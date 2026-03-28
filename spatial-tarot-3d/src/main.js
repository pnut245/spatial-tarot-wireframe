import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { DEAL_SEQUENCE, DECK, PLANES, SLOT_DEFS } from "./deck.js";

/* ── Fonts ──────────────────────────────────────── */
const DISPLAY_FONT = '"Cinzel", serif';
const BODY_FONT = '"Quattrocento Sans", sans-serif';

/* ── Image cache ────────────────────────────────── */
const imageCache = new Map();

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function preloadCardImages() {
  const promises = DECK.filter((c) => c.img).map(async (card) => {
    const img = await loadImage(card.img);
    if (img) imageCache.set(card.id, img);
  });
  await Promise.all(promises);
}

/* ── DOM ────────────────────────────────────────── */
const app = document.querySelector("#app");
app.innerHTML = `
  <div class="shell">
    <div class="viewport" id="viewport"></div>
    <div class="hud" id="hud" data-phase="intro">

      <div class="top-bar">
        <div class="sigil" id="sigil" title="Spatial Tarot">&#x2609;</div>
        <div class="question-field">
          <input class="question-input" id="question"
            placeholder="What pattern wants to surface?" />
        </div>
      </div>

      <div class="bottom-bar">
        <section class="readout" id="readout"></section>
        <div class="controls">
          <button class="back-btn" id="back-btn" type="button" hidden>&larr; Back to spread</button>
          <button class="deal-btn" id="deal-btn" type="button">Begin Reading</button>
          <button class="reset-btn" id="reset-btn" type="button">Clear &amp; Restart</button>
          <div class="status-line" id="status"></div>
        </div>
      </div>

    </div>
  </div>
`;

const hud = document.querySelector("#hud");
const viewport = document.querySelector("#viewport");
const questionInput = document.querySelector("#question");
const dealBtn = document.querySelector("#deal-btn");
const resetBtn = document.querySelector("#reset-btn");
const backBtn = document.querySelector("#back-btn");
const readoutEl = document.querySelector("#readout");
const statusEl = document.querySelector("#status");

/* ── Renderer ───────────────────────────────────── */
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewport.appendChild(renderer.domElement);

/* ── Scene ──────────────────────────────────────── */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030508);
scene.fog = new THREE.FogExp2(0x030508, 0.038);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);
camera.position.set(0, 3.5, 20);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 8;
controls.maxDistance = 26;
controls.maxPolarAngle = Math.PI * 0.46;
controls.target.set(0, 0.3, 0);

/* ── Post-processing ────────────────────────────── */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.7, 0.35);
composer.addPass(bloom);

/* ── World ──────────────────────────────────────── */
const world = new THREE.Group();
scene.add(world);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(2, 2);
const clickable = [];
const slotMap = new Map();

const baseCameraPosition = new THREE.Vector3(0, 3.5, 20);
const desiredCameraPosition = baseCameraPosition.clone();
const desiredTarget = new THREE.Vector3(0, 0.3, 0);

/* ── State ──────────────────────────────────────── */
const state = {
  question: "",
  remaining: shuffle([...DECK]),
  spread: new Map(),
  // Selection: { mode: "card"|"column"|"row", key, keys[] }
  selection: null,
  dealCount: 0,
  dealing: false,
  phase: "intro" // intro | dealing | reading
};

/* ── Events ─────────────────────────────────────── */
questionInput.addEventListener("input", () => {
  state.question = questionInput.value.trim();
});

dealBtn.addEventListener("click", () => {
  if (state.phase === "intro") {
    state.phase = "dealing";
    hud.dataset.phase = "dealing";
    dealCards();
  }
});

resetBtn.addEventListener("click", resetDemo);
backBtn.addEventListener("click", () => { if (state.selection) deselect(); });

const clock = new THREE.Clock();

init();

/* ── Init ───────────────────────────────────────── */
async function init() {
  try { if (document.fonts?.ready) await document.fonts.ready; } catch {}
  setStatus("Loading card art...");
  await preloadCardImages();
  setStatus("");
  buildScene();
  updateReadout();
  resize();
  window.addEventListener("resize", resize);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerleave", () => {
    pointer.set(2, 2);
  });
  renderer.domElement.addEventListener("click", onClick);
  animate();
}

/* ═══════════════════════════════════════════════════
   SCENE CONSTRUCTION
   ═══════════════════════════════════════════════════ */

