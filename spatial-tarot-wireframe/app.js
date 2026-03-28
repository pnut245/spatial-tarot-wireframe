const STORAGE_KEY = "spatial-tarot-wireframe:v1";
const APP_VERSION = "2026-03-28-onboarding-submit";

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
  // Matches the BRIC-inspired palette in styles.css
  understory: "rgba(113, 62, 149, 0.92)", // purple
  surface: "rgba(11, 11, 11, 0.82)", // ink
  horizon: "rgba(0, 73, 83, 0.88)", // deep teal
  none: "rgba(11, 11, 11, 0.35)"
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

function slotLens(code) {
  switch (code) {
    case "A":
      return "Theme / frame";
    case "B":
      return "Crossing influence";
    case "C":
      return "Resource / support";
    case "D":
      return "Trajectory / outcome";
    default:
      return "Slot";
  }
}

function planeLens(planeId) {
  switch (planeId) {
    case "understory":
      return "hidden drivers";
    case "surface":
      return "what’s happening now";
    case "horizon":
      return "where this is heading";
    default:
      return "context";
  }
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

function isNonEmptyQuestion(state) {
  return (state.question ?? "").toString().trim().length > 0;
}

function hasSubmittedQuestion(state) {
  return Boolean(state.session?.question_submitted_at);
}

function getDealDelayMs() {
  const el = byId("deal-delay");
  const n = Number.parseInt(el?.value ?? "0", 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const USER_ID_KEY = "spatial-tarot-user-id:v1";

function getOrCreateUserId() {
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  const id = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : uid("user");
  localStorage.setItem(USER_ID_KEY, id);
  return id;
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
    user_id: getOrCreateUserId(),
    created_at: nowIso(),
    session: {
      question_submitted_at: null
    },
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
      hovered_plane: null,
      profile_step: 0,
      dealing: false,
      deal_job_id: null,
      last_dealt_instance_id: null,
      last_interpretation_copy: ""
    },
    profile: {
      version: 1,
      created_at: null,
      updated_at: null,
      onboarding_completed_at: null,
      onboarding_skipped_at: null,
      quiz: { answers: {} }, // questionId -> optionId
      scores: null,
      enneagram: null,
      astrology_resonance: null,
      natal: { birth_date: "", birth_time: "", birth_place: "", sun_sign: "" }
    },
    _cardById: cardById
  };
}

async function copyTextToClipboard(text) {
  const value = (text ?? "").toString();
  if (!value) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to legacy copy for file:// or permissions issues.
    }
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.left = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, value.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return Boolean(ok);
  } catch {
    return false;
  }
}

function addEvent(state, type, payload = {}) {
  state.events.push({
    id: uid("evt"),
    at: nowIso(),
    type,
    payload
  });
}

function bumpProfileUpdated(state) {
  state.profile ||= defaultState(DECK).profile;
  if (!state.profile.created_at) state.profile.created_at = nowIso();
  state.profile.updated_at = nowIso();
}

function addScores(target, delta) {
  if (!delta) return;
  for (const [k, v] of Object.entries(delta)) {
    target[k] = (target[k] ?? 0) + (v ?? 0);
  }
}

function profileTone(state) {
  const elements = state.profile?.scores?.astrology_resonance?.elements ?? [];
  const triad = state.profile?.scores?.enneagram?.top_triad ?? null;

  const primary = elements[0] ?? null;
  const tone = {
    opener: "",
    verb: "Notice",
    vibe: "balanced",
    triad
  };

  switch (primary) {
    case "fire":
      tone.verb = "Do";
      tone.vibe = "direct";
      tone.opener = "Move toward the clearest action.";
      break;
    case "earth":
      tone.verb = "Build";
      tone.vibe = "practical";
      tone.opener = "Anchor this in a concrete next step.";
      break;
    case "air":
      tone.verb = "Consider";
      tone.vibe = "reflective";
      tone.opener = "Track the pattern and the story you’re telling.";
      break;
    case "water":
      tone.verb = "Feel";
      tone.vibe = "empathetic";
      tone.opener = "Listen for the emotional truth underneath the facts.";
      break;
    default:
      break;
  }

  return tone;
}

function topKeys(scoreMap, n = 3) {
  return Object.entries(scoreMap ?? {})
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, n)
    .map(([k, v]) => ({ key: k, score: v ?? 0 }));
}

function sunSignFromDate(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const parts = yyyyMmDd.split("-");
  if (parts.length !== 3) return "";
  const month = Number.parseInt(parts[1], 10);
  const day = Number.parseInt(parts[2], 10);
  if (!Number.isFinite(month) || !Number.isFinite(day)) return "";
  // Tropical zodiac (approx boundaries).
  const md = month * 100 + day;
  if (md >= 321 && md <= 419) return "Aries";
  if (md >= 420 && md <= 520) return "Taurus";
  if (md >= 521 && md <= 620) return "Gemini";
  if (md >= 621 && md <= 722) return "Cancer";
  if (md >= 723 && md <= 822) return "Leo";
  if (md >= 823 && md <= 922) return "Virgo";
  if (md >= 923 && md <= 1022) return "Libra";
  if (md >= 1023 && md <= 1121) return "Scorpio";
  if (md >= 1122 && md <= 1221) return "Sagittarius";
  if (md >= 1222 || md <= 119) return "Capricorn";
  if (md >= 120 && md <= 218) return "Aquarius";
  if (md >= 219 && md <= 320) return "Pisces";
  return "";
}

