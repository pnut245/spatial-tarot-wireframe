const APP_VERSION = "2026-03-29-tarot-wheel-b";

const MAJORS = [
  { id: "major-00", name: "The Fool", keywords: ["beginning", "leap", "naivete"], meaning: "Starting point, openness, and stepping into the unknown." },
  { id: "major-01", name: "The Magician", keywords: ["agency", "tools", "focus"], meaning: "Intentional action; shaping outcomes through attention." },
  { id: "major-02", name: "The High Priestess", keywords: ["intuition", "hidden", "silence"], meaning: "What is concealed; trusting inner knowing and subtle signals." },
  { id: "major-03", name: "The Empress", keywords: ["growth", "care", "abundance"], meaning: "Nurturing, creation, and conditions that allow something to flourish." },
  { id: "major-04", name: "The Emperor", keywords: ["structure", "boundary", "authority"], meaning: "Stability through structure; rules, leadership, responsibility." },
  { id: "major-05", name: "The Hierophant", keywords: ["tradition", "teaching", "ritual"], meaning: "Learning through shared practices; values and institutional frames." },
  { id: "major-06", name: "The Lovers", keywords: ["choice", "alignment", "bond"], meaning: "A meaningful choice; values alignment; relationship as mirror." },
  { id: "major-07", name: "The Chariot", keywords: ["direction", "will", "control"], meaning: "Momentum through chosen direction; holding forces in tension." },
  { id: "major-08", name: "Strength", keywords: ["patience", "courage", "gentleness"], meaning: "Durable courage; influence through steadiness rather than force." },
  { id: "major-09", name: "The Hermit", keywords: ["search", "pause", "insight"], meaning: "Stepping back to see clearly; solitude in service of perspective." },
  { id: "major-10", name: "Wheel of Fortune", keywords: ["change", "cycle", "timing"], meaning: "Shifts in conditions; cycles and timing beyond control." },
  { id: "major-11", name: "Justice", keywords: ["balance", "truth", "consequence"], meaning: "Clarity, accountability, and consequences returning to the present." },
  { id: "major-12", name: "The Hanged Man", keywords: ["reframe", "pause", "surrender"], meaning: "A change in viewpoint; waiting with purpose; letting go of a fixed approach." },
  { id: "major-13", name: "Death", keywords: ["ending", "transition", "release"], meaning: "A needed ending; clearing space; transition rather than literal finality." },
  { id: "major-14", name: "Temperance", keywords: ["integration", "blend", "pace"], meaning: "Gradual integration; mixing elements; steadiness and moderation." },
  { id: "major-15", name: "The Devil", keywords: ["attachment", "compulsion", "shadow"], meaning: "Patterns of attachment; noticing where choice has narrowed." },
  { id: "major-16", name: "The Tower", keywords: ["disruption", "truth", "shock"], meaning: "Sudden change; disruption that forces honesty." },
  { id: "major-17", name: "The Star", keywords: ["hope", "guidance", "renewal"], meaning: "Guidance after difficulty; renewal; a steady North Star." },
  { id: "major-18", name: "The Moon", keywords: ["uncertainty", "dream", "projection"], meaning: "Ambiguity and projection; moving through uncertainty with care." },
  { id: "major-19", name: "The Sun", keywords: ["clarity", "vitality", "confidence"], meaning: "Clarity and warmth; energy returns; simple truths become visible." },
  { id: "major-20", name: "Judgement", keywords: ["reckoning", "call", "decision"], meaning: "A call to step forward; honest appraisal; moving from past to next chapter." },
  { id: "major-21", name: "The World", keywords: ["completion", "integration", "cycle"], meaning: "Completion and integration; seeing the whole; one cycle closing cleanly." }
];

const MINOR_SUITS = [
  { id: "wands", label: "Wands", short: "W", color: "#f47920" },
  { id: "cups", label: "Cups", short: "C", color: "#63ceca" },
  { id: "swords", label: "Swords", short: "S", color: "#c2d1ff" },
  { id: "pentacles", label: "Pentacles", short: "P", color: "#bfedab" }
];

const MINOR_RANKS = [
  { id: "ace", label: "Ace", short: "A" },
  { id: "two", label: "2", short: "2" },
  { id: "three", label: "3", short: "3" },
  { id: "four", label: "4", short: "4" },
  { id: "five", label: "5", short: "5" },
  { id: "six", label: "6", short: "6" },
  { id: "seven", label: "7", short: "7" },
  { id: "eight", label: "8", short: "8" },
  { id: "nine", label: "9", short: "9" },
  { id: "ten", label: "10", short: "10" },
  { id: "page", label: "Page", short: "Pg" },
  { id: "knight", label: "Knight", short: "Kn" },
  { id: "queen", label: "Queen", short: "Q" },
  { id: "king", label: "King", short: "K" }
];