function buildScene() {
  /* Lighting — front-facing so all cards are well-lit */

  // Strong ambient fill so nothing is in deep shadow
  const hemi = new THREE.HemisphereLight(0x8899bb, 0x223344, 1.0);
  scene.add(hemi);

  // Main key light from camera direction — front and slightly above
  const key = new THREE.DirectionalLight(0xeef4ff, 1.5);
  key.position.set(0, 6, 16);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 50;
  key.shadow.camera.left = -18;
  key.shadow.camera.right = 18;
  key.shadow.camera.top = 18;
  key.shadow.camera.bottom = -18;
  scene.add(key);

  // Fill light from below-front to lift the lower rows out of shadow
  const fill = new THREE.DirectionalLight(0xdde8ff, 0.8);
  fill.position.set(0, -2, 14);
  scene.add(fill);

  // Gentle accent rim lights — kept dimmer so they don't overpower cards
  const rimA = new THREE.PointLight(0xb08cff, 8, 30, 2.2);
  rimA.position.set(-10, 2, -6);
  scene.add(rimA);

  const rimB = new THREE.PointLight(0xe87cac, 5, 25, 2.4);
  rimB.position.set(10, -1, -4);
  scene.add(rimB);

  /* Floor with sacred geometry pattern */
  const floorGroup = new THREE.Group();
  floorGroup.rotation.x = -Math.PI / 2;
  floorGroup.position.y = -4.8;

  const floorBase = new THREE.Mesh(
    new THREE.CircleGeometry(30, 96),
    new THREE.MeshStandardMaterial({
      color: 0x060e1a,
      metalness: 0.2,
      roughness: 0.88,
      transparent: true,
      opacity: 0.92
    })
  );
  floorBase.receiveShadow = true;
  floorGroup.add(floorBase);

  // Concentric rings
  for (let i = 1; i <= 5; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(i * 3.2 - 0.03, i * 3.2 + 0.03, 120),
      new THREE.MeshBasicMaterial({
        color: 0xb08cff,
        transparent: true,
        opacity: 0.04 + (5 - i) * 0.015,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    ring.position.z = 0.01;
    floorGroup.add(ring);
  }

  // Radial lines on floor
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const pts = [new THREE.Vector3(0, 0, 0.02), new THREE.Vector3(Math.cos(angle) * 16, Math.sin(angle) * 16, 0.02)];
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xb08cff, transparent: true, opacity: 0.035 })
    );
    floorGroup.add(line);
  }

  world.add(floorGroup);

  /* Deck pedestal */
  const deckPedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.45, 1.2, 40),
    new THREE.MeshStandardMaterial({
      color: 0x0c1324,
      emissive: 0x1a2e5a,
      emissiveIntensity: 0.6,
      metalness: 0.35,
      roughness: 0.28
    })
  );
  deckPedestal.position.set(-9.2, -2.7, 2.8);
  deckPedestal.castShadow = true;
  deckPedestal.receiveShadow = true;
  world.add(deckPedestal);

  const deckGlow = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.06, 20, 80),
    new THREE.MeshBasicMaterial({
      color: 0xb08cff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    })
  );
  deckGlow.position.copy(deckPedestal.position);
  deckGlow.rotation.x = Math.PI / 2;
  world.add(deckGlow);

  const deckStack = createDeckStack();
  deckStack.position.set(-9.2, -1.45, 2.8);
  world.add(deckStack);

  /* Atmosphere */
  scene.add(createStars());
  scene.add(createDustParticles());

  const aurora = createAurora();
  aurora.position.set(0, 7, -12);
  world.add(aurora);

  const aurora2 = createAurora();
  aurora2.position.set(-5, 4, -10);
  aurora2.rotation.z = 0.3;
  aurora2.scale.set(0.7, 0.5, 1);
  aurora2.material.opacity = 0.35;
  world.add(aurora2);

  /* Plane slabs + labels */
  for (const plane of PLANES) {
    const slab = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 3.2, 1, 1),
      new THREE.MeshBasicMaterial({
        color: plane.glow,
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    slab.position.set(0, plane.y, plane.z - 0.3);
    world.add(slab);

    // Elliptical edge frame
    const edge = new THREE.Mesh(
      new THREE.TorusGeometry(8, 0.025, 12, 140),
      new THREE.MeshBasicMaterial({
        color: plane.glow,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending
      })
    );
    edge.scale.y = 0.18;
    edge.rotation.x = Math.PI / 2;
    edge.position.set(0, plane.y, plane.z - 0.15);
    world.add(edge);

    const label = createLabelSprite(plane.label.toUpperCase(), plane.color, 300, 70);
    label.position.set(-7.8, plane.y + 0.2, plane.z + 1.5);
    label.userData.selectRow = plane.id;
    world.add(label);
    clickable.push(label);
  }

  /* Card columns */
  const columnX = [-5.4, -1.8, 1.8, 5.4];
  for (let i = 0; i < SLOT_DEFS.length; i++) {
    const slot = SLOT_DEFS[i];
    const x = columnX[i];

    // Vertical connecting line
    const pts = PLANES.map((p) => new THREE.Vector3(x, p.y, p.z));
    const connector = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x8aa0d4, transparent: true, opacity: 0.1 })
    );
    world.add(connector);

    // Column label — big, glowy, above card area
    const colLabel = createLabelSprite(slot.label.toUpperCase(), "#b8caee", 440, 90, true);
    colLabel.position.set(x, 5.5, 1.2);
    colLabel.userData.selectCol = slot.code;
    world.add(colLabel);
    clickable.push(colLabel);

    for (const plane of PLANES) {
      const key = slotKey(plane.id, slot.code);
      const group = new THREE.Group();
      group.position.set(x, plane.y, plane.z);
      group.userData.key = key;
      group.userData.code = slot.code;
      group.userData.plane = plane.id;

      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.82, 1.0, 0.3, 32),
        new THREE.MeshStandardMaterial({
          color: 0x0d1528,
          emissive: plane.glow,
          emissiveIntensity: 0.18,
          metalness: 0.4,
          roughness: 0.28
        })
      );
      pedestal.castShadow = true;
      pedestal.receiveShadow = true;
      pedestal.position.y = -0.1;
      group.add(pedestal);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.05, 16, 64),
        new THREE.MeshBasicMaterial({
          color: plane.glow,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.15;
      ring.userData.key = key;
      ring.userData.code = slot.code;
      group.add(ring);

      const aura = new THREE.Mesh(
        new THREE.CircleGeometry(1.15, 40),
        new THREE.MeshBasicMaterial({
          color: plane.glow,
          transparent: true,
          opacity: 0.06,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.11;
      group.add(aura);

      world.add(group);
      slotMap.set(key, { key, code: slot.code, plane, group, pedestal, ring, aura, card: null });
    }
  }
}

/* ═══════════════════════════════════════════════════
   SCENE ELEMENTS
   ═══════════════════════════════════════════════════ */

function createDeckStack() {
  const deck = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const card = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 2.2, 0.04),
      createCardMaterials(
        { name: "Spatial Tarot", keywords: ["query", "layer", "pattern"], meaning: "" },
        "#b08cff"
      )
    );
    card.rotation.y = -0.34;
    card.rotation.x = 0.09;
    card.position.set(i * 0.012, i * 0.05, -i * 0.02);
    deck.add(card);
  }
  return deck;
}

