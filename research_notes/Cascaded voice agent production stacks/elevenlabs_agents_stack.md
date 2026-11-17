# ElevenLabs Agents ("ElevenAgents", formerly Conversational AI / Agents Platform) production stack, as of November 2026

Research date: 2026-11-17. Naming: "Conversational AI" (2024-25) -> "Agents Platform" (late 2025) -> "ElevenAgents" (rename announced Feb 9, 2026, [changelog](https://elevenlabs.io/docs/changelog/2026/2/9)). Labels used below: **[Confirmed]** = stated by ElevenLabs (docs, blog, trust center, status page, SDK source, job posts); **[Third-party]** = independent measurement or press; **[Inferred]** = my deduction, never stated by ElevenLabs. Many ElevenLabs blog posts cited are growth-marketing pieces that restate docs; where an engineering-authored source exists it is preferred.

## 1. End-to-end architecture of an agent call (client SDK -> transport -> ASR -> turn-taking -> LLM -> TTS) and what the orchestrator does

### Takeaway
ElevenAgents is a first-party cascaded pipeline (Scribe realtime ASR -> proprietary turn-taking model + VAD -> customer-selected LLM -> streaming TTS) run by an in-house orchestration engine that claims <100 ms overhead. Browser/mobile voice defaults to WebRTC through a LiveKit server that ElevenLabs operates (confirmed in SDK source), text-only and raw API use a WebSocket (`/v1/convai/conversation`), and phone traffic enters via SIP trunk or a native Twilio integration.

### Cited Findings
- **[Confirmed]** Docs describe the architecture as 4 coordinated components: "a fine-tuned Speech to Text (ASR) model", "your choice of language model or custom LLM", "a low-latency TTS model across 10,000+ voices and 70+ languages", and "a proprietary turn-taking model that handles conversation timing". Agents can alternatively run on an "Eleven Realtime" model — [ElevenAgents overview](https://elevenlabs.io/docs/eleven-agents/overview)
- **[Confirmed]** ElevenLabs' own 9-layer decomposition of the stack (Nov 6, 2026): ASR, turn taking, LLM(s), orchestration, tools/MCP, knowledge+memory (RAG), speech synthesis, transport/telephony, guardrails/testing/monitoring — [Voice AI infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Transport defaults: "The SDKs use WebRTC for voice and WebSocket for text-only conversations by default." Private agents authenticate with a signed URL (WebSocket) or a conversation token (WebRTC) minted server-side. WebSocket endpoint `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=...` — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide); [JS SDK docs](https://elevenlabs.io/docs/eleven-agents/libraries/java-script); [WebSocket docs](https://elevenlabs.io/docs/agents-platform/libraries/web-sockets)
- **[Confirmed]** WebRTC support launched Jul 21, 2025 (was WebSocket-only before); motivation given was browser-grade echo cancellation and noise removal; 11.ai was migrated first — [WebRTC announcement](https://elevenlabs.io/blog/conversational-ai-webrtc)
- **[Confirmed, from source code]** The WebRTC path is LiveKit. `@elevenlabs/client` `WebRTCConnection.ts` imports `Room` from `livekit-client`, fetches a token from `/v1/convai/conversation/token`, then calls `room.connect(livekitUrl, conversationToken)` with a `DEFAULT_LIVEKIT_WS_URL`; mic and agent audio are LiveKit tracks at pcm_48000; control messages (e.g. `conversation_initiation_client_data`) go over LiveKit `publishData()` — [WebRTCConnection.ts @ client 1.33.0](https://github.com/elevenlabs/packages/blob/%40elevenlabs%2Fclient%401.33.0/packages/client/src/utils/WebRTCConnection.ts)
- **[Confirmed, from source code]** ElevenLabs runs its own LiveKit server: client changelog 1.7.1 pinned `livekit-client` 2.16.1 "to fix WebRTC connection failures with newer livekit-client versions whose join protocol is incompatible with the ElevenLabs LiveKit server" — [client CHANGELOG](https://github.com/elevenlabs/packages/blob/main/packages/client/CHANGELOG.md)
- **[Confirmed]** React Native SDK requires `@livekit/react-native`, `@livekit/react-native-webrtc`, `livekit-client` as peer deps — [elevenlabs/packages README](https://github.com/elevenlabs/packages); [React Native SDK docs](https://elevenlabs.io/docs/agents-platform/libraries/react-native)
- **[Confirmed]** Conversation token endpoint: `GET /v1/convai/conversation/token` returns `{token, conversation_id}`; token valid 10 minutes — [Get conversation token](https://elevenlabs.io/docs/eleven-agents/api-reference/conversations/get-webrtc-token); [React Native docs](https://elevenlabs.io/docs/agents-platform/libraries/react-native)
- **[Confirmed]** WebSocket protocol message types (client->server): user audio chunk, user message (text), user activity, multimodal message, feedback, pong (server pings for latency measurement) — [Agent WebSockets API](https://elevenlabs.io/docs/agents-platform/api-reference/agents-platform/websocket)
- **[Confirmed]** Agent ASR config (API schema): `provider` enum `elevenlabs | scribe_realtime | scribe_v2_turbo`, default `scribe_realtime`; input formats pcm_8000..pcm_48000 and ulaw_8000 (default pcm_16000); `keywords` boosting — [Get agent API](https://elevenlabs.io/docs/api-reference/agents/get)
- **[Confirmed]** Turn config (API schema): `turn_timeout` (default 7 s), `turn_eagerness` patient/normal/eager, `spelling_patience` auto/off ("model based"), `speculative_turn` (default false; "starts generating LLM responses during silence before full turn confidence is reached ... May increase LLM costs"), `silence_end_call_timeout` — [Get agent API](https://elevenlabs.io/docs/api-reference/agents/get)
- **[Confirmed]** Turn-taking model "analyzes tone, rhythm, and word context instead of relying on silence timers alone"; interruption stop signal "lands in under 200 ms"; also ignore-list words, skip-turn tool, option to disable interruptions — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** A separate VAD model exists alongside the turn model ("Improvements to our voice activity detection model help it better filter background speech and short responses") — [Interaction models](https://elevenlabs.io/blog/interaction-models) (Jul 16, 2026)
- **[Confirmed]** Per-turn flow as described by ElevenLabs: audio streams in, Scribe transcribes ~150 ms behind speech; turn-taking evaluates concurrently with transcription; LLM gets history + RAG context + tool outputs + system prompt; TTS synthesizes; audio starts playing before synthesis finishes — [Interaction models](https://elevenlabs.io/blog/interaction-models)
- **[Confirmed, engineering-authored]** Orchestration engine (Feb 27, 2026, by forward-deployed engineers): "low-latency orchestration engine purpose-built for real-time conversations, adding less than 100ms of overhead"; uses "multiple models at various stages of the answer pipeline"; every LLM request = system prompt + alternating history + KB retrieval + serialized tool schemas — [Unpacking the orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine)
- **[Confirmed]** Orchestrator speculates on end of turn: "reduces perceived LLM latency by predicting when a user has finished speaking. In some cases, this can result in multiple LLM generation requests with the same conversation context within a single turn." — [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine)
- **[Confirmed]** Tool execution modes: Immediate (optionally with pre-tool speech filler, auto-extended for slow tools), Post-Tool-Speech (wait until agent finishes speaking; for transfers/payments), Async (fire-and-forget). Tool results can be mapped into dynamic variables (key-value working memory) — [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine)
- **[Confirmed]** Workflows: a directed graph of sub-agents; "the orchestrator object is rebuilt on every transition as if it were an independent agent"; conversation history carries across; edge conditions are deterministic (unconditional, expression, tool result) or LLM-evaluated, and LLM conditions "are evaluated in parallel by the orchestrator" outside the agent's prompt; loop safeguards exist — [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine)
- **[Confirmed]** Post-call: transcript + tool data go through a fixed low-latency LLM for evaluation criteria and data collection, then post-call webhook — [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine)
- **[Confirmed]** Guardrails run outside the prompt, in parallel; Guardrails 2.0 (Sep 2026) has Focus, Manipulation, Content, Custom; streaming mode lets <500 ms of audio play before a block, blocking mode adds ~200-500 ms — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Three packaging levels of the same stack: ElevenAgents (full platform), Realtime models/API (OpenAI-Realtime-compatible wire protocol), and Speech Engine (ElevenLabs does STT+turn-taking+TTS; customer's server runs the LLM over one WebSocket per conversation) — [overview](https://elevenlabs.io/docs/eleven-agents/overview); [Interaction models](https://elevenlabs.io/blog/interaction-models)
- **[Confirmed]** "Eleven Realtime" v1 Mini/Max (launched Oct 20, 2026) are marketed as speech-to-speech but are "built on a cascaded architecture of the components described above, tuned end to end" — [Introducing Eleven Realtime](https://elevenlabs.io/blog/realtime)
- **[Confirmed]** Client SDKs: Python, JavaScript, React, React Native, Swift, Kotlin, Unity (Unity v0.1.0 Nov 9, 2026), plus `<elevenlabs-convai>` widget — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide); [changelog Nov 9, 2026](https://elevenlabs.io/docs/changelog/2026/11/9)

### Inferences
- **[Inferred]** Server side, an agent process most likely joins the LiveKit room as a participant and bridges audio into the same orchestrator that serves the WebSocket and SIP paths; ElevenLabs has not described this.
- **[Inferred]** LiveKit is used as media transport only (SFU, signalling, client SDKs). Nothing indicates the LiveKit Agents framework is the orchestrator; ElevenLabs describes its orchestrator as purpose-built.
- **[Inferred]** Open-source replication map: LiveKit server (self-hosted, Apache-2.0) for WebRTC; a WebSocket endpoint for server-to-server/text; Pipecat or LiveKit Agents as orchestrator; Silero VAD + a semantic end-of-turn model (e.g. Pipecat Smart Turn, LiveKit turn detector) standing in for the proprietary turn model; speculative LLM start on stable partials; clause-level TTS chunking.

### Gaps
- Whether the LiveKit deployment is self-hosted open-source LiveKit or LiveKit Cloud/enterprise is not stated; the changelog wording "ElevenLabs LiveKit server" suggests self-operated but does not prove it. The default LiveKit hostname was not captured in the excerpt I read.
- No public description of the orchestrator's implementation language, process model, or how agent workers are scheduled. No engineering talk or podcast with that detail was found.
- Architecture/size/training data of the turn-taking and VAD models are unpublished.

## 2. Models per layer, published latency, language coverage

### Takeaway
As of Nov 2026 the default agent ASR is Scribe v2 Realtime (~150 ms to committed transcript, 90+ languages) with Scribe v3 Live just released (Nov 9, 2026); the flagship agent TTS is Eleven v4 Turbo (~100 ms median server-side, 90+ languages) with Flash v2.5 (32 languages) as the cheap/fast option. ElevenLabs' own illustrative end-to-end budget is ~680 ms P50 / ~1.56 s P95, and independent phone-line benchmarks land at roughly 1.0-1.4 s median.

### Cited Findings
**ASR**
- **[Confirmed]** "ElevenAgents uses Scribe v2 Realtime, which transcribes speech in approximately 150 ms"; trained for noise, accents, identifiers; enabled under the agent's Advanced settings — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Scribe v2 Realtime: ~150 ms "time to committed transcript" (median, production traffic), 90+ languages — [latency methodology](https://elevenlabs.io/docs/eleven-api/concepts/latency-methodology) (figures last updated Oct 29, 2026); [Interaction models](https://elevenlabs.io/blog/interaction-models)
- **[Confirmed]** Scribe v3 / Scribe v3 Live released Nov 9, 2026: v3 Live has 44% lower semantic WER than v2 Realtime on FLEURS (73 languages), adds `commit_strategy=turn_prediction` (commits when the model predicts end of turn; partials carry `turn_probability`), multilingual mode, 10,000-term keyterm library; partials now sent up to 100 ms sooner — [changelog Nov 9, 2026](https://elevenlabs.io/docs/changelog/2026/11/9)
- **[Confirmed]** Scribe v2 Medical: 7.0% WER on Eka Medical ASR benchmark (vendor-reported) — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Status page shows a "Scribe v3 Live outage" on Nov 10, 2026, one day after launch — [status history](https://status.elevenlabs.io/history)

**TTS**
- **[Confirmed]** Models page (current): `eleven_v4_turbo` ~100 ms, 90+ languages; `eleven_v3_conversational` ~165 ms, 70+ languages; `eleven_flash_v2_5` ~100 ms, 32 languages; `eleven_flash_v2` ~135 ms, English; `eleven_turbo_v2_5`/`eleven_turbo_v2` listed as "first generation low-latency ... outclassed by Flash". Recommended for agents: v4 Turbo, Flash v2.5, Flash v2, or Multilingual v2 — [Models](https://elevenlabs.io/docs/overview/models)
- **[Confirmed]** Measurement method: medians (p50) of server-side latency (request received -> first audio sent) on production WebSocket streaming traffic with warm voices; excludes network, LLM wait, player buffering; medians rise at peak hours — [latency methodology](https://elevenlabs.io/docs/eleven-api/concepts/latency-methodology)
- **[Confirmed, conflicting figures]** Flash v2.5 is quoted as "~75 ms" model inference in older docs and most blogs ([older models page](https://elevenlabs.io/docs/models); [latency optimization blog, Jun 2026](https://elevenlabs.io/blog/voice-agent-latency-optimization)), as "50 ms model time to first byte" after a GPU/inference upgrade ([Feb 20, 2026 blog](https://elevenlabs.io/blog/text-to-speech-api-up-to-40-faster-globally)), and as "~100 ms" median server-side in the current methodology page ([latency methodology](https://elevenlabs.io/docs/eleven-api/concepts/latency-methodology)). These measure different things (inference-only vs server-side). v3 Conversational likewise appears as ~280 ms on an older page and ~165 ms now.
- **[Confirmed]** Eleven v4 Turbo: "built on an entirely new architecture", "optimized with ElevenAgents as one system"; median inference ~100 ms, median time to first speech ~150 ms (measured Sep 2026, WebSocket, network removed); audio tags, IPA phonemes — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Eleven v3 Conversational launched inside ElevenAgents Feb 2026 "with built-in turn-taking"; Expressive Mode builds on it ([laughs], [whispers], [sighs], [slow]) — [Interaction models (May 2026)](https://elevenlabs.io/blog/interaction-models-for-natural-human-ai-communication)
- **[Confirmed]** Flash v2.5 does not normalize numbers by default (to keep latency low) — [Models](https://elevenlabs.io/docs/overview/models)
- **[Confirmed]** Voice type affects latency: default/synthetic voices and Instant Voice Clones are faster than Professional Voice Clones — [latency optimization blog](https://elevenlabs.io/blog/voice-agent-latency-optimization)
- **[Confirmed]** Agent-level voice controls: multi-voice, speed 0.7x-1.2x, per-language voice, pronunciation dictionaries (IPA/CMU) — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)

**End-to-end latency**
- **[Confirmed, illustrative]** ElevenLabs' worked latency budget (English, nearby servers; "illustrative ranges, not guarantees"): capture+endpointing 120/280 ms, STT finalization 60/150, network 60/160, LLM TTFT 250/600, TTS TTFA 110/220, player buffer 80/150 => ~680 ms P50 / ~1560 ms P95 — [latency optimization blog](https://elevenlabs.io/blog/voice-agent-latency-optimization)
- **[Confirmed, vague]** "ElevenAgents are optimized for sub-100ms turnaround on internal benchmarks, with sub-200ms targeted for telephony" — [Interaction models (May 2026)](https://elevenlabs.io/blog/interaction-models-for-natural-human-ai-communication). This cannot be an end-to-end response latency given the budget above; it most likely refers to platform/TTS overhead.
- **[Confirmed]** Eleven Realtime (the tuned cascade) time to first audio on Artificial Analysis Big Bench Audio: v1 Max 0.57 s, v1 Mini 0.62 s; Big Bench Audio accuracy 98.8% / 75.9% — [Introducing Eleven Realtime](https://elevenlabs.io/blog/realtime)
- **[Third-party]** Cozzo (Oct 20-26, 2026; small n, vendor defaults, v4 Turbo voice): ElevenLabs Agents 0.41 s median over browser connection, 1.04-1.10 s median on real phone calls via Twilio->SIP (p90 1.34 s) — [Cozzo phone benchmark](http://cozzo.io/benchmarks/phone-calls); [Cozzo summary](https://cozzo.io/benchmarks)
- **[Third-party]** Openbenchmarks phone test: ElevenLabs 1,424 ms median / 1,768 ms p95 over 429 turns, tightest tail ratio (1.24x) of five platforms — [Openbenchmarks](https://openbenchmarks.com/voice-agent-latency/voice-agent-latency-comparison)
- **[Third-party, competitor-run]** Telnyx (Oct 2026, ~50 calls/platform): ElevenLabs p50 1,340 ms, p95 2,040 ms — [Telnyx benchmark report](https://github.com/team-telnyx/benchmark/blob/main/voice-ai/2026-10-first-response-latency/report/REPORT.md)
- **[Third-party]** Cekura matched-agent bench: ElevenLabs mean response 1.27 s (fastest of 7 configs), 100% calls without provider/connection issue; but in Cekura's separate test of live production agents ElevenLabs' median was 3.08 s — [via Retell blog citing Cekura](https://www.retellai.com/blog/retell-vs-bland-vs-vapi-vs-elevenlabs); [Cekura production benchmark](https://benchmarks.cekura.ai/experiments/production-voice-agents)

### Inferences
- **[Inferred]** Realistic production expectation for a cascaded ElevenAgents call is ~0.4-0.7 s over WebRTC and ~1.0-1.4 s over PSTN; the PSTN penalty (~0.5 s) is carrier/SIP path, not model time.
- **[Inferred]** Scribe v3 Live's turn-prediction commit shows ElevenLabs is moving end-of-turn prediction into the ASR model itself (joint ASR + turn detection), which an open-source stack would approximate with a separate semantic turn model.

### Gaps
- Whether agents already default to Scribe v3 Live (vs v2 Realtime) is not stated; the agent API schema I saw still lists `scribe_realtime` as default.
- No published architecture details (model size, codec, AR vs flow-matching) for v4 Turbo, Flash, or Scribe.
- No ElevenLabs-published p95/p99 end-to-end latency for agents measured on production traffic.

## 3. LLM layer: third-party models, self-hosted open-weight models, custom LLM, cascading

### Takeaway
The LLM is the one layer ElevenLabs mostly does not build: agents choose among Google, OpenAI and Anthropic models (Gemini and Claude are served via Google Vertex AI) or open-weight models that ElevenLabs self-hosts on its own GPUs (Qwen, GLM, DeepSeek, Nemotron; earlier GPT-OSS), or bring an OpenAI-compatible endpoint. Reliability comes from automatic cross-provider cascading with a 4 s default per-model timeout.

### Cited Findings
- **[Confirmed]** Current supported list. ElevenLabs-hosted: Nemotron 3.5 Super VL, DeepSeek Flash 4.1, GLM 5.2, Qwen3.6-35B-A3B, Qwen3.5-397B-A17B. Google: Gemini 4 Argon, 3.8/3.7/3.6/3.5 Flash, 3.5 Flash-Lite, 3.1 Pro Preview, 3.1 Flash Lite, 3 Flash Preview, 2.5 Flash/Flash Lite (deprecated, removal Nov 30, 2026). OpenAI: GPT-6.1 Sol/Terra, GPT-6 Astra/Sol/Luna, GPT-5.6 Sol/Terra/Luna, GPT-5.5, 5.4 (+Mini/Nano), 5.2, 5.1, 5 (+Mini/Nano), 4.1 family, 4o/4o Mini. Anthropic: Claude Opus 5.5/5/4.8/4.7/4.6, Sonnet 5.5/5/4.6/4.5, Haiku 4.5 — [Models (LLM) docs](https://elevenlabs.io/docs/eleven-agents/customization/llm)
- **[Confirmed, older snapshot]** An earlier docs version listed hosted GLM-4.5-Air, Qwen3-30B-A3B, GPT-OSS-120B — [older LLM docs](https://elevenlabs.io/docs/agents-platform/customization/llm)
- **[Confirmed]** API enum of model IDs reveals quantization/variants of hosted models: `qwen3-4b`, `qwen3-30b-a3b`, `qwen36-35b-a3b`, `qwen35-397b-a17b`, `gpt-oss-20b`, `gpt-oss-120b`, `glm-45-air-fp8`, `glm-52`, `deepseek-v41-flash`, `nemotron-35-super-vl-nvfp4`; also `grok-beta` and `custom-llm` — [Calculate expected LLM usage API](https://elevenlabs.io/docs/eleven-agents/api-reference/llm/calculate)
- **[Confirmed]** "Hosted by ElevenLabs" means "deployed and operated on infrastructure managed by ElevenLabs ... currently hosted in the United States, or in the region of your enterprise deployment"; the original model developer never receives inputs/outputs — [Models (LLM) docs](https://elevenlabs.io/docs/eleven-agents/customization/llm)
- **[Confirmed]** Gemini and Anthropic models in ElevenAgents are accessed "via Vertex AI" (GCP subprocessor entry) — [Trust Center](https://compliance.elevenlabs.io/?product=elevenlabszrm). Docs add that select Gemini/Claude models are billed at Vertex regional pricing (+10%) "which is what US and EU traffic is billed at" — [Models (LLM) docs](https://elevenlabs.io/docs/eleven-agents/customization/llm)
- **[Confirmed]** Custom LLM: any server implementing OpenAI Chat Completions (`/v1/chat/completions`) or Responses (`/v1/responses`) with SSE streaming; must support function calling for system tools; credentials stored as secrets; also "bring your own OpenAI key". Not usable with Realtime models — [Custom LLM docs](https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm)
- **[Confirmed]** LLM cascading: on API error, timeout, or empty response, falls to a backup sequence; at least 3 attempts across preferred + backups; backup connections lazily initialized; `cascade_timeout_seconds` 2-15 s, default 4; modes Default / Custom / Disabled. Documented default sequence (may be stale): Gemini 2.5 Flash -> GPT-4o -> Gemini 2.5 Flash Lite -> Claude Sonnet 4.5. ZRM/HIPAA filters the list — [LLM cascading docs](https://elevenlabs.io/docs/eleven-agents/customization/llm/llm-cascading)
- **[Confirmed]** With a Custom LLM as primary there is no fallback to hosted models unless `backup_llm_config` is set to override; custom LLM cannot itself be a backup. Realtime-model agents fall back to a backup LLM if the Realtime model does not respond in time — [LLM cascading docs](https://elevenlabs.io/docs/eleven-agents/customization/llm/llm-cascading)
- **[Confirmed]** Per-agent reasoning controls (thinking budget / reasoning effort; "Disabled: fastest replies"); max system prompt 2 MB; reasoning summaries can add latency — [Models (LLM) docs](https://elevenlabs.io/docs/eleven-agents/customization/llm)
- **[Confirmed]** LLM can be set per workflow sub-agent (cheap fast model for triage, stronger model for hard steps) — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Latency implication stated by ElevenLabs: LLM TTFT is "the largest and least predictable contributor to time-to-first-audio"; STT and TTS stages are "comparatively stable" — [Twilio build guide](https://elevenlabs.io/blog/build-voice-agent-twilio-elevenlabs)
- **[Confirmed]** Self-hosted small models are also used internally: RAG query rewriting races several models "including our self-hosted Qwen 3-4B and 3-30B-A3B"; externally hosted models "can slow during peak demand hours, our internal models stay relatively consistent"; during a provider outage "conversations continued seamlessly on our self-hosted models" — [RAG engineering post](https://elevenlabs.io/blog/engineering-rag) (Sep 12, 2025; older)
- **[Confirmed, job posting]** Inference research-engineer role lists "CUDA, Triton, TensorRT, or serving frameworks such as vLLM or SGLang", plus quantization, distillation, KV-cache optimization, batching, custom kernels — [Research Engineer - Inference](https://elevenlabs.io/careers/2d7f9a7c-a9e6-4877-bb38-34e4d989054c/research-engineer-inference). Infrastructure role lists "vLLM, Slurm" as desirable — [Infrastructure Engineer posting (third-party mirror, Oct 14, 2026)](https://devopsprojectshq.com/infrastructure-engineer-at-elevenlabs)

### Inferences
- **[Inferred]** Hosted open-weight LLMs are probably served with vLLM or SGLang on ElevenLabs' GPU Kubernetes clusters, co-located with ASR/TTS; the `fp8` / `nvfp4` suffixes indicate FP8 and NVIDIA FP4 quantized weights (the latter implying Blackwell-class GPUs). Job posts name the frameworks only as desired experience, not as the production choice.
- **[Inferred]** OpenAI models are reached through a route other than Vertex (direct OpenAI or Azure); ElevenLabs does not say which.
- **[Inferred]** The Eleven Realtime v1 models likely bundle a fixed, co-located LLM with tuned turn-taking and TTS; the underlying LLM is not disclosed.

### Gaps
- No published TTFT numbers per LLM as served through ElevenAgents (the dashboard shows latency per model, but docs excerpts did not include figures).
- Serving framework, GPU type and replica topology for hosted LLMs are not confirmed.
- The current default cascade order may differ from the documented one, given Gemini 2.5 is being retired Nov 30, 2026.

## 4. Telephony and integrations (SIP, Twilio, batch, RAG, tools, MCP, workflows, testing, analytics)

### Takeaway
ElevenLabs sells no phone numbers or carrier minutes: telephony is bring-your-own via SIP trunk (TCP/TLS, G.711/G.722, optional SRTP) or a native Twilio import, with batch/campaign dialing layered on top. The surrounding platform (RAG on every turn, five tool types incl. MCP, graph workflows, simulation tests, A/B experiments, analytics) is all first-party.

### Cited Findings
**Telephony**
- **[Confirmed]** SIP trunking, inbound and outbound; works with Twilio, Vonage, Sinch, Infobip, Telnyx and "other standard providers"; signalling TCP 5060 or TLS 1.2+ on 5061 (UDP "experimental"); codecs G.711 (PCMU/PCMA) and G.722; media encryption Disabled/Allowed/Required; digest auth or IP ACL; custom SIP headers; static-IP SIP servers for enterprise; plan >=100 kbps per call — [SIP trunking docs](https://elevenlabs.io/docs/eleven-agents/phone-numbers/sip-trunking); [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Native Twilio integration: import purchased numbers (inbound+outbound) or verified caller IDs (outbound only) — [Twilio native integration](https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/native-integration)
- **[Confirmed]** Twilio media format is 8 kHz mu-law over WebSocket; ElevenLabs recommends `ulaw_8000` TTS output for telephony to avoid transcoding — [Twilio build guide](https://elevenlabs.io/blog/build-voice-agent-twilio-elevenlabs); [latency optimization blog](https://elevenlabs.io/blog/voice-agent-latency-optimization)
- **[Confirmed]** Batch calling (CSV/XLS recipients, extra columns become dynamic variables, scheduling) uses min(50% of workspace concurrency, 70% of agent concurrency) unless `target_concurrency_limit` is set; providers enum `twilio | sip_trunk | exotel`. Batch calling "will be deprecated in favor of Campaigns" (retries, callbacks, redirects, calling windows) — [Batch calling docs](https://elevenlabs.io/docs/eleven-agents/phone-numbers/batch-calls); [Submit batch API](https://elevenlabs.io/docs/api-reference/batch-calling/create)
- **[Confirmed]** Other channels: WhatsApp (messages, voice notes, inbound/outbound calls), SMS, email; contact-center connectors named in queueing docs: Genesys, AudioCodes, Exotel — [WhatsApp docs](https://elevenlabs.io/docs/eleven-agents/whatsapp); [Call queueing](https://elevenlabs.io/docs/eleven-agents/guides/call-queueing)
- **[Confirmed]** Telephony system tools: end call, language detection, agent transfer, transfer to number (human handoff / warm transfer), skip turn, play keypad touch tone (DTMF), voicemail detection — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** SIP is a distinct failure domain: status page shows "Agent SIP Conversation Disruption" (major, Oct 8, 2026; "Non-SIP Agent conversations are unaffected"), "EU Agents disruption in SIP calls" (major, Oct 6, 2026), and inbound Twilio connection failures (Aug 2026) — [status incidents](https://status.elevenlabs.io/api/v2/incidents.json)

**Knowledge base / RAG**
- **[Confirmed]** Inputs: PDF, DOCX, TXT, MD, HTML, EPUB (<=20 MB each), URLs, text. Documents up to ~300,000 characters can be injected as full context; larger ones use RAG; default mode Auto; retrieval can run every turn or on demand — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** RAG is "built directly into the request pipeline so it runs on every query", preceded by an LLM query-rewriting step that collapses dialogue history into a self-contained query; rewriting was >80% of RAG latency; fixed by racing multiple models in parallel (first valid response wins) with a 1 s timeout falling back to the raw user message; median 326 -> 155 ms, p75 436 -> 250 ms, p95 629 -> 426 ms — [RAG engineering post](https://elevenlabs.io/blog/engineering-rag) (Sep 2025)

**Tools**
- **[Confirmed]** Tool types: client tools (dispatched as events over the conversation connection), webhook/server tools, code tools (custom JavaScript in a sandbox on ElevenLabs infrastructure), MCP tools, system tools — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide); [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine)
- **[Confirmed]** MCP: SSE and streamable-HTTP transports; disabled by default per workspace; approval modes Always Ask / Fine-Grained / No Approval; not available under Zero Retention Mode or HIPAA — [MCP docs](https://elevenlabs.io/docs/eleven-agents/customization/tools/mcp)
- **[Confirmed]** Personalization: `{{dynamic_variables}}`; for inbound Twilio/SIP/WhatsApp/SMS a conversation-initiation webhook fetches caller data (response <=256 KB) before the call starts — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)

**Workflows / multi-agent**
- **[Confirmed]** Workflow node types: Subagent (override prompt, LLM, voice, tools, KB), Say, Dispatch tool (guaranteed tool call with success/failure edges), Update state, Agent transfer, Transfer to number, End call; edges carry natural-language conditions evaluated by an LLM — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Agent-to-agent transfer is implemented as a `transfer_to_agent` system tool with rules (target agent, natural-language condition, delay, transfer message) — [Agent transfer docs](https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/agent-transfer)

**Testing, experiments, analytics**
- **[Confirmed]** Three test types: Simulation (LLM-simulated user, 1-50 turns, default 5, success condition judged by LLM; tools mockable), Next Reply, Tool Call (exact/regex/LLM match); `repeat_count` 2-20 yields a pass rate; tests can be created from real conversations; runnable from dashboard, CLI, API — [Agent testing docs](https://elevenlabs.io/docs/eleven-agents/customization/agent-testing); [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Experiments: A/B on agent version branches, deterministic routing by conversation ID, recommended start 5-10% — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Observability: per-call success evaluation and data collection; dashboard with volume, duration, cost, error rates (split by tool/LLM/connection), agent response latency and turn-taking latency at p50/p90/p99; per-node workflow analytics; OpenTelemetry trace export (reasoning in `elevenlabs.reasoning_content` span attribute) — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide); [Models (LLM) docs](https://elevenlabs.io/docs/eleven-agents/customization/llm)

### Inferences
- **[Inferred]** Because the WebRTC layer is LiveKit, the SIP ingress may be LiveKit SIP or a separate SBC (the queueing docs mention AudioCodes as an integration, not as their SBC). Nothing public settles this.
- **[Inferred]** Open-source equivalents: LiveKit SIP or Asterisk/FreeSWITCH/Kamailio for trunking; Twilio Media Streams serializer for the native-Twilio path; a vector store plus a small racing query-rewriter for RAG; an LLM-as-caller simulation harness for tests.

### Gaps
- Embedding model, vector index, chunking strategy and reranking for the knowledge base are not disclosed.
- SIP stack/SBC vendor is not disclosed. The promised RCA for the Oct 8, 2026 SIP incident was not found.
- Details of the new "Campaigns" / Campaign Manager product were not researched in depth.

## 5. Infrastructure: cloud, GPUs, regions, concurrency, scale, reliability, compliance

### Takeaway
ElevenLabs runs primarily on Google Cloud (Kubernetes with GPU clusters, Terraform, ArgoCD), serving models from US, Netherlands and Singapore with isolated residency environments in EU, India and Singapore; inference uses NVIDIA GPUs including Blackwell RTX PRO 6000 on GCP G4 VMs, alongside bare-metal/rented clusters for training. Agents handle 10-15M+ conversations per week, and the compliance portfolio is broad (SOC 2 Type 2, ISO 27001/42001, HIPAA, PCI DSS L1, HDS, FedRAMP 20x) with per-agent Zero Retention Mode.

### Cited Findings
**Cloud and GPUs**
- **[Confirmed]** Trust Center subprocessor entry: "Google Cloud Platform - Cloud infrastructure, security, data storage & LLM Services"; Enterprise: US or selected hosting location; non-Enterprise: data may be processed in US, EU or Singapore — [Trust Center](https://compliance.elevenlabs.io/?product=elevenlabszrm)
- **[Confirmed]** Feb 26, 2026 multi-year extension with Google Cloud: ElevenLabs "will utilize Google Cloud's G4 virtual machines, powered by NVIDIA RTX PRO 6000 Blackwell GPUs, to train and serve its voice models", with "a significantly larger cluster of NVIDIA Blackwell GPUs" — [Google Cloud press release](https://www.googlecloudpresscorner.com/2026-02-26-ElevenLabs-Partners-with-Google-Cloud-for-Cloud-Services-and-the-Latest-NVIDIA-Blackwell-GPUs,1)
- **[Confirmed, job posting via third-party mirror]** Infrastructure Engineer role: "Run and scale Kubernetes clusters, including GPU clusters for inference and training, across cloud and on-prem"; requires GCP, Python and/or Go, Terraform, ArgoCD, operating stateful systems (databases, observability stacks); mentions "cloud migrations" — [Infrastructure Engineer posting (Oct 14, 2026)](https://devopsprojectshq.com/infrastructure-engineer-at-elevenlabs)
- **[Confirmed, job posting]** Research infra: "We operate NVIDIA GPU clusters across bare metal and rented capacity", InfiniBand fabrics, on-site hardware bring-up — [HPC Infrastructure Engineer](https://elevenlabs.io/careers/120da2b3-d88b-4e3c-9b89-d19ff73db9d9/hpc-infrastructure-engineer-gpu-clusters)

**Regions / residency**
- **[Confirmed]** Global routing is default since Feb 2026: Americas -> US-Central, EMEA -> Netherlands, APAC -> Singapore; `x-region` response header shows serving region; `api.us.elevenlabs.io` pins to US — [multi-region blog](https://elevenlabs.io/blog/text-to-speech-api-up-to-40-faster-globally); [changelog Feb 9, 2026](https://elevenlabs.io/docs/changelog/2026/2/9)
- **[Confirmed]** Flash WebSocket TTFB by client region: North America, Europe, SE Asia 100-150 ms; South Asia and NE Asia 150-200 ms — [latency optimization docs](https://elevenlabs.io/docs/eleven-api/guides/how-to/best-practices/latency-optimization)
- **[Confirmed]** Enterprise data residency via fully isolated environments (separate workspace, API key, hostnames): EU `api.eu.residency.elevenlabs.io`, India `api.in.residency.elevenlabs.io`, Singapore `api.sg.residency.elevenlabs.io`; storage is in-region but processing may leave it unless ZRM + API are used (EU) — [Data residency docs](https://elevenlabs.io/docs/overview/administration/data-residency)
- **[Confirmed]** Advice to builders: network RTT to ElevenLabs is ~20-200 ms over the public internet; "ElevenLabs already routes to the nearest of its North America, Europe, and Southeast Asia clusters" — [Twilio build guide](https://elevenlabs.io/blog/build-voice-agent-twilio-elevenlabs)

**Concurrency / capacity**
- **[Confirmed]** Agent concurrent calls by plan: Free 4, Starter 6, Creator 10, Pro 20, Scale 30, Business 40, Enterprise elevated — [Agents pricing](https://elevenlabs.io/pricing/agents?price.billing_cycle=yearly)
- **[Confirmed]** Burst: up to 3x the limit (capped at 300 for non-enterprise) at 2x price; burst calls get "lower priority for speech-to-text and text-to-speech processing" and may see higher latency — [Burst pricing docs](https://elevenlabs.io/docs/eleven-agents/guides/burst-pricing)
- **[Confirmed]** Call queueing: on by default for new agents; hold audio; max wait 1-1,800 s (default 180); queue time not billed; WebSocket clients get `queue_status` events and close code 4300 on timeout — [Call queueing docs](https://elevenlabs.io/docs/eleven-agents/guides/call-queueing)
- **[Confirmed]** Priority queueing is a platform primitive: plans carry a priority level (Free 3 ... Enterprise 6); requests over the concurrency limit queue with lower-priority traffic, "typically only adds ~50ms". A TTS concurrency of 5 supports roughly 100 simultaneous conversations because synthesis is faster than real time — [Models: concurrency and priority](https://elevenlabs.io/docs/overview/models)
- **[Confirmed]** From Nov 26, 2026 `/v1/convai` enforces server-side request timeouts and may return HTTP 504 during latency spikes — [Changelog Nov 16, 2026](https://elevenlabs.io/docs/changelog)

**Scale**
- **[Confirmed]** "Our agents now handle more than 15 million conversations every week, up 3x since February"; ElevenAgents ARR up >3x over the same period; enterprise is 55% of revenue (Sep 30, 2026) — [$22bn tender blog](https://elevenlabs.io/blog/tender-22bn). The agents landing page and Nov 2026 guide still say "10M+ conversations per week" — [agents page](https://elevenlabs.io/agents)
- **[Confirmed]** Company: $330M+ ARR at end of 2025; $500M Series D at $11B (Feb 4, 2026); $300M tender at $22B (Sep 30, 2026) — [Series D blog](https://elevenlabs.io/blog/series-d); [Reuters](https://www.reuters.com/legal/transactional/elevenlabs-valuation-doubles-22-billion-surging-ai-voice-agent-demand-2026-09-30)
- **[Third-party estimate]** Sacra: ~$600M annualized revenue in June 2026; ">2M conversational AI voice agents" deployed handling "33M+ conversations to date" (an older statistic, clearly superseded by the weekly figure above) — [Sacra](https://sacra.com/c/elevenlabs)
- **[Confirmed, customer references]** Meesho ~90% of support queries automated across 60,000+ calls/day; Czech benefits hotlines ~5,000 calls/day, 85% resolved — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)

**Reliability**
- **[Confirmed]** Recent agent-relevant incidents: Nov 3 and Nov 4, 2026, EU agents on v4 Turbo had choppy audio because the model was "generating audio slower than real time under high load" (fixed by raising throughput); Oct 12-13 TTS failures from "a heavy traffic spike"; Oct 8 and Oct 6 major SIP disruptions; Nov 10 Scribe v3 Live outage — [status history](https://status.elevenlabs.io/history); [incidents JSON](https://status.elevenlabs.io/api/v2/incidents.json)
- **[Confirmed]** Custom SLAs and DPAs are Enterprise-only contract terms — [pricing guide blog](https://elevenlabs.io/blog/ai-voice-agent-pricing-guide)

**Compliance**
- **[Confirmed]** Trust Center lists SOC 2 Type 2, ISO 27001/27017/27018/27701, ISO/IEC 42001, PCI DSS 4.0.1 Level 1, FedRAMP 20x Class A, CSA STAR, AIUC-1, HIPAA, HDS (France, Jan 2026), GDPR, CCPA, DORA, UK Cyber Essentials Plus, TX-RAMP L2, NHS DSPT — [Trust Center](https://compliance.elevenlabs.io/?product=elevenlabszrm)
- **[Confirmed]** Zero Retention Mode (Enterprise): per-agent toggle (Privacy > Advanced), API traffic only; "all call data is processed in memory only and never written to persistent storage", applies to internal logs too; post-call webhooks still deliver outputs — [ZRM docs](https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode); [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine)
- **[Confirmed]** HIPAA: BAA + ZRM required; LLM allowlist limited to BAA-covered providers (Gemini, Claude, OpenAI in US/EU, hosted Qwen3.5-397B and GLM-5.2), or custom LLM with customer's own BAA after ElevenLabs approval; only Eleven Realtime v1 Max among Realtime models; no MCP — [HIPAA docs](https://elevenlabs.io/docs/eleven-agents/legal/hipaa); [ZRM docs](https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode)

### Inferences
- **[Inferred]** Production inference for agents runs on GKE (or GCP-hosted Kubernetes) GPU node pools in us-central, Netherlands (europe-west4) and Singapore (asia-southeast1); the GCP region names are my mapping of the stated locations, not ElevenLabs' words.
- **[Inferred]** The Nov 3-4 v4 Turbo incident shows real-time-factor headroom under peak load is the binding capacity constraint for the newest TTS model, i.e. GPU capacity per region is provisioned close to demand.
- **[Inferred]** "Cloud migrations" in the job post plus on-prem/bare-metal mentions suggest a hybrid footprint beyond GCP; no second public cloud is confirmed in the sources I read.

### Gaps
- No public uptime percentage or SLA number; SLA is contract-only.
- Total number of agents created as of Nov 2026, total minutes, and peak concurrent calls are not published (only weekly conversations).
- Database, message bus, and observability stack are not named publicly.
- Whether non-GCP clouds or neoclouds serve production inference is unknown.

## 6. Pricing per minute and LLM cost pass-through

### Takeaway
Voice is a flat $0.08 per minute on every paid self-serve plan (plans differ only in included minutes and concurrency), covering ASR, TTS, turn-taking, knowledge base and RAG. LLM tokens and telephony are billed on top at cost.

### Cited Findings
- **[Confirmed]** Plans (monthly): Free 15 min / 4 concurrent; Starter $6, 75 min, 6; Creator $22, 275 min, 10; Pro $99, 1,238 min, 20; Scale $299, 3,738 min, 30; Business $990, 12,375 min, 40; Enterprise custom. Additional minutes $0.08; text messages $0.003 each; burst $0.16/min — [Agents pricing](https://elevenlabs.io/pricing/agents?price.billing_cycle=yearly); [pricing guide blog (Nov 4, 2026)](https://elevenlabs.io/blog/ai-voice-agent-pricing-guide)
- **[Confirmed]** The platform rate "includes text to speech, speech to text, turn taking, knowledge bases, and RAG"; volume discounts only via Enterprise — [pricing guide blog](https://elevenlabs.io/blog/ai-voice-agent-pricing-guide)
- **[Confirmed]** "ElevenLabs passes through third-party LLM costs at the provider's published rate, with no markup", except select Gemini/Claude models billed at Vertex AI regional rates (+10% on input, output and cache tokens) — [Models (LLM) docs](https://elevenlabs.io/docs/eleven-agents/customization/llm)
- **[Confirmed]** Per-agent LLM cost estimate is shown via "Detailed costs" in the LLM selector; an API estimates LLM cost from prompt length, KB pages, and RAG usage — [Help center: cost](https://elevenlabs.io/docs/help-center/product/eleven-agents/how-much-does-eleven-agents-cost); [Calculate LLM usage API](https://elevenlabs.io/docs/eleven-agents/api-reference/llm/calculate)
- **[Confirmed]** Telephony carrier charges are separate and passed through at cost; ElevenLabs charges no telephony fee of its own — [pricing guide blog](https://elevenlabs.io/blog/ai-voice-agent-pricing-guide); [Stork.AI summary (third-party)](https://www.stork.ai/blog/elevenlabs-agents-pricing-2026)
- **[Confirmed]** Silent periods are billed at 5% of the per-minute rate; queue time is unbilled; speculative turn "can raise LLM cost" — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide); [Call queueing](https://elevenlabs.io/docs/eleven-agents/guides/call-queueing)
- **[Confirmed]** WhatsApp voice notes incur STT and TTS API-rate charges — [WhatsApp docs](https://elevenlabs.io/docs/eleven-agents/whatsapp)
- **[Confirmed]** Startup grant: 12 months free, 33M characters, Scale-level benefits — [Agents pricing](https://elevenlabs.io/pricing/agents?price.billing_cycle=yearly)

### Inferences
- **[Inferred]** All-in cost per minute for a typical call is roughly $0.08 + LLM (commonly well under a cent to a few cents per minute depending on model and prompt size) + carrier ($0.005-0.02/min typical); ElevenLabs publishes no per-minute LLM figure, so this range is my estimate.
- **[Inferred]** Since every self-serve tier is $0.08/min, concurrency is the real product being tiered.

### Gaps
- Whether v4 Turbo / v3 Conversational / Expressive Mode minutes carry a surcharge over Flash was not visible in the excerpts read; the pricing guide implies a single rate.
- Pricing of ElevenLabs-hosted open-weight LLMs (per-token rates) was not captured.
- Enterprise per-minute rates and pricing of Eleven Realtime models were not found.

## 7. Published engineering details on how low latency is achieved

### Takeaway
The published techniques are conventional but applied aggressively: stage overlap (speculative LLM start before end-of-turn is confirmed, clause-level LLM->TTS streaming), owning and co-optimizing ASR/turn/TTS as one system, racing and self-hosting small LLMs for auxiliary steps, parallel out-of-band guardrail/condition evaluation, multi-region serving, and codec matching. No deep systems paper or conference talk was found; most detail comes from two engineering blog posts and docs.

### Cited Findings
- **[Confirmed]** Ranked levers per ElevenLabs: (1) start LLM work on stable STT partials to hide endpointing delay; (2) stream LLM tokens into TTS at sentence boundaries so synthesis of sentence one overlaps generation of sentence two; (3) stream TTS to the player and minimize the jitter buffer; (4) Flash + default voice or IVC, with codec matched to transport (`ulaw_8000` for telephony, PCM/MP3 for browser) — [latency optimization blog](https://elevenlabs.io/blog/voice-agent-latency-optimization)
- **[Confirmed]** Speculative turn in the platform: an opt-in setting that "starts the language model reply before the caller is confirmed finished"; originally shipped with v3 Conversational as pre-triggering "LLM response generation during periods of user silence"; the orchestrator may issue several LLM requests with identical context in one turn — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide); [Interaction models (May 2026)](https://elevenlabs.io/blog/interaction-models-for-natural-human-ai-communication); [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine)
- **[Confirmed]** Sub-sentence TTS start: "The assistant starts speaking after receiving enough words and a comma from the language model, rather than waiting for complete sentences" — [Conversation flow docs](https://elevenlabs.io/docs/eleven-agents/customization/conversation-flow)
- **[Confirmed]** Orchestrator overhead "<100ms" — [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine)
- **[Confirmed]** Model racing for RAG query rewrite with 1 s hard fallback to the raw message (median 155 ms); self-hosted models chosen for latency consistency at peak — [RAG engineering post](https://elevenlabs.io/blog/engineering-rag)
- **[Confirmed]** Parallelism outside the main generation path: workflow LLM conditions evaluated in parallel by the orchestrator; guardrails in streaming mode run concurrently with the reply — [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine); [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Dead-air masking rather than latency removal: pre-tool speech fillers auto-extended for slow tools; optional ambient audio during tool runs — [orchestration engine](https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine); [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide)
- **[Confirmed]** Joint optimization: v4 Turbo is "optimized with ElevenAgents as one system"; Eleven Realtime is the cascade "tuned end to end" — [infrastructure guide](https://elevenlabs.io/blog/voice-ai-infrastructure-guide); [Introducing Eleven Realtime](https://elevenlabs.io/blog/realtime)
- **[Confirmed]** Infrastructure-level: "upgraded GPUs and an optimized inference stack" took Flash v2.5 to 50 ms model TTFB; geo-routing to nearest of three regions cut TTFB 20-40% for non-US users — [multi-region blog](https://elevenlabs.io/blog/text-to-speech-api-up-to-40-faster-globally)
- **[Confirmed]** ASR-side: partial transcripts now emitted as soon as produced (up to 100 ms saved); turn-prediction commit in Scribe v3 Live avoids waiting for a silence timeout — [changelog Nov 9, 2026](https://elevenlabs.io/docs/changelog/2026/11/9)
- **[Confirmed]** Warm-path assumptions: published TTS latency assumes "warm voices" (already used for a generation); backup LLM connections are lazily initialized (so first failover pays connection setup) — [latency methodology](https://elevenlabs.io/docs/eleven-api/concepts/latency-methodology); [LLM cascading docs](https://elevenlabs.io/docs/eleven-agents/customization/llm/llm-cascading)
- **[Confirmed]** LLM-side knobs exposed to users: reasoning disabled for fastest replies, small/fast models per sub-agent, prompt caching priced via `input_cache_read`/`input_cache_write` — [Models (LLM) docs](https://elevenlabs.io/docs/eleven-agents/customization/llm)
- **[Confirmed, job posting]** Inference team techniques listed: quantization, distillation, KV-cache optimization, batching strategies, custom kernels for "real-time, streaming workloads where every millisecond matters" — [Research Engineer - Inference](https://elevenlabs.io/careers/2d7f9a7c-a9e6-4877-bb38-34e4d989054c/research-engineer-inference)

### Inferences
- **[Inferred]** The decisive structural advantage is co-location: ASR, turn model, TTS, orchestrator and (optionally) hosted LLMs sit in the same cluster, so the only cross-network hop inside a turn is to a third-party LLM; choosing a hosted open-weight LLM would remove it. ElevenLabs does not spell this out or quantify it.
- **[Inferred]** For an open-source replica the highest-value items are: semantic end-of-turn with speculative (cancelable) LLM generation, comma/clause-level TTS flushing, a streaming TTS with sub-150 ms TTFB on warm voices, self-hosted small LLM for query rewrite with a hard timeout, and running everything in one region next to the SIP/WebRTC edge.
- **[Inferred]** No evidence of response caching (e.g. cached TTS for repeated phrases or semantic LLM caches) in published material, beyond provider prompt caching.

### Gaps
- No conference talk, podcast or paper with systems-level detail (batching strategy, streaming protocol between orchestrator and model servers, GPU scheduling) was found within the search budget; this may exist but was not surfaced.
- Speculative-turn cancellation semantics and the wasted-token rate are not published.
- No published breakdown of measured (not illustrative) per-stage latency on production agent traffic.
