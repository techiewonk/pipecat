# Open-source orchestration frameworks and infrastructure for a self-hosted cascaded voice-agent platform (as of 2026-11-17)

Notes on reading these notes:
- Web facts carry the publication/read date of the source. Many comparison articles are written by vendors (Dograh, Micdrop, LiveKit, jambonz, Cekura, Modal); these are flagged "(vendor)".
- Local-repo facts cite absolute file paths. The local checkout is Pipecat **1.11.0** (CHANGELOG header `## [1.11.0] - 2026-09-17`; HEAD commit 3dede06, 2026-09-17). Upstream was at **v1.15.0 (2026-10-29)** per a third-party check on 2026-11-04, so the checkout is roughly two months / four minor releases behind — [Sheerbit](https://sheerbit.com/pipecat-vs-livekit-agents/).

## 1. Orchestration frameworks: Pipecat, LiveKit Agents, TEN, Vocode, FastRTC, Bolna, Ultravox, others

### Takeaway
Only two frameworks are both permissively licensed and actively maintained at production scale: Pipecat (BSD-2, transport-agnostic frame pipeline) and LiveKit Agents (Apache-2.0, agent-as-room-participant on LiveKit's own SFU/SIP stack). TEN has a restricted "Apache 2.0 with additional conditions" licence, Vocode is dormant since Nov 2024, FastRTC is a prototyping transport library, Bolna is a small telephony-first project, and Ultravox is a speech-LLM rather than a cascade framework.

### Cited Findings

**Comparison table (table-ready)**

| Project | Licence | Language | Architecture model | Transport | Telephony | Turn-taking | Stars (date) | Managed counterpart |
|---|---|---|---|---|---|---|---|---|
| Pipecat (Daily) | BSD-2-Clause | Python server; client SDKs JS/React/RN/Swift/Kotlin/C++/ESP32 | Pipeline of frame processors; transport is a plugin | Daily, LiveKit, SmallWebRTC (P2P), WebSocket, WhatsApp, MoQ, Vonage | Serializers for Twilio, Telnyx, Plivo, Exotel, Vonage, Genesys; Daily PSTN/SIP | Silero VAD + Smart Turn v3 (open, CPU, default) | ~17,200 (2026-11-13) | Pipecat Cloud ($0.01/min active); Pipecat Enterprise (your K8s, Daily control plane) |
| LiveKit Agents | Apache-2.0 (turn detector under separate LiveKit Model License) | Python, Node.js | `AgentSession` joins a LiveKit room as a participant; agent-server/job-subprocess worker pool | LiveKit WebRTC rooms only | Native LiveKit SIP (inbound/outbound trunks, dispatch rules, cold + agent-assisted transfer) | LiveKit TurnDetector audio model (v1 on LiveKit Inference, v1-mini local CPU) | ~15,200 (2026-11-13) | LiveKit Cloud ($0 for 1,000 agent min; $50/5,000; then $0.01/min) |
| TEN Framework (Agora) | "Apache 2.0 with additional restrictions" (non-compete with Agora; no hosting on end-user devices); `packages/` plain Apache-2.0 | C/C++, Go, Python, JS/TS | Polyglot graph runtime; extensions share a message bus; TMAN Designer visual editor | Agora RTC, WebSocket | SIP examples / via Agora | Own VAD + turn-detection model | ~11,200 (2026-11-13) | Agora conversational AI engine |
| Vocode | MIT | Python | Modular STT/LLM/TTS library | WebSocket | Twilio, Vonage | basic | ~3,800; last push 2024-11-15 | Hosted product discontinued (per Micdrop) |
| FastRTC (Hugging Face/Gradio) | MIT | Python | Turns a Python function into a WebRTC/WebSocket stream; bring your own STT/LLM/TTS | WebRTC, WebSocket | `fastphone()` demo number only | Built-in pause detection (`ReplyOnPause`) | 4,618 (Jul 2026) | None |
| Bolna | MIT core; hosted APIs + playground closed | Python | Config(JSON)-driven telephony-first orchestration over WebSockets | WebSocket | Twilio, Plivo (Exotel/SIP listed) | basic | ~800 (2026-11-13) | Bolna cloud (~$0.06/min) |
| Ultravox (Fixie) | MIT | — | Open speech-language model, not a cascade framework | — | — | — | ~4,600 | Ultravox API ($0.05/min) |
| Dograh | BSD-2-Clause | Python/TS | Full platform (visual builder, campaigns, QA) on a fork of Pipecat | WebRTC, WebSocket | Twilio, Vonage, Plivo, Telnyx, Exotel, Vobiz, Cloudonix, Asterisk ARI, own SIP trunk | inherits Pipecat | 5,365 (Aug 2026) | Dograh Cloud ($0.01/min) |
| Unmute (Kyutai) | MIT (models CC-BY 4.0) | Python + Rust backend | Reference cascade wrapping any text LLM with Kyutai STT/TTS | WebSocket | none | STT-based pause detection | n/a | unmute.sh demo |

Sources for table rows: [Botcadence, read 2026-11-13](https://botcadence.com/blogs/open-source-ai-voice-agents); [Sheerbit, checked 2026-11-04](https://sheerbit.com/pipecat-vs-livekit-agents/); [Micdrop (vendor), 2026-08-13](https://micdrop.dev/blog/open-source-voice-agent-frameworks); [Dograh (vendor), 2026-10-29](https://www.dograh.com/hub/blogs/best-open-source-voice-ai-platforms); [Techsy, Jul 2026](https://techsy.io/en/blog/best-open-source-voice-agent-frameworks); [MenuAgentic, 2026-09-14](https://menuagentic.com/blogs/pipecat-vs-livekit-agents-vs-ten-framework-vs-bolna); [kyutai-labs/unmute](https://github.com/kyutai-labs/unmute); [Collegica, 2026-09-13](https://www.collegica.org/ai/voice-agents).

**Pipecat**
- Latest release v1.15.0 (2026-10-29); LiveKit Agents Python 1.8.10 (2026-10-29) and Node 1.9.5; "both projects release every week or two" — [Sheerbit, 2026-11-04](https://sheerbit.com/pipecat-vs-livekit-agents/).
- Pipecat 1.0 landed April 2026; ~14,000 stars, 293 contributors, >300,000 PyPI downloads/week as of Aug 2026; "the stable API is younger than the project" — [Micdrop (vendor), 2026-08-13](https://micdrop.dev/blog/open-source-voice-agent-frameworks).
- Star growth: 13,416 (Jul 2026) → 15,476 (Sep 2026) → ~17,200 (2026-11-13) — [Techsy](https://techsy.io/en/blog/best-open-source-voice-agent-frameworks); [Micdrop](https://micdrop.dev/blog/top-ai-voice-agent-platforms); [Botcadence](https://botcadence.com/blogs/open-source-ai-voice-agents).
- Pipecat Cloud GA 2026-01-08; >1,000 teams used the beta; launch announcement named NVIDIA, Mercor, Descript, Epic, Vapi, Tavus as users. Pricing $0.01–$0.03 per active agent minute by instance size; SIP $0.003–$0.02/min; PSTN $0.018/min; Frankfurt region available — [Micdrop (vendor), 2026-09-13](https://micdrop.dev/blog/top-ai-voice-agent-platforms).
- Pipecat Enterprise runs agents in the customer's own Kubernetes cluster with a Daily-operated control plane — [Sheerbit](https://sheerbit.com/pipecat-vs-livekit-agents/); [Modal (vendor)](https://modal.com/resources/best-infrastructure-self-hosted-voice-agents).
- Pipecat's telephony guide states its carrier-WebSocket integrations (Twilio/Telnyx/Plivo/Exotel) have "No advanced call center features like transfers or reconnects"; transfers need Daily PSTN or SIP routes — [Dograh (vendor), 2026-10-29](https://www.dograh.com/hub/blogs/best-open-source-voice-ai-platforms).
- Integration-count claims conflict: "more than 150 AI services" [Dograh](https://www.dograh.com/hub/blogs/best-open-source-voice-ai-platforms) vs "68+ service integrations" in an older academic tutorial [arXiv 2603.05413](https://arxiv.org/html/2603.05413). The local README table lists 23 STT, 25 LLM, 31 TTS, 5 speech-to-speech, 7 transports, 6 serializers, 4 video, 5 audio-processing entries — `/home/user/pipecat/README.md` (lines 92–102).
- Smart Turn v3.2: Whisper Tiny base + linear classifier, ~8M parameters, "runs in as little as 10ms on some CPUs", 23 languages, BSD-2 for data, training script and weights — [Collegica, 2026-09-13](https://www.collegica.org/ai/voice-agents).

**LiveKit Agents**
- Server, SIP service, egress, ingress, agents framework and all client SDKs are Apache-2.0 and self-hostable "with full feature parity" — [LiveKit blog (vendor), 2026-09-21](https://livekit.com/blog/best-open-source-voice-and-video-ai-agent-frameworks).
- Repo carries a separate `MODEL_LICENSE` file; turn-detection models ship under the LiveKit Model License, not Apache-2.0 — [github.com/livekit/agents](https://github.com/livekit/agents); [Dograh (vendor)](https://www.dograh.com/hub/blogs/best-open-source-voice-ai-platforms).
- ~13,000 stars, 446 contributors, >1M PyPI downloads/week (Aug 2026); LiveKit raised a $100M Series C at $1B valuation in Jan 2026 (Index Ventures) — [Micdrop (vendor)](https://micdrop.dev/blog/open-source-voice-agent-frameworks).
- Named production users: OpenAI (ChatGPT voice), SAP, NVIDIA, Tesla, Spotify, Salesforce, SpaceX (LiveKit customer page, as relayed) — [Micdrop](https://micdrop.dev/blog/open-source-voice-agent-frameworks); [Micdrop](https://micdrop.dev/blog/top-ai-voice-agent-platforms). Note: OpenAI's own May 2026 post describes ChatGPT voice / Realtime WebRTC running on an in-house Go transceiver built on Pion — [OpenAI, 2026-05-04](https://openai.com/index/delivering-low-latency-voice-ai-at-scale/). The two claims are in tension; the OpenAI post is the primary source.
- Case study: telli migrated 100% of call volume to LiveKit in three weeks — 30,000+ daily calls, 400+ SIP trunks, 30+ languages, EU data residency, direct Deutsche Telekom trunks — [LiveKit blog (vendor)](https://livekit.com/blog/best-open-source-voice-and-video-ai-agent-frameworks).
- Features: tool use, multi-agent handoff, tasks/task groups/workflows built in, native MCP, built-in agent-server orchestration and load balancing — [LiveKit docs](https://docs.livekit.io/agents); [Sheerbit](https://sheerbit.com/pipecat-vs-livekit-agents/).

**Others**
- TEN: ~11,000 stars, release roughly every two weeks, still 0.x after two years, no named production users; renamed from Astra; licence forbids competing with Agora's offerings — [Micdrop (vendor)](https://micdrop.dev/blog/open-source-voice-agent-frameworks). LiveKit calls it "source-available" — [LiveKit blog (vendor)](https://livekit.com/blog/best-open-source-voice-and-video-ai-agent-frameworks).
- Vocode: last commit Nov 2024, last stable release Jun 2024; README says it is "actively looking for community maintainers" — [Micdrop](https://micdrop.dev/blog/open-source-voice-agent-frameworks); [Dograh](https://www.dograh.com/hub/blogs/best-open-source-voice-ai-platforms).
- FastRTC: built-in voice detection/turn-taking, auto Gradio UI, WebRTC + WebSocket, mountable on FastAPI — [Hugging Face blog, 2025-02-25 (older)](https://huggingface.co/blog/fastrtc); "scales down beautifully and scales up painfully" — [Techsy](https://techsy.io/en/blog/best-open-source-voice-agent-frameworks).
- Unmute: needs CUDA GPU ≥16 GB VRAM; latency ~750 ms on a single L40S, ~450 ms with one GPU per service — [Collegica](https://www.collegica.org/ai/voice-agents); LLM can be self-hosted via vLLM — [kyutai-labs/unmute](https://github.com/kyutai-labs/unmute).
- HuggingFace speech-to-speech: queue-based threaded pipeline, "the cleanest reference implementation" — [arXiv 2603.05413](https://arxiv.org/html/2603.05413).

### Inferences
- For an ElevenLabs-Agents-like platform that must be fully self-hostable under a permissive licence, the realistic choices are Pipecat (bring your own transport/telephony) or LiveKit Agents (adopt the LiveKit media plane). They are also composable: Pipecat ships a LiveKit transport, so LiveKit server + LiveKit SIP can carry media for a Pipecat pipeline (confirmed by a production write-up in section 7).
- Licence nuance matters for "fully open": Pipecat's default turn model is BSD-2; LiveKit's is under a separate model licence; TEN is effectively unusable for building a competing platform.

### Gaps
- No primary-source list of Pipecat production customers beyond the names in the Pipecat Cloud GA announcement (relayed by a third party).
- Exact star/contributor counts were not read from GitHub directly this session; figures are third-party reads with dates.
- No independent benchmark comparing per-call resource cost of Pipecat vs LiveKit Agents; the only published number is jambonz's vendor white paper (section 4).

## 2. What the local Pipecat checkout already provides for a self-hosted stack

### Takeaway
Pipecat 1.11.0 (BSD-2) covers every non-model layer of a self-hosted cascade in-tree: local/self-hostable STT, LLM and TTS adapters (including any OpenAI-compatible endpoint), a serverless P2P WebRTC transport, six telephony serializers, a bundled CPU turn-detection model, a multi-worker bus with Redis/Postgres backends, OpenTelemetry tracing, and a fully local eval harness. Missing in-tree: a SIP stack, an SFU, a PII-redaction/guardrail processor, and a deployment/autoscaling layer.

### Cited Findings

**Licence / version**
- BSD 2-Clause, Copyright 2024–2026 Daily; `requires-python >=3.11` — `/home/user/pipecat/LICENSE`, `/home/user/pipecat/pyproject.toml`.

**Self-hostable model adapters (table-ready)**

| Layer | Class (module under `/home/user/pipecat/src/pipecat/services/`) | How it runs | Notes |
|---|---|---|---|
| STT | `WhisperSTTService` (`whisper/stt.py`) | In-process faster-whisper (`faster-whisper~=1.2.1`); `device` cpu/cuda/auto, `compute_type` | `SegmentedSTTService` (per-utterance, not streaming) |
| STT | `WhisperSTTServiceMLX` (`whisper/stt.py`) | In-process MLX Whisper, Apple Silicon only | extra `mlx-whisper` |
| STT | `MoonshineSTTService` (`moonshine/stt.py`) | In-process (`moonshine-voice`) | Segmented; default eval transcriber |
| STT | `FunASRSTTService` (`funasr/stt.py`) | In-process FunASR, `device` cpu/cuda | Segmented |
| STT | `OpenAISTTService` (`openai/stt.py`, base `whisper/base_stt.py`) | `base_url` param → any OpenAI-compatible `/v1/audio/transcriptions` server | Segmented |
| STT | `NvidiaSTTService`, `NvidiaSegmentedSTTService` (`nvidia/stt.py`) | Riva gRPC; default `grpc.nvcf.nvidia.com:443`, docstring: "For local deployments, pass the local address (e.g. `localhost:50051`)" | streaming + segmented; extra `nvidia-riva-client` |
| LLM | `OLLamaLLMService` (`ollama/llm.py`) | OpenAI-compatible, default `http://localhost:11434/v1` | subclass of `OpenAILLMService` |
| LLM | `OpenAILLMService` / `BaseOpenAILLMService` (`openai/llm.py`, `openai/base_llm.py`) | `base_url` param → vLLM, SGLang, llama.cpp, etc. | generic OpenAI-compatible client |
| LLM | `NvidiaLLMService` (`nvidia/llm.py`) | default `https://integrate.api.nvidia.com/v1`; "For local deployments, pass the local address (e.g. `http://localhost:8000/v1`)" | NIM; strips think tags |
| LLM | `BasetenLLMService` (`baseten/llm.py`) | dedicated-deployment `base_url` pattern documented | serverless GPU |
| TTS | `KokoroTTSService` (`kokoro/tts.py`) | In-process kokoro-onnx; model auto-downloads to `~/.cache/pipecat/kokoro-onnx` | espeak-ng phonemizer |
| TTS | `PiperTTSService`, `PiperHttpTTSService` (`piper/tts.py`) | In-process ONNX voice, or HTTP server via `base_url` | |
| TTS | `PocketTTSService` (`pocket_tts/tts.py`) | In-process (`pocket-tts>=2.1.0`) | |
| TTS | `XTTSService` (`xtts/tts.py`) | HTTP to an XTTS streaming server (`base_url`) | **Deprecated since 1.7.0** in this checkout |
| TTS | `OpenAITTSService` (`openai/tts.py`) | `base_url` param → any OpenAI-compatible `/v1/audio/speech` server | |
| TTS | `NvidiaTTSService` (`nvidia/tts.py`) | Riva gRPC, local `localhost:50051` supported | |
| Vision | Moondream (`moondream/vision.py`) | In-process transformers | |
| S2S | `UltravoxRealtimeLLMService` (`ultravox/llm.py`) | Hosted Ultravox Realtime API (join URL) | not a self-hosted path |

Sources: grep of the listed files; optional-dependency list in `/home/user/pipecat/pyproject.toml`. Runnable examples: `/home/user/pipecat/examples/voice/voice-kokoro.py`, `voice-moonshine.py`, `voice-piper.py`, `voice-pockettts.py`, `voice-xtts.py`, `voice-nvidia.py`, `voice-nvidia-segmented.py`, `voice-nvidia-sagemaker.py`; `/home/user/pipecat/examples/transcription/transcription-whisper-local.py`, `transcription-whisper-mlx.py`, `transcription-funasr.py`; `/home/user/pipecat/examples/function-calling/function-calling-ollama.py`, `function-calling-nvidia.py`; `/home/user/pipecat/examples/getting-started/06a-voice-agent-local.py`.

**Transports** — `/home/user/pipecat/src/pipecat/transports/`
- `smallwebrtc/` (aiortc-based peer-to-peer WebRTC, extra `webrtc = aiortc>=1.14.0`), `websocket/` (`fastapi.py`, `server.py`, `client.py`, `rtvi_client.py`), `livekit/` (connects to any LiveKit server URL), `daily/` (closed-source Daily service), `moq/` (Media over QUIC, `moq-rs`), `local/` (PyAudio, Tk), `whatsapp/`, `vonage/`, plus avatar transports `heygen/`, `tavus/`, `lemonslice/`.
- Development runner `/home/user/pipecat/src/pipecat/runner/run.py` serves Daily, LiveKit, SmallWebRTC, telephony (`TELEPHONY_TRANSPORTS = ["twilio", "telnyx", "plivo", "exotel"]`), plain WebSocket and MoQ from one process, with a `POST /start` endpoint and HMAC session tokens for WebSocket auth.

**Telephony** — `/home/user/pipecat/src/pipecat/serializers/`
- `twilio.py`, `telnyx.py`, `plivo.py`, `vonage.py`, `exotel.py`, `genesys.py` (plus `protobuf.py`, `rtvi_client.py`). No Asterisk/FreeSWITCH/jambonz serializer and no SIP stack in-tree; grep of `/home/user/pipecat/COMMUNITY_INTEGRATIONS.md` for those names returned nothing.
- Outbound-call helpers: `/home/user/pipecat/src/pipecat/extensions/voicemail/voicemail_detector.py` (`VoicemailDetector`), `/home/user/pipecat/src/pipecat/extensions/ivr/ivr_navigator.py` (`IVRNavigator`); DTMF tones in `/home/user/pipecat/src/pipecat/audio/dtmf/`.

**VAD / turn detection / audio** — `/home/user/pipecat/src/pipecat/audio/`, `/home/user/pipecat/src/pipecat/turns/`
- Default stop strategy is `TurnAnalyzerUserTurnStopStrategy(LocalSmartTurnAnalyzerV3)`; default start strategies are `VADUserTurnStartStrategy` + `TranscriptionUserTurnStartStrategy` — `/home/user/pipecat/src/pipecat/turns/user_turn_strategies.py`.
- Smart Turn weights are bundled: `/home/user/pipecat/src/pipecat/audio/turn/smart_turn/data/smart-turn-v3.2-cpu.onnx`, run via onnxruntime on 16 kHz audio (`local_smart_turn_v3.py`). Alternatives: `http_smart_turn.py` (remote endpoint), `local_coreml_smart_turn.py`, `local_smart_turn_v2.py`, proprietary `krisp_viva_turn.py`.
- Silero VAD bundled as ONNX, forced CPU provider — `/home/user/pipecat/src/pipecat/audio/vad/silero.py`. Also `krisp_viva_vad.py`, `aic_quail_vad.py` (proprietary).
- Noise filters: `rnnoise_filter.py` (open), `koala_filter.py`, `krisp_viva_filter.py`, `aic_filter.py` (proprietary) — `/home/user/pipecat/src/pipecat/audio/filters/`.
- Turn strategies available: stop — speech-timeout, turn-analyzer, eager, deferred, LLM turn-completion, external; start — VAD, transcription, min-words, wake-phrase, external, Krisp; mute — always, first-speech, function-call, mute-until-first-bot-complete; plus user-idle controller — `/home/user/pipecat/src/pipecat/turns/user_stop/`, `user_start/`, `user_mute/`.

**Multi-worker bus / jobs** — `/home/user/pipecat/src/pipecat/bus/`, `/home/user/pipecat/src/pipecat/workers/`
- `AsyncQueueBus` (in-process), `RedisBus` (`bus/network/redis.py`), `PgmqBus` (`bus/network/pgmq.py`, Postgres), `WebSocketProxyClient`/`WebSocketProxyServer` (`workers/proxy/websocket/`) for point-to-point links; `LLMWorker`, `LLMContextWorker`, `BackendLLMWorker`, `UIWorker`; `WorkerRunner`.
- Patterns demonstrated: handoff, parallel fan-out (`job_group`), sidecar workers, distributed bus (Redis, PGMQ), remote proxy, UI workers — `/home/user/pipecat/examples/multi-worker/README.md`.

**Conversation logic, tools, RAG, memory**
- Pipecat Flows is in core: `/home/user/pipecat/src/pipecat/flows/` (`manager.py`, `flow_config.schema.json`).
- MCP client: `/home/user/pipecat/src/pipecat/services/mcp_service.py` (`MCPClient`), examples for stdio and streamable HTTP in `/home/user/pipecat/examples/mcp/`.
- Memory/RAG: `mem0` service dir; examples `/home/user/pipecat/examples/rag/rag-mem0.py`, `rag-gemini.py`. No in-tree pgvector/Qdrant retriever. LangChain and Strands processors in `/home/user/pipecat/src/pipecat/processors/frameworks/`.

**Observability / recording**
- OpenTelemetry: extra `tracing` (opentelemetry-sdk/api ≥1.33); `/home/user/pipecat/src/pipecat/utils/tracing/` (`setup.py` default OTLP exporter `http://localhost:4317`, `turn_trace_observer.py` for per-turn spans, `service_decorators.py`).
- Observers: `user_bot_latency_observer.py`, `turn_tracking_observer.py`, `service_metrics_observer.py`, `startup_timing_observer.py`, `function_call_observer.py`, `error_observer.py`, log observers — `/home/user/pipecat/src/pipecat/observers/`. Sentry extra; examples in `/home/user/pipecat/examples/observability/`.
- README points to Whisker (real-time pipeline debugger) and Tail (terminal dashboard) as separate repos — `/home/user/pipecat/README.md` lines 54, 58.
- Call recording primitive: `AudioBufferProcessor` — `/home/user/pipecat/src/pipecat/processors/audio/audio_buffer_processor.py`.

**Evals** — `/home/user/pipecat/src/pipecat/evals/`, `/home/user/pipecat/evals/release/`
- Harness connects to a bot's eval transport as an RTVI client; two scenario kinds (scripted `turns:` with `expect:` assertions incl. latency budgets, text contains/excludes, function-call checks, LLM judge; simulated `persona:`/`goal:` with judged and measured metrics) — `/home/user/pipecat/AGENTS.md`, `/home/user/pipecat/evals/release/README.md`.
- Runs fully local by default: judge = Ollama `gemma4:12b`, caller voice = Kokoro, transcriber = Moonshine; "No keys, no per-run cost" — `/home/user/pipecat/evals/release/README.md`.
- Release suite: 31 scripted + 6 simulated scenario files; manifest runs with `concurrency: 4` and audio recording — `/home/user/pipecat/evals/release/scenarios/`, `/home/user/pipecat/evals/release/manifest.yaml`. A separate `/home/user/pipecat/evals/turn-completion/` suite exists.
- CLI: `pipecat eval run <scenario> --bot-url ws://...`, `pipecat eval suite <manifest>` — `/home/user/pipecat/AGENTS.md`.

### Inferences
- An all-local Pipecat bot needs no adapter code: faster-whisper or Riva for STT, `OpenAILLMService(base_url=...)` for vLLM/SGLang, Kokoro/Piper in-process or an OpenAI-compatible TTS server, SmallWebRTC or LiveKit for media, Smart Turn + Silero on CPU.
- The in-process Whisper/Moonshine/FunASR adapters are segmented (transcribe after end-of-speech), so a low-latency production stack would more likely use the streaming Riva adapter or a remote streaming server; in-process models also tie GPU memory to each bot process, which conflicts with the "CPU-only bot, shared GPU services" pattern in section 5.
- Pipecat has no SIP endpoint, so self-hosted PSTN requires either LiveKit SIP (via the LiveKit transport) or a PBX bridged over WebSocket/AudioSocket with a custom serializer.

### Gaps
- Grep for `pii|redact|guardrail` matched only provider-level files (e.g. `services/deepgram/stt.py`, `services/aws/llm.py`); I did not open them, and found no dedicated PII-redaction or guardrail processor. Treat "no built-in guardrails" as probable, not confirmed.
- Not checked: whether releases 1.12–1.15 added a SIP transport, Asterisk serializer or further local services (a third-party page says "A community serializer covers Asterisk" — [Sheerbit](https://sheerbit.com/pipecat-vs-livekit-agents/) — not present in this checkout).
- The replacement named in the XTTS deprecation notice was not read.

## 3. Real-time transport: open-source WebRTC servers and WebSocket vs WebRTC

### Takeaway
WebRTC (UDP, Opus, jitter buffer, loss concealment, NAT traversal) is the consensus transport for the user-facing leg; WebSocket is appropriate for server-to-server hops, telephony media streams and prototypes. LiveKit server is the only open-source SFU with a first-party agent framework, SIP bridge, recorder and embedded TURN; mediasoup, Janus, Jitsi Videobridge and Pion are lower-level alternatives, and for 1:1 agent calls an SFU is optional (Pipecat SmallWebRTC, OpenAI's Pion transceiver).

### Cited Findings
- Five open-source projects dominate self-hosted WebRTC media servers in 2026: mediasoup (C++ engine driven from Node.js, no signalling/recording/mobile SDKs), Janus (modular C gateway; VideoRoom plugin for SFU, plus SIP, RTSP/Streaming, Record&Play plugins in one server), LiveKit (Go SFU on Pion, full platform with SDKs, Egress, SIP, Agents), Jitsi Videobridge (Kotlin/Java), Pion (Go WebRTC library, MIT, v4.2.24 on 2026-10-16; "not an SFU"). All five actively maintained as of Oct 2026 — [Fora Soft, 2026-11-10](https://www.forasoft.com/learn/video-streaming/articles-streaming/sfu-comparison-mediasoup-janus-livekit-jitsi-pion).
- "A custom Pion-based SFU typically takes a year or more to reach production"; LiveKit is the only one of the five with a built-in TURN/TLS option, others need coturn or managed TURN; OpenVidu 3 is an Apache-2.0 stack that runs on LiveKit or mediasoup — [Fora Soft](https://www.forasoft.com/learn/video-streaming/articles-streaming/sfu-comparison-mediasoup-janus-livekit-jitsi-pion).
- LiveKit server: Go, built on Pion; single binary / Docker / Kubernetes; UDP/TCP/TURN; JWT auth; webhooks; "distributed and multi-region"; telephony over SIP — [github.com/livekit/livekit](https://github.com/livekit/livekit).
- OpenAI's "transceiver" model: one Go/Pion edge service terminates WebRTC (ICE, DTLS, SRTP) and converts to simpler internal protocols so backend services "scale like ordinary services"; conventional one-UDP-port-per-session WebRTC "fits [Kubernetes] poorly" because of large public UDP port ranges — [OpenAI, 2026-05-04](https://openai.com/index/delivering-low-latency-voice-ai-at-scale/).
- WebSocket vs WebRTC table: WebSocket = TCP, ordered, stalls on loss, no audio handling, one HTTP upgrade, any server; WebRTC = usually UDP with TURN/TCP fallback, drops/conceals late packets, Opus + jitter buffer + PLC, needs signalling/ICE/STUN/TURN and usually a media server. "On a clean network, the two have similar latency. The difference shows up when packets are lost." "Most production voice agents use both." — [Cartesia, 2026-10-07](http://www.cartesia.ai/learn/webrtc-vs-websocket).
- WebSocket is reasonable when the network is predictable (internal tools, kiosks), for prototypes, non-conversational audio, or when the client is a server — [Cartesia](http://www.cartesia.ai/learn/webrtc-vs-websocket).
- LiveKit's position (vendor): WebSockets "work in a demo [and] fall apart in production"; WebRTC adds echo cancellation, noise suppression, NAT traversal; an SFU adds routing and observability — [LiveKit blog, 2026-03-23](https://livekit.com/blog/why-webrtc-beats-websockets-for-voice-ai-agents).
- Pipecat transports are swappable: Daily, SmallWebRTC (peer-to-peer), WebSocket, LiveKit, WhatsApp, Media over QUIC — [Sheerbit](https://sheerbit.com/pipecat-vs-livekit-agents/); confirmed in `/home/user/pipecat/src/pipecat/transports/`.
- Room-based entry (Daily/LiveKit) means workers make only outbound connections — "no public ingress, no load balancer in the media path, and no WebSocket timeouts to tune"; carrier-WebSocket entry requires public ingress, TLS, a WebSocket-capable load balancer and idle-timeout tuning — [Evalgent (vendor), 2026-10-04](https://www.evalgent.com/blog/deploy-pipecat-production).
- Modal's Sticky Sessions (Oct 2026) pin each call to one container "so WebRTC signaling reaches the container that holds the peer connection" — [Modal, 2026-10-20](https://modal.com/blog/serverless-routing-made-sticky).

### Inferences
- Daily's media service is closed (only its client libraries and Pipecat are open), so a fully open media plane means LiveKit server, SmallWebRTC/aiortc peer-to-peer, or a custom Pion/mediasoup/Janus build.
- For 1:1 voice agents without supervisors or recording composites, a P2P WebRTC endpoint in the bot (SmallWebRTC) plus a TURN server avoids running an SFU, at the cost of per-pod UDP reachability and session-affinity requirements.

### Gaps
- No sourced licences this session for mediasoup, Janus, Jitsi Videobridge, aiortc, coturn (background knowledge, unverified here: mediasoup ISC, Janus GPLv3, JVB Apache-2.0, aiortc BSD-3, coturn BSD-3).
- No published capacity numbers for aiortc/SmallWebRTC at production concurrency were found.
- Media over QUIC maturity for voice agents: only the existence of a Pipecat MoQ transport was confirmed.

## 4. Telephony: open-source SIP and how it connects to agent frameworks

### Takeaway
There are three open routes to the PSTN: (a) LiveKit SIP (Apache-2.0) bridging a SIP trunk into a LiveKit room; (b) a classic open telco stack (Kamailio/OpenSIPS proxy + Asterisk/FreeSWITCH media) bridged to the agent over WebSocket/AudioSocket; (c) carrier media-stream WebSockets (Twilio/Telnyx/Plivo) straight into the agent, which is simplest but leaves call control with the carrier. jambonz is a telephony-first alternative whose self-hosting is now commercially licensed.

### Cited Findings
- LiveKit SIP: "SIP to WebRTC bridge for LiveKit"; supports dialing out (INVITE), dialing in, digest auth, DTMF send/read; inbound flow = create SIP trunk + dispatch rule, SIP caller becomes a room participant — [github.com/livekit/sip](https://github.com/livekit/sip). Apache-2.0 — [LiveKit blog (vendor)](https://livekit.com/blog/best-open-source-voice-and-video-ai-agent-frameworks).
- LiveKit telephony integrates with third-party SIP trunking providers "for example, Telnyx, Twilio, Plivo" — [LiveKit docs](https://docs.livekit.io/telephony/start/sip-trunk-setup). LiveKit Phone Numbers (US) exist only on LiveKit Cloud — [Sheerbit](https://sheerbit.com/pipecat-vs-livekit-agents/).
- Self-hosted LiveKit telephony means running LiveKit server plus the separate SIP service and an external trunk/carrier — [Modal (vendor)](https://modal.com/resources/best-infrastructure-self-hosted-voice-agents); [Sheerbit](https://sheerbit.com/pipecat-vs-livekit-agents/).
- Asterisk `chan_websocket`: new channel driver for ARI `externalMedia`, available from Asterisk 23.0.0, 22.6.0, 21.11.0 and 20.16.0; streams raw media in binary WebSocket frames (e.g. 160-byte ulaw every 20 ms) and does framing/timing of app-sent media itself, unlike AudioSocket and RTP external media — [Asterisk docs](https://docs.asterisk.org/Configuration/Channel-Drivers/WebSocket).
- AudioSocket pitfalls: `app_audiosocket` forwards frames immediately, so the app must pace one 320-byte frame per 20 ms and re-clamp deadlines; Python asyncio leaves Nagle on by default, re-bunching frames; with `chan_websocket` Asterisk owns the playout clock and `FLUSH_MEDIA` handles barge-in — [ICT Innovations, 2026-09-05](https://ictinnovations.com/asterisk-ai-voice-agent-lessons-audiosocket-barge-in).
- Practitioner stack (Jul 2025, older): Kamailio (SIP proxy/load balancer) + Asterisk (PBX/RTP) + faster-whisper + Coqui TTS + Mistral 7B on vLLM + Postgres/Qdrant + Prometheus/Grafana + Langfuse, with Telnyx trunks; target >500 concurrent outbound calls. "Jambonz stumbled for me past ~500 concurrent dials; Kamailio + Asterisk held steadier once tuned"; LiveKit Agents "is a framework, not a phone system" — [D. Fridkin, 2025-07-23](https://dmitriyfridkin.substack.com/p/i-tried-3-new-to-me-opensource-tools). Single-author anecdote.
- Carrier-grade telco case study: evolved from a single Asterisk dialplan to Kamailio + FreeSWITCH handling "millions of calls a day"; FreeSWITCH is natively multi-threaded and was "comfortable" under load "that made Asterisk sweat"; controlled via ESL from Go — [Snapwre, 2026-04-22](https://snapwre.com/case-studies/carrier-grade-voip-platform). Not a voice-AI system; relevant for the SIP edge only.
- jambonz: MIT-licensed JavaScript project maintained since 2019; Retell AI and Vapi are reported to run on it, alongside Cognigy, Rasa, Movius; work spread across ~30 repos — [Micdrop (vendor)](https://micdrop.dev/blog/open-source-voice-agent-frameworks). Self-hosting is licensed per cluster: $7/session/month or $2,000/month unlimited, licence keyed to domain, air-gapped and OEM licences on request — [jambonz.org](https://jambonz.org/self-hosting). An open-source edition and a commercial v11 edition (custom Go media server) coexist — [Modal (vendor)](https://modal.com/resources/best-infrastructure-self-hosted-voice-agents). These sources conflict on how "open" jambonz is; the jambonz.org licensing page is primary.
- jambonz vendor white paper (Aug 2026) claims 10x more concurrent voice-agent sessions than LiveKit on identical hardware, attributing it to a shared compiled media-server process vs LiveKit's one job subprocess per call; uses an open-source SIP/RTP load generator with mocked speech/LLM vendors — [jambonz white paper (vendor)](http://jambonz.org/blog/whitepapers/jambonz-vs-livekit-voice-ai-benchmark.pdf). Not independently replicated.
- Pipecat phone routes: Daily PSTN/SIP, or WebSocket media streams from Twilio, Telnyx, Plivo, Exotel — [Sheerbit](https://sheerbit.com/pipecat-vs-livekit-agents/). Daily PSTN price is reported as $0.018/min [Botcadence](https://botcadence.com/blogs/open-source-ai-voice-agents) and as $0.025/min + $2/number/month [Evalgent, Oct 2026](https://www.evalgent.com/blog/deploy-pipecat-production) — conflicting.
- Twilio trial accounts do not reliably deliver inbound calls to the webhook — [AI Agentic Enterprises, 2026-07-28](https://ai-agentic-enterprises.com/blog/voice-agent-launch).

### Inferences
- The most "all-open" telephony path for a Pipecat- or LiveKit-based platform is SIP trunk → LiveKit SIP → LiveKit room → agent; this also gives transfers and multi-party rooms that Pipecat's carrier-WebSocket serializers lack.
- Teams with existing PBX infrastructure can bridge Asterisk (chan_websocket/AudioSocket) or FreeSWITCH into a Pipecat WebSocket transport with a custom serializer; `chan_websocket` removes the playout-pacing burden that caused most reported AudioSocket bugs.

### Gaps
- No source found this session for FreeSWITCH `mod_audio_stream`/`mod_audio_fork` integrations with Pipecat, nor for OpenSIPS in voice-AI deployments.
- Licences of Asterisk, FreeSWITCH, Kamailio, OpenSIPS not sourced here (background, unverified: GPLv2, MPL-1.1, GPLv2, GPLv2).
- No comparative SIP-trunk pricing or STIR/SHAKEN guidance gathered beyond the single practitioner mention.

## 5. Model serving, GPU infrastructure, co-location and autoscaling

### Takeaway
The standard pattern is a CPU-only, stateful bot process per call that calls separately autoscaled, shared GPU services (vLLM for the LLM; Riva/NIM, Speaches or Kokoro-FastAPI for speech), all pinned to one region/AZ so each hop is ~1–2 ms. Serving tools sit in three layers (engine: vLLM, Triton; framework: Ray Serve, BentoML; platform: KServe/KubeRay), autoscaling should key on sessions or queue depth rather than CPU, and long call durations force slow scale-down with drain.

### Cited Findings

**Serving stack (table-ready; versions read 2026-11-10)**

| Project | Latest release | Layer | Batching | Autoscaling | Owner / licence |
|---|---|---|---|---|---|
| vLLM | 0.32.0 (2026-10-18) | LLM engine | Continuous batching | External | PyTorch Foundation |
| Dynamo-Triton (Triton) | 2.74.0 (2026-11-02) | Engine/server | Dynamic batcher, ensembles | External (HPA, KServe) | NVIDIA, BSD-3 |
| Ray Serve | Ray 2.60.0 (2026-11-04) | Framework | `@serve.batch` | Replica + node autoscaler | PyTorch Foundation since Oct 2025 |
| BentoML | 1.4.40 (2026-10-23) | Framework | Adaptive batching | BentoCloud or HPA | Modular (Feb 2026), now Qualcomm; Apache-2.0 |
| KServe | 0.21.0 (2026-09-25) | Platform | Optional batcher sidecar | Knative, HPA or KEDA | CNCF incubating since Sep 2025 |
| TorchServe | 0.12.0 (2024-09-30) | Server | — | — | Archived |

Source: [A. Kumar, 2026-11-10](https://www.ajayk.sh/blog/model-serving-triton-bentoml-ray-serve-2026). "KServe can run Triton or vLLM as its runtime; Ray Serve can wrap vLLM; Triton has a vLLM backend."

- vLLM Production Stack Helm chart (v0.1.11+) integrates KEDA: scale on Prometheus metric `vllm:num_requests_waiting` (example threshold 5, polling 15 s, cooldown 360 s, scale-down stabilization 300 s) — [vLLM production-stack docs](https://docs.vllm.ai/projects/production-stack/en/latest/use_cases/autoscaling-keda.html).
- vLLM-Omni serves TTS: Qwen3-TTS on 2×H20, mean time-to-first-packet 70.6 ms at concurrency 1, 268.8 ms at 8, 451 ms at 16, 1,128 ms at 64 — [vLLM blog, 2026-06-23](https://vllm.ai/blog/2026-06-23-vllm-omni-tts).
- NVIDIA Speech NIM: ASR/TTS/NMT as standalone GPU containers packaging the model with Triton + TensorRT; gRPC port 50051 and HTTP 9000; streaming ASR models include Parakeet CTC, Parakeet RNNT Multilingual (25+ languages), Nemotron ASR Streaming (40 locales); TTS family is Magpie; Whisper Large v3 and Canary are offline-only — [NVIDIA Speech NIM docs, 2026-11-06](https://docs.nvidia.com/nim/speech/latest/about/index.html); [ASR NIM](https://docs.nvidia.com/nim/speech/latest/asr/); [How it works](https://docs.nvidia.com/nim/speech/latest/about/how-it-works.html).
- Riva licensing: free to try via NVIDIA API Catalog; production deployment is part of NVIDIA AI Enterprise (90-day free evaluation licence) — [NVIDIA, 2025-03 (older)](https://www.nvidia.com/en-us/ai-data-science/products/riva/get-started). Not open source.
- Riva scaling on Kubernetes: GPU Operator, Traefik load balancing, HPA on a custom Triton queue-duration metric; ≥16 GB VRAM per GPU recommended — [NVIDIA blog, 2023-01-12 (old)](https://developer.nvidia.com/blog/autoscaling-nvidia-riva-deployment-with-kubernetes-for-speech-ai-in-production).
- Speaches: OpenAI-API-compatible server for streaming transcription and speech (faster-whisper; Kokoro and Piper), dynamic model load/unload, GPU/CPU, Docker Compose, Realtime API; "aims to be Ollama, but for TTS/STT models" — [speaches-ai/speaches](https://github.com/speaches-ai/speaches).
- Modal + Pipecat reference (Nov 2025, older): ~1 s voice-to-voice with open models; "Even with Silero VAD and SmartTurn enabled, Pipecat bots only require CPUs"; heavy models moved into separately autoscaled GPU services shared by all bots; services pinned to one region; Modal Tunnels used to bypass request routing — [Modal, 2025-11-04](https://modal.com/blog/low-latency-voice-bot).
- Modal Sticky Sessions (Oct 2026): sessions become the unit of concurrency; fleet scales on active + queued sessions rather than request volume — [Modal, 2026-10-20](https://modal.com/blog/serverless-routing-made-sticky).
- Cerebrium (Jun 2025, older): co-locating STT/LLM/TTS in one cluster gave ~2 ms inter-service latency and ~500 ms voice-to-voice; self-hosted Deepgram TTFB ~110 ms vs ~250 ms via API; one A10 handled ~160–180 concurrent Deepgram streams at $1.44/h, while a self-hosted Llama on an H100 took ~10 concurrent requests; each service autoscaled independently because of different concurrency/hardware profiles — [Cerebrium (vendor), 2025-06-25](https://www.cerebrium.ai/blog/deploying-a-global-scale-ai-voice-agent-with-500ms-latency).
- EKS reference (Sep 2026): EKS Auto Mode + Karpenter NodePools pinned to one AZ; three nodes — CPU node (LiveKit server + LiveKit Agents orchestrator, pod affinity on hostname, both `hostNetwork`), GPU node 1 (vLLM, Llama 3.1 8B AWQ on A10G, ~200 ms TTFT), GPU node 2 (Speaches: faster-whisper large-v3-turbo + Kokoro-82M on A10G); Silero VAD in-process (~30 ms); ~1 ms per in-cluster hop — [WebRTC.ventures, 2026-09-04](https://webrtc.ventures/2026/09/self-hosted-voice-ai-pipeline-eks-karpenter-livekit).
- LiveKit self-hosted agents: worker-pool model; LiveKit server does round-robin, single-assignment job dispatch; each agent server spawns a subprocess per job; `load_fnc` default = CPU utilisation, `load_threshold` default 0.7 (older doc page says 0.75); autoscale at a lower threshold (e.g. 0.5); shorten scale-up and lengthen scale-down stabilization "because agent servers take time to drain"; set `terminationGracePeriodSeconds` for draining; geographic affinity is Cloud-only — [LiveKit docs](https://docs.livekit.io/deploy/custom/deployments); [older page](https://docs.livekit.io/agents/deployment).
- AWS/Pipecat/Deepgram on SageMaker reference: session-aware autoscaling on active calls per container (not CPU), graceful drain with ECS Task Scale-in Protection, bidirectional-streaming VPC endpoint so audio stays in the VPC, CloudWatch dashboard for end-to-end latency, turn and interruption counts — [AWS Startups](https://aws.amazon.com/aws-startups/insights/deploy-voice-agents-with-pipecat-deepgram-and-amazon-sagemaker-ai).
- Primer guidance: serverless FaaS (Lambda, Cloud Run) generally unsuitable for voice agents; deploy Docker containers, start with a fixed VM pool then add autoscaling/graceful deploys; rule of thumb "a single agent per virtual machine CPU, with double the maximum amount of RAM you see an agent process consuming" — [Voice AI & Voice Agents primer](https://voiceaiandvoiceagents.com/).
- Self-hosted Pipecat phone blueprint: stateless router (verifies carrier signature, admission control, version pinning) + worker pods with capped media WebSockets, one `PipelineWorker` per call + Redis for slot counters, heartbeats, call→version map and webhook idempotency ("never holds audio") + OTel collector — [Evalgent (vendor), 2026-10-04](https://www.evalgent.com/blog/deploy-pipecat-production).
- Latency tuning list: small (8B-class) tool-capable model, short system prompt, vLLM prefix caching, streaming TTS on first sentence, same region/subnet, warm models with a dummy request at start-up — [Meetrix (vendor), 2026-09-21](https://meetrix.io/blogs/self-host-voice-ai-agent-stack).
- vLLM-served LLM with streaming STT/TTS reached P50 time-to-first-audio 947 ms (best 729 ms), "comparable latency with self-hosted vLLM on NVIDIA A10G" — [arXiv 2603.05413](https://arxiv.org/html/2603.05413v1).

### Inferences
- Autoscaling has two distinct loops: bot workers scale on active sessions (long-lived, non-movable, need drain), GPU model servers scale on queue depth / concurrent streams. Mixing them (in-process models) couples GPU cost to call count.
- Because GPU node provisioning and model load take minutes, voice stacks need minimum warm replicas rather than scale-to-zero on the model tier; scale-to-zero is viable only for the bot tier with fast container starts (as Pipecat Cloud's `min_agents` / `max_agents` suggests).
- Riva/NIM offers the most mature streaming ASR/TTS serving but is proprietary-licensed; the open equivalent today is assembling Speaches/Kokoro-FastAPI/vLLM-Omni, which are less battle-tested.

### Gaps
- No SGLang-specific source was retrieved (its fit for voice TTFT is unverified here); licences of vLLM, SGLang, KEDA, Ray not sourced this session (background: Apache-2.0).
- No published Baseten voice reference architecture was retrieved; only the existence of a Pipecat `BasetenLLMService` is confirmed (`/home/user/pipecat/src/pipecat/services/baseten/llm.py`).
- No hard numbers found for concurrent calls per GPU for open STT/TTS (faster-whisper, Kokoro) under production load; no cold-start timings for model tiers.

## 6. Supporting pieces: RAG, tools/MCP, state, observability, testing/evals, recording, PII, guardrails

### Takeaway
Observability is solved by framework-emitted OpenTelemetry spans (both Pipecat and LiveKit) sent to a self-hosted backend (Langfuse MIT, Jaeger, Grafana, SigNoz), though audio-aligned traces remain a gap in open tooling. Open-source testing is framework-specific (Pipecat evals with audio, LiveKit text-only test framework); full-audio-path, load, and production-monitoring testing is dominated by commercial vendors (Hamming, Coval, Cekura, Bluejay, Roark). RAG, state, PII and guardrails are generic components with little voice-specific open tooling.

### Cited Findings

**Observability**
- Pipecat has built-in OpenTelemetry tracing: a conversation span, turn spans, and a span per STT/LLM/TTS call with provider and time-to-first-byte attributes; documented destinations are Jaeger and Grafana (gRPC) and Langfuse, LangSmith, MLflow, SigNoz (HTTP). LiveKit Agents emits OpenTelemetry too — [V. Nicolai blog, 2026-09-23](https://vadim.blog/voice-tracing-compared/); local confirmation in `/home/user/pipecat/src/pipecat/utils/tracing/`.
- Langfuse receives Pipecat spans on its OTLP endpoint; for LiveKit its SDK registers a span processor on the tracer provider — [Langfuse Pipecat docs](https://langfuse.com/integrations/frameworks/pipecat); [Langfuse LiveKit docs](https://langfuse.com/integrations/frameworks/livekit); [LiveKit docs](https://docs.livekit.io/testing/observability/tracing).
- Server licences: Langfuse MIT except enterprise modules (SCIM, audit logging, retention policies), self-hostable; Arize Phoenix Elastic License 2.0 (source-available); LangSmith self-hosting is an Enterprise add-on; Braintrust self-hosts only the data plane — [V. Nicolai blog](https://vadim.blog/voice-tracing-compared/).
- LiveKit Agent Insights works only with LiveKit Cloud media servers ("not with self-hosted media servers or fully self-hosted deployments"), 30-day retention, PII redaction bundled but off by default — [V. Nicolai blog](https://vadim.blog/voice-tracing-compared/).
- Langfuse's and Arize's Pipecat integrations document no audio capture (Langfuse supports MP3/WAV/OGG attachments generically, but nothing puts the call recording there automatically) — [V. Nicolai blog](https://vadim.blog/voice-tracing-compared/).
- Pipecat Whisker (real-time pipeline debugger) and Tail (terminal dashboard) are separate open repos — [github.com/pipecat-ai/pipecat](https://github.com/pipecat-ai/pipecat); `/home/user/pipecat/README.md`.
- Prometheus + Grafana + Langfuse used together in a practitioner self-hosted stack — [D. Fridkin, 2025-07-23](https://dmitriyfridkin.substack.com/p/i-tried-3-new-to-me-opensource-tools).

**Testing / evals (table-ready)**

| Tool | Licence | What it exercises | Runs where |
|---|---|---|---|
| Pipecat evals | BSD-2-Clause | Scripted + simulated conversations, text or synthesized audio, latency budgets per event | Local; default judge/voice/transcriber need no keys; Pipecat bots only |
| LiveKit Agents test framework | Apache-2.0 | Messages, tool calls, args, handoffs turn by turn, text only | pytest/Vitest; audio simulations only on LiveKit Cloud (beta, Python) |
| EVA-Bench (ServiceNow) | MIT | Bot-to-bot audio, 213 scenarios, noise/accent/connection perturbations | Local, calls hosted models |
| voicetest | Apache-2.0 | LLM-simulated users vs imported Retell/Vapi/LiveKit/Bland/Telnyx agents | CLI/web/CI |
| Voice Lab | Apache-2.0 | LLM + prompt only; no updates since Jun 2025 | Local |
| τ2-bench voice mode | MIT | Benchmarks realtime providers, not your agent | Local |
| promptfoo / DeepEval | MIT / Apache-2.0 | Text prompts/outputs | Local/CI |
| LangWatch Scenario | open source (licence not stated in source) | Scenario tests in pytest/vitest; LangWatch self-hostable | CI |
| Fixa | open source | Phone tester; no commit since Jan 2025 | — |
| Hamming | Commercial | 65+ languages, accents, noise, DTMF/IVR, 50+ metrics, red teaming, 1,000+ concurrent calls, SOC 2/HIPAA; SIP + WebRTC (LiveKit rooms, Daily rooms for Pipecat) | Hosted; price on demo |
| Coval | Commercial | 27 voices, 10 languages, 20 environments; CLI/GitHub Actions gating; OTel traces | Hosted; $100/mo (100 sim min), $500/mo (1,000), Enterprise from $4,500 |
| Cekura | Commercial (7 judge prompts Apache-2.0) | Personas, red teaming, load tests, monitoring; phone/SIP/WebRTC/CHIRP WebSocket | Hosted; 300 free credits then $0.25/test min, $0.05/monitored call |
| Bluejay, Roark | Commercial | Production-call replay; audio metrics | Hosted |

Sources: [Cekura (vendor), 2026-07-25](http://www.cekura.ai/discover/open-source-voice-agent-testing-tools); [Micdrop (vendor), 2026-11-08](https://micdrop.dev/blog/top-voice-agent-testing-tools); [LangWatch (vendor), 2026-11-12](https://langwatch.ai/blog/best-voice-agent-testing-platforms); [RubricHQ, 2026-11-06](https://rubrichq.io/blog/voice-ai-evaluation-tools-compared); [LiveKit docs](https://docs.livekit.io/agents/start/testing/?ref=livekit.com/blog).
- "Pipecat's release-eval harness is the most fully free option: its default judge, caller voice and transcriber run locally with no keys and no per-run cost, but it drives Pipecat bots only" — [Cekura (vendor)](http://www.cekura.ai/discover/open-source-voice-agent-testing-tools).
- LiveKit and Pipecat docs both route users to commercial partners for full-audio-path, load and production monitoring (LiveKit: Bluejay, Cekura, Coval, Hamming; Pipecat: Cekura, Coval, Roark) — [LiveKit docs](https://docs.livekit.io/testing/); [Pipecat docs](https://docs.pipecat.ai/pipecat/evals/overview).
- One independent benchmark cited by a third party scored simulation quality / evaluation accuracy: Coval 48.9 / 62.7%, Hamming 43.0 / 75.7%, Evalion 61.0 / 86.7% (the citing article attaches a caveat; Evalion has since pivoted away from voice) — [ContextQA, 2026-08-17](https://contextqa.com/blog/ai-voice-agent-testing-tools/); [Micdrop](https://micdrop.dev/blog/top-voice-agent-testing-tools).

**Recording**
- LiveKit Egress (Apache-2.0): room-composite, track-composite and track egress to MP4/OGG/WebM/HLS/RTMP/SRT/WebSocket, upload to S3-compatible, Azure or GCP storage; must be deployed separately when self-hosting and uses Redis queues — [github.com/livekit/egress](https://github.com/livekit/egress); [LiveKit docs](https://docs.livekit.io/transport/self-hosting/egress).
- Pipecat: in-pipeline `AudioBufferProcessor` — `/home/user/pipecat/src/pipecat/processors/audio/audio_buffer_processor.py`.

**Guardrails / PII**
- Primer: use a separate model for guardrails; open components are llama-guard (Meta) and NeMo Guardrails (NVIDIA), both "designed with text chat in mind, not voice AI" — [Voice AI & Voice Agents primer](https://voiceaiandvoiceagents.com/).
- NeMo Guardrails supports PII detection via GLiNER and Microsoft Presidio (mask/detect on input, output and retrieval) — [NVIDIA NeMo Guardrails docs](https://docs.nvidia.com/nemo/guardrails/configure-guardrails/guardrail-catalog/pii-detection).
- Open frameworks lack "production QA features (call scoring, redaction/PII filters)" and per-call billing/metering out of the box — [D. Fridkin, 2025-07-23 (older)](https://dmitriyfridkin.substack.com/p/i-tried-3-new-to-me-opensource-tools).

**RAG / state / tools**
- Postgres + Qdrant for state/vector; Redis/Postgres + pgvector added for memory/RAG in a practitioner stack — [D. Fridkin](https://dmitriyfridkin.substack.com/p/i-tried-3-new-to-me-opensource-tools).
- Redis as shared session/admission state for a Pipecat fleet — [Evalgent (vendor)](https://www.evalgent.com/blog/deploy-pipecat-production); MongoDB/Cosmos + Redis as platform state in an AKS deployment — [MiraiMinds, 2026-01-17](https://blog.miraiminds.co/blog/real-time-voice-ai-aks).
- MCP is native in LiveKit Agents — [MenuAgentic](https://menuagentic.com/blogs/pipecat-vs-livekit-agents-vs-ten-framework-vs-bolna); Pipecat has an in-tree `MCPClient` — `/home/user/pipecat/src/pipecat/services/mcp_service.py`.
- A production report found context-window overflow and retrieval among the things that broke under real traffic — [Flixzone, 2026-10-05](https://flixzone.icu/tutorials/ai-voice-agent-pilot-vs-production-lessons-from-real-calls).

### Inferences
- A self-hosted platform can reach parity with hosted observability for latency breakdowns (OTel → Langfuse/Grafana) but must build audio-aligned trace playback and production call scoring itself.
- The open eval gap is full-audio-path testing over the real transport (SIP/WebRTC), load testing, and adversarial/red-team suites; Pipecat's harness covers regression and simulation in CI but through its own eval transport rather than the production media path.
- Voice-specific guardrails (e.g. redacting PII in audio recordings, DTMF capture for card numbers) have no identified open-source component; text-level Presidio/NeMo on transcripts is the available building block.

### Gaps
- No voice-specific RAG latency benchmarks (pgvector vs Qdrant) were found; licences for pgvector, Qdrant, Presidio, NeMo Guardrails, llama-guard not sourced this session.
- Whisker/Tail feature details and licences were not read (only their existence).
- No source on open-source audio-level PII redaction (beeping/muting recordings) or on consent/TCPA tooling beyond one mention.

## 7. Reference architectures, case studies and operational lessons from self-hosted stacks

### Takeaway
Published fully-open stacks converge on the same shape — LiveKit (or Twilio WebSocket) for media, Pipecat or LiveKit Agents as a CPU orchestrator, vLLM/Ollama for an ~8B LLM, faster-whisper and Kokoro behind OpenAI-compatible servers, all in one AZ — and report roughly 0.5–1 s voice-to-voice at low concurrency. The recurring lesson is that failures come from plumbing (DNS, NAT/UDP ports, audio pacing, VAD thresholds, concurrency under load, deploy determinism), not from the models.

### Cited Findings

**Reference architecture table (table-ready)**

| Source (date) | Media / telephony | Orchestrator | STT | LLM | TTS | Infra | Reported latency |
|---|---|---|---|---|---|---|---|
| [WebRTC.ventures (2026-09)](https://webrtc.ventures/2026/09/self-hosted-voice-ai-pipeline-eks-karpenter-livekit) | LiveKit server (self-hosted) | LiveKit Agents | faster-whisper large-v3-turbo via Speaches | Llama 3.1 8B AWQ on vLLM | Kokoro-82M via Speaches | EKS Auto Mode + Karpenter, 1 CPU + 2 A10G nodes, single AZ | ~200 ms LLM TTFT; ~1 ms/hop |
| [Modal (2025-11, older)](https://modal.com/blog/low-latency-voice-bot) | WebRTC (Pipecat) | Pipecat on CPU container | open-weights, GPU service | open-weights, GPU service | open-weights, GPU service | Modal serverless GPU, region-pinned, tunnels | ~1 s voice-to-voice |
| [Cerebrium (2025-06, older)](https://www.cerebrium.ai/blog/deploying-a-global-scale-ai-voice-agent-with-500ms-latency) | — | (Pipecat-style) | Deepgram self-hosted on A10 | Llama on H100 | — | Cerebrium, co-located services | ~500 ms voice-to-voice |
| [Meetrix (2026-09)](https://meetrix.io/blogs/self-host-voice-ai-agent-stack) | LiveKit server + LiveKit SIP | LiveKit Agents | Speaches (faster-whisper) | vLLM or Ollama | Kokoro-FastAPI | single private network | not quantified |
| [AI Agentic Enterprises (2026-07)](https://ai-agentic-enterprises.com/blog/voice-agent-launch) | Twilio Media Streams (WebSocket) | Pipecat on a VPS | faster-whisper | Qwen3-8B on Ollama | Kokoro-82M | RunPod RTX 4090 pod + SSH tunnel | ~3 s after disabling thinking |
| [MiraiMinds (2026-01)](https://blog.miraiminds.co/blog/real-time-voice-ai-aks) | SIP trunk → LiveKit SIP → LiveKit server (edge VM) | Pipecat workflow on AKS | (cloud) | Azure OpenAI via private endpoint | (cloud) | AKS + edge VM with stable NAT, Redis, Datadog | not quantified |
| [Flixzone (2026-10)](https://flixzone.icu/tutorials/ai-voice-agent-pilot-vs-production-lessons-from-real-calls) | Asterisk AudioSocket, ViciDial campaign | custom gateway | Whisper | Ollama (3 parallel slots) | — | single GPU | 1.7–2.2 s single call; median 6.64 s at 6 concurrent |
| [D. Fridkin (2025-07, older)](https://dmitriyfridkin.substack.com/p/i-tried-3-new-to-me-opensource-tools) | Kamailio + Asterisk, Telnyx | jambonz / LiveKit Agents / Vocode | faster-whisper | Mistral 7B on vLLM | Coqui TTS | Postgres + Qdrant, Prometheus/Grafana, Langfuse | not quantified |
| [Unmute, Kyutai](https://www.collegica.org/ai/voice-agents) | WebSocket | Unmute backend (Rust) | Kyutai STT | any LLM (vLLM) | Kyutai TTS | Docker Compose / Swarm | ~750 ms on one L40S; ~450 ms with a GPU per service |

**Operational lessons reported**
- "The hard part is the plumbing: DNS, NAT, ports, deterministic deploys, and debuggability." Biggest production failures: private-endpoint DNS resolving to public IPs, `:latest` image-tag drift, `hostPort` rollouts stuck Pending, native-module crashes and unstable Python base images, subnet exhaustion. LiveKit SIP + LiveKit server were moved to an edge VM with stable NAT/ports, separate from the Kubernetes app platform — [MiraiMinds, 2026-01-17](https://blog.miraiminds.co/blog/real-time-voice-ai-aks).
- Concurrency collapses latency on a single self-hosted LLM: 1.7–2.2 s single-call first reply became 4.9–9.3 s (median 6.64 s) with six concurrent conversations; an uncached five-session run hit 19.3 s vs 4.85 s warm. "Benchmark several concurrency levels with varied caller audio and a cold cache. Set admission control from the measured p95." Advertised capacity (10 calls) had never been measured — [Flixzone, 2026-10-05](https://flixzone.icu/tutorials/ai-voice-agent-pilot-vs-production-lessons-from-real-calls). Small-sample, single system.
- The same audit classed the system as "operational pilot, not ready for an unattended production service" two weeks after go-live; GPU, models and health checks were fine and the failures were in integration (call identity, AMD, context overflow, safety guards, retrieval) — [Flixzone](https://flixzone.icu/tutorials/ai-voice-agent-pilot-vs-production-lessons-from-real-calls).
- Self-hosting pitfalls from one launch: vLLM failed four different ways before the author switched to Ollama (KV-cache sizing, missing `ninja` for JIT, CUDA OOM during graph capture, hang); a thinking-by-default model took 77 s until `think: false`; pip silently installed a torch build for the wrong CUDA and TTS fell back to CPU; default 200 ms VAD silence threshold chopped sentences and caused Whisper hallucinations until raised to 800 ms — [AI Agentic Enterprises, 2026-07-28](https://ai-agentic-enterprises.com/blog/voice-agent-launch). Single-author anecdote.
- Audio pacing on Asterisk AudioSocket is the application's job (20 ms frames, re-clamped deadlines, disable Nagle); measure before optimising — a Piper worker pool was slower than a global lock because ONNX Runtime already saturated all cores; keep a ~300 ms pre-onset lookback buffer for VAD — [ICT Innovations, 2026-09-05](https://ictinnovations.com/asterisk-ai-voice-agent-lessons-audiosocket-barge-in).
- "Realtime vs. telephony is a split brain": LiveKit gives the realtime UX but SIP edge, billing/metering, QA scoring and PII redaction must be added; tuned Kamailio + Asterisk outlasted jambonz past ~500 concurrent dials — [D. Fridkin, 2025-07-23](https://dmitriyfridkin.substack.com/p/i-tried-3-new-to-me-opensource-tools).
- Scale-down must be slow and drain-aware; scale-up should trigger well before workers stop accepting jobs — [LiveKit docs](https://docs.livekit.io/deploy/custom/deployments); session-count-based scaling and scale-in protection — [AWS Startups](https://aws.amazon.com/aws-startups/insights/deploy-voice-agents-with-pipecat-deepgram-and-amazon-sagemaker-ai).
- WebRTC on Kubernetes needs a deliberate port strategy: OpenAI avoided per-session public UDP ports by terminating all WebRTC in a dedicated Pion transceiver tier — [OpenAI, 2026-05-04](https://openai.com/index/delivering-low-latency-voice-ai-at-scale/); the EKS reference uses `hostNetwork` for LiveKit and the orchestrator — [WebRTC.ventures](https://webrtc.ventures/2026/09/self-hosted-voice-ai-pipeline-eks-karpenter-livekit); LiveKit can mux media on a single UDP port (default range 50000–60000 otherwise) — [Meetrix (vendor)](https://meetrix.io/blogs/self-host-voice-ai-agent-stack).
- "Open source removes the platform fee, not the provider bills"; self-hosting means owning uptime, scaling, call quality and upgrades; engineering time is the largest cost — [Botcadence (vendor), 2026-11-12](https://botcadence.com/blogs/open-source-ai-voice-agents).
- Scale proof-point on an open media stack: telli, 30,000+ daily calls over 400+ SIP trunks on LiveKit (deployment model — Cloud vs self-hosted — not stated) — [LiveKit blog (vendor)](https://livekit.com/blog/best-open-source-voice-and-video-ai-agent-frameworks).

**Composite reference architecture implied by the sources (layer → open-source option)**

| Layer | Open-source options evidenced above |
|---|---|
| PSTN edge | SIP trunk (Telnyx/Twilio/Plivo) → LiveKit SIP; or Kamailio/OpenSIPS + Asterisk/FreeSWITCH; or carrier media-stream WebSocket |
| Media / client transport | LiveKit server (SFU, embedded TURN); Pipecat SmallWebRTC (P2P) + TURN; custom Pion edge |
| Orchestration | Pipecat (`PipelineWorker` per call) or LiveKit Agents (job subprocess per call), CPU pods |
| Turn-taking | Silero VAD + Smart Turn v3.2 (BSD-2) or LiveKit turn detector (model licence) |
| STT serving | faster-whisper via Speaches; Riva/NIM streaming ASR (proprietary licence); Kyutai STT |
| LLM serving | vLLM (+ production-stack/KEDA), Ollama, NIM; fronted by OpenAI-compatible API |
| TTS serving | Kokoro (in-process, Speaches, Kokoro-FastAPI), Piper, vLLM-Omni TTS, Riva/NIM Magpie |
| Scaling / scheduling | Kubernetes + Karpenter/KEDA, session-aware autoscaling, drain on scale-in, single-AZ co-location |
| State | Redis (admission, heartbeats, bus), Postgres (PGMQ bus, records), vector store (pgvector/Qdrant) |
| Observability | OpenTelemetry → Langfuse / Grafana / Jaeger / SigNoz; Prometheus; Whisker/Tail for Pipecat |
| Testing | Pipecat evals or LiveKit test framework in CI; commercial vendors for full-audio/load/monitoring |
| Recording | LiveKit Egress; Pipecat `AudioBufferProcessor` |
| Guardrails / PII | NeMo Guardrails, llama-guard, Presidio on transcripts |

### Inferences
- No source found describes a fully self-hosted, all-open-model cascade running at large production scale (thousands of concurrent calls) with published numbers; the detailed write-ups are single-team or small-concurrency systems, and the large-scale proof points (telli, OpenAI) use open transport with hosted or proprietary models.
- The latency evidence suggests open stacks match hosted ones at low concurrency (0.5–1 s) but degrade sharply without admission control and enough LLM replicas, so capacity planning per GPU is the central operational task.
- Splitting the SIP/WebRTC edge (stable public IPs, UDP) from the autoscaled Kubernetes app tier is a repeated design choice across independent sources.

### Gaps
- No cost-per-minute figures for fully self-hosted stacks at scale were found; the only cost data points are GPU hourly prices in vendor posts.
- No conference-talk material was retrieved; Daily, NVIDIA and Baseten engineering blogs were not directly fetched (NVIDIA blueprint for voice agents with Pipecat was not found in search results).
- The Voice AI primer was only seen in excerpt (hosting and guardrails sections); its current guidance on self-hosted LLMs and network architecture was not read in full.
- Several lessons come from single-author blogs with small samples (flagged inline); none is independently corroborated.
