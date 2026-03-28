# Notes for graphics (cross-lab)

## Is “multimodal” a stand-in for AGI?
Not really. Multimodal is best thought of as **one capability axis** (perception + communication channels). A system can be multimodal and still fail at other “AGI-adjacent” requirements like long-horizon planning, robust tool use, self-correction, and reliable real‑world task completion.

If you want a single word that’s *closer* to the vibe people mean by “AGI”, use something like:
- **generalist agents** (tool-using, multi-step, domain-general competence), or
- **human-level task performance** on diverse, real-world evaluations.

## “AGI-ish” data points (good proxies)
When you want charts that feel like “human-level competence,” favor evaluations that require:
- **Long-horizon execution** (multiple steps, state, retries)
- **Tool use** (APIs, search, code execution)
- **Grounded interaction** (web/computer use, documents, images)
- **Low variance / reliability** (not just “best-of-N” demos)

Common proxy categories:
- **Real-world coding tasks** (e.g., repo bugfix benchmarks)
- **General assistant tasks** (web+docs+reasoning end-to-end)
- **Computer-use benchmarks** (UI actions + perception)
- **Hard science QA / problem solving** (less memorization, more reasoning)

## What I put in the CSV
`ai_models_timeline_crosslab.csv` is a *milestone timeline* you can turn into:
- a horizontal timeline graphic (color by `capability_tags`)
- a “capability ladder” graphic (stack tags per year)
- a “phase diagram” (text → multimodal → tools → computer use → agents)

Each row includes a `source_url` so you can click through when you’re building the graphic and want to quote/verify details.
