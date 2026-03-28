# Spatial Tarot (3D Web Wireframe)

This is a **no-dependencies** wireframe website to quickly test the *interaction grammar* described in **Spatial Tarot in 3D**:

- Session flow: question → draw → place → inspect → annotate → export
- Volumetric spread idea: **three discrete planes** with **vertical correspondences**
- Input redundancy for reach: **drag/drop** and **click-to-place** (touch-friendly)
- Event-sourced session log (for replay/export later)

## Run locally

Option A (simplest): open the file directly:

- `spatial-tarot-wireframe/index.html`

Option B (serve it):

From the repo root:

```bash
cd spatial-tarot-wireframe
python3 -m http.server 5173
```

Then open:

- http://localhost:5173

## What to test (concrete script)

Run with 5–8 people (mix of tarot readers + novices), 5–10 minutes each.

1. Ask them to type a question (intention).
2. Ask them to **Draw 6** and place cards into any slots.
3. Ask them to inspect one card and write a note.
4. Ask them to hover a slot and explain what “correspondence across planes” means.
5. Ask them to export JSON and send it to you.

**Capture:** time-to-first-correct-placement, confusion moments (“where am I?”), and whether correspondences feel meaningful.

For a fuller script + metrics, use:

- `spatial-tarot-wireframe/test-script.md`
- `spatial-tarot-wireframe/next-steps.md`

## Data exported

Use **Export JSON** to download:

- `instances` (card instance state)
- `placed` (plane+slot → instance)
- `notes`
- `events` (append-only interaction log)

This intentionally matches the PDF’s recommendation to treat readings as an event stream + derived snapshot.
