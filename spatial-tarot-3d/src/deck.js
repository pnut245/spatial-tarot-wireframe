export const PLANES = [
  { id: "understory", label: "Understory", subtitle: "Hidden drivers", color: "#9d7cff", glow: 0x9d7cff, y: -2.6, z: 1.2 },
  { id: "surface", label: "Surface", subtitle: "Present pattern", color: "#70d7ff", glow: 0x70d7ff, y: 0, z: 0 },
  { id: "horizon", label: "Horizon", subtitle: "Trajectory", color: "#4ef2b0", glow: 0x4ef2b0, y: 2.6, z: -1.2 }
];

export const SLOT_DEFS = [
  { code: "A", label: "Theme" },
  { code: "B", label: "Tension" },
  { code: "C", label: "Resource" },
  { code: "D", label: "Outcome" }
];

export const DEAL_SEQUENCE = SLOT_DEFS.flatMap((slot) =>
  PLANES.map((plane) => ({ plane: plane.id, code: slot.code }))
);

/* Rider-Waite-Smith public domain art (Wikimedia Commons, 1909 Pamela Colman Smith) */
const W = "https://upload.wikimedia.org/wikipedia/commons/thumb";

export const DECK = [
  {
    id: "major-00",
    name: "The Fool",
    keywords: ["beginning", "leap", "trust"],
    meaning: "A threshold moment. Step forward before the map is complete.",
    img: `${W}/9/90/RWS_Tarot_00_Fool.jpg/400px-RWS_Tarot_00_Fool.jpg`
  },
  {
    id: "major-01",
    name: "The Magician",
    keywords: ["agency", "focus", "craft"],
    meaning: "What is available becomes powerful when attention and will line up.",
    img: `${W}/d/de/RWS_Tarot_01_Magician.jpg/400px-RWS_Tarot_01_Magician.jpg`
  },
  {
    id: "major-02",
    name: "The High Priestess",
    keywords: ["intuition", "silence", "hidden"],
    meaning: "Knowledge is present, but it asks for stillness instead of force.",
    img: `${W}/8/88/RWS_Tarot_02_High_Priestess.jpg/400px-RWS_Tarot_02_High_Priestess.jpg`
  },
  {
    id: "major-03",
    name: "The Empress",
    keywords: ["care", "growth", "abundance"],
    meaning: "Create the conditions that let something living keep expanding.",
    img: `${W}/d/d2/RWS_Tarot_03_Empress.jpg/400px-RWS_Tarot_03_Empress.jpg`
  },
  {
    id: "major-04",
    name: "The Emperor",
    keywords: ["structure", "authority", "boundary"],
    meaning: "Definition, responsibility, and architecture become the message.",
    img: `${W}/c/c3/RWS_Tarot_04_Emperor.jpg/400px-RWS_Tarot_04_Emperor.jpg`
  },
  {
    id: "major-05",
    name: "The Hierophant",
    keywords: ["ritual", "teaching", "tradition"],
    meaning: "A pattern older than you is shaping the present moment.",
    img: `${W}/8/8d/RWS_Tarot_05_Hierophant.jpg/400px-RWS_Tarot_05_Hierophant.jpg`
  },
  {
    id: "major-06",
    name: "The Lovers",
    keywords: ["choice", "alignment", "bond"],
    meaning: "The path forward depends on what you are willing to align with.",
    img: `${W}/d/db/RWS_Tarot_06_Lovers.jpg/400px-RWS_Tarot_06_Lovers.jpg`
  },
  {
    id: "major-07",
    name: "The Chariot",
    keywords: ["direction", "discipline", "drive"],
    meaning: "Momentum builds when scattered forces are held in one direction.",
    img: `${W}/9/9b/RWS_Tarot_07_Chariot.jpg/400px-RWS_Tarot_07_Chariot.jpg`
  },
  {
    id: "major-08",
    name: "Strength",
    keywords: ["courage", "patience", "gentleness"],
    meaning: "Steady influence outlasts pressure and spectacle.",
    img: `${W}/f/f5/RWS_Tarot_08_Strength.jpg/400px-RWS_Tarot_08_Strength.jpg`
  },
  {
    id: "major-09",
    name: "The Hermit",
    keywords: ["solitude", "search", "clarity"],
    meaning: "Distance creates the light needed to read the pattern accurately.",
    img: `${W}/4/4d/RWS_Tarot_09_Hermit.jpg/400px-RWS_Tarot_09_Hermit.jpg`
  },
  {
    id: "major-10",
    name: "Wheel of Fortune",
    keywords: ["cycle", "change", "timing"],
    meaning: "The conditions are moving. Your task is to read the turn cleanly.",
    img: `${W}/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg/400px-RWS_Tarot_10_Wheel_of_Fortune.jpg`
  },
  {
    id: "major-11",
    name: "Justice",
    keywords: ["truth", "balance", "consequence"],
    meaning: "Reality is asking for a clear accounting.",
    img: `${W}/e/e0/RWS_Tarot_11_Justice.jpg/400px-RWS_Tarot_11_Justice.jpg`
  },
  {
    id: "major-12",
    name: "The Hanged Man",
    keywords: ["pause", "reframe", "surrender"],
    meaning: "The answer appears when the frame changes, not when effort increases.",
    img: `${W}/2/2b/RWS_Tarot_12_Hanged_Man.jpg/400px-RWS_Tarot_12_Hanged_Man.jpg`
  },
  {
    id: "major-13",
    name: "Death",
    keywords: ["ending", "release", "transition"],
    meaning: "A closed form is making room for the next living shape.",
    img: `${W}/d/d7/RWS_Tarot_13_Death.jpg/400px-RWS_Tarot_13_Death.jpg`
  },
  {
    id: "major-14",
    name: "Temperance",
    keywords: ["blend", "pace", "integration"],
    meaning: "The message is in the mixing, not the extremes.",
    img: `${W}/f/f8/RWS_Tarot_14_Temperance.jpg/400px-RWS_Tarot_14_Temperance.jpg`
  },
  {
    id: "major-15",
    name: "The Devil",
    keywords: ["attachment", "shadow", "compulsion"],
    meaning: "Notice what has started to claim more authority than it deserves.",
    img: `${W}/5/55/RWS_Tarot_15_Devil.jpg/400px-RWS_Tarot_15_Devil.jpg`
  },
  {
    id: "major-16",
    name: "The Tower",
    keywords: ["disruption", "reveal", "shock"],
    meaning: "What falls away is exposing the truer structure underneath.",
    img: `${W}/5/53/RWS_Tarot_16_Tower.jpg/400px-RWS_Tarot_16_Tower.jpg`
  },
  {
    id: "major-17",
    name: "The Star",
    keywords: ["hope", "guidance", "renewal"],
    meaning: "A quiet signal remains visible enough to orient by.",
    img: `${W}/d/db/RWS_Tarot_17_Star.jpg/400px-RWS_Tarot_17_Star.jpg`
  },
  {
    id: "major-18",
    name: "The Moon",
    keywords: ["dream", "uncertainty", "projection"],
    meaning: "The reading asks for care where certainty would be a shortcut.",
    img: `${W}/7/7f/RWS_Tarot_18_Moon.jpg/400px-RWS_Tarot_18_Moon.jpg`
  },
  {
    id: "major-19",
    name: "The Sun",
    keywords: ["clarity", "warmth", "vitality"],
    meaning: "What matters is becoming easier to see and easier to trust.",
    img: `${W}/1/17/RWS_Tarot_19_Sun.jpg/400px-RWS_Tarot_19_Sun.jpg`
  },
  {
    id: "major-20",
    name: "Judgement",
    keywords: ["call", "reckoning", "decision"],
    meaning: "Something is ready to move from interpretation into action.",
    img: `${W}/d/dd/RWS_Tarot_20_Judgement.jpg/400px-RWS_Tarot_20_Judgement.jpg`
  },
  {
    id: "major-21",
    name: "The World",
    keywords: ["completion", "integration", "whole"],
    meaning: "The spread resolves by showing how the pieces are already related.",
    img: `${W}/f/ff/RWS_Tarot_21_World.jpg/400px-RWS_Tarot_21_World.jpg`
  }
];