function promptArtSvg(type) {
  // Simple inline SVG “image prompts” (no external assets).
  switch (type) {
    case "mountain":
      return `<svg viewBox="0 0 240 140" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stop-color="rgba(167,139,250,0.18)"/>
            <stop offset="1" stop-color="rgba(125,211,252,0.18)"/>
          </linearGradient>
        </defs>
        <rect width="240" height="140" fill="rgba(11,15,23,0.22)"/>
        <path d="M20 120 L90 40 L140 90 L175 55 L220 120 Z" fill="url(#g)" stroke="rgba(231,238,252,0.25)" stroke-width="2"/>
        <path d="M90 40 L110 70" stroke="rgba(231,238,252,0.35)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="190" cy="34" r="10" fill="none" stroke="rgba(52,211,153,0.55)" stroke-width="3"/>
      </svg>`;
    case "ocean":
      return `<svg viewBox="0 0 240 140" preserveAspectRatio="none" aria-hidden="true">
        <rect width="240" height="140" fill="rgba(11,15,23,0.22)"/>
        <path d="M0 85 C30 65, 60 105, 90 85 C120 65, 150 105, 180 85 C210 65, 240 105, 270 85" fill="none" stroke="rgba(125,211,252,0.6)" stroke-width="4" stroke-linecap="round"/>
        <path d="M0 105 C30 85, 60 125, 90 105 C120 85, 150 125, 180 105 C210 85, 240 125, 270 105" fill="none" stroke="rgba(167,139,250,0.42)" stroke-width="4" stroke-linecap="round"/>
        <circle cx="48" cy="44" r="12" fill="none" stroke="rgba(251,191,36,0.6)" stroke-width="3"/>
      </svg>`;
    case "sky":
      return `<svg viewBox="0 0 240 140" preserveAspectRatio="none" aria-hidden="true">
        <rect width="240" height="140" fill="rgba(11,15,23,0.22)"/>
        <path d="M40 78 C55 55, 85 55, 100 78 C125 45, 165 55, 160 86 C185 86, 200 98, 196 114 L50 114 C30 105, 24 92, 40 78 Z" fill="rgba(231,238,252,0.1)" stroke="rgba(231,238,252,0.25)" stroke-width="2"/>
        <path d="M128 26 l6 16 17 2 -13 11 4 17 -14 -9 -14 9 4-17 -13-11 17-2 6-16Z" fill="none" stroke="rgba(52,211,153,0.55)" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;
    case "forge":
      return `<svg viewBox="0 0 240 140" preserveAspectRatio="none" aria-hidden="true">
        <rect width="240" height="140" fill="rgba(11,15,23,0.22)"/>
        <path d="M60 110 L120 30 L180 110 Z" fill="rgba(251,113,133,0.14)" stroke="rgba(251,113,133,0.55)" stroke-width="2"/>
        <path d="M120 52 C110 70, 130 70, 120 92 C108 78, 92 86, 100 104 C85 98, 75 116, 92 122 C115 130, 138 124, 146 110 C156 92, 140 78, 120 52 Z" fill="rgba(251,191,36,0.16)" stroke="rgba(251,191,36,0.6)" stroke-width="2"/>
      </svg>`;
    case "library":
      return `<svg viewBox="0 0 240 140" preserveAspectRatio="none" aria-hidden="true">
        <rect width="240" height="140" fill="rgba(11,15,23,0.22)"/>
        <rect x="38" y="34" width="34" height="88" rx="6" fill="rgba(125,211,252,0.12)" stroke="rgba(125,211,252,0.45)" stroke-width="2"/>
        <rect x="78" y="26" width="34" height="96" rx="6" fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.45)" stroke-width="2"/>
        <rect x="118" y="40" width="34" height="82" rx="6" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.45)" stroke-width="2"/>
        <rect x="158" y="30" width="34" height="92" rx="6" fill="rgba(231,238,252,0.08)" stroke="rgba(231,238,252,0.25)" stroke-width="2"/>
      </svg>`;
    case "garden":
    default:
      return `<svg viewBox="0 0 240 140" preserveAspectRatio="none" aria-hidden="true">
        <rect width="240" height="140" fill="rgba(11,15,23,0.22)"/>
        <path d="M40 112 C60 90, 90 90, 110 112 C130 85, 170 86, 190 112" fill="none" stroke="rgba(52,211,153,0.6)" stroke-width="4" stroke-linecap="round"/>
        <path d="M90 112 V70" stroke="rgba(231,238,252,0.22)" stroke-width="2"/>
        <path d="M90 70 C80 74, 76 84, 82 92 C92 92, 98 82, 90 70 Z" fill="rgba(52,211,153,0.18)" stroke="rgba(52,211,153,0.55)" stroke-width="2"/>
      </svg>`;
  }
}

const PROFILE_QUESTIONS = [
  {
    id: "axis-security",
    prompt: "When you’re uncertain, what helps most?",
    options: [
      {
        id: "plan",
        label: "A clear plan",
        sub: "Stability, steps, guardrails",
        art: "library",
        enneagram: { 6: 2, 1: 1, 5: 1 },
        astro: { earth: 2, fixed: 1, saturn: 1 }
      },
      {
        id: "trust",
        label: "Trust the flow",
        sub: "Surrender, timing, intuition",
        art: "ocean",
        enneagram: { 9: 2, 2: 1, 4: 1 },
        astro: { water: 2, mutable: 1, neptune: 1 }
      },
      {
        id: "move",
        label: "Make a bold move",
        sub: "Momentum, decisive action",
        art: "forge",
        enneagram: { 8: 2, 3: 1, 7: 1 },
        astro: { fire: 2, cardinal: 1, mars: 1 }
      }
    ]
  },
  {
    id: "axis-focus",
    prompt: "What kind of clarity feels right today?",
    options: [
      {
        id: "truth",
        label: "Hard truth",
        sub: "Cut through and decide",
        art: "mountain",
        enneagram: { 8: 1, 1: 1, 6: 1 },
        astro: { fire: 1, earth: 1, mars: 1, saturn: 1 }
      },
      {
        id: "meaning",
        label: "Deeper meaning",
        sub: "Symbols, pattern, story",
        art: "sky",
        enneagram: { 4: 2, 5: 1, 9: 1 },
        astro: { water: 1, air: 1, neptune: 1, moon: 1 }
      },
      {
        id: "useful",
        label: "Practical next step",
        sub: "Small action you can do",
        art: "garden",
        enneagram: { 3: 1, 2: 1, 1: 1 },
        astro: { earth: 2, cardinal: 1, saturn: 1 }
      }
    ]
  },
  {
    id: "axis-energy",
    prompt: "Which atmosphere matches your energy?",
    options: [
      { id: "quiet", label: "Quiet depth", sub: "Slow, reflective, inward", art: "ocean", enneagram: { 5: 2, 4: 1, 9: 1 }, astro: { water: 2, fixed: 1, moon: 1 } },
      { id: "bright", label: "Bright motion", sub: "Upbeat, curious, outward", art: "sky", enneagram: { 7: 2, 3: 1, 2: 1 }, astro: { air: 2, mutable: 1, jupiter: 1 } },
      { id: "steady", label: "Steady grounded", sub: "Calm, reliable, embodied", art: "garden", enneagram: { 9: 1, 6: 1, 1: 1 }, astro: { earth: 2, fixed: 1, saturn: 1 } }
    ]
  },
  {
    id: "axis-relation",
    prompt: "In relationships, you tend to…",
    options: [
      { id: "support", label: "Support & nurture", sub: "Care through presence", art: "garden", enneagram: { 2: 2, 9: 1, 6: 1 }, astro: { water: 1, earth: 1, venus: 1, moon: 1 } },
      { id: "achieve", label: "Protect the mission", sub: "Build something real", art: "mountain", enneagram: { 3: 2, 1: 1, 8: 1 }, astro: { cardinal: 1, earth: 1, sun: 1, saturn: 1 } },
      { id: "space", label: "Need breathing room", sub: "Autonomy matters", art: "sky", enneagram: { 5: 1, 7: 1, 4: 1 }, astro: { air: 2, fixed: 1, uranus: 1 } }
    ]
  },
  {
    id: "axis-threat",
    prompt: "When something feels off, your first move is…",
    options: [
      { id: "scan", label: "Scan for risk", sub: "What could go wrong?", art: "library", enneagram: { 6: 2, 5: 1 }, astro: { earth: 1, air: 1, saturn: 1, mercury: 1 } },
      { id: "confront", label: "Confront directly", sub: "Name it and handle it", art: "forge", enneagram: { 8: 2, 1: 1 }, astro: { fire: 2, mars: 1, pluto: 1 } },
      { id: "reframe", label: "Reframe gently", sub: "Find the hidden need", art: "ocean", enneagram: { 9: 1, 2: 1, 4: 1 }, astro: { water: 2, neptune: 1, venus: 1 } }
    ]
  },
  {
    id: "axis-identity",
    prompt: "Pick a style of self-expression:",
    options: [
      { id: "signature", label: "Signature & excellence", sub: "Be known for it", art: "mountain", enneagram: { 3: 2, 1: 1 }, astro: { sun: 1, saturn: 1, earth: 1, fixed: 1 } },
      { id: "original", label: "Original & strange", sub: "Be unmistakably you", art: "sky", enneagram: { 4: 2, 7: 1 }, astro: { uranus: 1, air: 1, mutable: 1 } },
      { id: "simple", label: "Simple & sincere", sub: "Less performance, more truth", art: "garden", enneagram: { 9: 1, 2: 1, 5: 1 }, astro: { earth: 1, water: 1, moon: 1 } }
    ]
  },
  {
    id: "axis-control",
    prompt: "Where do you want more power right now?",
    options: [
      { id: "boundaries", label: "Boundaries", sub: "No more leakage", art: "forge", enneagram: { 8: 2, 1: 1 }, astro: { mars: 1, saturn: 1, fixed: 1 } },
      { id: "insight", label: "Insight", sub: "See the real pattern", art: "library", enneagram: { 5: 2, 6: 1 }, astro: { mercury: 1, air: 1, fixed: 1 } },
      { id: "peace", label: "Peace", sub: "Less friction, more ease", art: "ocean", enneagram: { 9: 2, 2: 1 }, astro: { venus: 1, water: 1, mutable: 1 } }
    ]
  },
  {
    id: "axis-time",
    prompt: "Which feels more true for you?",
    options: [
      { id: "initiate", label: "Initiate", sub: "Start the next chapter", art: "sky", enneagram: { 7: 1, 3: 1, 8: 1 }, astro: { cardinal: 2, fire: 1, jupiter: 1 } },
      { id: "sustain", label: "Sustain", sub: "Commit and deepen", art: "mountain", enneagram: { 6: 1, 1: 1, 8: 1 }, astro: { fixed: 2, earth: 1, saturn: 1 } },
      { id: "adapt", label: "Adapt", sub: "Stay responsive", art: "ocean", enneagram: { 9: 1, 5: 1, 4: 1 }, astro: { mutable: 2, water: 1, neptune: 1 } }
    ]
  }
];

function computeProfileFromAnswers(answers) {
  const enneagram = {};
  const astro = { fire: 0, earth: 0, air: 0, water: 0, cardinal: 0, fixed: 0, mutable: 0 };
  const planets = {
    sun: 0,
    moon: 0,
    mercury: 0,
    venus: 0,
    mars: 0,
    jupiter: 0,
    saturn: 0,
    uranus: 0,
    neptune: 0,
    pluto: 0
  };

  for (const q of PROFILE_QUESTIONS) {
    const optId = answers[q.id];
    const opt = q.options.find((o) => o.id === optId);
    if (!opt) continue;
    addScores(enneagram, opt.enneagram);
    addScores(astro, opt.astro);
    // Planets are included inside opt.astro as keys; split them out.
    for (const p of Object.keys(planets)) {
      if (opt.astro?.[p]) planets[p] = (planets[p] ?? 0) + (opt.astro[p] ?? 0);
    }
  }

  // Remove planet keys from astro map (keep elements/modes only).
  for (const p of Object.keys(planets)) delete astro[p];

  const topTypes = topKeys(enneagram, 3).map((t) => Number.parseInt(t.key, 10)).filter((n) => Number.isFinite(n));
  const topElem = topKeys({ fire: astro.fire, earth: astro.earth, air: astro.air, water: astro.water }, 2);
  const topMode = topKeys({ cardinal: astro.cardinal, fixed: astro.fixed, mutable: astro.mutable }, 2);
  const topPlanet = topKeys(planets, 3);

  const triads = {
    head: (enneagram[5] ?? 0) + (enneagram[6] ?? 0) + (enneagram[7] ?? 0),
    heart: (enneagram[2] ?? 0) + (enneagram[3] ?? 0) + (enneagram[4] ?? 0),
    gut: (enneagram[8] ?? 0) + (enneagram[9] ?? 0) + (enneagram[1] ?? 0)
  };
  const topTriad = topKeys(triads, 1)[0]?.key ?? null;

  return {
    enneagram: { scores: enneagram, top_types: topTypes, top_triad: topTriad },
    astrology_resonance: { elements: topElem.map((x) => x.key), modes: topMode.map((x) => x.key), planets: topPlanet.map((x) => x.key), scores: { ...astro, planets } }
  };
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
    addEvent(state, "ui.hover_slot", { plane, slot_code: code });
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
  if (!hasSubmittedQuestion(state)) return;
  state.ui ||= {};
  state.ui.dealing = true;
  const jobId = uid("dealjob");
  state.ui.deal_job_id = jobId;
  saveState(state);
  renderAll(state);

  updateDealDelayLabel();
  const delayMs = getDealDelayMs();
  const revealMs = delayMs > 0 ? Math.min(800, Math.max(350, Math.round(delayMs * 0.6))) : 0;

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
  const profileLens = state.profile?.scores
    ? `${(state.profile.scores.enneagram?.top_types ?? []).slice(0, 1).map((n) => `E${n}`).join("")} • ${(state.profile.scores.astrology_resonance?.elements ?? []).slice(0, 1).join("")}`
    : "—";

  // Behavior tags inferred from events (local-only).
  const hoverCount = state.events.filter((e) => e.type === "ui.hover_slot").length;
  const noteSaves = state.events.filter((e) => e.type === "note.save").length;
  const reversals = state.events.filter((e) => e.type === "card.reverse").length;
  const behaviorTags = [];
  if (hoverCount >= 8) behaviorTags.push("stack-reader");
  if (noteSaves >= 2) behaviorTags.push("note-maker");
  if (reversals >= 2) behaviorTags.push("reversal-curious");
  const behavior = behaviorTags.length ? behaviorTags.join(" ") : "—";

  el.innerHTML = `
    <div class="metrics__row"><span class="metrics__label">Drawn</span><span class="metrics__value">${drawnCount}</span></div>
    <div class="metrics__row"><span class="metrics__label">Remaining</span><span class="metrics__value">${remaining}</span></div>
    <div class="metrics__row"><span class="metrics__label">Placed</span><span class="metrics__value">${placedCount}</span></div>
    <div class="metrics__row"><span class="metrics__label">Blocked</span><span class="metrics__value">${blockedCount}</span></div>
    <div class="metrics__row"><span class="metrics__label">First placement (from draw)</span><span class="metrics__value">${formatDurationMs(ms)}</span></div>
    <div class="metrics__row"><span class="metrics__label">Auto-deal next</span><span class="metrics__value">${nextText}</span></div>
    <div class="metrics__row"><span class="metrics__label">Seed</span><span class="metrics__value">${seed}</span></div>
    <div class="metrics__row"><span class="metrics__label">Profile lens</span><span class="metrics__value">${profileLens}</span></div>
    <div class="metrics__row"><span class="metrics__label">Behavior</span><span class="metrics__value">${behavior}</span></div>
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

