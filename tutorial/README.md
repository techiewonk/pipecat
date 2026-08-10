# Pipecat Feature Tutorial

A responsive, offline-capable HTML tutorial for the Pipecat framework, organized **by feature** (not by example file). It builds from first principles to an all-in-one **Gemini Live agent-to-agent (A2A)** system that runs locally and distributed.

## Start here

Open **`index.html`** in any browser. No server, build step, or internet connection is required.

Prefer everything on one page? Open **`all-in-one.html`** instead — all 14 chapters plus the full API reference in a single scrollable file.

## Chapters

| # | File | Topic |
|---|------|-------|
| 0 | `ch00-foundations.html` | Pipeline, frames, processors, worker, runner, bus, transports |
| 1 | `ch01-turn-taking.html` | VAD, turn detection, interruptions, idle, muting |
| 2 | `ch02-audio-frame-processing.html` | VAD engines, resamplers, mixers, noise filters, muting, DTMF, recording + the frame-processor toolbox |
| 3 | `ch03-speech-io.html` | STT + TTS as swappable services; runtime voice/language switching |
| 4 | `ch04-brain-memory.html` | LLM inference, context, persistence, summarization |
| 5 | `ch05-tools-mcp.html` | Function calling and MCP tool servers |
| 6 | `ch06-gemini-live.html` | Realtime speech-to-speech (the capstone engine) |
| 7 | `ch07-multimodal.html` | Vision, video processing, avatars |
| 8 | `ch08-rag.html` | RAG and grounding |
| 9 | `ch09-flows.html` | Structured multi-step conversations |
| 10 | `ch10-production-telephony.html` | Wake phrase, translation, voicemail, metrics + telephony comparison |
| 11 | `ch11-a2a-patterns.html` | Handoff, fan-out, sidecar, proxy, UI worker, distributed bus |
| 12 | `ch12-capstone-gemini-a2a.html` | The all-in-one Gemini Live A2A — local + distributed |
| 13 | `ch13-api-reference.html` | Filterable index of all 322 official API-reference pages |

Every chapter follows the same template: time/level, concept, a frame-flow diagram, annotated real code, inline Python notes, a run-it command, a modify-it exercise, common-errors, and a checkpoint quiz. Common building blocks are explained once (Chapter 0) and cross-linked, so nothing is repeated.

## Folder layout

```
tutorial/
├── index.html                 Landing page + learning path
├── all-in-one.html            Every chapter + API reference on one page
├── ch00..ch13 *.html          The 14 chapters
├── assets/
│   ├── style.css              Dark developer theme + responsive layout (defined once)
│   └── nav.js                 Sidebar, on-page TOC, prev/next, self-contained syntax highlighter
├── build_offline_docs.py      One-run mirror for the linked documentation (see below)
└── reference/
    ├── _manifest.json         The 344 doc pages the mirror downloads
    └── *.html                 Local doc copies (created by build_offline_docs.py)
```

To add or rename a chapter, edit the `CHAPTERS` array in `assets/nav.js` — the sidebar, prev/next links, and (after regenerating) the all-in-one page all follow from it.

## Going fully offline

The tutorial's own pages already work with **no internet** — the theme, navigation, and syntax highlighting are all local; there are no CDN, web-font, or remote-image dependencies.

The only online content is the **344 documentation links** (the full API reference plus each chapter's "Docs" links). To mirror those locally, run once **with internet**:

```bash
python tutorial/build_offline_docs.py
# or:
uv run python tutorial/build_offline_docs.py
```

The script uses only the Python standard library. It:

1. Reads `reference/_manifest.json`.
2. Downloads each page's Markdown and converts it to a themed offline HTML page in `reference/`.
3. Rewrites every `docs.pipecat.ai` link in every tutorial page to point at the local copy.

Re-running skips pages already downloaded; pass `--force` to refetch. After it finishes, the entire tutorial — chapters and all linked docs — works with no connection.

## Notes

- Descriptions of example files are derived from the repository's `examples/` directory and the files' docstrings/imports.
- The API-reference index links the live docs by default; run the mirror script to make those local.
- A companion Markdown version of the underlying course lives at the repo root as `COURSE.md`, and a flat per-file inventory of all 380 examples as `EXAMPLES_INVENTORY.md`.
