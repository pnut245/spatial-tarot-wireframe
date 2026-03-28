const STORAGE_KEY = "spatial-tarot-wireframe:v1";
const APP_VERSION = "2026-03-28-graphic-grid";

// Embedded so this works when opening `index.html` directly (no local server needed).
const DECK = {
  deck_id: "rws-wireframe",
  cards: [
    {
      id: "major-00",
      name: "The Fool",
      keywords: ["beginning", "leap", "naivete"],
      meaning: "Starting point, openness, and a willingness to step into the unknown."
    },
    {
      id: "major-01",
      name: "The Magician",
      keywords: ["agency", "tools", "focus"],
      meaning: "Intentional action, skills on hand, and shaping outcomes through attention."
    },
    {
      id: "major-02",
      name: "The High Priestess",
      keywords: ["intuition", "hidden", "silence"],
      meaning: "What is concealed or not yet spoken; trusting inner knowing and subtle signals."
    },
    {
      id: "major-03",
      name: "The Empress",
      keywords: ["growth", "care", "abundance"],
      meaning: "Nurturing, creation, and conditions that allow something to flourish."
    },
    {
      id: "major-04",
      name: "The Emperor",
      keywords: ["structure", "boundary", "authority"],
      meaning: "Stability through structure; leadership, rules, and the shape of responsibility."
    },
    {
      id: "major-05",
      name: "The Hierophant",
      keywords: ["tradition", "teaching", "ritual"],
      meaning: "Learning through tradition and shared practices; values and institutional frames."
    },
    {
      id: "major-06",
      name: "The Lovers",
      keywords: ["choice", "alignment", "bond"],
      meaning: "A meaningful choice; values alignment; relationship as mirror and commitment."
    },
    {
      id: "major-07",
      name: "The Chariot",
      keywords: ["direction", "will", "control"],
      meaning: "Momentum through a chosen direction; holding conflicting forces in tension."
    },
    {
      id: "major-08",
      name: "Strength",
      keywords: ["patience", "courage", "gentleness"],
      meaning: "Durable courage; influence through steadiness rather than force."
    },
    {
      id: "major-09",
      name: "The Hermit",
      keywords: ["search", "pause", "insight"],
      meaning: "Stepping back to see clearly; solitude in service of perspective."
    },
    {
      id: "major-10",
      name: "Wheel of Fortune",
      keywords: ["change", "cycle", "timing"],
      meaning: "Shifts in conditions; cycles and timing; what is in motion beyond control."
    },
    {
      id: "major-11",
      name: "Justice",
      keywords: ["balance", "truth", "consequence"],
      meaning: "Clarity, accountability, and the return of consequences to the present moment."
    },
    {
      id: "major-12",
      name: "The Hanged Man",
      keywords: ["reframe", "pause", "surrender"],
      meaning: "A change in viewpoint; waiting with purpose; letting go of a fixed approach."
    },
    {
      id: "major-13",
      name: "Death",
      keywords: ["ending", "transition", "release"],
      meaning: "A needed ending; clearing space; transition rather than literal finality."
    },
    {
      id: "major-14",
      name: "Temperance",
      keywords: ["integration", "blend", "pace"],
      meaning: "Gradual integration; mixing elements; steadiness and moderation."
    },
    {
      id: "major-15",
      name: "The Devil",
      keywords: ["attachment", "compulsion", "shadow"],
      meaning: "Patterns of attachment; what binds; noticing where choice has narrowed."
    },
    {
      id: "major-16",
      name: "The Tower",
      keywords: ["disruption", "truth", "shock"],
      meaning: "Sudden change; a revealing collapse; disruption that forces honesty."
    },
    {
      id: "major-17",
      name: "The Star",
      keywords: ["hope", "guidance", "renewal"],
      meaning: "Guidance after difficulty; renewal; a quiet, steady North Star."
    },
    {
      id: "major-18",
      name: "The Moon",
      keywords: ["uncertainty", "dream", "projection"],
      meaning: "Ambiguity and projection; moving through uncertainty with care."
    },
    {
      id: "major-19",
      name: "The Sun",
      keywords: ["clarity", "vitality", "confidence"],
      meaning: "Clarity and warmth; energy returns; simple truths become visible."
    },
    {
      id: "major-20",
      name: "Judgement",
      keywords: ["reckoning", "call", "decision"],
      meaning: "A call to step forward; honest appraisal; moving from past to next chapter."
    },
    {
      id: "major-21",
      name: "The World",
      keywords: ["completion", "integration", "cycle"],
      meaning: "Completion and integration; seeing the whole; one cycle closing cleanly."
    }
  ]
};

const SLOT_DEFS = [
  { code: "A", label: "Theme / frame" },
  { code: "B", label: "Crossing influence" },
  { code: "C", label: "Resource / support" },
  { code: "D", label: "Trajectory / outcome" }
];

const PLANES = [
  { id: "understory", label: "Understory" },
  { id: "surface", label: "Surface" },
  { id: "horizon", label: "Horizon" }
];

const PLANE_ACCENTS = {
  understory: "rgba(167, 139, 250, 0.92)",
  surface: "rgba(125, 211, 252, 0.92)",
  horizon: "rgba(52, 211, 153, 0.92)",
  none: "rgba(231, 238, 252, 0.5)"
};

const DEAL_SEQUENCE = (() => {
  // Fill by correspondence stack (A→D), and within each stack fill hidden→present→trajectory.
  const order = [];
  for (const slot of SLOT_DEFS) {
    for (const plane of PLANES) {
      order.push({ plane: plane.id, code: slot.code });
    }
  }
  return order;
})();

