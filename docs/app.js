const STORAGE_KEY = "spatial-tarot-wireframe:v1";

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

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clampText(value, max = 140) {
  const s = (value ?? "").toString().trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
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
    rng_seed: null,
    deck_id: deck.deck_id,
    remaining: deck.cards.map((c) => c.id),
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
  for (const s of allSlots) s.classList.toggle("slot--corresponding", Boolean(activeCode) && s.dataset.code === activeCode);
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
  for (const plane of PLANES) {
    const el = document.getElementById(`slots-${plane.id}`);
    el.innerHTML = "";
    for (const slot of SLOT_DEFS) {
      const slotId = `${plane.id}:${slot.code}`;
      const div = document.createElement("div");
      div.className = "slot";
      div.dataset.plane = plane.id;
      div.dataset.code = slot.code;
      div.dataset.slotId = slotId;
      div.tabIndex = 0;
      div.innerHTML = `
        <div class="slot__label">
          <span>${slot.label}</span>
          <span class="slot__code">${slot.code}</span>
        </div>
        <div class="slot__drop">Drop / click to place</div>
      `;
      el.appendChild(div);
    }
  }
}

function renderHand(state) {
  const handEl = document.getElementById("hand");
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
    if (state.ui.selected_hand_instance_id === instanceId) div.classList.add("tarot-card--selected");
    div.innerHTML = `
      <div class="tarot-card__name">${card.name}</div>
      <div class="tarot-card__meta">${card.keywords.map((k) => `#${k}`).slice(0, 3).join(" ")}</div>
    `;
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
  const allSlots = document.querySelectorAll(".slot");
  for (const slot of allSlots) {
    const plane = slot.dataset.plane;
    const code = slot.dataset.code;
    const key = `${plane}:${code}`;
    const instanceId = state.placed[key];

    slot.classList.toggle("slot--occupied", Boolean(instanceId));
    slot.classList.remove("slot--active");

    const dropText = slot.querySelector(".slot__drop");
    dropText.textContent = instanceId ? "" : "Drop / click to place";

    const existingCard = slot.querySelector(".tarot-card");
    if (existingCard) existingCard.remove();

    if (instanceId) {
      const inst = state.instances[instanceId];
      const card = state._cardById[inst.card_id];
      const cardDiv = document.createElement("div");
      cardDiv.className = "tarot-card";
      cardDiv.dataset.instanceId = instanceId;
      if (state.ui.selected_instance_id === instanceId) cardDiv.classList.add("tarot-card--selected");
      cardDiv.innerHTML = `
        <div class="tarot-card__name">${card.name}</div>
        <div class="tarot-card__meta">${inst.face_up ? "face-up" : "face-down"} • ${
          inst.reversed ? "reversed" : "upright"
        }</div>
      `;
      cardDiv.addEventListener("click", () => {
        state.ui.selected_instance_id = instanceId;
        state.ui.selected_hand_instance_id = null;
        addEvent(state, "ui.select", { instance_id: instanceId });
        saveState(state);
        renderAll(state);
      });
      slot.appendChild(cardDiv);
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

function renderInspect(state) {
  const inspectEl = document.getElementById("inspect");
  inspectEl.innerHTML = "";

  const instanceId = state.ui.selected_instance_id;
  if (!instanceId || !state.instances[instanceId]) {
    inspectEl.innerHTML = `<div class="inspect__empty">Select a card to inspect.</div>`;
    return;
  }

  const inst = state.instances[instanceId];
  const card = state._cardById[inst.card_id];
  const noteText = (state.notes[instanceId]?.text ?? "").trim();

  inspectEl.innerHTML = `
    <div class="inspect__name">${card.name}</div>
    <div class="inspect__meaning">${card.meaning}</div>
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

  document.getElementById("flip-card").onclick = () => {
    inst.face_up = !inst.face_up;
    addEvent(state, "card.flip", { instance_id: instanceId, face_up: inst.face_up });
    saveState(state);
    renderAll(state);
  };

  document.getElementById("toggle-reversal").onclick = () => {
    inst.reversed = !inst.reversed;
    addEvent(state, "card.reverse", { instance_id: instanceId, reversed: inst.reversed });
    saveState(state);
    renderAll(state);
  };

  document.getElementById("return-to-hand").onclick = () => {
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
  const logEl = document.getElementById("log");
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
  const el = document.getElementById("metrics");
  if (!el) return;

  const drawnCount = Object.keys(state.instances).length;
  const placedCount = Object.keys(state.placed).length;
  const blockedCount = state.events.filter((e) => e.type === "place.blocked").length;
  const ms = msBetweenIso(state.metrics?.first_draw_at, state.metrics?.first_place_at);

  el.innerHTML = `
    <div class="metrics__row"><span class="metrics__label">Drawn</span><span class="metrics__value">${drawnCount}</span></div>
    <div class="metrics__row"><span class="metrics__label">Placed</span><span class="metrics__value">${placedCount}</span></div>
    <div class="metrics__row"><span class="metrics__label">Blocked</span><span class="metrics__value">${blockedCount}</span></div>
    <div class="metrics__row"><span class="metrics__label">First placement (from draw)</span><span class="metrics__value">${formatDurationMs(ms)}</span></div>
  `;
}

function renderCorrespondence(state) {
  const el = document.getElementById("correspondence");
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
    const suffix = inst.reversed ? " (reversed)" : "";
    return { plane: p, text: `${card.name}${suffix}`, empty: false };
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
  const modal = document.getElementById("modal");
  const pre = document.getElementById("modal-pre");
  const titleEl = document.getElementById("modal-title");
  const dl = document.getElementById("download-json");
  const footer = dl.closest(".modal__footer");

  titleEl.textContent = title;
  pre.textContent = text;
  modal.classList.remove("hidden");

  const close = () => modal.classList.add("hidden");
  document.getElementById("modal-close").onclick = close;
  document.getElementById("modal-backdrop").onclick = close;

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
    instances: state.instances,
    placed: state.placed,
    notes: state.notes,
    events: state.events
  };
  return exportable;
}