function markdownToHtml(md) {
  // Tiny markdown subset: **bold**, line breaks.
  const esc = (s) =>
    (s ?? "")
      .toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  const safe = esc(md);
  const bolded = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return bolded.replace(/\n/g, "<br/>");
}

function getPlacedInstance(state, planeId, slotCode) {
  const key = `${planeId}:${slotCode}`;
  const instanceId = state.placed?.[key] ?? null;
  if (!instanceId) return null;
  const inst = state.instances?.[instanceId] ?? null;
  const card = inst ? state._cardById?.[inst.card_id] ?? null : null;
  return inst && card ? { inst, card } : null;
}

function buildInterpretation(state) {
  if (!hasSubmittedQuestion(state)) {
    const msg = "Submit a question to deal cards and generate an interpretation.";
    return { html: null, copyText: msg, text: msg };
  }

  const placedCount = Object.keys(state.placed ?? {}).length;
  if (placedCount === 0) {
    const msg = "Deal cards to generate an interpretation.";
    return { html: null, copyText: msg, text: msg };
  }

  const tone = profileTone(state);
  const q = (state.question ?? "").toString().trim();

  const surfaceStoryLines = SLOT_DEFS.map((s) => {
    const got = getPlacedInstance(state, "surface", s.code);
    if (!got) return null;
    const rev = got.inst.reversed ? " (reversed)" : "";
    return `- Surface ${s.code} (${slotLens(s.code)}): ${got.card.name}${rev} — ${got.card.meaning}`;
  }).filter(Boolean);

  const stackLines = SLOT_DEFS.map((s) => {
    const u = getPlacedInstance(state, "understory", s.code);
    const sf = getPlacedInstance(state, "surface", s.code);
    const h = getPlacedInstance(state, "horizon", s.code);
    const parts = [];
    if (u) parts.push(u.inst.face_up ? u.card.name : "Face-down");
    if (sf) parts.push(sf.inst.face_up ? sf.card.name : "Face-down");
    if (h) parts.push(h.inst.face_up ? h.card.name : "Face-down");
    if (!parts.length) return null;
    return `- Slot ${s.code} (${slotLens(s.code)}): ${parts.join(" → ")}`;
  }).filter(Boolean);

  const horizonD = getPlacedInstance(state, "horizon", "D");
  const surfaceC = getPlacedInstance(state, "surface", "C");
  const surfaceB = getPlacedInstance(state, "surface", "B");
  const understoryA = getPlacedInstance(state, "understory", "A");

  const nextSteps = [];
  if (surfaceC) nextSteps.push(`- ${tone.verb} your support: ${surfaceC.card.keywords?.[0] ?? "support"} (Surface C).`);
  if (surfaceB) nextSteps.push(`- ${tone.verb} the friction: ${surfaceB.card.keywords?.[0] ?? "challenge"} (Surface B).`);
  if (understoryA) nextSteps.push(`- ${tone.verb} the hidden driver: ${understoryA.card.keywords?.[0] ?? "pattern"} (Understory A).`);
  if (horizonD) nextSteps.push(`- ${tone.verb} toward the outcome: ${horizonD.card.keywords?.[0] ?? "direction"} (Horizon D).`);

  const blocks = [];
  blocks.push(`**Question**: ${q || "—"}`);
  if (tone.opener) blocks.push(`**Tone**: ${tone.opener}`);
  blocks.push("");
  blocks.push("**Surface story (A→D)**");
  blocks.push(surfaceStoryLines.length ? surfaceStoryLines.join("\n") : "- No Surface cards yet.");
  blocks.push("");
  blocks.push("**Vertical stacks (correspondences)**");
  blocks.push(stackLines.length ? stackLines.join("\n") : "- Not enough cards placed yet.");
  blocks.push("");
  blocks.push("**Next steps**");
  blocks.push(nextSteps.length ? nextSteps.slice(0, 3).join("\n") : "- Deal more cards to generate next steps.");

  const copyText = blocks.join("\n");
  const html = markdownToHtml(copyText);
  return { html, copyText, text: null };
}