function createStars() {
  const count = 2200;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const radius = 14 + Math.random() * 35;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.75;
    positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    positions[i * 3 + 1] = Math.cos(phi) * radius * 0.7 + 5;
    positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius - 12;
    sizes[i] = 0.04 + Math.random() * 0.1;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xe8f0ff) }
    },
    vertexShader: `
      attribute float size;
      uniform float time;
      varying float vAlpha;
      void main() {
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPos;
        gl_PointSize = size * (200.0 / -mvPos.z);
        vAlpha = 0.3 + 0.7 * (0.5 + 0.5 * sin(time * 0.8 + position.x * 0.5 + position.y * 0.3));
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geo, mat);
  points.userData.isTwinkle = true;
  return points;
}

function createDustParticles() {
  const count = 400;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 28;
    positions[i * 3 + 1] = -4 + Math.random() * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    velocities[i * 3] = (Math.random() - 0.5) * 0.003;
    velocities[i * 3 + 1] = 0.002 + Math.random() * 0.006;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.userData.velocities = velocities;

  const mat = new THREE.PointsMaterial({
    color: 0xb08cff,
    size: 0.05,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    depthWrite: false
  });

  const points = new THREE.Points(geo, mat);
  points.userData.isDust = true;
  return points;
}

function createAurora() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "rgba(176,140,255,0.0)");
  grad.addColorStop(0.15, "rgba(176,140,255,0.5)");
  grad.addColorStop(0.35, "rgba(92,200,232,0.35)");
  grad.addColorStop(0.55, "rgba(232,124,172,0.2)");
  grad.addColorStop(0.75, "rgba(78,242,176,0.35)");
  grad.addColorStop(1, "rgba(78,242,176,0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Wispy horizontal streaks
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.018})`;
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      200 + Math.random() * 250,
      8 + Math.random() * 14
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.Mesh(
    new THREE.PlaneGeometry(26, 12, 1, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
}

/* ═══════════════════════════════════════════════════
   CARD RENDERING
   ═══════════════════════════════════════════════════ */

function createCardInstance(card, plane) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 2.2, 0.05),
    createCardMaterials(card, plane.color)
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.rotation.y = -0.24;
  mesh.rotation.x = 0.02;

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 2.5),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(plane.color),
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  glow.position.z = -0.08;
  mesh.add(glow);

  return {
    id: crypto.randomUUID(),
    card,
    plane: plane.id,
    mesh,
    slotKey: null,
    wobble: Math.random() * Math.PI * 2,
    animation: null
  };
}

function createCardMaterials(card, accentColor) {
  const front = new THREE.CanvasTexture(drawCardFace(card, accentColor));
  const back = new THREE.CanvasTexture(drawCardBack(accentColor));
  front.colorSpace = THREE.SRGBColorSpace;
  back.colorSpace = THREE.SRGBColorSpace;
  front.anisotropy = renderer.capabilities.getMaxAnisotropy();
  back.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const side = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor).multiplyScalar(0.35),
    metalness: 0.5,
    roughness: 0.4
  });
  return [
    side, side, side, side,
    new THREE.MeshStandardMaterial({ map: front, metalness: 0.0, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ map: back, metalness: 0.15, roughness: 0.65 })
  ];
}