function renderAll(state) {
  document.getElementById("question").value = state.question ?? "";

  const noteEl = document.getElementById("note");
  const selected = state.ui.selected_instance_id;
  noteEl.value = selected ? state.notes[selected]?.text ?? "" : "";

  renderHand(state);
  renderSlots(state);
  updateCorrespondenceHighlight(state);
  renderInspect(state);
  renderCorrespondence(state);
  renderMetrics(state);
  renderLog(state);
}

function showScreen(screen) {
  const home = document.getElementById("screen-home");
  const session = document.getElementById("screen-session");
  home.classList.toggle("hidden", screen !== "home");
  session.classList.toggle("hidden", screen !== "session");
}

function drawCards(state, count, { kind }) {
  const drawn = [];
  for (let i = 0; i < count; i += 1) {
    if (state.remaining.length === 0) break;
    const idx = Math.floor(Math.random() * state.remaining.length);
    const cardId = state.remaining.splice(idx, 1)[0];
    const instanceId = uid("inst");
    state.instances[instanceId] = {
      id: instanceId,
      card_id: cardId,
      face_up: false,
      reversed: Math.random() < 0.18,
      plane: null,
      slot_code: null,
      drawn_at: nowIso(),
      kind
    };
    state.hand.unshift(instanceId);
    drawn.push(instanceId);
    addEvent(state, "draw", { instance_id: instanceId, card_id: cardId, kind });
  }
  if (drawn.length === 0) addEvent(state, "draw.none", { kind });

  state.metrics ||= { first_draw_at: null, first_place_at: null };
  if (drawn.length > 0 && !state.metrics.first_draw_at) {
    state.metrics.first_draw_at = state.instances[drawn[0]].drawn_at;
  }

  state.ui.selected_hand_instance_id = drawn[0] ?? state.ui.selected_hand_instance_id;
  state.ui.selected_instance_id = drawn[0] ?? state.ui.selected_instance_id;
  saveState(state);
  renderAll(state);
}

function resetState(deck) {
  const state = defaultState(deck);
  addEvent(state, "session.start", { mode: "3d_web_wireframe", method: "volumetric_cross" });
  saveState(state);
  return state;
}

function wireControls(state, deck) {
  document.getElementById("home-start").onclick = () => {
    showScreen("session");
    addEvent(state, "ui.start", {});
    saveState(state);
    renderAll(state);
  };

  document.getElementById("nav-home").onclick = () => showScreen("home");
  document.getElementById("nav-session").onclick = () => showScreen("session");

  document.getElementById("nav-help").onclick = () => {
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
        "Input:\\n" +
        "- Drag a card onto a slot\\n" +
        "- Or click a card, then click a slot\\n\\n" +
        "Inspect:\\n" +
        "- Select a card to flip/reverse + add a note\\n\\n" +
        "Export:\\n" +
        "- Use Export JSON to share the session log + snapshot.",
      onDownload: null
    });
  };

  document.getElementById("nav-export").onclick = () => {
    const exported = exportState(state);
    openModal({
      title: "Export (copy/paste or download)",
      text: JSON.stringify(exported, null, 2),
      onDownload: () => downloadJson(`spatial-tarot-${state.session_id}.json`, exported),
      downloadLabel: "Download JSON"
    });
  };

  document.getElementById("nav-reset").onclick = () => {
    const next = resetState(deck);
    Object.assign(state, next);
    showScreen("home");
    renderAll(state);
  };

  document.getElementById("question").addEventListener("input", (e) => {
    const value = e.target.value ?? "";
    state.question = value;
    addEvent(state, "question.update", { value: clampText(value, 280) });
    saveState(state);
  });

  document.getElementById("draw-one").onclick = () => drawCards(state, 1, { kind: "draw" });
  document.getElementById("draw-three").onclick = () => drawCards(state, 3, { kind: "draw" });
  document.getElementById("draw-clarifier").onclick = () => drawCards(state, 1, { kind: "clarifier" });

  document.getElementById("save-note").onclick = () => {
    const instanceId = state.ui.selected_instance_id;
    if (!instanceId || !state.instances[instanceId]) return;
    const text = (document.getElementById("note").value ?? "").toString();
    state.notes[instanceId] = { text, updated_at: nowIso() };
    addEvent(state, "note.save", { instance_id: instanceId, length: text.length });
    saveState(state);
    renderAll(state);
  };

  document.getElementById("clear-note").onclick = () => {
    const instanceId = state.ui.selected_instance_id;
    if (!instanceId || !state.instances[instanceId]) {
      document.getElementById("note").value = "";
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
  alert(`Wireframe failed to start: ${err.message}`);
});