function renderInterpretation(state) {
  const el = byId("interpretation");
  if (!el) return;
  const built = buildInterpretation(state);
  state.ui ||= {};
  state.ui.last_interpretation_copy = built.copyText ?? "";
  if (built.html) el.innerHTML = `<div class="interpretation__body">${built.html}</div>`;
  else el.innerHTML = `<div class="inspect__empty">${(built.text ?? "").toString()}</div>`;
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
    user_id: state.user_id ?? null,
    rng: state.rng ?? null,
    profile: state.profile ?? null,
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
  if (questionEl) questionEl.disabled = hasSubmittedQuestion(state);

  const submitBtn = byId("submit-question");
  const qHint = byId("question-hint");
  const isDealing = Boolean(state.ui?.dealing);
  const valid = isNonEmptyQuestion(state);
  const submitted = hasSubmittedQuestion(state);
  if (submitBtn) submitBtn.disabled = isDealing || submitted || !valid;
  if (qHint) {
    if (submitted) qHint.textContent = "Question submitted. Use the controls below for clarifiers.";
    else if (!valid) qHint.textContent = "Enter a question to begin.";
    else qHint.textContent = "Ready. Submit to deal the spread.";
  }

  const noteEl = byId("note");
  const selected = state.ui.selected_instance_id;
  if (noteEl) noteEl.value = selected ? state.notes[selected]?.text ?? "" : "";

  updateDealDelayLabel();
  const dealBtns = ["deal-next", "deal-full"];
  for (const id of dealBtns) {
    const btn = byId(id);
    if (btn) btn.disabled = isDealing || !submitted;
  }
  const delayEl = byId("deal-delay");
  if (delayEl) delayEl.disabled = isDealing;

  renderHand(state);
  renderSlots(state);
  updateCorrespondenceHighlight(state);
  renderInspect(state);
  renderCorrespondence(state);
  renderInterpretation(state);

  const copyBtn = byId("copy-interpretation");
  const canCopy = hasSubmittedQuestion(state) && Object.keys(state.placed ?? {}).length > 0;
  if (copyBtn) copyBtn.disabled = !canCopy;

  renderMetrics(state);
  renderLog(state);
}