function drawCardFace(card, accentColor) {
  const W = 720, H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Warm parchment background — readable but not blinding
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#e8dfc8");
  bg.addColorStop(0.5, "#e0d5b8");
  bg.addColorStop(1, "#d6c9a6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Accent-tinted border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 10;
  roundRect(ctx, 12, 12, W - 24, H - 24, 18);
  ctx.stroke();

  // Inner frame
  ctx.strokeStyle = hexToRgba(accentColor, 0.4);
  ctx.lineWidth = 2;
  roundRect(ctx, 28, 28, W - 56, H - 56, 12);
  ctx.stroke();

  // Card name at top — bold, dark on light
  ctx.fillStyle = "#0e0a16";
  ctx.font = `700 48px ${DISPLAY_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(card.name.toUpperCase(), W / 2, 80);

  // Decorative line under name
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(W * 0.18, 100);
  ctx.lineTo(W * 0.82, 100);
  ctx.stroke();

  // Draw the RWS image if loaded
  const img = imageCache.get(card.id);
  const imgTop = 112;
  const imgAreaH = 560;
  if (img) {
    // Fit image into the area preserving aspect ratio
    const aspect = img.width / img.height;
    let drawW = W - 80;
    let drawH = drawW / aspect;
    if (drawH > imgAreaH) {
      drawH = imgAreaH;
      drawW = drawH * aspect;
    }
    const drawX = (W - drawW) / 2;
    const drawY = imgTop + (imgAreaH - drawH) / 2;

    // Subtle shadow behind image
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  } else {
    // Fallback: sacred geometry placeholder
    const cx = W / 2, cy = imgTop + imgAreaH / 2;
    ctx.strokeStyle = hexToRgba(accentColor, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.stroke();
    for (let t = 0; t < 2; t++) {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (Math.PI * 2 * i) / 3 + t * (Math.PI / 3) - Math.PI / 2;
        const px = cx + Math.cos(a) * 85;
        const py = cy + Math.sin(a) * 85;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Bottom area: keywords + meaning on parchment
  const bottomY = imgTop + imgAreaH + 20;

  // Keywords
  if (card.keywords?.length) {
    ctx.fillStyle = "#1a1028";
    ctx.font = `700 26px ${BODY_FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(card.keywords.join("  \u00b7  "), W / 2, bottomY + 12);
  }

  // Meaning text
  if (card.meaning) {
    ctx.fillStyle = "#18121e";
    wrapText(ctx, card.meaning, 56, bottomY + 52, W - 112, 36, `italic 700 26px ${BODY_FONT}`);
  }

  // Footer
  ctx.fillStyle = hexToRgba(accentColor, 0.7);
  ctx.font = `600 20px ${DISPLAY_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("SPATIAL TAROT", W / 2, H - 40);

  return canvas;
}

function drawCardBack(accentColor) {
  const W = 720, H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background — brighter center
  const bg = ctx.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, 520);
  bg.addColorStop(0, hexToRgba(accentColor, 0.5));
  bg.addColorStop(0.2, hexToRgba(accentColor, 0.2));
  bg.addColorStop(0.4, "#141f3e");
  bg.addColorStop(0.75, "#0c1428");
  bg.addColorStop(1, "#080e1e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = hexToRgba(accentColor, 0.6);
  ctx.lineWidth = 3;
  roundRect(ctx, 20, 20, W - 40, H - 40, 24);
  ctx.stroke();

  // Inner decorative border
  ctx.strokeStyle = hexToRgba(accentColor, 0.2);
  ctx.lineWidth = 1;
  roundRect(ctx, 42, 42, W - 84, H - 84, 16);
  ctx.stroke();

  const cx = W / 2, cy = H / 2;

  // Radial lines
  ctx.strokeStyle = hexToRgba(accentColor, 0.15);
  ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 40, cy + Math.sin(angle) * 40);
    ctx.lineTo(cx + Math.cos(angle) * 260, cy + Math.sin(angle) * 260);
    ctx.stroke();
  }

  // Concentric circles
  for (const r of [80, 140, 200, 260]) {
    ctx.strokeStyle = hexToRgba(accentColor, r < 150 ? 0.3 : 0.12);
    ctx.lineWidth = r < 150 ? 1.5 : 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Center dot
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();

  // Moon phases at top
  const moonY = 72;
  const phases = [0.2, 0.5, 1.0, 0.5, 0.2];
  for (let i = 0; i < phases.length; i++) {
    const mx = cx + (i - 2) * 32;
    ctx.fillStyle = hexToRgba(accentColor, phases[i] * 0.5);
    ctx.beginPath();
    ctx.arc(mx, moonY, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title
  ctx.fillStyle = hexToRgba(accentColor, 0.7);
  ctx.font = `600 32px ${DISPLAY_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("SPATIAL TAROT", cx, H - 68);

  return canvas;
}

function createLabelSprite(text, color, width = 340, height = 88, bright = false) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Glowing text — stronger glow for bright labels
  ctx.shadowColor = color;
  ctx.shadowBlur = bright ? 18 : 8;
  ctx.fillStyle = color;
  ctx.font = `${bright ? 600 : 500} ${Math.round(height * (bright ? 0.42 : 0.36))}px ${DISPLAY_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = `${bright ? 6 : 3}px`;
  // Draw with glow
  ctx.fillText(text, width / 2, height / 2);
  if (bright) ctx.fillText(text, width / 2, height / 2); // double pass for stronger glow
  // Crisp pass
  ctx.shadowBlur = 0;
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: bright ? 0.9 : 0.75 })
  );
  sprite.scale.set(width / (bright ? 180 : 220), height / (bright ? 180 : 220), 1);
  return sprite;
}

/* ═══════════════════════════════════════════════════
   DEALING & INTERACTION
   ═══════════════════════════════════════════════════ */

async function dealCards() {
  if (state.dealing) return;
  state.dealing = true;
  setStatus("The cards are speaking...");

  let cardIndex = 0;
  while (cardIndex < DEAL_SEQUENCE.length) {
    const target = DEAL_SEQUENCE[cardIndex];
    const slot = slotMap.get(slotKey(target.plane, target.code));
    if (!slot || slot.card) { cardIndex++; continue; }

    const nextCard = state.remaining.shift();
    if (!nextCard) break;

    const instance = createCardInstance(nextCard, slot.plane);
    instance.slotKey = slot.key;
    slot.card = instance;
    state.spread.set(slot.key, instance);
    world.add(instance.mesh);
    clickable.push(instance.mesh);
    instance.mesh.userData.key = slot.key;
    instance.mesh.userData.isCard = true;

    const start = new THREE.Vector3(-9.2, -1.35, 2.8);
    const end = slot.group.position.clone().add(new THREE.Vector3(0, 1.35, 0.12));
    instance.mesh.position.copy(start);

    // Smooth low-gravity drift with entropy
    const drift = (Math.random() - 0.5) * 1.2;  // lateral drift
    const loft = 0.8 + Math.random() * 1.5;      // gentle upward float
    const wobbleAmt = (Math.random() - 0.5) * 0.12; // subtle Z tilt
    const wobbleFreq = 1.5 + Math.random() * 1.5;   // how fast it sways
    instance.animation = {
      from: start.clone(),
      to: end.clone(),
      startedAt: clock.getElapsedTime(),
      duration: 1.8 + Math.random() * 0.4,
      drift,
      loft,
      wobbleAmt,
      wobbleFreq
    };

    state.dealCount = cardIndex + 1;
    cardIndex++;

    // Soft camera tracking
    const mid = slot.group.position;
    desiredTarget.set(mid.x * 0.2, mid.y * 0.12 + 0.3, mid.z * 0.15);
    desiredCameraPosition.set(
      mid.x * 0.06,
      baseCameraPosition.y + mid.y * 0.03,
      baseCameraPosition.z - 0.5
    );

    setStatus(`${nextCard.name} \u2014 ${slot.plane.label} ${slot.code}`);
    await sleep(260);
  }

  state.dealing = false;
  state.phase = "reading";
  hud.dataset.phase = "reading";
  setStatus(`${state.dealCount} cards laid. Click any card to read it.`);

  // Smoothly return to overview
  desiredTarget.set(0, 0.2, 0);
  desiredCameraPosition.copy(baseCameraPosition);

  updateReadout();
}

function resetDemo() {
  for (const [, slot] of slotMap) {
    if (slot.card) world.remove(slot.card.mesh);
    slot.card = null;
  }
  clickable.length = 0;
  state.remaining = shuffle([...DECK]);
  state.spread.clear();
  state.selection = null;
  state.dealCount = 0;
  state.dealing = false;
  state.phase = "intro";
  hud.dataset.phase = "intro";
  questionInput.value = "";
  state.question = "";
  updateReadout();
  setStatus("");
  desiredTarget.set(0, 0.4, 0);
  desiredCameraPosition.copy(baseCameraPosition);
}

function selectCard(key) {
  if (!key || !slotMap.has(key)) return;
  if (state.selection?.mode === "card" && state.selection.key === key) {
    deselect(); return;
  }
  state.selection = { mode: "card", key, keys: [key] };
  const pos = slotMap.get(key).group.position;
  desiredTarget.set(pos.x * 0.45, pos.y * 0.35 + 0.5, pos.z + 2);
  desiredCameraPosition.set(pos.x * 0.3, pos.y * 0.25 + baseCameraPosition.y * 0.65, 13.5);
  showBackBtn();
  updateReadout();
}

function selectColumn(code) {
  if (state.selection?.mode === "column" && state.selection.key === code) {
    deselect(); return;
  }
  const keys = PLANES.map((p) => slotKey(p.id, code));
  state.selection = { mode: "column", key: code, keys };
  const avgX = slotMap.get(keys[0])?.group.position.x ?? 0;
  desiredTarget.set(avgX * 0.4, 0.5, 0.5);
  desiredCameraPosition.set(avgX * 0.25, baseCameraPosition.y * 0.7, 14);
  showBackBtn();
  updateReadout();
}

function selectRow(planeId) {
  if (state.selection?.mode === "row" && state.selection.key === planeId) {
    deselect(); return;
  }
  const keys = SLOT_DEFS.map((s) => slotKey(planeId, s.code));
  state.selection = { mode: "row", key: planeId, keys };
  const plane = PLANES.find((p) => p.id === planeId);
  desiredTarget.set(0, (plane?.y ?? 0) * 0.4 + 0.5, 0.5);
  desiredCameraPosition.set(0, (plane?.y ?? 0) * 0.2 + baseCameraPosition.y * 0.7, 14);
  showBackBtn();
  updateReadout();
}

function deselect() {
  state.selection = null;
  backBtn.hidden = true;
  desiredTarget.set(0, 0.2, 0);
  desiredCameraPosition.copy(baseCameraPosition);
  updateReadout();
}

function showBackBtn() {
  backBtn.hidden = false;
}

function updateReadout() {
  if (state.phase === "intro") {
    readoutEl.innerHTML = `
      <div class="readout__eyebrow">Spatial Tarot</div>
      <div class="readout__title">Three Layers of Sight</div>
      <div class="readout__body">
        Twelve cards across three depths &mdash; the hidden, the present, and the emerging.
        Ask your question, then begin.
      </div>
      <div class="readout__stack">
        ${PLANES.map((p) => `
          <div class="readout__row">
            <span class="readout__plane" style="color:${p.color}">${p.label}</span>
            <span class="readout__card">${p.subtitle}</span>
          </div>
        `).join("")}
      </div>
    `;
    return;
  }

  if (!state.selection) {
    readoutEl.innerHTML = `
      <div class="readout__eyebrow">Reading</div>
      <div class="readout__title">Explore the Spread</div>
      <div class="readout__body">Click a card to read it, or click a column or row label to see how cards relate across a position or layer.</div>
    `;
    return;
  }

  const sel = state.selection;

  if (sel.mode === "card") {
    const slot = slotMap.get(sel.key);
    const inst = slot?.card;
    if (!inst) return;
    const [planeId, code] = sel.key.split(":");
    const plane = PLANES.find((p) => p.id === planeId);
    const slotDef = SLOT_DEFS.find((s) => s.code === code);
    readoutEl.innerHTML = `
      <div class="readout__eyebrow">
        <span class="readout__card--link" data-select-row="${planeId}">${plane?.label ?? ""}</span>
        &mdash;
        <span class="readout__card--link" data-select-col="${code}">${slotDef?.label ?? ""}</span>
      </div>
      <div class="readout__title">${inst.card.name}</div>
      <div class="readout__body">${inst.card.meaning}</div>
      <div class="readout__keywords">
        ${inst.card.keywords.map((k) => `<span class="keyword">#${k}</span>`).join("")}
      </div>
      <div class="readout__hint">Click the layer or position name above to see a combined reading.</div>
    `;
    wireReadoutLinks();
    return;
  }

  if (sel.mode === "column") {
    const slotDef = SLOT_DEFS.find((s) => s.code === sel.key);
    const cards = sel.keys.map((k) => {
      const s = slotMap.get(k);
      return { key: k, plane: PLANES.find((p) => p.id === k.split(":")[0]), inst: s?.card };
    });
    const dealt = cards.filter((c) => c.inst);
    readoutEl.innerHTML = `
      <div class="readout__eyebrow">Column Reading</div>
      <div class="readout__title">${slotDef?.label ?? "Column"} Across Three Depths</div>
      <div class="readout__body">${columnInterpretation(slotDef, dealt)}</div>
      <div class="readout__stack">
        ${cards.map((c) => `
          <div class="readout__row">
            <span class="readout__plane" style="color:${c.plane.color}">${c.plane.label}</span>
            <span class="readout__card ${c.inst ? "readout__card--link" : ""}" ${c.inst ? `data-select-card="${c.key}"` : ""}>${c.inst ? c.inst.card.name : "\u2014"}</span>
          </div>
        `).join("")}
      </div>
    `;
    wireReadoutLinks();
    return;
  }

  if (sel.mode === "row") {
    const plane = PLANES.find((p) => p.id === sel.key);
    const cards = sel.keys.map((k) => {
      const s = slotMap.get(k);
      const code = k.split(":")[1];
      return { key: k, slotDef: SLOT_DEFS.find((sd) => sd.code === code), inst: s?.card };
    });
    const dealt = cards.filter((c) => c.inst);
    readoutEl.innerHTML = `
      <div class="readout__eyebrow">Layer Reading</div>
      <div class="readout__title">${plane?.label ?? "Layer"} &mdash; ${plane?.subtitle ?? ""}</div>
      <div class="readout__body">${rowInterpretation(plane, dealt)}</div>
      <div class="readout__stack">
        ${cards.map((c) => `
          <div class="readout__row">
            <span class="readout__plane">${c.slotDef?.label ?? ""}</span>
            <span class="readout__card ${c.inst ? "readout__card--link" : ""}" ${c.inst ? `data-select-card="${c.key}"` : ""}>${c.inst ? c.inst.card.name : "\u2014"}</span>
          </div>
        `).join("")}
      </div>
    `;
    wireReadoutLinks();
    return;
  }
}

function wireReadoutLinks() {
  readoutEl.querySelectorAll("[data-select-card]").forEach((el) => {
    el.addEventListener("click", () => selectCard(el.dataset.selectCard));
  });
  readoutEl.querySelectorAll("[data-select-col]").forEach((el) => {
    el.addEventListener("click", () => selectColumn(el.dataset.selectCol));
  });
  readoutEl.querySelectorAll("[data-select-row]").forEach((el) => {
    el.addEventListener("click", () => selectRow(el.dataset.selectRow));
  });
}

function columnInterpretation(slotDef, dealt) {
  if (dealt.length === 0) return `No cards dealt to the ${slotDef?.label} column yet.`;
  const label = slotDef?.label?.toLowerCase() ?? "this position";
  const names = dealt.map((c) => c.inst.card.name);
  const allKeywords = dealt.flatMap((c) => c.inst.card.keywords);
  const tensions = allKeywords.length > 2
    ? `The threads of <em>${allKeywords[0]}</em>, <em>${allKeywords[Math.floor(allKeywords.length / 2)]}</em>, and <em>${allKeywords[allKeywords.length - 1]}</em> weave through this position.`
    : "";

  if (dealt.length === 3) {
    return `Reading ${label} across all three depths: ${names[0]} shapes what is hidden, ${names[1]} holds the present pattern, and ${names[2]} points toward what is emerging. ${tensions}`;
  }
  return `${dealt.length} of 3 cards revealed for ${label}. ${names.join(" and ")} ${dealt.length === 1 ? "begins" : "begin"} to sketch the picture. ${tensions}`;
}

function rowInterpretation(plane, dealt) {
  if (dealt.length === 0) return `No cards dealt to the ${plane?.label} layer yet.`;
  const names = dealt.map((c) => `${c.inst.card.name} (${c.slotDef?.label})`);
  const allKeywords = dealt.flatMap((c) => c.inst.card.keywords);
  const unique = [...new Set(allKeywords)];
  const themeStr = unique.length > 2
    ? `Recurring energies: <em>${unique.slice(0, 4).join("</em>, <em>")}</em>.`
    : "";

  if (dealt.length === 4) {
    return `The full ${plane?.label} layer &mdash; ${plane?.subtitle?.toLowerCase()}. ${names.join(", ")}. Together they map the ${plane?.label?.toLowerCase()} terrain of this reading. ${themeStr}`;
  }
  return `${dealt.length} of 4 positions filled at the ${plane?.label} level. ${names.join(", ")}. ${themeStr}`;
}

function setStatus(text) {
  statusEl.textContent = text;
}

/* ═══════════════════════════════════════════════════
   INPUT HANDLING
   ═══════════════════════════════════════════════════ */

function onPointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onClick() {
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(clickable, true)[0];
  if (!hit) {
    if (state.selection) deselect();
    return;
  }

  const obj = hit.object;

  // Column label clicked
  if (obj.userData.selectCol) {
    selectColumn(obj.userData.selectCol);
    return;
  }
  // Row label clicked
  if (obj.userData.selectRow) {
    selectRow(obj.userData.selectRow);
    return;
  }
  // Card clicked
  const cardObj = obj.userData.isCard ? obj : obj.parent?.userData.isCard ? obj.parent : null;
  if (cardObj?.userData.key) {
    selectCard(cardObj.userData.key);
    return;
  }

  if (state.selection) deselect();
}

/* ═══════════════════════════════════════════════════
   ANIMATION LOOP
   ═══════════════════════════════════════════════════ */

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  // Smooth camera
  camera.position.lerp(desiredCameraPosition, 0.025);
  controls.target.lerp(desiredTarget, 0.05);
  controls.update();

  // Hover cursor
  raycaster.setFromCamera(pointer, camera);
  const hovered = raycaster.intersectObjects(clickable, true)[0];
  renderer.domElement.style.cursor = hovered ? "pointer" : "grab";

  // Update twinkling stars
  scene.traverse((obj) => {
    if (obj.userData.isTwinkle && obj.material.uniforms) {
      obj.material.uniforms.time.value = elapsed;
    }
  });

  // Update dust particles
  scene.traverse((obj) => {
    if (obj.userData.isDust) {
      const pos = obj.geometry.attributes.position;
      const vel = obj.geometry.userData.velocities;
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3] += vel[i * 3];
        pos.array[i * 3 + 1] += vel[i * 3 + 1];
        pos.array[i * 3 + 2] += vel[i * 3 + 2];
        // Reset if too high
        if (pos.array[i * 3 + 1] > 10) {
          pos.array[i * 3 + 1] = -4;
          pos.array[i * 3] = (Math.random() - 0.5) * 28;
          pos.array[i * 3 + 2] = (Math.random() - 0.5) * 16;
        }
      }
      pos.needsUpdate = true;
    }
  });

  // Build set of selected keys for quick lookup
  const selKeys = new Set(state.selection?.keys ?? []);
  const selMode = state.selection?.mode ?? null;

  // For multi-card selection, compute showcase positions
  let showcaseSlots = [];
  if (selMode === "column" || selMode === "row") {
    showcaseSlots = state.selection.keys
      .map((k) => slotMap.get(k))
      .filter((s) => s?.card);
  }

  // Slot glow and card animation
  for (const [, slot] of slotMap) {
    const isSelected = selKeys.has(slot.key);

    // Breathing ring glow
    const breath = 0.5 + Math.sin(elapsed * 1.5 + slot.group.position.x) * 0.12;
    slot.ring.material.opacity = isSelected ? 0.6 : breath * 0.3;
    slot.aura.material.opacity = isSelected ? 0.15 : 0.03 + breath * 0.02;
    slot.pedestal.material.emissiveIntensity = isSelected ? 0.4 : 0.08 + breath * 0.04;

    const ringScale = isSelected ? 1.05 + Math.sin(elapsed * 2) * 0.02 : 1;
    slot.ring.scale.set(ringScale, ringScale, ringScale);

    if (!slot.card) continue;
    const card = slot.card;

    if (card.animation) {
      // Deal animation (unchanged)
      const anim = card.animation;
      const raw = Math.min((elapsed - anim.startedAt) / anim.duration, 1);
      const eased = 1 - Math.pow(1 - raw, 3.5);
      card.mesh.position.lerpVectors(anim.from, anim.to, eased);
      const floatPhase = Math.sin(raw * Math.PI);
      card.mesh.position.y += anim.loft * floatPhase;
      card.mesh.position.x += anim.drift * floatPhase * (1 - eased);
      card.mesh.rotation.y = THREE.MathUtils.lerp(-0.6, -0.24, eased);
      card.mesh.rotation.x = THREE.MathUtils.lerp(0.3, 0.02, eased);
      card.mesh.rotation.z = anim.wobbleAmt * Math.sin(raw * Math.PI * anim.wobbleFreq) * (1 - eased);
      if (raw >= 1) {
        card.animation = null;
        card.mesh.rotation.z = 0;
        card.mesh.scale.setScalar(1);
      }
    } else {
      const base = slot.group.position;
      const hover = Math.sin(elapsed * 1.0 + card.wobble) * 0.08;

      if (isSelected && selMode === "card") {
        // Single card: float forward and scale up
        const showcasePos = new THREE.Vector3(base.x * 0.45, base.y * 0.35 + 1.5, base.z + 3.5);
        card.mesh.position.lerp(showcasePos, 0.08);
        card.mesh.position.y += hover * 0.5;
        card.mesh.rotation.y = THREE.MathUtils.lerp(card.mesh.rotation.y, Math.sin(elapsed * 0.3) * 0.03, 0.08);
        card.mesh.rotation.x = THREE.MathUtils.lerp(card.mesh.rotation.x, 0.0, 0.08);
        card.mesh.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.08);

      } else if (isSelected && (selMode === "column" || selMode === "row")) {
        // Multi-card: fan out side by side
        const idx = showcaseSlots.indexOf(slot);
        const count = showcaseSlots.length;
        const spread = count <= 3 ? 2.2 : 2.0;
        const fanX = (idx - (count - 1) / 2) * spread;
        const fanZ = base.z + 4;
        const fanY = 1.2 - Math.abs(idx - (count - 1) / 2) * 0.15; // slight arc
        const showcasePos = new THREE.Vector3(fanX, fanY, fanZ);
        card.mesh.position.lerp(showcasePos, 0.07);
        card.mesh.position.y += hover * 0.3;
        // Fan angle: outer cards tilt slightly inward
        const fanAngle = (idx - (count - 1) / 2) * -0.06;
        card.mesh.rotation.y = THREE.MathUtils.lerp(card.mesh.rotation.y, fanAngle, 0.07);
        card.mesh.rotation.x = THREE.MathUtils.lerp(card.mesh.rotation.x, 0.0, 0.07);
        card.mesh.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.07);

      } else {
        // Non-selected: return to home
        const homePos = new THREE.Vector3(base.x, base.y + 1.35 + hover, base.z + 0.12);
        card.mesh.position.lerp(homePos, 0.06);
        card.mesh.rotation.y = THREE.MathUtils.lerp(card.mesh.rotation.y, -0.24 + Math.sin(elapsed * 0.5 + card.wobble) * 0.03, 0.06);
        card.mesh.rotation.x = THREE.MathUtils.lerp(card.mesh.rotation.x, 0.02 + Math.cos(elapsed * 0.7 + card.wobble) * 0.015, 0.06);
        card.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.06);
      }
    }
  }

  // World subtle rotation
  world.rotation.y = Math.sin(elapsed * 0.06) * 0.025;

  // Bloom breathing
  bloom.strength = 0.5 + Math.sin(elapsed * 0.3) * 0.1;

  composer.render(delta);
}

/* ═══════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════ */

function resize() {
  const w = viewport.clientWidth;
  const h = viewport.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
}

function slotKey(plane, code) { return `${plane}:${code}`; }

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function easeOutCubic(t) { return 1 - (1 - t) ** 3; }

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, font) {
  ctx.font = font;
  ctx.textAlign = "left";
  const words = text.split(" ");
  let line = "";
  let drawY = y;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      ctx.fillText(line, x, drawY);
      line = word;
      drawY += lineHeight;
    } else {
      line = candidate;
    }
  }
  if (line) ctx.fillText(line, x, drawY);
}

function hexToRgba(hex, alpha) {
  const c = new THREE.Color(hex);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`;
}