function planeLabel(planeId) {
  return PLANES.find((p) => p.id === planeId)?.label ?? "Hand";
}

function planeAccent(planeId) {
  return PLANE_ACCENTS[planeId] ?? PLANE_ACCENTS.none;
}

function majorNumber(cardId) {
  const m = (cardId ?? "").match(/major-(\d+)/);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function glyphTypeForCard(card) {
  if (!card) return "circle";
  if (card.name === "The Sun") return "sun";
  if (card.name === "The Moon") return "moon";
  if (card.name === "The Star") return "star";

  const n = majorNumber(card.id);
  const cycle = ["circle", "triangle", "square", "diamond", "wave", "eye", "spiral", "cross"];
  if (n === null) return cycle[0];
  return cycle[n % cycle.length];
}

function glyphSvg(type) {
  switch (type) {
    case "triangle":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4L21 20H3L12 4Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
    case "square":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
    case "diamond":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3L21 12L12 21L3 12L12 3Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
    case "wave":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13c3.5 0 3.5-6 7-6s3.5 6 7 6 3.5-6 7-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    case "eye":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
    case "spiral":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c0-2.8 2.2-5 5-5 2.2 0 4 1.8 4 4 0 4.4-3.6 8-8 8-5.5 0-10-4.5-10-10C3 5.7 5.7 3 9 3c2.8 0 5 2.2 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    case "cross":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    case "moon":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 2c-2.6 1.2-4.5 3.9-4.5 7.1 0 4.4 3.6 8 8 8 1.1 0 2.1-.2 3-.6-1.6 3.6-5.2 6.1-9.4 6.1C7.5 22.6 3 18.1 3 12.6 3 7.5 6.8 3.3 11.8 2.6 13.4 2.3 14.8 2.2 16 2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
    case "sun":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M19.8 4.2l-2.1 2.1M6.3 17.7l-2.1 2.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    case "star":
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 6.1 6.6.6-5 4.3 1.5 6.4L12 17.9 6.3 20.4 7.8 14 2.8 9.7l6.6-.6L12 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
    case "circle":
    default:
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
  }
}

function cardBadgesHtml(inst, { slotCode } = {}) {
  const badges = [];
  const faceUp = inst.face_up;
  badges.push(faceUp ? `<span class="badge badge--up">UP</span>` : `<span class="badge badge--down">DOWN</span>`);
  if (inst.reversed) badges.push(`<span class="badge badge--rev">REV</span>`);
  if (slotCode) badges.push(`<span class="badge">SLOT ${slotCode}</span>`);
  return badges.join("");
}

function cardBadgesHtmlWithOverrides(inst, { slotCode, faceUpOverride } = {}) {
  const badges = [];
  const faceUp = typeof faceUpOverride === "boolean" ? faceUpOverride : inst.face_up;
  badges.push(faceUp ? `<span class="badge badge--up">UP</span>` : `<span class="badge badge--down">DOWN</span>`);
  if (inst.reversed) badges.push(`<span class="badge badge--rev">REV</span>`);
  if (slotCode) badges.push(`<span class="badge">SLOT ${slotCode}</span>`);
  return badges.join("");
}

function cardMiniHtml({ inst, card, planeId, slotCode, context }) {
  const glyph = glyphTypeForCard(card);
  const meta =
    context === "placed"
      ? `${planeLabel(planeId)} • Slot ${slotCode}`
      : card.keywords.map((k) => `#${k}`).slice(0, 3).join(" ");

  return `
    <div class="tarot-card__inner" aria-hidden="true">
      <div class="tarot-card__face tarot-card__face--back">
        <div class="tarot-card__top">
          <div class="tarot-card__corner">#${inst.draw_n ?? "—"}</div>
          <div class="tarot-card__badges">${cardBadgesHtmlWithOverrides(inst, { slotCode: context === "placed" ? slotCode : null, faceUpOverride: false })}</div>
        </div>
        <div class="tarot-card__glyph tarot-card__glyph--back">${glyphSvg("cross")}</div>
        <div class="tarot-card__body">
          <div class="tarot-card__name">Face-down</div>
          <div class="tarot-card__meta">${context === "placed" ? meta : "Dealing… then reveal"}</div>
        </div>
      </div>
      <div class="tarot-card__face tarot-card__face--front">
        <div class="tarot-card__top">
          <div class="tarot-card__corner">#${inst.draw_n ?? "—"}</div>
          <div class="tarot-card__badges">${cardBadgesHtmlWithOverrides(inst, { slotCode: context === "placed" ? slotCode : null, faceUpOverride: true })}</div>
        </div>
        <div class="tarot-card__glyph">${glyphSvg(glyph)}</div>
        <div class="tarot-card__body">
          <div class="tarot-card__name">${card.name}</div>
          <div class="tarot-card__meta">${meta}</div>
        </div>
      </div>
    </div>
  `;
}

function nowIso() {
  return new Date().toISOString();
}

function byId(id) {
  return document.getElementById(id);
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function seedFromCryptoOrTime() {
  try {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] || (Date.now() >>> 0);
  } catch {
    // Fallback if crypto isn't available.
    return ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0) || 1;
  }
}

function ensureRng(state) {
  state.rng ||= { seed: null, state: null, calls: 0 };
  if (!Number.isFinite(state.rng.seed)) state.rng.seed = seedFromCryptoOrTime();
  if (!Number.isFinite(state.rng.state) || state.rng.state === 0) {
    // xorshift32 cannot start with 0
    state.rng.state = (state.rng.seed >>> 0) || 1;
  }
  if (!Number.isFinite(state.rng.calls)) state.rng.calls = 0;
}