function showScreen(screen) {
  const home = byId("screen-home");
  const session = byId("screen-session");
  const profile = byId("screen-profile");
  if (!home || !session || !profile) return;
  home.classList.toggle("hidden", screen !== "home");
  session.classList.toggle("hidden", screen !== "session");
  profile.classList.toggle("hidden", screen !== "profile");
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
  const navProfile = byId("nav-profile");
  if (navProfile) navProfile.onclick = () => showScreen("profile");

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

  const openProfile = byId("open-profile");
  if (openProfile) openProfile.onclick = () => showScreen("profile");

  const questionEl = byId("question");
  if (questionEl)
    questionEl.addEventListener("input", (e) => {
      const value = e.target.value ?? "";
      state.question = value;
      addEvent(state, "question.update", { value: clampText(value, 280) });
      saveState(state);
      renderAll(state);
    });
  if (questionEl)
    questionEl.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const btn = byId("submit-question");
      if (btn && !btn.disabled) btn.click();
    });

  const submitBtn = byId("submit-question");
  if (submitBtn)
    submitBtn.onclick = () => {
      if (!isNonEmptyQuestion(state)) return;
      state.session ||= { question_submitted_at: null };
      if (state.session.question_submitted_at) return;
      state.session.question_submitted_at = nowIso();
      addEvent(state, "question.submit", { value: clampText(state.question, 280) });
      saveState(state);
      renderAll(state);
      void dealToBoardWithDelay(state, 12, { kind: "opening" });
    };

  const dealNext = byId("deal-next");
  if (dealNext)
    dealNext.onclick = () => {
      if (!hasSubmittedQuestion(state)) return;
      void dealToBoardWithDelay(state, 1, { kind: "clarifier" });
    };

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
      if (!hasSubmittedQuestion(state)) return;
      // Fill as many empty slots as possible, up to 12, with delays between cards.
      const next = nextEmptyDealSlot(state);
      if (!next) return;
      const empty = DEAL_SEQUENCE.filter((s) => !state.placed[`${s.plane}:${s.code}`]).length;
      const count = Math.min(12, empty);
      void dealToBoardWithDelay(state, count, { kind: "deal_full" });
    };

  const copyInterpretation = byId("copy-interpretation");
  if (copyInterpretation)
    copyInterpretation.onclick = async () => {
      const text = (state.ui?.last_interpretation_copy ?? "").toString();
      if (!text.trim()) return;
      const ok = await copyTextToClipboard(text);
      addEvent(state, "interpretation.copy", { ok, length: text.length });
      saveState(state);

      if (ok) {
        const prev = copyInterpretation.textContent;
        copyInterpretation.textContent = "Copied";
        copyInterpretation.disabled = true;
        setTimeout(() => {
          copyInterpretation.textContent = prev ?? "Copy reading";
          renderAll(state);
        }, 900);
      }
    };

  const profileSkip = byId("profile-skip");
  if (profileSkip)
    profileSkip.onclick = () => {
      state.profile ||= defaultState(deck).profile;
      state.profile.onboarding_skipped_at = nowIso();
      bumpProfileUpdated(state);
      addEvent(state, "profile.onboarding.skip", {});
      saveState(state);
      showScreen("session");
      renderAll(state);
    };

  const profileSubmit = byId("profile-submit");
  if (profileSubmit)
    profileSubmit.onclick = () => {
      state.profile ||= defaultState(deck).profile;
      state.profile.onboarding_completed_at = nowIso();
      bumpProfileUpdated(state);

      // If user answered some questions but didn't reach the end, compute a partial profile.
      const answers = state.profile?.quiz?.answers ?? {};
      const hasAnyAnswers = Object.keys(answers).length > 0;
      const total = PROFILE_QUESTIONS.length;
      const answeredCount = Object.keys(answers).length;
      if (hasAnyAnswers && answeredCount < total) {
        const computed = computeProfileFromAnswers(answers);
        state.profile.scores = computed;
        state.profile.enneagram = computed.enneagram;
        state.profile.astrology_resonance = computed.astrology_resonance;
        addEvent(state, "profile.partial_compute", { answered: answeredCount, total });
      }

      addEvent(state, "profile.onboarding.continue", {
        has_quiz: Boolean(state.profile?.scores),
        has_natal: Boolean(state.profile?.natal?.birth_date)
      });
      saveState(state);
      showScreen("session");
      renderAll(state);
    };

  const profileStart = byId("profile-start");
  if (profileStart)
    profileStart.onclick = () => {
      state.profile ||= defaultState(deck).profile;
      state.profile.quiz ||= { answers: {} };
      state.profile.quiz.answers = {};
      state.ui.profile_step = 0;
      state.profile.scores = null;
      state.profile.enneagram = null;
      state.profile.astrology_resonance = null;
      bumpProfileUpdated(state);
      addEvent(state, "profile.start", {});
      saveState(state);
      renderProfile(state);
      renderProfileSummary(state);
    };

  const profileReset = byId("profile-reset");
  if (profileReset)
    profileReset.onclick = () => {
      state.profile = defaultState(deck).profile;
      state.ui.profile_step = 0;
      addEvent(state, "profile.clear", {});
      saveState(state);
      renderProfile(state);
      renderProfileSummary(state);
    };

  const saveNatal = byId("save-natal");
  if (saveNatal)
    saveNatal.onclick = () => {
      state.profile ||= defaultState(deck).profile;
      state.profile.natal ||= { birth_date: "", birth_time: "", birth_place: "", sun_sign: "" };
      const d = (byId("birth-date")?.value ?? "").toString();
      const t = (byId("birth-time")?.value ?? "").toString();
      const p = (byId("birth-place")?.value ?? "").toString();
      state.profile.natal.birth_date = d;
      state.profile.natal.birth_time = t;
      state.profile.natal.birth_place = p;
      state.profile.natal.sun_sign = sunSignFromDate(d);
      bumpProfileUpdated(state);
      addEvent(state, "profile.natal.save", { has_date: Boolean(d), has_time: Boolean(t), has_place: Boolean(p) });
      saveState(state);
      renderProfile(state);
      renderProfileSummary(state);
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

function renderProfile(state) {
  const progress = byId("profile-progress");
  const prompt = byId("profile-prompt");
  const choices = byId("profile-choices");
  const results = byId("profile-results");
  if (!progress || !prompt || !choices || !results) return;

  state.profile ||= defaultState(DECK).profile;
  state.profile.quiz ||= { answers: {} };
  state.ui ||= {};
  state.ui.profile_step ??= 0;

  const total = PROFILE_QUESTIONS.length;
  const step = Math.min(total, Math.max(0, state.ui.profile_step ?? 0));
  const answeredCount = Object.keys(state.profile.quiz.answers ?? {}).length;

  progress.textContent = `Question ${Math.min(step + 1, total)} / ${total}  •  answered ${answeredCount}`;

  const q = PROFILE_QUESTIONS[step] ?? null;
  if (!q) {
    prompt.textContent = "Quiz complete.";
    choices.innerHTML = "";
  } else {
    prompt.textContent = q.prompt;
    choices.innerHTML = q.options
      .map(
        (o) => `
          <button class="choiceCard" type="button" data-q="${q.id}" data-opt="${o.id}">
            <div class="choiceCard__art">${promptArtSvg(o.art)}</div>
            <div>
              <div class="choiceCard__label">${o.label}</div>
              <div class="choiceCard__sub">${o.sub ?? ""}</div>
            </div>
          </button>
        `
      )
      .join("");

    for (const btn of Array.from(choices.querySelectorAll("button.choiceCard"))) {
      btn.onclick = () => {
        const qid = btn.dataset.q;
        const oid = btn.dataset.opt;
        if (!qid || !oid) return;
        state.profile.quiz.answers[qid] = oid;
        bumpProfileUpdated(state);
        addEvent(state, "profile.answer", { question_id: qid, option_id: oid });

        // Advance.
        state.ui.profile_step = Math.min(total, step + 1);
        if (state.ui.profile_step >= total) {
          const computed = computeProfileFromAnswers(state.profile.quiz.answers);
          state.profile.scores = computed;
          state.profile.enneagram = computed.enneagram;
          state.profile.astrology_resonance = computed.astrology_resonance;
          addEvent(state, "profile.complete", {
            enneagram_top: computed.enneagram.top_types,
            astro_elements: computed.astrology_resonance.elements,
            astro_modes: computed.astrology_resonance.modes
          });
        }
        saveState(state);
        renderProfile(state);
        renderProfileSummary(state);
      };
    }
  }

  const natal = state.profile.natal ?? { birth_date: "", birth_time: "", birth_place: "", sun_sign: "" };
  const dateEl = byId("birth-date");
  const timeEl = byId("birth-time");
  const placeEl = byId("birth-place");
  if (dateEl) dateEl.value = natal.birth_date ?? "";
  if (timeEl) timeEl.value = natal.birth_time ?? "";
  if (placeEl) placeEl.value = natal.birth_place ?? "";

  // Results
  const computed = state.profile.scores?.enneagram ? state.profile.scores : null;
  if (!computed) {
    results.innerHTML = `<div class="inspect__empty">Complete the quiz to generate your Enneagram + astrology resonance profile.</div>`;
    return;
  }

  const enneagramTop = (computed.enneagram?.top_types ?? []).slice(0, 3).map((n) => `Type ${n}`).join(" · ");
  const triad = computed.enneagram?.top_triad ?? "—";
  const elements = (computed.astrology_resonance?.elements ?? []).join(" + ") || "—";
  const modes = (computed.astrology_resonance?.modes ?? []).join(" + ") || "—";
  const planets = (computed.astrology_resonance?.planets ?? []).slice(0, 3).join(" · ") || "—";
  const sun = state.profile.natal?.sun_sign ? `Sun: ${state.profile.natal.sun_sign}` : "Sun: — (optional)";

  results.innerHTML = `
    <div><strong>Enneagram (signals)</strong>: ${enneagramTop || "—"}</div>
    <div class="kv"><div class="kv__k">Triad</div><div class="kv__v">${triad}</div></div>
    <div class="kv"><div class="kv__k">Elements (resonance)</div><div class="kv__v">${elements}</div></div>
    <div class="kv"><div class="kv__k">Modes (resonance)</div><div class="kv__v">${modes}</div></div>
    <div class="kv"><div class="kv__k">Planet vibes</div><div class="kv__v">${planets}</div></div>
    <div class="kv"><div class="kv__k">Natal</div><div class="kv__v">${sun}</div></div>
    <div class="hint" style="margin-top: 10px;">
      Use this as a storytelling lens, not a diagnosis. You can restart the quiz anytime.
    </div>
  `;
}

function renderProfileSummary(state) {
  const el = byId("profile-summary");
  if (!el) return;
  const computed = state.profile?.scores ?? null;
  if (!computed) {
    el.textContent = "Not set yet. Use Profile to choose a visual style and (optional) natal overlay.";
    return;
  }
  const enneagramTop = (computed.enneagram?.top_types ?? []).slice(0, 2).map((n) => `Type ${n}`).join(" / ") || "—";
  const elements = (computed.astrology_resonance?.elements ?? []).slice(0, 2).join("+") || "—";
  const sun = state.profile?.natal?.sun_sign ? `Sun ${state.profile.natal.sun_sign}` : "Sun —";
  el.textContent = `Signals: ${enneagramTop} • Resonance: ${elements} • ${sun}`;
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
  state.user_id ||= getOrCreateUserId();
  state.session ||= { question_submitted_at: null };
  state.session.question_submitted_at ??= null;
  state.profile ||= defaultState(deck).profile;
  state.profile.quiz ||= { answers: {} };
  state.profile.onboarding_completed_at ??= null;
  state.profile.onboarding_skipped_at ??= null;
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
  state.ui.profile_step ??= 0;

  wireControls(state, deck);

  // UX: always start on Profile (onboarding), then user continues to cards.
  showScreen("profile");
  renderAll(state);
  renderProfile(state);
  renderProfileSummary(state);
}

main().catch((err) => {
  console.error(err);
  alert(`Wireframe failed to start (${APP_VERSION}): ${err.message}`);
});
