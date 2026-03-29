const APP_VERSION = "2026-03-29-tarot-wheel-a";

const DECK = {
  deck_id: "rws-wheel-wireframe",
  cards: [
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
  ]
};

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

function renderWheel({ mount, cards, rotationDeg, activeIndex }) {
  const size = 700;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 320;
  const rInner = 110;
  const a = sliceAngle(cards.length);

  const svgParts = [];
  svgParts.push(`<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Tarot wheel">`);
  svgParts.push(`<g id="wheel">`);

  // Slices
  for (let i = 0; i < cards.length; i += 1) {
    const start = -90 + i * a;
    const end = start + a;
    const path = wedgePath(cx, cy, rOuter, rInner, start, end);
    const mid = start + a / 2;
    const labelPos = polarToCartesian(cx, cy, (rOuter + rInner) / 2, mid);
    const card = cards[i];
    const label = `${String(i + 1).padStart(2, "0")}`;
    const cls = `wheelSlice${i === activeIndex ? " wheelSlice--active" : ""}`;

    svgParts.push(
      `<path class="${cls}" data-idx="${i}" d="${path}" fill="${palette(i)}"></path>`
    );
    svgParts.push(
      `<text class="sliceLabel" x="${labelPos.x.toFixed(2)}" y="${labelPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${label}</text>`
    );
    // Small tick text near outer ring: first 6 chars of name
    const outerPos = polarToCartesian(cx, cy, rOuter - 22, mid);
    const short = (card.name || "").slice(0, 7).toUpperCase();
    svgParts.push(
      `<text class="sliceLabel" x="${outerPos.x.toFixed(2)}" y="${outerPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${short}</text>`
    );
  }

  // Outer ring + hub
  svgParts.push(`<circle class="wheelRing" cx="${cx}" cy="${cy}" r="${rOuter}"></circle>`);
  svgParts.push(`<circle class="wheelHub" cx="${cx}" cy="${cy}" r="${rInner - 10}"></circle>`);
  svgParts.push(`<text class="wheelHubText" x="${cx}" y="${cy - 8}" text-anchor="middle">TAROT</text>`);
  svgParts.push(`<text class="wheelHubText" x="${cx}" y="${cy + 12}" text-anchor="middle">WHEEL</text>`);

  svgParts.push(`</g>`);
  svgParts.push(`</svg>`);

  mount.innerHTML = svgParts.join("");

  const wheel = mount.querySelector("#wheel");
  if (wheel) {
    wheel.style.transform = `rotate(${rotationDeg}deg)`;
  }
}

function renderSelected({ el, card, index }) {
  if (!el) return;
  if (!card) {
    el.innerHTML = `<div class="inspect__empty">Throw a dart to select a card.</div>`;
    return;
  }
  const tags = (card.keywords ?? []).slice(0, 3).map((k) => `<span class="tag">#${k}</span>`).join("");
  el.innerHTML = `
    <div class="selected__name">${String(index + 1).padStart(2, "0")} — ${card.name}</div>
    <div class="selected__meta">${card.meaning}</div>
    <div class="selected__tags">${tags}</div>
  `;
}

async function spinToRandom({ state, cards, strength }) {
  if (state.spinning) return;
  state.spinning = true;

  const dart = byId("dart");
  dart?.classList.remove("is-throwing");
  // Restart animation
  void dart?.offsetWidth;
  dart?.classList.add("is-throwing");

  const current = state.rotationDeg;
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

  state.rotationDeg = finalRotation;
  const wheel = byId("wheelMount")?.querySelector("#wheel");
  if (wheel) {
    wheel.style.transition = "transform 2200ms cubic-bezier(0.15, 0.85, 0.2, 1)";
    wheel.style.transform = `rotate(${finalRotation}deg)`;
  }

  await new Promise((r) => setTimeout(r, 2280));

  const idx = selectedIndexFromRotation(finalRotation, count);
  state.activeIndex = idx;
  state.spinning = false;
  renderAll(state);
}

function wireDragRotate({ mount, state, cards }) {
  let dragging = false;
  let startAngle = 0;
  let startRotation = 0;

  const centerFromEvent = (e) => {
    const rect = mount.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ("clientX" in e ? e.clientX : 0) - cx;
    const y = ("clientY" in e ? e.clientY : 0) - cy;
    return { x, y };
  };

  const angleDeg = (x, y) => (Math.atan2(y, x) * 180) / Math.PI;

  mount.addEventListener("pointerdown", (e) => {
    if (state.spinning) return;
    dragging = true;
    mount.setPointerCapture(e.pointerId);
    const p = centerFromEvent(e);
    startAngle = angleDeg(p.x, p.y);
    startRotation = state.rotationDeg;
  });

  mount.addEventListener("pointermove", (e) => {
    if (!dragging || state.spinning) return;
    const p = centerFromEvent(e);
    const a = angleDeg(p.x, p.y);
    const delta = a - startAngle;
    state.rotationDeg = startRotation + delta;
    const idx = selectedIndexFromRotation(state.rotationDeg, cards.length);
    state.activeIndex = idx;

    const wheel = mount.querySelector("#wheel");
    if (wheel) {
      wheel.style.transition = "transform 0ms linear";
      wheel.style.transform = `rotate(${state.rotationDeg}deg)`;
    }

    renderSelected({ el: byId("selected"), card: cards[idx], index: idx });
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
  const cards = DECK.cards;
  renderWheel({ mount, cards, rotationDeg: state.rotationDeg, activeIndex: state.activeIndex });
  renderSelected({ el: byId("selected"), card: cards[state.activeIndex] ?? null, index: state.activeIndex ?? 0 });

  const strength = byId("strength");
  const strengthValue = byId("strengthValue");
  if (strengthValue && strength) strengthValue.textContent = String(strength.value);
}

function main() {
  const mount = byId("wheelMount");
  if (!mount) throw new Error("wheelMount missing");

  const state = {
    rotationDeg: 0,
    activeIndex: 0,
    spinning: false
  };

  renderAll(state);
  wireDragRotate({ mount, state, cards: DECK.cards });

  const throwBtn = byId("throw");
  if (throwBtn)
    throwBtn.onclick = () => {
      const strength = byId("strength")?.value ?? "6";
      void spinToRandom({ state, cards: DECK.cards, strength });
    };

  const reset = byId("reset");
  if (reset)
    reset.onclick = () => {
      state.rotationDeg = 0;
      state.activeIndex = 0;
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