function rngUint32(state) {
  ensureRng(state);
  // xorshift32
  let x = state.rng.state >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.rng.state = x >>> 0;
  state.rng.calls += 1;
  return state.rng.state;
}

function rngFloat01(state) {
  // [0, 1)
  return rngUint32(state) / 4294967296;
}

function rngInt(state, maxExclusive) {
  if (maxExclusive <= 0) return 0;
  return Math.floor(rngFloat01(state) * maxExclusive);
}

function clampText(value, max = 140) {
  const s = (value ?? "").toString().trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms | 0)));
}

function getDealDelayMs() {
  const el = byId("deal-delay");
  const n = Number.parseInt(el?.value ?? "0", 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function defaultState(deck) {
  const cardById = Object.fromEntries(deck.cards.map((c) => [c.id, c]));
  return {
    version: 1,
    session_id: uid("session"),
    created_at: nowIso(),
    question: "",
    rng: { seed: seedFromCryptoOrTime(), state: null, calls: 0 },
    deck_id: deck.deck_id,
    remaining: deck.cards.map((c) => c.id),
    seq: {
      next_draw_number: 1
    },
    hand: [],
    placed: {}, // `${plane}:${code}` => instanceId
    instances: {}, // instanceId => {id, card_id, face_up, reversed, plane, slot_code, note, drawn_at}
    notes: {}, // instanceId => {text, updated_at}
    events: [], // append-only log for export/replay
    metrics: {
      first_draw_at: null,
      first_place_at: null
    },
    ui: {
      selected_instance_id: null,
      selected_hand_instance_id: null,
      hovered_slot_code: null,
      hovered_plane: null
    },
    _cardById: cardById
  };
}

function addEvent(state, type, payload = {}) {
  state.events.push({
    id: uid("evt"),
    at: nowIso(),
    type,
    payload
  });
}

function formatDurationMs(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "—";
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m > 0) return `${m}:${s.toString().padStart(2, "0")}`;
  return `${s}s`;
}

function msBetweenIso(a, b) {
  if (!a || !b) return null;
  const ams = Date.parse(a);
  const bms = Date.parse(b);
  if (Number.isNaN(ams) || Number.isNaN(bms)) return null;
  return bms - ams;
}

function getSlotDef(code) {
  return SLOT_DEFS.find((s) => s.code === code) ?? null;
}

function getActiveSlotCode(state) {
  const hovered = state.ui?.hovered_slot_code;
  if (hovered) return hovered;
  const selectedId = state.ui?.selected_instance_id;
  const selectedInst = selectedId ? state.instances[selectedId] : null;
  return selectedInst?.slot_code ?? null;
}

function updateCorrespondenceHighlight(state) {
  const activeCode = getActiveSlotCode(state);
  const allSlots = document.querySelectorAll(".slot");
  for (const s of allSlots)
    s.classList.toggle("slot--corresponding", Boolean(activeCode) && s.dataset.code === activeCode);

  const headers = document.querySelectorAll(".board__header");
  for (const h of headers)
    h.classList.toggle("board__header--active", Boolean(activeCode) && h.dataset.code === activeCode);
}

function setHoveredSlot(state, { plane, code, on }) {
  state.ui ||= {};
  if (on) {
    state.ui.hovered_slot_code = code;
    state.ui.hovered_plane = plane;
  } else if (state.ui.hovered_slot_code === code && state.ui.hovered_plane === plane) {
    state.ui.hovered_slot_code = null;
    state.ui.hovered_plane = null;
  }
  updateCorrespondenceHighlight(state);
  renderCorrespondence(state);
}

function ensureSlotContainers() {
  const board = document.getElementById("board");
  if (!board) return;

  const planeSubtitles = {
    understory: "Hidden drivers",
    surface: "Present snapshot",
    horizon: "Trajectory"
  };

  board.innerHTML = "";

  const corner = document.createElement("div");
  corner.className = "board__corner";
  corner.innerHTML = `<div><strong>Plane</strong> ↓</div><div><strong>Slot</strong> →</div>`;
  board.appendChild(corner);

  for (const slot of SLOT_DEFS) {
    const header = document.createElement("div");
    header.className = "board__header";
    header.dataset.code = slot.code;
    header.innerHTML = `
      <div class="board__headerTop">
        <div class="board__code">${slot.code}</div>
      </div>
      <div class="board__headerLabel">${slot.label}</div>
    `;
    board.appendChild(header);
  }

  for (const plane of PLANES) {
    const rowLabel = document.createElement("div");
    rowLabel.className = "board__rowLabel";
    rowLabel.innerHTML = `
      <div class="board__rowTitle board__rowTitle--${plane.id}">${plane.label}</div>
      <div class="board__rowSub">${planeSubtitles[plane.id] ?? ""}</div>
    `;
    board.appendChild(rowLabel);

    for (const slot of SLOT_DEFS) {
      const slotId = `${plane.id}:${slot.code}`;
      const div = document.createElement("div");
      div.className = "slot slot--empty";
      div.dataset.plane = plane.id;
      div.dataset.code = slot.code;
      div.dataset.slotId = slotId;
      div.tabIndex = 0;
      div.style.setProperty("--plane-accent", planeAccent(plane.id));
      div.innerHTML = `<div class="slot__drop">Drop / click to place</div>`;
      board.appendChild(div);
    }
  }
}

function nextEmptyDealSlot(state) {
  for (const step of DEAL_SEQUENCE) {
    const key = `${step.plane}:${step.code}`;
    if (!state.placed[key]) return step;
  }
  return null;
}

function renderHand(state) {
  const handEl = byId("hand");
  if (!handEl) return;
  handEl.innerHTML = "";
  if (state.hand.length === 0) {
    const empty = document.createElement("div");
    empty.className = "hint";
    empty.textContent = "No cards in hand yet. Draw cards to begin.";
    handEl.appendChild(empty);
    return;
  }

  for (const instanceId of state.hand) {
    const inst = state.instances[instanceId];
    const card = state._cardById[inst.card_id];
    const div = document.createElement("div");
    div.className = "tarot-card";
    div.draggable = true;
    div.dataset.instanceId = instanceId;
    div.dataset.faceUp = inst.face_up ? "true" : "false";
    div.dataset.reversed = inst.reversed ? "true" : "false";
    div.style.setProperty("--plane-accent", planeAccent(inst.plane));
    if (state.ui.selected_hand_instance_id === instanceId) div.classList.add("tarot-card--selected");
    div.innerHTML = cardMiniHtml({ inst, card, planeId: inst.plane, slotCode: inst.slot_code, context: "hand" });
    div.addEventListener("dragstart", (e) => {
      e.dataTransfer?.setData("text/plain", instanceId);
      e.dataTransfer?.setData("application/x-spatial-tarot-instance", instanceId);
    });
    div.addEventListener("click", () => {
      state.ui.selected_hand_instance_id =
        state.ui.selected_hand_instance_id === instanceId ? null : instanceId;
      state.ui.selected_instance_id = instanceId;
      addEvent(state, "ui.select", { instance_id: instanceId });
      saveState(state);
      renderAll(state);
    });
    handEl.appendChild(div);
  }
}

function renderSlots(state) {
  const next = nextEmptyDealSlot(state);
  const nextKey = next ? `${next.plane}:${next.code}` : null;

  const allSlots = document.querySelectorAll(".slot");
  for (const slot of allSlots) {
    const plane = slot.dataset.plane;
    const code = slot.dataset.code;
    const key = `${plane}:${code}`;
    const instanceId = state.placed[key];

    slot.classList.toggle("slot--occupied", Boolean(instanceId));
    slot.classList.toggle("slot--empty", !instanceId);
    slot.classList.remove("slot--active");
    slot.classList.toggle("slot--next", Boolean(nextKey) && !instanceId && key === nextKey);

    const dropText = slot.querySelector(".slot__drop");
    if (dropText) dropText.textContent = instanceId ? "" : "Drop / click to place";

    const existingCard = slot.querySelector(".tarot-card");
    if (!instanceId) {
      if (existingCard) existingCard.remove();
    } else {
      const inst = state.instances[instanceId];
      const card = state._cardById[inst.card_id];
      const shouldReplace = !existingCard || existingCard.dataset.instanceId !== instanceId;

      const cardDiv = shouldReplace ? document.createElement("div") : existingCard;
      if (shouldReplace) {
        cardDiv.className = "tarot-card";
        cardDiv.dataset.instanceId = instanceId;
        cardDiv.addEventListener("click", () => {
          state.ui.selected_instance_id = instanceId;
          state.ui.selected_hand_instance_id = null;
          addEvent(state, "ui.select", { instance_id: instanceId });
          saveState(state);
          renderAll(state);
        });
      }

      cardDiv.dataset.faceUp = inst.face_up ? "true" : "false";
      cardDiv.dataset.reversed = inst.reversed ? "true" : "false";
      cardDiv.style.setProperty("--plane-accent", planeAccent(plane));
      cardDiv.classList.toggle("tarot-card--selected", state.ui.selected_instance_id === instanceId);
      cardDiv.classList.toggle("tarot-card--dealt", state.ui.last_dealt_instance_id === instanceId);

      // Only rewrite inner HTML when creating/replacing the card element. This allows CSS flip transitions.
      if (shouldReplace || !cardDiv.querySelector(".tarot-card__inner")) {
        cardDiv.innerHTML = cardMiniHtml({ inst, card, planeId: plane, slotCode: code, context: "placed" });
      }

      if (shouldReplace) slot.appendChild(cardDiv);
    }

    slot.onmouseenter = () => setHoveredSlot(state, { plane, code, on: true });
    slot.onmouseleave = () => setHoveredSlot(state, { plane, code, on: false });
    slot.onfocus = () => setHoveredSlot(state, { plane, code, on: true });
    slot.onblur = () => setHoveredSlot(state, { plane, code, on: false });

    slot.ondragover = (e) => {
      e.preventDefault();
      slot.classList.add("slot--active");
    };
    slot.ondragleave = () => slot.classList.remove("slot--active");
    slot.ondrop = (e) => {
      e.preventDefault();
      slot.classList.remove("slot--active");
      const instanceIdFromDnD =
        e.dataTransfer?.getData("application/x-spatial-tarot-instance") ||
        e.dataTransfer?.getData("text/plain");
      if (!instanceIdFromDnD) return;
      placeIntoSlot(state, instanceIdFromDnD, plane, code);
    };

    slot.onclick = () => {
      const selectedFromHand = state.ui.selected_hand_instance_id;
      if (!selectedFromHand) return;
      placeIntoSlot(state, selectedFromHand, plane, code);
    };
  }
}

function placeIntoSlot(state, instanceId, plane, code) {
  if (!state.instances[instanceId]) return;
  const key = `${plane}:${code}`;

  // If slot occupied, do nothing for wireframe (keeps behavior predictable for testing).
  if (state.placed[key]) {
    addEvent(state, "place.blocked", { reason: "slot_occupied", slot: key, instance_id: instanceId });
    saveState(state);
    renderAll(state);
    return;
  }

  // Remove from hand.
  state.hand = state.hand.filter((id) => id !== instanceId);

  // If previously placed elsewhere, clear that mapping.
  for (const [k, v] of Object.entries(state.placed)) {
    if (v === instanceId) delete state.placed[k];
  }

  state.placed[key] = instanceId;
  state.instances[instanceId].plane = plane;
  state.instances[instanceId].slot_code = code;
  state.ui.selected_hand_instance_id = null;
  state.ui.selected_instance_id = instanceId;

  state.metrics ||= { first_draw_at: null, first_place_at: null };
  if (!state.metrics.first_place_at) state.metrics.first_place_at = nowIso();

  addEvent(state, "place", { instance_id: instanceId, plane, slot_code: code });
  saveState(state);
  renderAll(state);
}

function drawOneInstance(state, { kind, faceUp = true } = {}) {
  if (state.remaining.length === 0) return null;
  ensureRng(state);
  const idx = rngInt(state, state.remaining.length);
  const cardId = state.remaining.splice(idx, 1)[0];
  const instanceId = uid("inst");
  const drawN = state.seq.next_draw_number;
  state.seq.next_draw_number += 1;
  state.instances[instanceId] = {
    id: instanceId,
    card_id: cardId,
    face_up: Boolean(faceUp),
    reversed: rngFloat01(state) < 0.18,
    plane: null,
    slot_code: null,
    draw_n: drawN,
    drawn_at: nowIso(),
    kind
  };
  addEvent(state, "draw", { instance_id: instanceId, card_id: cardId, kind });
  return instanceId;
}

function dealInstancesIntoNextSlots(state, instanceIds) {
  for (const instanceId of instanceIds) {
    const next = nextEmptyDealSlot(state);
    if (!next) break;
    placeIntoSlot(state, instanceId, next.plane, next.code);
  }
}

function updateDealDelayLabel() {
  const valueEl = byId("deal-delay-value");
  if (!valueEl) return;
  const ms = getDealDelayMs();
  valueEl.textContent = `${ms}ms`;
}

async function dealToBoardWithDelay(state, count, { kind }) {
  state.ui ||= {};
  state.ui.dealing = true;
  const jobId = uid("dealjob");
  state.ui.deal_job_id = jobId;
  saveState(state);
  renderAll(state);

  updateDealDelayLabel();
  const delayMs = getDealDelayMs();
  const revealMs = delayMs > 0 ? Math.min(450, Math.max(180, Math.round(delayMs * 0.55))) : 0;

  for (let i = 0; i < count; i += 1) {
    if (state.ui.deal_job_id !== jobId) break;
    const next = nextEmptyDealSlot(state);
    if (!next) break;

    // Deal as face-down first, then reveal (auto-flip) to emulate a human reading.
    const instanceId = drawOneInstance(state, { kind, faceUp: false });
    if (!instanceId) break;

    // Place directly to board (no hand interaction in auto-draw mode).
    const key = `${next.plane}:${next.code}`;
    state.placed[key] = instanceId;
    state.instances[instanceId].plane = next.plane;
    state.instances[instanceId].slot_code = next.code;
    state.ui.selected_instance_id = instanceId;
    state.ui.selected_hand_instance_id = null;
    state.ui.last_dealt_instance_id = instanceId;

    state.metrics ||= { first_draw_at: null, first_place_at: null };
    if (!state.metrics.first_draw_at) state.metrics.first_draw_at = state.instances[instanceId].drawn_at;
    if (!state.metrics.first_place_at) state.metrics.first_place_at = nowIso();

    addEvent(state, "place", { instance_id: instanceId, plane: next.plane, slot_code: next.code });
    saveState(state);
    renderAll(state);

    if (revealMs > 0) await sleep(revealMs);
    if (state.ui.deal_job_id !== jobId) break;

    // Reveal (flip face-up).
    const inst = state.instances[instanceId];
    if (inst && !inst.face_up) {
      inst.face_up = true;
      addEvent(state, "card.flip", { instance_id: instanceId, face_up: true, mode: "auto_reveal" });
      saveState(state);
      renderAll(state);
    }

    // Keep pacing between placements (pace includes reveal time).
    const remainingPace = delayMs - revealMs;
    if (remainingPace > 0 && i < count - 1) await sleep(remainingPace);
  }

  if (state.ui.deal_job_id === jobId) {
    state.ui.deal_job_id = null;
    state.ui.dealing = false;
    saveState(state);
    renderAll(state);
  }
}

function dealEmptySlots(state, { kind, limit = Infinity } = {}) {
  const filled = [];
  let placedCount = 0;
  for (const step of DEAL_SEQUENCE) {
    if (placedCount >= limit) break;
    const key = `${step.plane}:${step.code}`;
    if (state.placed[key]) continue;
    const instanceId = drawOneInstance(state, { kind: kind ?? "deal" });
    if (!instanceId) break;
    // Place without going through hand.
    state.placed[key] = instanceId;
    state.instances[instanceId].plane = step.plane;
    state.instances[instanceId].slot_code = step.code;
    state.ui.selected_instance_id = instanceId;
    state.ui.selected_hand_instance_id = null;
    addEvent(state, "place", { instance_id: instanceId, plane: step.plane, slot_code: step.code });
    filled.push(instanceId);
    placedCount += 1;
  }

  if (filled.length > 0) {
    state.metrics ||= { first_draw_at: null, first_place_at: null };
    if (!state.metrics.first_draw_at) state.metrics.first_draw_at = state.instances[filled[0]].drawn_at;
    if (!state.metrics.first_place_at) state.metrics.first_place_at = nowIso();
  }

  saveState(state);
  renderAll(state);
}

function renderInspect(state) {
  const inspectEl = byId("inspect");
  if (!inspectEl) return;
  inspectEl.innerHTML = "";

  const instanceId = state.ui.selected_instance_id;
  if (!instanceId || !state.instances[instanceId]) {
    inspectEl.innerHTML = `<div class="inspect__empty">Select a card to inspect.</div>`;
    return;
  }

  const inst = state.instances[instanceId];
  const card = state._cardById[inst.card_id];
  const noteText = (state.notes[instanceId]?.text ?? "").trim();
  const glyph = glyphTypeForCard(card);
  const title = inst.face_up ? card.name : "Face-down";
  const meaning = inst.face_up
    ? card.meaning
    : "Flip to reveal the card name + meaning. (Wireframe note: the glyph stays visible so you can track cards.)";

  inspectEl.innerHTML = `
    <div class="tarot-card__glyph" style="justify-self: start; place-items: start; margin-bottom: 6px; color: var(--plane-accent, rgba(231, 238, 252, 0.82));">${glyphSvg(glyph)}</div>
    <div class="inspect__name">${title}</div>
    <div class="inspect__meaning">${meaning}</div>
    <div class="inspect__tags">
      <span class="tag tag--plane">${inst.plane ?? "in hand"}</span>
      <span class="tag tag--slot">${inst.slot_code ?? "—"}</span>
      <span class="tag">${inst.face_up ? "face-up" : "face-down"}</span>
      <span class="tag">${inst.reversed ? "reversed" : "upright"}</span>
      ${noteText ? `<span class="tag">note</span>` : ""}
    </div>
    <div class="row" style="margin-top: 12px;">
      <button class="btn btn--primary" id="flip-card" type="button">Flip</button>
      <button class="btn" id="toggle-reversal" type="button">Reverse</button>
      <button class="btn" id="return-to-hand" type="button">To hand</button>
    </div>
  `;

  const flipBtn = byId("flip-card");
  if (flipBtn)
    flipBtn.onclick = () => {
    inst.face_up = !inst.face_up;
    addEvent(state, "card.flip", { instance_id: instanceId, face_up: inst.face_up });
    saveState(state);
    renderAll(state);
  };

  const reverseBtn = byId("toggle-reversal");
  if (reverseBtn)
    reverseBtn.onclick = () => {
    inst.reversed = !inst.reversed;
    addEvent(state, "card.reverse", { instance_id: instanceId, reversed: inst.reversed });
    saveState(state);
    renderAll(state);
  };

  const toHandBtn = byId("return-to-hand");
  if (toHandBtn)
    toHandBtn.onclick = () => {
    // Clear placement mapping.
    for (const [k, v] of Object.entries(state.placed)) {
      if (v === instanceId) delete state.placed[k];
    }
    inst.plane = null;
    inst.slot_code = null;
    if (!state.hand.includes(instanceId)) state.hand.unshift(instanceId);
    addEvent(state, "hand.return", { instance_id: instanceId });
    saveState(state);
    renderAll(state);
  };
}

function renderLog(state) {
  const logEl = byId("log");
  if (!logEl) return;
  logEl.innerHTML = "";
  const rows = state.events.slice(-80).reverse();
  for (const evt of rows) {
    const div = document.createElement("div");
    div.className = "log__row";
    const at = evt.at.replace("T", " ").replace("Z", "Z");
    div.textContent = `${at}  ${evt.type}  ${clampText(JSON.stringify(evt.payload), 120)}`;
    logEl.appendChild(div);
  }
}

function renderMetrics(state) {
  const el = byId("metrics");
  if (!el) return;

  const drawnCount = Object.keys(state.instances).length;
  const placedCount = Object.keys(state.placed).length;
  const blockedCount = state.events.filter((e) => e.type === "place.blocked").length;
  const ms = msBetweenIso(state.metrics?.first_draw_at, state.metrics?.first_place_at);
  const remaining = state.remaining?.length ?? 0;
  const seed = state.rng?.seed ?? "—";
  const next = nextEmptyDealSlot(state);
  const nextText = next ? `${planeLabel(next.plane)} ${next.code}` : "—";

  el.innerHTML = `
    <div class="metrics__row"><span class="metrics__label">Drawn</span><span class="metrics__value">${drawnCount}</span></div>
    <div class="metrics__row"><span class="metrics__label">Remaining</span><span class="metrics__value">${remaining}</span></div>
    <div class="metrics__row"><span class="metrics__label">Placed</span><span class="metrics__value">${placedCount}</span></div>
    <div class="metrics__row"><span class="metrics__label">Blocked</span><span class="metrics__value">${blockedCount}</span></div>
    <div class="metrics__row"><span class="metrics__label">First placement (from draw)</span><span class="metrics__value">${formatDurationMs(ms)}</span></div>
    <div class="metrics__row"><span class="metrics__label">Auto-deal next</span><span class="metrics__value">${nextText}</span></div>
    <div class="metrics__row"><span class="metrics__label">Seed</span><span class="metrics__value">${seed}</span></div>
  `;
}

function renderCorrespondence(state) {
  const el = byId("correspondence");
  if (!el) return;

  const code = getActiveSlotCode(state);
  if (!code) {
    el.innerHTML = `<div class="inspect__empty">Hover a slot (A/B/C/D) to see the vertical stack across planes.</div>`;
    return;
  }

  const def = getSlotDef(code);
  const label = def ? def.label : "Slot";

  const rows = PLANES.map((p) => {
    const key = `${p.id}:${code}`;
    const instanceId = state.placed[key];
    if (!instanceId) return { plane: p, text: "— empty —", empty: true };
    const inst = state.instances[instanceId];
    const card = state._cardById[inst.card_id];
    const base = inst.face_up ? card.name : `Face-down (#${inst.draw_n ?? "—"})`;
    const suffix = inst.reversed ? " (reversed)" : "";
    return { plane: p, text: `${base}${suffix}`, empty: false };
  });

  el.innerHTML = `
    <div class="correspondence__title">Slot ${code} — ${label}</div>
    <div class="correspondence__hint">Read down the stack: hidden → present → trajectory.</div>
    <div class="stack">
      ${rows
        .map(
          (r) => `
        <div class="stack__row">
          <div class="stack__plane stack__plane--${r.plane.id}">${r.plane.label}</div>
          <div class="stack__card ${r.empty ? "stack__empty" : ""}">${r.text}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function openModal({ title, text, onDownload, downloadLabel }) {
  const modal = byId("modal");
  const pre = byId("modal-pre");
  const titleEl = byId("modal-title");
  const dl = byId("download-json");
  if (!modal || !pre || !titleEl || !dl) return;
  const footer = dl.closest(".modal__footer");

  titleEl.textContent = title;
  pre.textContent = text;
  modal.classList.remove("hidden");

  const close = () => modal.classList.add("hidden");
  const closeBtn = byId("modal-close");
  const backdrop = byId("modal-backdrop");
  if (closeBtn) closeBtn.onclick = close;
  if (backdrop) backdrop.onclick = close;

  const hasDownload = typeof onDownload === "function";
  footer?.classList.toggle("hidden", !hasDownload);
  dl.textContent = downloadLabel ?? "Download JSON";
  dl.onclick = hasDownload ? onDownload : () => {};
}

function exportState(state) {
  const drawnCount = Object.keys(state.instances).length;
  const placedCount = Object.keys(state.placed).length;
  const blockedCount = state.events.filter((e) => e.type === "place.blocked").length;
  const timeToFirstPlaceMs = msBetweenIso(state.metrics?.first_draw_at, state.metrics?.first_place_at);
  const exportable = {
    version: state.version,
    session_id: state.session_id,
    created_at: state.created_at,
    exported_at: nowIso(),
    question: state.question,
    deck_id: state.deck_id,
    rng: state.rng ?? null,
    spread: {
      type: "volumetric_cross_wireframe",
      planes: PLANES.map((p) => p.id),
      slots: SLOT_DEFS.map((s) => s.code)
    },
    metrics: {
      drawn_count: drawnCount,
      placed_count: placedCount,
      place_blocked_count: blockedCount,
      first_draw_at: state.metrics?.first_draw_at ?? null,
      first_place_at: state.metrics?.first_place_at ?? null,
      time_to_first_place_ms: timeToFirstPlaceMs
    },
    remaining: state.remaining ?? [],
    hand: state.hand ?? [],
    instances: state.instances,
    placed: state.placed,
    notes: state.notes,
    events: state.events
  };
  return exportable;
}

function renderAll(state) {
  const questionEl = byId("question");
  if (questionEl) questionEl.value = state.question ?? "";

  const noteEl = byId("note");
  const selected = state.ui.selected_instance_id;
  if (noteEl) noteEl.value = selected ? state.notes[selected]?.text ?? "" : "";

  updateDealDelayLabel();
  const isDealing = Boolean(state.ui?.dealing);
  const dealBtns = ["deal-next", "deal-full"];
  for (const id of dealBtns) {
    const btn = byId(id);
    if (btn) btn.disabled = isDealing;
  }
  const delayEl = byId("deal-delay");
  if (delayEl) delayEl.disabled = isDealing;

  renderHand(state);
  renderSlots(state);
  updateCorrespondenceHighlight(state);
  renderInspect(state);
  renderCorrespondence(state);
  renderMetrics(state);
  renderLog(state);
}

function showScreen(screen) {
  const home = byId("screen-home");
  const session = byId("screen-session");
  if (!home || !session) return;
  home.classList.toggle("hidden", screen !== "home");
  session.classList.toggle("hidden", screen !== "session");
}

function resetState(deck) {
  const state = defaultState(deck);
  ensureRng(state);
  addEvent(state, "session.start", { mode: "3d_web_wireframe", method: "volumetric_cross" });
  saveState(state);
  return state;
}

function wireControls(state, deck) {
  const homeStart = byId("home-start");
  if (homeStart)
    homeStart.onclick = () => {
      showScreen("session");
      addEvent(state, "ui.start", {});
      saveState(state);
      renderAll(state);
    };

  const navHome = byId("nav-home");
  if (navHome) navHome.onclick = () => showScreen("home");
  const navSession = byId("nav-session");
  if (navSession) navSession.onclick = () => showScreen("session");

  const navHelp = byId("nav-help");
  if (navHelp)
    navHelp.onclick = () => {
    addEvent(state, "ui.help", {});
    saveState(state);
    openModal({
      title: "Help (Volumetric Cross)",
      text:
        "Planes are discrete layers:\\n" +
        "- Understory: hidden drivers / subconscious influences\\n" +
        "- Surface: present snapshot\\n" +
        "- Horizon: likely trajectory / advice\\n\\n" +
        "Correspondence = same slot letter (A/B/C/D) across planes.\\n" +
        "Hover a slot to highlight the vertical stack + see it in the Correspondence panel.\\n\\n" +
        "Auto-deal:\\n" +
        "- Fills slots by stack: A then B then C then D\\n" +
        "- Within a stack: Understory → Surface → Horizon\\n" +
        "- Deals face-down, then flips to reveal\\n" +
        "- Deal pace adds a short delay between cards\\n" +
        "- The next target slot is highlighted in amber\\n\\n" +
        "Input (rare):\\n" +
        "- If the board is full, extra cards go to Hand\\n" +
        "- You can drag/click from Hand to place manually\\n\\n" +
        "Inspect:\\n" +
        "- Select a card to flip/reverse + add a note\\n\\n" +
        "Export:\\n" +
        "- Use Export JSON to share the session log + snapshot.",
      onDownload: null
    });
  };

  const navExport = byId("nav-export");
  if (navExport)
    navExport.onclick = () => {
    const exported = exportState(state);
    openModal({
      title: "Export (copy/paste or download)",
      text: JSON.stringify(exported, null, 2),
      onDownload: () => downloadJson(`spatial-tarot-${state.session_id}.json`, exported),
      downloadLabel: "Download JSON"
    });
  };

  const navReset = byId("nav-reset");
  if (navReset)
    navReset.onclick = () => {
    const next = resetState(deck);
    Object.assign(state, next);
    showScreen("home");
    renderAll(state);
  };

  const questionEl = byId("question");
  if (questionEl)
    questionEl.addEventListener("input", (e) => {
      const value = e.target.value ?? "";
      state.question = value;
      addEvent(state, "question.update", { value: clampText(value, 280) });
      saveState(state);
    });

  const dealNext = byId("deal-next");
  if (dealNext) dealNext.onclick = () => dealToBoardWithDelay(state, 1, { kind: "draw" });

  const dealDelay = byId("deal-delay");
  if (dealDelay)
    dealDelay.addEventListener("input", () => {
      updateDealDelayLabel();
      addEvent(state, "ui.deal_delay", { ms: getDealDelayMs() });
      saveState(state);
    });

  const dealFull = byId("deal-full");
  if (dealFull)
    dealFull.onclick = () => {
      // Fill as many empty slots as possible, up to 12, with delays between cards.
      const next = nextEmptyDealSlot(state);
      if (!next) return;
      const empty = DEAL_SEQUENCE.filter((s) => !state.placed[`${s.plane}:${s.code}`]).length;
      const count = Math.min(12, empty);
      void dealToBoardWithDelay(state, count, { kind: "deal_full" });
    };

  const saveNote = byId("save-note");
  if (saveNote)
    saveNote.onclick = () => {
    const instanceId = state.ui.selected_instance_id;
    if (!instanceId || !state.instances[instanceId]) return;
    const noteInput = byId("note");
    const text = (noteInput?.value ?? "").toString();
    state.notes[instanceId] = { text, updated_at: nowIso() };
    addEvent(state, "note.save", { instance_id: instanceId, length: text.length });
    saveState(state);
    renderAll(state);
  };

  const clearNote = byId("clear-note");
  if (clearNote)
    clearNote.onclick = () => {
    const instanceId = state.ui.selected_instance_id;
    if (!instanceId || !state.instances[instanceId]) {
      const noteInput = byId("note");
      if (noteInput) noteInput.value = "";
      return;
    }
    delete state.notes[instanceId];
    addEvent(state, "note.clear", { instance_id: instanceId });
    saveState(state);
    renderAll(state);
  };
}

async function main() {
  ensureSlotContainers();
  const deck = DECK;

  const existing = loadState();
  const state = existing ? { ...defaultState(deck), ...existing } : resetState(deck);
  state._cardById = Object.fromEntries(deck.cards.map((c) => [c.id, c]));

  // Ensure required keys exist if loading older state.
  state.instances ||= {};
  state.notes ||= {};
  state.events ||= [];
  state.placed ||= {};
  state.hand ||= [];
  state.remaining ||= deck.cards.map((c) => c.id);
  state.seq ||= { next_draw_number: 1 };
  ensureRng(state);
  const maxDraw = Math.max(
    0,
    ...Object.values(state.instances)
      .map((inst) => inst.draw_n)
      .filter((n) => Number.isFinite(n))
  );
  state.seq.next_draw_number = Math.max(state.seq.next_draw_number ?? 1, maxDraw + 1);
  state.metrics ||= { first_draw_at: null, first_place_at: null };
  state.ui ||= {
    selected_instance_id: null,
    selected_hand_instance_id: null,
    hovered_slot_code: null,
    hovered_plane: null
  };
  state.ui.hovered_slot_code ??= null;
  state.ui.hovered_plane ??= null;

  wireControls(state, deck);

  // Default to session screen if user already started.
  const hasWork = state.events.some((e) => e.type !== "session.start");
  showScreen(hasWork ? "session" : "home");
  renderAll(state);
}

main().catch((err) => {
  console.error(err);
  alert(`Wireframe failed to start (${APP_VERSION}): ${err.message}`);
});
