# Concrete path from this wireframe → testable product

This maps directly onto the PDF’s prototyping roadmap (discovery → low-fi → vertical slice → multiuser → platform expansion).

## 1) This week: validate the mechanics (Discovery)

- Run 5–8 sessions using `test-script.md`.
- Pick **2–3 flagship mechanics** to keep (recommendation: keep *Volumetric* as the anchor, optionally add *Temporal Ribbon* next).
- Decide success metrics: time-to-understand, clarity, and “would you use this again?”.

## 2) Next: increase fidelity without increasing scope (Low-fi → “lite” prototype)

Keep the same flow, but add only what improves interpretability:

- Better labels + a “legend” panel for planes and correspondences
- “Inspect” improvements: larger text, high contrast, stable positioning
- A guided mode (short prompts per slot) to reduce cognitive load
- A real deck metadata layer (localizable strings; multiple traditions later)

Still keep it link-shareable (static site).

## 3) Then: build a vertical slice in the target 3D runtime (Vertical slice)

Implement one full reading loop end-to-end (draw → place → explore → annotate → save/replay):

- Unity XR Interaction Toolkit (direct + ray interaction), OpenXR mappings
- Or WebXR (for maximal reach) if the product goal is “shareable links first”

Carry forward the same data model:

- card instances (pose + face/reversal + plane membership)
- interpretation artifacts (notes/links/tags)
- event log + derived snapshot (for replay and synchronization)

## 4) Multiuser (only after single-user is stable)

- Start with shared state + roles (reader / querent / observer) and a deterministic event ordering rule.
- Keep “join late” working by replaying the event stream to rebuild state.

## 5) Platform expansion

- Web “lite” remains the on-ramp.
- MR anchored version later (anchors + accessibility pass).