function buildMinors() {
  const cards = [];
  for (const suit of MINOR_SUITS) {
    for (const rank of MINOR_RANKS) {
      const name = `${rank.label} of ${suit.label}`;
      cards.push({
        id: `minor-${suit.id}-${rank.id}`,
        name,
        keywords: [suit.id, rank.id],
        meaning: "Minor Arcana placeholder (layout test).",
        suit,
        rank
      });
    }
  }
  return cards;
}

const MINORS = buildMinors();

function byId(id) {
  return document.getElementById(id);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function normDeg(deg) {
  const d = deg % 360;
  return d < 0 ? d + 360 : d;
}

function sliceAngle(cardCount) {
  return 360 / Math.max(1, cardCount);
}

function selectedIndexFromRotation(rotationDeg, cardCount) {
  const a = sliceAngle(cardCount);
  const normalized = normDeg(360 - normDeg(rotationDeg)); // see derivation in README notes
  const idx = Math.floor(normalized / a);
  return clamp(idx, 0, cardCount - 1);
}

function polarToCartesian(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx, cy, rOuter, rInner, startDeg, endDeg) {
  const p1 = polarToCartesian(cx, cy, rOuter, startDeg);
  const p2 = polarToCartesian(cx, cy, rOuter, endDeg);
  const p3 = polarToCartesian(cx, cy, rInner, endDeg);
  const p4 = polarToCartesian(cx, cy, rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z"
  ].join(" ");
}

function palette(i) {
  const colors = ["#c2d1ff", "#bfedab", "#f4be18", "#f47920", "#63ceca", "#713e95"];
  return colors[i % colors.length];
}

function minorFill(card, rankIndex) {
  const base = card?.suit?.color ?? "#c2d1ff";
  const opacity = 0.55 + (rankIndex % 2 ? 0.12 : 0);
  return { base, opacity };
}

function renderWheel({ mount, majors, minors, rotationMajors, rotationMinors, activeMajor, activeMinor }) {
  const size = 700;
  const cx = size / 2;
  const cy = size / 2;
  const rMajorOuter = 320;
  const rMajorInner = 212;
  const rMinorOuter = 206;
  const rMinorInner = 120;
  const hubR = 110;

  const aMajor = sliceAngle(majors.length);
  const aMinor = sliceAngle(minors.length);

  const svgParts = [];
  svgParts.push(`<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Tarot wheel (dual rings)">`);
  svgParts.push(`<g id="wheelMajors">`);

  for (let i = 0; i < majors.length; i += 1) {
    const start = -90 + i * aMajor;
    const end = start + aMajor;
    const path = wedgePath(cx, cy, rMajorOuter, rMajorInner, start, end);
    const mid = start + aMajor / 2;
    const labelPos = polarToCartesian(cx, cy, (rMajorOuter + rMajorInner) / 2, mid);
    const card = majors[i];
    const label = `${String(i).padStart(2, "0")}`;
    const cls = `wheelSlice wheelSlice--major${i === activeMajor ? " wheelSlice--active" : ""}`;

    svgParts.push(`<path class="${cls}" data-ring="major" data-idx="${i}" d="${path}" fill="${palette(i)}"></path>`);
    svgParts.push(
      `<text class="sliceLabel" x="${labelPos.x.toFixed(2)}" y="${labelPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${label}</text>`
    );
    const outerPos = polarToCartesian(cx, cy, rMajorOuter - 22, mid);
    const short = (card.name || "").slice(0, 7).toUpperCase();
    svgParts.push(
      `<text class="sliceLabel sliceLabel--outer" x="${outerPos.x.toFixed(2)}" y="${outerPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${short}</text>`
    );
  }

  svgParts.push(`</g>`);
  svgParts.push(`<g id="wheelMinors">`);

  for (let i = 0; i < minors.length; i += 1) {
    const start = -90 + i * aMinor;
    const end = start + aMinor;
    const path = wedgePath(cx, cy, rMinorOuter, rMinorInner, start, end);
    const mid = start + aMinor / 2;
    const labelPos = polarToCartesian(cx, cy, (rMinorOuter + rMinorInner) / 2, mid);
    const card = minors[i];
    const rankIndex = i % MINOR_RANKS.length;
    const { base, opacity } = minorFill(card, rankIndex);
    const cls = `wheelSlice wheelSlice--minor${i === activeMinor ? " wheelSlice--activeMinor" : ""}`;
    const code = `${card.rank?.short ?? "?"}${card.suit?.short ?? "?"}`;
    const show = i % 2 === 0;

    svgParts.push(
      `<path class="${cls}" data-ring="minor" data-idx="${i}" d="${path}" fill="${base}" fill-opacity="${opacity.toFixed(2)}"></path>`
    );
    if (show) {
      svgParts.push(
        `<text class="sliceLabel sliceLabel--minor" x="${labelPos.x.toFixed(2)}" y="${labelPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${code}</text>`
      );
    }
  }

  svgParts.push(`</g>`);

  svgParts.push(`<circle class="wheelRing" cx="${cx}" cy="${cy}" r="${rMajorOuter}"></circle>`);
  svgParts.push(`<circle class="wheelRing wheelRing--minor" cx="${cx}" cy="${cy}" r="${rMinorOuter}"></circle>`);
  svgParts.push(`<circle class="wheelRing wheelRing--minor" cx="${cx}" cy="${cy}" r="${rMajorInner}"></circle>`);
  svgParts.push(`<circle class="wheelRing wheelRing--minor" cx="${cx}" cy="${cy}" r="${rMinorInner}"></circle>`);

  svgParts.push(`<circle class="wheelHub" cx="${cx}" cy="${cy}" r="${hubR}"></circle>`);
  svgParts.push(`<text class="wheelHubText" x="${cx}" y="${cy - 8}" text-anchor="middle">TAROT</text>`);
  svgParts.push(`<text class="wheelHubText" x="${cx}" y="${cy + 12}" text-anchor="middle">WHEEL</text>`);

  svgParts.push(`</svg>`);

  mount.innerHTML = svgParts.join("");

  const wheelMajors = mount.querySelector("#wheelMajors");
  const wheelMinors = mount.querySelector("#wheelMinors");
  if (wheelMajors) wheelMajors.style.transform = `rotate(${rotationMajors}deg)`;
  if (wheelMinors) wheelMinors.style.transform = `rotate(${rotationMinors}deg)`;
}

function renderSelected({ el, major, minor, majorIndex, minorIndex }) {
  if (!el) return;
  if (!major && !minor) {
    el.innerHTML = `<div class="inspect__empty">Throw a dart to select a card pair.</div>`;
    return;
  }
  const tagsMajor = (major?.keywords ?? []).slice(0, 3).map((k) => `<span class="tag">#${k}</span>`).join("");
  const tagsMinor = minor?.suit
    ? `<span class="tag">#${minor.suit.id}</span><span class="tag">#${minor.rank.id}</span>`
    : (minor?.keywords ?? []).slice(0, 3).map((k) => `<span class="tag">#${k}</span>`).join("");
  el.innerHTML = `
    <div class="selected__name">Major: ${String(majorIndex).padStart(2, "0")} — ${major?.name ?? "—"}</div>
    <div class="selected__meta">${major?.meaning ?? ""}</div>
    <div class="selected__tags">${tagsMajor}</div>
    <div style="height: 12px;"></div>
    <div class="selected__name">Minor: ${String(minorIndex + 1).padStart(2, "0")} — ${minor?.name ?? "—"}</div>
    <div class="selected__meta">${minor?.meaning ?? ""}</div>
    <div class="selected__tags">${tagsMinor}</div>
  `;
}

async function spinRingToRandom({ state, ring, cards, strength, durationMs }) {
  const current = ring === "major" ? state.rotationMajors : state.rotationMinors;
  const count = cards.length;
  const a = sliceAngle(count);
  const targetIndex = Math.floor(Math.random() * count);
  const jitter = (Math.random() - 0.5) * a * 0.6;
  const normalized = clamp(targetIndex * a + a / 2 + jitter, targetIndex * a + 3, (targetIndex + 1) * a - 3);
  const desiredMod = normDeg(360 - normalized);
  const currentMod = normDeg(current);
  const deltaMod = normDeg(desiredMod - currentMod);
  const extraTurns = clamp(Number.parseInt(strength ?? "6", 10) || 6, 3, 9);
  const finalRotation = current + extraTurns * 360 + deltaMod;

  if (ring === "major") state.rotationMajors = finalRotation;
  else state.rotationMinors = finalRotation;

  const mount = byId("wheelMount");
  const group = mount?.querySelector(ring === "major" ? "#wheelMajors" : "#wheelMinors");
  if (group) {
    group.style.transition = `transform ${durationMs}ms cubic-bezier(0.15, 0.85, 0.2, 1)`;
    group.style.transform = `rotate(${finalRotation}deg)`;
  }

  return { finalRotation, targetIndex };
}

async function spinToRandom({ state, strength }) {
  if (state.spinning) return;
  state.spinning = true;

  const dart = byId("dart");
  dart?.classList.remove("is-throwing");
  // Restart animation
  void dart?.offsetWidth;
  dart?.classList.add("is-throwing");

  const majors = MAJORS;
  const minors = MINORS;
  const durationMaj = 2100;
  const durationMin = 2300;

  void spinRingToRandom({ state, ring: "major", cards: majors, strength, durationMs: durationMaj });
  void spinRingToRandom({
    state,
    ring: "minor",
    cards: minors,
    strength: clamp((Number.parseInt(strength ?? "6", 10) || 6) + 1, 3, 9),
    durationMs: durationMin
  });

  await new Promise((r) => setTimeout(r, Math.max(durationMaj, durationMin) + 120));

  state.activeMajor = selectedIndexFromRotation(state.rotationMajors, majors.length);
  state.activeMinor = selectedIndexFromRotation(state.rotationMinors, minors.length);
  state.spinning = false;
  renderAll(state);
}

function wireDragRotate({ mount, state, majors, minors }) {
  let dragging = false;
  let startAngle = 0;
  let startRotation = 0;
  let ring = "major";

  const centerFromEvent = (e) => {
    const rect = mount.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ("clientX" in e ? e.clientX : 0) - cx;
    const y = ("clientY" in e ? e.clientY : 0) - cy;
    return { x, y, d: Math.hypot(x, y) };
  };

  const angleDeg = (x, y) => (Math.atan2(y, x) * 180) / Math.PI;

  mount.addEventListener("pointerdown", (e) => {
    if (state.spinning) return;
    dragging = true;
    mount.setPointerCapture(e.pointerId);
    const p = centerFromEvent(e);
    startAngle = angleDeg(p.x, p.y);
    // Decide which ring based on radius (SVG is scaled, so use mount pixels).
    ring = p.d > mount.clientWidth * 0.32 ? "major" : "minor";
    startRotation = ring === "major" ? state.rotationMajors : state.rotationMinors;
  });

  mount.addEventListener("pointermove", (e) => {
    if (!dragging || state.spinning) return;
    const p = centerFromEvent(e);
    const a = angleDeg(p.x, p.y);
    const delta = a - startAngle;
    const nextRotation = startRotation + delta;

    if (ring === "major") state.rotationMajors = nextRotation;
    else state.rotationMinors = nextRotation;

    const idxMajor = selectedIndexFromRotation(state.rotationMajors, majors.length);
    const idxMinor = selectedIndexFromRotation(state.rotationMinors, minors.length);
    state.activeMajor = idxMajor;
    state.activeMinor = idxMinor;

    const group = mount.querySelector(ring === "major" ? "#wheelMajors" : "#wheelMinors");
    if (group) {
      group.style.transition = "transform 0ms linear";
      group.style.transform = `rotate(${nextRotation}deg)`;
    }

    renderSelected({
      el: byId("selected"),
      major: majors[idxMajor],
      minor: minors[idxMinor],
      majorIndex: idxMajor,
      minorIndex: idxMinor
    });
  });

  mount.addEventListener("pointerup", () => {
    dragging = false;
  });
  mount.addEventListener("pointercancel", () => {
    dragging = false;
  });
}

function renderAll(state) {
  const mount = byId("wheelMount");
  if (!mount) return;
  const majors = MAJORS;
  const minors = MINORS;
  state.activeMajor ??= selectedIndexFromRotation(state.rotationMajors ?? 0, majors.length);
  state.activeMinor ??= selectedIndexFromRotation(state.rotationMinors ?? 0, minors.length);
  renderWheel({
    mount,
    majors,
    minors,
    rotationMajors: state.rotationMajors ?? 0,
    rotationMinors: state.rotationMinors ?? 0,
    activeMajor: state.activeMajor,
    activeMinor: state.activeMinor
  });
  renderSelected({
    el: byId("selected"),
    major: majors[state.activeMajor] ?? null,
    minor: minors[state.activeMinor] ?? null,
    majorIndex: state.activeMajor ?? 0,
    minorIndex: state.activeMinor ?? 0
  });

  const strength = byId("strength");
  const strengthValue = byId("strengthValue");
  if (strengthValue && strength) strengthValue.textContent = String(strength.value);
}

function main() {
  const mount = byId("wheelMount");
  if (!mount) throw new Error("wheelMount missing");

  const state = {
    rotationMajors: 0,
    rotationMinors: 0,
    activeMajor: 0,
    activeMinor: 0,
    spinning: false
  };

  renderAll(state);
  wireDragRotate({ mount, state, majors: MAJORS, minors: MINORS });

  const throwBtn = byId("throw");
  if (throwBtn)
    throwBtn.onclick = () => {
      const strength = byId("strength")?.value ?? "6";
      void spinToRandom({ state, strength });
    };

  const reset = byId("reset");
  if (reset)
    reset.onclick = () => {
      state.rotationMajors = 0;
      state.rotationMinors = 0;
      state.activeMajor = 0;
      state.activeMinor = 0;
      state.spinning = false;
      renderAll(state);
    };

  const strength = byId("strength");
  if (strength)
    strength.addEventListener("input", () => {
      const strengthValue = byId("strengthValue");
      if (strengthValue) strengthValue.textContent = String(strength.value);
    });
}

main();
window.__TAROT_WHEEL_VERSION__ = APP_VERSION;
