# Gepard (nineninesix.ai) — fact sheet for a self-hosted cascaded voice-agent stack

Research date: 2026-11-17. All facts date-stamped where the source gives a date. Most performance numbers are **vendor-measured** (nineninesix.ai); this is flagged per item.

**Identification (short version):** "Gepard" is **Gepard 1.0 / 1.1, an open-weight streaming text-to-speech (TTS) model from nineninesix.ai (Nineninesix, Inc — the KaniTTS team)**. It fills the **TTS layer only** of an STT → LLM → TTS pipeline. No STT, LLM, turn-detection or speech-to-speech model named Gepard/GEPARD/Guepard was found.

---

## 1. Who makes Gepard, when was it released, and which pipeline layer does it serve?

### Takeaway
Gepard is a TTS model (GEnerative, Prosody-aware, Autoregressive text-to-speech model for Realtime Dialogue) by nineninesix.ai, released publicly in late June / early July 2026, with a robustness update (Gepard 1.1) in September 2026. It is the TTS layer only; the identification is unambiguous for a voice-agent context.

### Cited Findings
- Name is an acronym: "GEnerative, Prosody-aware, Autoregressive text-to-speech model for Realtime Dialogue"; also German for cheetah. Developed by nineninesix.ai. — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- Technical report: arXiv:2609.04222, authors Denis Pavlov, Ulanbek Abdurazakov, Nursultan Bakashov; affiliation "Nineninesix, Inc"; 37 pages, 11 figures; arXiv page shows "Submitted on 4 Jul 2026". — [arXiv](https://arxiv.org/abs/2609.04222)
- Timeline: HF repo "Created Jun 22, 2026" per a third-party model index — [theapplied.co](http://theapplied.co/models/nineninesix-gepard-1-0); r/LocalLLaMA launch post by u/ylankgz dated 2026-07-07 (123 upvotes, 19 comments) — [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/); 2026-08-06 `stop_head` weights updated to fix premature stopping on multi-sentence input — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- Gepard 1.1 exists: "a GRPO pass over gepard-1.0 ... a robustness release, not a quality release"; benchmark run dated 2026-09-02; HF repo last modified 2026-09-10. — [HF gepard-1.1](https://huggingface.co/nineninesix/gepard-1.1)
- nineninesix has 28 repos on HF across three generations (KaniTTS, KaniTTS2, Gepard); vendor guidance: "For anything shipping to users today the answer is Gepard 1.0". Sibling `diamond-1.0` is a speech-restoration model, not TTS. — [nineninesix blog, 2026-08-10](https://www.nineninesix.ai/blog/kani-tts-to-gepard-model-guide)
- The author positions it explicitly for cascaded stacks: "You probably would use it through VAPI or pipecat or livekit in a STT-LLM-TTS pipeline." — [Reddit, 2026-07](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/)
- HF popularity as of 2026-11-17 (HF API): gepard-1.0 — 134 likes, 8,319 downloads; gepard-1.1 — 4 likes, 445 downloads; official demo Space `nineninesix/gepard` — 40 likes. — [HF gepard-1.0](https://huggingface.co/nineninesix/gepard-1.0), [HF gepard-1.1](https://huggingface.co/nineninesix/gepard-1.1), [HF Space](https://huggingface.co/spaces/nineninesix/gepard)
- **Other things named "Gepard" on Hugging Face (all checked 2026-11-17; none is a competing voice-agent model):**
  - `Yazid/Gepard` (2023, no task tag, 5 downloads) — unrelated — [HF](https://huggingface.co/Yazid/Gepard)
  - `CyberHarem/gepard_m1_girlsfrontline` (text-to-image character LoRA) — unrelated — [HF](https://huggingface.co/CyberHarem/gepard_m1_girlsfrontline)
  - `gepardzik/*`, `Gepardius/*`, `Gepardicus/*` — user names, unrelated LLM/vision/Piper repos — [HF search](https://huggingface.co/models?search=gepard)
  - Derivatives of the nineninesix model: `texdata/Gepard-Slovenian-TTS` (LoRA fine-tune, Apache-2.0) — [HF](https://huggingface.co/texdata/Gepard-Slovenian-TTS); `routsourav1729/gepard-hindi-1.0` (gated), `premlal/spx-gepard-telugu-v0`, `eugenehp/gepard`, `niobures/Gepard` — [HF search](https://huggingface.co/models?search=gepard)
  - `Mediform/gemma4-12b-it-medivoice-baseline-omni-gepard-v1` — a Gemma-4 audio LLM whose training data was synthesized with "OmniVoice, Gepard TTS"; "gepard" in the name refers to the TTS used for data, not a Gepard LLM — [HF](https://huggingface.co/Mediform/gemma4-12b-it-medivoice-baseline-omni-gepard-v1)
- HF search for "guepard" returned zero models (2026-11-17). — [HF search](https://huggingface.co/models?search=guepard)

### Inferences
- The user's "Gepard ... one of the models" in an ElevenLabs-like cascaded stack almost certainly means nineninesix Gepard TTS; it is the only Gepard that is a speech model, and it is marketed exactly for this use.
- The stack still needs a separate STT, LLM and turn detector; Gepard supplies none of them.

### Gaps
- arXiv ID `2609.04222` implies a September 2026 identifier, but the arXiv page shows submission on 4 Jul 2026. The ID is what the model card, the vendor blog and the arXiv page all cite; the date mismatch is unexplained (a web-search summary also flagged it). Verify the date before citing it in a report.
- Company details (funding, headcount, HQ) not researched/found.
- Which version (1.0 vs 1.1) the user intends is unknown — should be clarified. The hosted API docs show `model_id: "gepard-1.0"`; I found no statement that the hosted API serves 1.1.

---

## 2. Is it open-source / open-weight? License, commercial use, where are weights and code?

### Takeaway
Weights are Apache 2.0 (commercial use permitted, not gated on HF), but the model depends on NVIDIA NeMo NanoCodec, which is under the separate NVIDIA Open Model License — legal review must cover both. Inference, vLLM-serving and training code are public on GitHub.

### Cited Findings
- License: "Apache 2.0 — this model and its weights"; "This model uses the NVIDIA NeMo NanoCodec. That model is governed by the NVIDIA Open Model License Agreement." — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- Vendor license table: Gepard 1.0 — Apache 2.0 — commercial use "unrestricted"; KaniTTS/KaniTTS2 weights are Liquid AI LFM 1.0 ("see licence terms"). "A repository badge tells you about the code. The weights are a separate artefact." — [nineninesix blog, 2026-08-10](https://www.nineninesix.ai/blog/kani-tts-to-gepard-model-guide)
- Weights: `nineninesix/gepard-1.0` — `model.safetensors` 1.11 GB, plus `gepard_config.json`, `after_DPO_stop_head.pt`, `gepard_techreport.pdf`, `LICENSE`; HF API reports `gated: false`. — [HF files](https://huggingface.co/nineninesix/gepard-1.0/tree/main)
- Gepard 1.1 is also Apache 2.0, base model gepard-1.0. — [HF gepard-1.1](https://huggingface.co/nineninesix/gepard-1.1)
- Code repos: reference inference [gepard-inference](https://github.com/nineninesix-ai/gepard-inference); vLLM server [gepard-vllm](https://github.com/nineninesix-ai/gepard-vllm) (Docker Hub image `ylankgz/gepard-vllm`); training/pretraining pipeline [gepard-train](https://github.com/nineninesix-ai/gepard-train); benchmark harness `nineninesix-ai/benchmarks`. — [HF model card](https://huggingface.co/nineninesix/gepard-1.0), [Reddit 2026-08-26](https://www.reddit.com/r/LocalLLaMA/comments/1vz1yc6/ran_our_apache_20_gepard_tts_through_covals/)
- Also mirrored on ModelScope (555.69M params, 1.13 GB). — [ModelScope](https://www.modelscope.ai/models/nineninesix/gepard-1.0)
- Base/backbone: fine-tune of `nineninesix/qwen3_5-full-attn-only-14`, built on Qwen3.5-0.8B-Base; training data from LAION (Emilia, EmoNet-Voice; dataset tag `laion/Emolia`). — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- Third-party caution: "the audio codec ships under NVIDIA's Open Model License rather than Apache, so check it if you are shipping commercially." — [Neural Expedition, 2026-07-15](https://neuralexpedition.com/models/issue-072-gepard-1-0)

### Inferences
- For a commercial self-hosted deployment the Apache-2.0 weights are fine; the open item is the NanoCodec license (NVIDIA Open Model License is generally described by NVIDIA as commercially usable, but I did not read its text in this research).

### Gaps
- License of the GitHub code repos themselves (gepard-vllm, gepard-inference, gepard-train) was not confirmed from a LICENSE file.
- gepard-vllm README says `HF_TOKEN` "needs access to the gated model", but the HF API reports gepard-1.0 as not gated — README may be stale, or the codec/backbone may require a token. Unverified.
- Training-data licensing (Emilia is in-the-wild speech) and its implication for commercial use were not analyzed by any source found.

---

## 3. Technical details

### Takeaway
~556M-parameter decoder-only AR TTS (14-layer Qwen3.5 backbone + 32 FSQ heads + stop head) over NVIDIA NanoCodec at 22.05 kHz, designed to run on unmodified vLLM. Vendor numbers: ~46–50 ms TTFA, single-stream RTF ≈ 0.067, up to 256 concurrent streams per 96 GB GPU (64–128 recommended for live calls). Its weak spots are speaker similarity and WER.

### Cited Findings

**Architecture**
- Autoregressive decoder-only; backbone "Qwen3.5 full-attention transformer (14 layers, hidden 1024, 8 heads; ~500M params)"; total ≈ 555.7M params (backbone + audio interface + voice-cloning compressor). — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- Codec: NVIDIA NeMo NanoCodec — FSQ, 22.05 kHz, 21.5 frames/s, 1.89 kbps; output sample rate 22,050 Hz. — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- "One clean pass per frame — the whole audio frame (32 orthogonal FSQ channels) is sampled in one step, no depth-transformer"; CFG "baked into the weights" (two-pass mode still available). — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- Design rule: "the model must run on a standard vLLM engine without modifying the source of its compute kernels"; voice cloning, text augmentation and CFG are moved into prefill or distilled into weights via DPO. — [arXiv abstract](https://arxiv.org/abs/2609.04222), [nineninesix blog 2026-08-13](https://www.nineninesix.ai/blog/why-gepard-runs-on-vllm)
- Serving model: "Qwen3.5 backbone + 32 FSQ audio heads + a binary stop head"; LLM and codec both run inside vLLM's EngineCore subprocess sharing one CUDA context. — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)

**Latency / throughput (all vendor-measured)**
- Paper/blog, SSE streaming, "server-class GPU": single-stream RTF 0.067 (~15× real time), single-stream TTFA 46 ms, 256 concurrent streams = ~204× aggregate real time; recommended 64–128 streams per GPU for live calls. — [nineninesix blog 2026-08-13](https://www.nineninesix.ai/blog/why-gepard-runs-on-vllm), [arXiv](https://arxiv.org/abs/2609.04222)
- Model card: "~25× real time on a single RTX 5090, with first audio chunk (TTFA) in ~50 ms"; "One 96GB GPU (RTX Pro 6000 Blackwell) holds up to 256 conversations in parallel." — [HF model card](https://huggingface.co/nineninesix/gepard-1.0). The launch Reddit post says "~20× RTF" on the same RTX 5090 — [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/). (Conflict: 15× / 20× / 25× across vendor sources.)
- Hosted API, WebSocket, 18 Aug 2026, client in AWS us-west-1, n=10 per bucket: median time-to-first-audio-byte 49.4 / 50.1 / 49.9 ms (short/medium/long); p95 55.4 / 52.4 / 69.8 ms. HTTP streaming: 112–126 ms. — [nineninesix blog 2026-08-25](https://www.nineninesix.ai/blog/tts-latency-benchmark-websocket-2026)
- Coval open-source TTS harness, run by nineninesix on 25 Aug 2026 against its own API, 30 samples: 68.7 ms TTFA p50, 85.8 ms p90, 104.8 ms worst; 48.6 ms of that is server compute; 20.5 ms leading silence; 5.23% WER; "Production serves that from a single RTX 4090". Network round trip normalised out for Gepard but not for Coval's published rows ("That flatters us"). — [nineninesix blog 2026-08-26](https://www.nineninesix.ai/blog/gepard-coval-tts-leaderboard)
- Author on weaker GPUs: TTFA "about the same for Ada-hopper-blackwell. The vram affects mostly on the number of concurrent sequences." — [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/)

**Quality benchmarks**
- Seed-TTS-eval (1,088 prompts, vendor-run) — Gepard 1.0: WER 0.036, SIM 0.585, UTMOS 2.64, NISQA-MOS 4.25, NOI 4.16, COL 4.16, DIS 4.51. Comparators: VoxCPM2 WER 0.015 / SIM 0.867 / NISQA 3.97; Fish-S2 0.016 / 0.789 / 4.18; OmniVoice 0.016 / 0.848 / 4.17; Qwen3-TTS 0.017 / 0.833 / 4.18; Echo-TTS 0.022 / 0.824 / 4.08; Chatterbox 0.063 / 0.796 / 4.19. Gepard is best on NISQA/NOI/COL/DIS, worst on SIM, second-worst on WER. — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- Gepard 1.1 vs 1.0 on the vendor's Multilingual Speech Benchmark v2.0 (63,000 utterances, 4 languages × 42 voices, Whisper scoring, 2026-09-02): WER 0.0801 → 0.0772; unusable outputs 88 → 12; catastrophic (WER > 50%) 3.13% → 2.97%; truncated clips 595 → 557; runaway clips 200 → 188; speaker similarity unchanged; NISQA MOS 4.411 → 4.464 (CI includes zero). — [HF gepard-1.1](https://huggingface.co/nineninesix/gepard-1.1)
- Per-language WER vs human-recording anchor (1.1): en-US 0.0675 (0.87× anchor), es-MX 0.0760 (1.24×), nl-NL 0.0626 (1.63×), pt-BR 0.1510 (2.05×). — [HF gepard-1.1](https://huggingface.co/nineninesix/gepard-1.1)
- 1.1 changed only 28 of 296 tensors (attention q/v projections in all 14 layers); everything else is bit-identical to 1.0. — [HF gepard-1.1](https://huggingface.co/nineninesix/gepard-1.1)

**Languages**
- English (US, UK), Spanish (Mexico), Portuguese (Brazil), Dutch (Netherlands); "plus five English accents". "Quality is strongest in English; other languages vary by voice and content." — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- Conflict: the vendor marketing page says "23 languages, with high emotional range", output "24 kHz". — [nineninesix.ai/tts](https://www.nineninesix.ai/tts). The model card, LinkedIn page and model-guide blog all say 4 languages / 22.05 kHz — [LinkedIn](https://linkedin.com/company/nineninesixai), [blog](https://www.nineninesix.ai/blog/kani-tts-to-gepard-model-guide).
- Community fine-tunes add Slovenian (LoRA, "Overall quality is not yet top-tier"), Hindi, Telugu; the full pretraining pipeline is released. — [texdata Slovenian](https://huggingface.co/texdata/Gepard-Slovenian-TTS), [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/)

**Voice cloning**
- Zero-shot from "a few seconds of reference audio"; speaker captured once up front, "cloning adds nothing to the per-word cost". — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- In gepard-vllm a voice is a ~32 KB speaker prefix stored in Postgres and cached in-process. — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)
- Cloning fidelity is the weak point: SIM 0.585 vs 0.79–0.87 for peers — [HF model card](https://huggingface.co/nineninesix/gepard-1.0); user report: "its get the tone (male or female) but not a real near similar voice" — [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/)

**Hardware**
- gepard-vllm: "NVIDIA GPU, CUDA 13+, compute capability sm_120 — Hopper (H100) and Blackwell (B200 / RTX 50-series) class chips"; at default `gpu_memory_utilization=0.82` it "reserves ~80 GB of VRAM" — lower via `TTS_GPU_MEMORY_UTILIZATION` on smaller cards; `linux/amd64` only; first launch ~60 s, warm ~25 s. — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)
- Apparent conflict: vendor's own production API runs on "a single RTX 4090" (Ada generation, not Hopper/Blackwell). — [nineninesix blog 2026-08-26](https://www.nineninesix.ai/blog/gepard-coval-tts-leaderboard)
- CPU/Mac: author says CPU is possible but "Needs to be converted to gguf or mlx"; vendor says for Macs use KaniTTS MLX ports because "Gepard's realtime figures assume a CUDA GPU". — [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/), [blog](https://www.nineninesix.ai/blog/kani-tts-to-gepard-model-guide)

### Inferences
- Weights are 1.11 GB, so the ~80 GB reservation is vLLM's default memory fraction for KV cache across 256 sequences, not a hard minimum; a 24 GB card should host it at reduced concurrency (consistent with the RTX 4090 production claim), but max streams per 24 GB card is not published.
- The CUDA 13 / sm_120 statement in the README is likely a build-configuration statement for the shipped Dockerfile rather than a hard model requirement; this needs hands-on verification on the target GPU.

### Gaps
- No published VRAM-vs-concurrency table for 16/24/48 GB cards; no published per-stream TTFA at 64/128 streams (only "keep TTFA at 50 ms" guidance).
- No independent (non-vendor) TTFA/RTF measurement found. The independent "tts-bench" (91 open models) post was located, but Gepard's row in it was not visible in the retrievable text — [Reddit tts-bench](https://www.reddit.com/r/LocalLLaMA/comments/1xsqv86/tts_bench_91_open_tts_models_and_28_paid_tts_apis/).
- No human-rated MOS; all naturalness numbers are predicted MOS (UTMOS/NISQA/DNSMOS).
- Emotion/style control tags, SSML, speed control, pronunciation dictionaries: nothing documented in sources found (the Slovenian fine-tune card says "no explicit emotion-control input").
- Maximum utterance length: default `TTS_MAX_TOKENS=1000` frames (≈46 s at 21.5 fps by arithmetic) — the per-request practical limit is not stated explicitly.

---

## 4. How is it served? Pipecat / LiveKit integration? Local Pipecat checkout findings

### Takeaway
Self-host with the vendor's `gepard-vllm` server (FastAPI + vLLM), which exposes a **Cartesia-compatible** HTTP/WebSocket API — so Pipecat and LiveKit use their existing Cartesia plugins with a URL override; there is no dedicated Gepard service in Pipecat. A hosted API exists at $5 per 1M characters.

### Cited Findings

**Local Pipecat checkout (/home/user/pipecat, checked 2026-11-17)**
- Case-insensitive grep for `gepard` and `guepard` across the whole repo (including `src/` and `examples/`): **zero matches**. There is no Gepard/nineninesix service, example or doc in this checkout. — local repo (no URL)
- The integration path is the existing Cartesia service at `/home/user/pipecat/src/pipecat/services/cartesia/tts.py`: `CartesiaTTSService(url: str = "wss://api.cartesia.ai/tts/websocket", ...)` (line 252) and `CartesiaHttpTTSService(base_url: str = "https://api.cartesia.ai", ...)` (line 799); both accept `extra_headers`. — local repo; matches [Pipecat Cartesia docs](https://docs.pipecat.ai/api-reference/server/services/tts/cartesia)
- In this checkout the class is `CartesiaHttpTTSService` (the gepard-vllm README spells it `CartesiaHTTPTTSService`), and `voice_id=`/`model=` constructor args are deprecated in favour of `settings=CartesiaTTSService.Settings(voice=..., model=...)`. — local repo; [Pipecat Cartesia docs](https://docs.pipecat.ai/api-reference/server/services/tts/cartesia)

**Self-hosted serving**
- "served on a vLLM backend and exposed through a Cartesia-compatible API ... it drops into Pipecat and LiveKit Agents by pointing their Cartesia plugin's base URL at this server — no custom plugin." — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)
- Endpoints: `POST /tts/bytes` (batch), `WebSocket /tts/websocket` (streaming, sentence-by-sentence, barge-in via `{"cancel":true,"context_id":…}`, multiple contexts multiplexed per socket), `POST /voices/clone`, `GET /voices`, `GET|DELETE /voices/{id}`, `GET /health`. — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)
- Vendor Pipecat snippet: `CartesiaTTSService(api_key="ignored", url="ws://YOUR_HOST:8000/tts/websocket", voice_id="<uuid>", sample_rate=22050)`; LiveKit: `cartesia.TTS(api_key="ignored", base_url="http://YOUR_HOST:8000", voice="<uuid>", sample_rate=22050)`. — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)
- Requires Postgres: "`DATABASE_URL` is required — the server fails fast on startup if it's unset" (voice store). — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)
- Tunables: `TTS_MAX_NUM_SEQS` (default 256), `TTS_FIRST_CHUNK_FRAMES` (default 10; lower = lower TTFB), `TTS_CHUNK_SIZE` (default 86 frames), `TTS_TEMPERATURE`/`TTS_TOP_P` (0.3/0.95), `TTS_MAX_TOKENS` (1000), `TTS_MODEL_PATH` (serve a fine-tune). vLLM automatic prefix caching is intentionally disabled. — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)
- Output: `/tts/bytes` supports container raw|wav, encoding pcm_s16le|pcm_f32le; model is 22,050 Hz and resamples to the requested rate. — [gepard-vllm server.py](https://github.com/nineninesix-ai/gepard-vllm/blob/main/server.py)
- **Not production-hardened as shipped** ("configured to run behind an API gateway for testing"): no authentication on any endpoint; `/debug/arm_profile` exposed; CORS `allow_origins=["*"]` with credentials; no upload-size cap on `/voices/clone`; `vllm` installed unpinned while the server "depends on a custom ModelRegistry hook and internal worker patching". — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)
- It is not served via vLLM's stock OpenAI-compatible endpoint; it is a custom FastAPI app that registers a custom multihead model with vLLM. — [gepard-vllm server.py](https://github.com/nineninesix-ai/gepard-vllm/blob/main/server.py)

**Hosted API**
- Base URL `https://api.nineninesix.ai`; official Cartesia SDKs work with a base-URL override; `model_id: "gepard-1.0"`; keys start `sk_996_`. — [nineninesix docs: SDKs](https://docs.nineninesix.ai/sdks), [Quickstart](https://docs.nineninesix.ai/quickstart)
- Pricing: $5 per 1M characters (≈22 hours of speech), pay-as-you-go, credits never expire, minimum top-up $5, failed generations not charged. — [nineninesix pricing](https://www.nineninesix.ai/pricing)
- Limits: Tier 1 — 60 req/min, 5 concurrent streams; Tier 2 (after $50 cumulative spend) — 600 req/min, 25 concurrent; Tier 3 — 6,000 req/min, 100 concurrent (contact sales). Concurrency counted per active-speech turn; a WebSocket counts as one request per connection. — [nineninesix pricing](https://www.nineninesix.ai/pricing)
- Conflict: the `/tts` marketing page says "~17 hours of audio for $15". — [nineninesix.ai/tts](https://www.nineninesix.ai/tts)
- Telephony formats on the hosted API: mu-law and a-law at 8000/16000/22050 Hz plus 16-bit PCM WAV. — [nineninesix blog 2026-09-01](https://www.nineninesix.ai/blog/jambonz-tts-vendor-gepard)
- Marketing page lists "Compatible with LiveKit, Vapi, Pipecat, Retell, Jambonz". — [nineninesix.ai/tts](https://www.nineninesix.ai/tts)
- jambonz ships nineninesix as a built-in TTS vendor since speech-layer v1.0.15. — [nineninesix blog 2026-09-01](https://www.nineninesix.ai/blog/jambonz-tts-vendor-gepard)

**Streaming behaviour inside a Pipecat/LiveKit pipeline**
- "Both Pipecat and LiveKit aggregate the LLM stream to sentences before sending, and the server synthesizes each as it arrives"; "Each sentence is an independent generation, so prosody resets at sentence boundaries"; timbre is preserved via the same speaker prefix. — [gepard-vllm README](https://github.com/nineninesix-ai/gepard-vllm)
- Gepard "delivers audio in a handful of large chunks where others send many small ones, which ... does commit more audio before the server can react, so barge-in responsiveness is a separate question"; "Cold-start numbers that include connection setup narrow our lead over Cartesia considerably." — [nineninesix blog 2026-08-25](https://www.nineninesix.ai/blog/tts-latency-benchmark-websocket-2026)

### Inferences
- In Pipecat the practical wiring is `CartesiaTTSService(url="ws://<host>:8000/tts/websocket", sample_rate=22050, settings=Settings(voice="<uuid>", model="gepard-1.0"))`; because the path is via a Cartesia emulation, any Cartesia features the Gepard server does not emulate (see Gaps) silently do not apply.
- The "starts speaking as text arrives" property is partly neutralised in Pipecat/LiveKit, since both send whole sentences; effective latency = LLM time-to-first-sentence + ~50 ms.
- Self-hosting needs an auth/gateway layer, a pinned vLLM version and a Postgres instance added by the deployer.

### Gaps
- Whether the Gepard server returns Cartesia-style **word timestamps** is not documented. Pipecat's `CartesiaTTSService` requests `add_timestamps=True` by default (local `tts.py` line 513) and uses them for interruption-accurate context; behaviour against Gepard is unverified and should be tested.
- Whether Cartesia `generation_config` (speed/emotion), SSML tags, or `cartesia_version` checks are honoured or ignored is not documented (README says version + api_key are ignored).
- No upstream Pipecat or LiveKit PR/plugin dedicated to Gepard was found; no report of a third party running Gepard through Pipecat in production was found.
- The known-good vLLM version for gepard-vllm is not stated in the README excerpt retrieved.
- No hosted-API SLA, region list or data-retention terms found.

---

## 5. Comparison with the closest TTS alternatives

### Takeaway
Vendor data puts Gepard ahead of Cartesia Sonic 3.5 and ElevenLabs Flash v2.5 on first-audio latency and far below them on price; against open models it wins on predicted naturalness but loses on voice-clone similarity and WER. No independent head-to-head against Kokoro or Orpheus was found.

### Cited Findings
- Hosted WebSocket median TTFA (vendor benchmark, 18 Aug 2026, us-west-1, ms, short/medium/long): Gepard 1.0 49.4/50.1/49.9; Cartesia sonic-3.5 102.2/94.5/122.6; ElevenLabs eleven_flash_v2_5 175.2/185.1/186.5; Gradium 218.6/218.3/219.9. — [nineninesix blog](https://www.nineninesix.ai/blog/tts-latency-benchmark-websocket-2026)
- Total delivery time (ms, short/medium): Gepard 143.9/307.9; ElevenLabs 217.2/326.0; Cartesia 345.6/876.8; Gradium 1,044.3/2,722.0. Long bucket: Gepard 674 vs ElevenLabs Flash 666 ("a tie inside the noise"), Cartesia 2,207, Gradium 6,403. — [nineninesix blog](https://www.nineninesix.ai/blog/tts-latency-benchmark-websocket-2026)
- Vendor's own caveat: "We built Gepard, so treat this as a vendor benchmark and check it"; corpus/code/logs published. — [nineninesix blog](https://www.nineninesix.ai/blog/tts-latency-benchmark-websocket-2026)
- Price: Gepard $5 per 1M chars "where Cartesia and Deepgram are around $30" (vendor claim). — [nineninesix LinkedIn, 2026-09-02](https://linkedin.com/company/nineninesixai). Independent tts-bench: cheapest hosted APIs "around $9 to $10 per 1M characters (Async, Giggy, Fish, Murf). ElevenLabs v4 is $80." — [Reddit tts-bench](https://www.reddit.com/r/LocalLLaMA/comments/1xsqv86/tts_bench_91_open_tts_models_and_28_paid_tts_apis/)
- Versus open models on Seed-TTS-eval (vendor-run): Gepard NISQA-MOS 4.25 vs Chatterbox 4.19; WER 0.036 vs Chatterbox 0.063; SIM 0.585 vs Chatterbox 0.796. (Launch post says the comparator was "Chatterbox Turbo".) — [HF model card](https://huggingface.co/nineninesix/gepard-1.0), [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/)
- Third party: "if faithful speaker similarity is the priority, an offline model like VoxCPM2 still wins that column." — [Neural Expedition, 2026-07-15](https://neuralexpedition.com/models/issue-072-gepard-1-0)
- Coval leaderboard: of the 25 APIs listed, 24 are closed; Gepard's self-run TTFA (68.7 ms p50) "is lower than every number published on their board" — self-measured, not a Coval-run listing. — [nineninesix blog 2026-08-26](https://www.nineninesix.ai/blog/gepard-coval-tts-leaderboard)
- Independent tts-bench context (Gepard row not seen): fastest open model AuroraTTS-100K at 12 ms TTFA on RTX 5090; top UTMOS Maya1 4.487, Chatterbox 4.423; commenters still rate Chatterbox and Kokoro highly. — [Reddit tts-bench](https://www.reddit.com/r/LocalLLaMA/comments/1xsqv86/tts_bench_91_open_tts_models_and_28_paid_tts_apis/)

### Inferences
- Table-ready positioning: Gepard = low-latency, high-concurrency, Apache-2.0, 4 languages, weak cloning fidelity. Versus Kokoro (tiny, preset voices, no cloning) Gepard adds cloning and LLM-style prosody at higher GPU cost; versus Orpheus/Chatterbox it claims better concurrency via vLLM-native serving. These contrasts are my inference from each model's general profile — no source found compares them directly with Gepard.
- Gepard's UTMOS (2.64 on Seed-TTS-eval; 2.48–2.53 on the vendor multilingual benchmark) is far below the ~4.4 UTMOS that tts-bench reports for top models, but the test sets and prompts differ, so the numbers are not comparable.

### Gaps
- No direct, same-harness comparison of Gepard vs Kokoro, Orpheus, or Cartesia Sonic self-hosted alternatives found.
- Not listed (as far as could be determined) on Artificial Analysis TTS leaderboard or TTS Arena; the Artificial Analysis page retrieved showed no model rows. — [Artificial Analysis](https://artificialanalysis.ai/text-to-speech/leaderboard/provider-voice)
- No blind human-preference (arena/ELO) result for Gepard found.

---

## 6. Known limitations, production users, community reports

### Takeaway
Documented limitations are specific and mostly self-reported: weak speaker similarity, higher WER than peers, non-English quality (pt-BR worst), residual truncation/looping failures (reduced in 1.1), per-sentence prosody resets, and an un-hardened reference server. Production evidence is thin: the vendor's own API, a jambonz vendor integration, and one team using it for synthetic training data.

### Cited Findings
- Trade-off stated by vendor: "it trades some speaker similarity (SIM) and word accuracy (WER)". — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- 1.0 failure modes quantified on 63,000 utterances: 88 unusable outputs, 3.13% catastrophic (WER > 50%), 595 truncated and 200 runaway clips; 1.1 reduces to 12 / 2.97% / 557 / 188. — [HF gepard-1.1](https://huggingface.co/nineninesix/gepard-1.1)
- "Short register" (1–2 word utterances) is a failure mode treated in the paper as fundamental to AR speech decoders, with a mitigation. — [arXiv](https://arxiv.org/abs/2609.04222), [nineninesix blog](https://www.nineninesix.ai/blog/why-gepard-runs-on-vllm)
- Benchmark blind spots admitted by vendor: "no digits, no abbreviations and no long-form text (3–16 words), so text normalisation and long-context prosody are untested"; Whisper-only scoring; GRPO train/benchmark overlap "was not audited"; 1.0 vs 1.1 latency difference "unverified". — [HF gepard-1.1](https://huggingface.co/nineninesix/gepard-1.1)
- Early 1.0 weights cut off multi-sentence input at the first sentence boundary (fixed 2026-08-06). — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- "Two-pass CFG dips voice similarity slightly versus single-pass — single-pass is the production default"; reference PyTorch runner "isn't tuned for throughput". — [HF model card](https://huggingface.co/nineninesix/gepard-1.0)
- Author: "this model was tuned for american english mostly. We are working on the PT-BR only model now (as well as MX and NL)". — [Reddit, 2026-07](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/)
- Community sentiment at launch was positive on latency and pt-BR naturalness ("Tested it in portuguese brazil and sounds great"), critical on cloning similarity. — [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1uq10cw/gepard_06b_streaming_tts_built_for_realtime/)
- The Coval-benchmark Reddit post (2026-08-26) had no comments when retrieved. — [Reddit](https://www.reddit.com/r/LocalLLaMA/comments/1vz1yc6/ran_our_apache_20_gepard_tts_through_covals/)
- WER measurement caveat: on Coval's harness roughly half of Gepard's 5.23% WER was scorer artefact (whisper-1 4.57% vs gpt-4o-transcribe 2.41% on the same audio). — [nineninesix blog 2026-08-26](https://www.nineninesix.ai/blog/gepard-coval-tts-leaderboard)
- Usage evidence: jambonz built-in vendor (since speech layer v1.0.15) — [nineninesix blog](https://www.nineninesix.ai/blog/jambonz-tts-vendor-gepard); Mediform (German medical voice assistant) used Gepard TTS with OmniVoice to synthesize 6,186 training audio variants — [HF Mediform](https://huggingface.co/Mediform/gemma4-12b-it-medivoice-baseline-omni-gepard-v1); MediaAtlas published a Slovenian LoRA fine-tune — [HF texdata](https://huggingface.co/texdata/Gepard-Slovenian-TTS)
- Low-quality secondary source warning: an "Honest Review" on aiindigo.com states "55,569,416 parameters" and voice cloning "Not published" — both contradict the model card (555.7M; zero-shot cloning). Do not use it. — [aiindigo](https://aiindigo.com/blog/honest-review-gepard-1-0-open-source-voice-synthesis-in-2026)

### Inferences
- For a production cascaded stack, prefer evaluating 1.1 (fewer catastrophic outputs, identical voice behaviour) unless hosted-API parity with `gepard-1.0` matters.
- Number/date/abbreviation reading is untested by the vendor's benchmarks; plan an LLM-side or pipeline-side text-normalisation step and test it on domain text.
- Risk concentration: a single small vendor, a model ~4.5 months old, almost all metrics self-reported.

### Gaps
- No named production customers of Gepard (self-hosted or API) found; no independent production post-mortems.
- No Hacker News discussion located.
- No GitHub issue review was done (issue counts, open bugs in gepard-vllm unknown).
- No reports on long-session stability (memory growth, vLLM EngineCore crashes) or multi-GPU/replica scaling.
- German is not supported despite the German name; no roadmap for additional official languages beyond the author's comment about PT-BR/MX/NL-specific models.

---

## What to clarify with the user
1. Confirm "Gepard" = nineninesix.ai Gepard TTS (the only plausible match) and which version: 1.0 (what the hosted API exposes) or 1.1 (robustness update, weights-only as far as found).
2. Self-hosted via `gepard-vllm` or the hosted `api.nineninesix.ai`? (Both use the same Cartesia-compatible wiring in Pipecat.)
3. Target languages — only en/es-MX/pt-BR/nl are official; anything else needs a fine-tune.
4. Is high-fidelity voice cloning a requirement? If yes, Gepard's SIM 0.585 is a material weakness.
5. Target GPU class — the README targets Hopper/Blackwell with CUDA 13 and ~80 GB default reservation; smaller cards need tuning and verification.
