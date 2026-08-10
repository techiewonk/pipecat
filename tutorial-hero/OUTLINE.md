# Pipecat 0‑to‑Hero — Course Outline (draft v2, full‑coverage)

A single authoritative, source‑grounded path from "never heard of Pipecat" to "can design and ship a distributed multi‑agent voice system." Every lesson is **source‑deep + runnable**: it explains the real classes that implement the idea, then ships an annotated program you can run.

- **Two code tracks per lesson:** a self‑contained **mini‑example** *and* one step of the **capstone thread**.
- **Capstone thread — "Atlas":** one project grows lesson by lesson — say‑one‑thing bot → full cascaded voice agent with tools → Gemini Live realtime agent with vision → Flows‑structured task → multi‑agent system on the bus → telephony + deploy → the final **Gemini Live A2A running local and distributed**.
- **Full coverage goal:** this v2 is audited so that **every `src/pipecat` package** and **every official Fundamentals + Evals doc page** maps to a lesson. See the **Coverage Matrix (Appendix E)**.

**Per‑lesson template:** 🎯 Objective · 🧠 Principle · 🔬 Source anchors · 💻 Mini‑example · 🧩 Capstone step · 🏋 Exercise · ✅ Checkpoint · ⏱ Time.

---

## Part I — Principles: the engine

**0. How to use this course.** Layer cake, capstone thread, running examples, repo map. ⏱15m

**1. What Pipecat is.** Real‑time media‑agent framework; the round‑trip; the seven core ideas; where the 567 source files live. 🔬 repo tree. ⏱20m

**2. Setup & first run.** `uv sync`, `.env`, run `getting-started/01`, the web client. 🧩 Atlas 0: say‑one‑thing. ⏱25m

**3. The frame model.** The 3 lanes (`SystemFrame` high‑priority vs `DataFrame`/`ControlFrame`), media bases, `UninterruptibleFrame`, reading the 125‑type taxonomy. 🔬 `frames/frames.py`. 💻 print‑every‑frame observer. ⏱35m

**4. The FrameProcessor contract & custom processors.** `process_frame`/`push_frame`, `FrameDirection`, `link()`, interruption propagation; writing your own; the built‑in filter/processor toolbox (`filters/*`, `idle_frame_processor`, `logger`, `text_transformer`, producer/consumer, `async_generator`, `gated`). 🔬 `processors/frame_processor.py`, `processors/filters/*`, `processors/*`. Covers **fundamentals/custom‑frame‑processor**. 🏋 build a text‑rewriting processor. ⏱45m

**5. Pipeline, workers, runner & parallel pipelines.** Linking (`PipelineSource/Sink`, `_link_processors`), lifecycle frames, `PipelineWorker`/`PipelineParams`, `WorkerRunner`; plus `ParallelPipeline` / `SyncParallelPipeline` and where they're used. 🔬 `pipeline/pipeline.py`, `pipeline/parallel_pipeline.py`, `pipeline/sync_parallel_pipeline.py`, `pipeline/worker.py`, `workers/runner.py`. 🧩 Atlas 1: minimal worker. ⏱45m

---

## Part II — The voice loop, layer by layer

**6. Transports.** `BaseTransport.input()/output()`, `TransportParams`, output `MediaSender` (chunking/resample/mixer/bot‑speaking/destinations), `clocks/` for pts timing. 🔬 `transports/base_*`, `smallwebrtc`, `daily`, `websocket`, `clocks/*`. 💻 same bot, two transports. ⏱35m

**7. Audio processing: filters, resamplers, VAD.** Noise filters (`audio_in_filter`: **RNNoiseFilter**, Krisp, Koala, AIC), resamplers (**SOXR**, SOXRStream, **Resampy**), VAD (`SileroVADAnalyzer`, `VADParams`, `VADController`, `VADProcessor`). 🔬 `audio/filters/*`, `audio/resamplers/*`, `audio/vad/*`, `processors/audio/vad_processor.py`. 💻 noise‑filtered VAD printer. ⏱45m

**8. Speech to Text.** `STTService` vs `SegmentedSTTService`, `run_stt`, passthrough, settings, `Language` enum, TTFB & **STT latency tuning**, keepalive/reconnect. 🔬 `services/stt_service.py`, `services/stt_latency.py`, `transcriptions/language.py`, `deepgram/stt.py`, `whisper`. Covers **fundamentals/stt‑latency‑tuning**. 💻 transcription bot; swap providers. ⏱40m

**9. Context & aggregators (the hub).** `LLMContext`, `LLMContextAggregatorPair` (`.user()`/`.assistant()`), sentence/DTMF/gated aggregators. 🔬 `processors/aggregators/{llm_context,llm_response_universal,sentence,dtmf_aggregator,gated}.py`. 💻 watch context grow. ⏱40m

**10. Turn‑taking & muting (modern).** ⚠️ On the aggregator, not the transport. `LLMUserAggregatorParams(vad_analyzer, user_turn_strategies, user_mute_strategies)`; start/stop strategies; smart‑turn models; wake‑phrase; server‑side muting. 🔬 `turns/*`, `audio/turn/smart_turn/*`. Covers **fundamentals/user‑input‑muting**. 💻 VAD‑only vs smart‑turn A/B + muting. ⏱50m

**11. LLM inference, adapters & settings.** `LLMService`, `BaseLLMAdapter`, the `BaseOpenAILLMService` streaming engine, the **Settings `NOT_GIVEN` delta** pattern + runtime updates. 🔬 `services/llm_service.py`, `services/openai/base_llm.py`, `adapters/services/*`, `services/settings.py`. Covers **fundamentals/service‑settings**. 🧩 Atlas 2: first full cascaded voice agent. ⏱45m

**12. Function calling, async tools & MCP.** Registration, `FunctionSchema`/`ToolsSchema`, `run_function_calls`→`FunctionCallParams`→`result_callback`, intermediate updates, cancellable async tools, `async_tool_messages`, MCP bridge. 🔬 `services/llm_service.py`, `adapters/schemas/*`, `services/mcp_service.py`, `processors/aggregators/async_tool_messages.py`. 🧩 Atlas 3: tools + an MCP server. ⏱50m

**13. Text to Speech.** `TTSService`/`WebsocketTTSService`, sentence aggregation & `TextAggregationMode`, audio‑context ordering, word timestamps, `LLMTextProcessor`, text transforms/filters, `skip_tts`. 🔬 `services/tts_service.py`, `services/cartesia/tts.py`, `processors/aggregators/llm_text_processor.py`, `utils/text/*`. 💻 runtime voice switch; skip‑TTS a code block. ⏱40m

**14. Output & playback.** `MediaSender` internals: mixers (`audio_out_mixer`, `SoundfileMixer`, mixer control frames), bot‑speaking, end‑silence, DTMF (`KeypadEntry`, `dtmf_aggregator`). 🔬 `transports/base_output.py`, `audio/mixers/*`, `audio/dtmf/*`. 💻 hold‑music bed ducked on speech. **Milestone: production‑quality single agent.** ⏱35m

---

## Part III — Realtime & multimodal

**15. Realtime speech‑to‑speech.** One `LLMService` replaces STT+LLM+TTS; server‑driven turns; tools via custom tools; voices/grounding. 🔬 `services/google/gemini_live/llm.py`, `openai/realtime/*`, `aws/nova_sonic/*`. 🧩 Atlas 4: swap cascade → Gemini Live. ⏱50m

**16. Vision, video & avatars.** Image frames through the pipeline; multimodal vision; video processing (`processors/gstreamer/*`); talking‑head avatars (transport vs video service). 🔬 vision `services/*`, `processors/gstreamer/*`, `transports/{tavus,heygen,simli,lemonslice}`. 💻 "what am I holding?"; Atlas gets a face (optional). ⏱40m

**17. Thinking / reasoning.** Thought frames (`LLMThoughtStart/Text/EndFrame`), budgets, thinking + tools. 🔬 `frames/frames.py` thought frames; `thinking/` examples. ⏱25m

**18. RAG & memory.** Retrieval into context; grounding metadata; long‑term memory (Mem0). 🔬 `services/mem0/*`, `rag/` examples. 🧩 Atlas 5: ground answers in a doc set. ⏱35m

---

## Part IV — Structure, control & capture

**19. Flows.** `FlowManager`, `NodeConfig`, transitions returning `(result, next_node)`, `ContextStrategy`, actions. 🔬 `flows/*`. 🧩 Atlas 6: structured intake/booking. ⏱50m

**20. Interruptions, idle & runtime switching.** Interruption propagation, `UserIdleController`, mid‑call service/voice/model switching. 🔬 interruption/idle frames, `pipeline/service_switcher.py`, `pipeline/llm_switcher.py`, `services/…` switchers. Covers **fundamentals/interruptions**, **fundamentals/detecting‑user‑idle**. ⏱40m

**21. Context summarization & strategies.** Compress long histories; `ContextStrategy` (APPEND/RESET/RESET_WITH_SUMMARY); gated context. 🔬 `processors/aggregators/{llm_context_summarizer,gated_llm_context}.py`. Covers **fundamentals/context‑summarization**. 🧩 Atlas 7: summarize old turns. ⏱35m

**22. Conversation capture: transcripts & recording.** Saving transcripts; recording audio with `AudioBufferProcessor`; transcript processors/observers. 🔬 `processors/audio/audio_buffer_processor.py`, transcript observer, `observers/transcription_log_observer.py`. Covers **fundamentals/saving‑transcripts**, **fundamentals/recording‑audio**. 💻 save a WAV + a transcript. ⏱35m

**23. Observability & metrics.** Observers vs processors; `MetricsFrame`/TTFB/usage; turn‑tracking & latency observers; RTVI event stream overview. 🔬 `observers/*`, `metrics/*`, `processors/frameworks/rtvi/observer.py`. Covers **fundamentals/metrics**. 🧩 Atlas 8: instrument latency. ⏱40m

---

## Part V — Multi‑agent: the bus

**24. The worker bus & bus bridge.** `WorkerBus` (priority queues/subscriptions), message types (`BusFrameMessage`, job/lifecycle/registry), `BusBridgeProcessor`/`_BusEdgeProcessor`. 🔬 `bus/bus.py`, `bus/messages.py`, `bus/bridge_processor.py`, `bus/local/async_queue.py`. Covers **fundamentals/agent‑bus**, **fundamentals/understanding‑the‑bus‑bridge**. ⏱45m

**25. Workers, `@tool`, registry & discovery.** `BaseWorker`→`PipelineWorker`→`LLMWorker`→`LLMContextWorker`; `@tool`; deferred frames; `WorkerRegistry` and how workers find each other / signal ready. 🔬 `workers/base_worker.py`, `workers/llm/*`, `registry/*`. Covers **fundamentals/agent‑registry‑and‑discovery**. 🧩 Atlas 9: wrap Atlas as `LLMContextWorker`. ⏱45m

**26. Handoff.** `activate_worker`/`deactivate_self`; main worker owns transport & bridges. 🔬 `workers/base_worker.py`, `examples/multi-worker/local-handoff/*`. 🧩 Atlas 10: triage → specialist. ⏱45m

**27. Job coordination.** `job()`/`job_group()`, `JobContext`/`JobGroupContext`, fan‑out + synthesize. 🔬 `pipeline/job_context.py`, `examples/multi-worker/parallel-debate/*`. 🧩 Atlas 11: consult N specialists in parallel. ⏱45m

**28. Distributed & proxy.** Same code, different bus: `RedisBus`/`PgmqBus`; WebSocket proxy workers. 🔬 `bus/network/{redis,pgmq}.py`, `workers/proxy/websocket/*`. 🧩 Atlas 12: split over Redis. ⏱50m

**29. UIWorker + RTVI client.** Bridge the bus to a web GUI: `UIWorker`, `@ui_event`, a11y snapshots, `send_command`, `ui_job_group`; RTVI UI frames/models. 🔬 `workers/ui/*`, `bus/ui/messages.py`, `processors/frameworks/rtvi/*`. ⏱45m

---

## Part VI — Production & quality

**30. Runner, transport selection & telephony.** `runner/run.py`, `RunnerArguments`, `create_transport`, one server for WebRTC/Daily/telephony/WS; telephony `FrameSerializer`s (Twilio/Telnyx/Plivo/Exotel/Vonage/Genesys, Protobuf). 🔬 `runner/*`, `serializers/*`. 🧩 Atlas 13: put Atlas on a phone number. ⏱45m

**31. Telephony intelligence: IVR & voicemail.** Navigate phone menus with `IvrNavigator`; classify outbound calls with `VoicemailDetector`. 🔬 `extensions/ivr/ivr_navigator.py`, `extensions/voicemail/voicemail_detector.py`. Covers **fundamentals/ivr**, **fundamentals/voicemail**. 💻 an IVR‑navigating outbound bot. ⏱35m

**32. Framework integrations.** Drop in external agent frameworks: LangChain and AWS Strands Agents as pipeline processors. 🔬 `processors/frameworks/langchain.py`, `processors/frameworks/strands_agents.py`, `examples/voice/voice-aws-strands.py`. ⏱25m

**33. Deployment & the CLI.** Pipecat Cloud vs self‑host; the `bot(runner_args)` contract; the `pipecat` CLI (scaffold/run/deploy). 🔬 `cli/*`, deployment docs. ⏱30m

**34. Evals & testing.** The eval framework end‑to‑end: `EvalTransport`, scenarios, the harness/runner, an LLM judge, speech/transcription evals, suites; plus unit‑testing custom processors. 🔬 `evals/{transport,scenario,harness,judge,suite,speech,transcribe,services,serializer}.py`, `tests/`. Covers the **Evals** docs. 🧩 Atlas 14: an eval scenario + judge for Atlas. ⏱45m

---

## Part VII — Capstone

**35. The Gemini Live A2A.** Assemble everything: main transport worker bridging audio to the bus; multiple Gemini Live specialist workers; handoff + parallel fan‑out; run local (in‑memory) and distributed (Redis/PGMQ) with only `bus=` changing; optional UIWorker; evals + metrics wired in. Full runnable project + architecture write‑up. ⏱ project

---

## Appendices
- **A. Frame catalog** — all 125 frame types grouped by lane/role.
- **B. Glossary** — frame, processor, aggregator, worker, bus, adapter, serializer, RTVI, turn strategy, smart turn, job group.
- **C. What changed from old tutorials** — turn‑taking on the aggregator; realtime as one service; Settings/`NOT_GIVEN`; `PipelineTask`→`PipelineWorker`.
- **D. Provider matrix** — every STT/LLM/TTS/realtime/vision/avatar provider and the one method each overrides.
- **E. Coverage matrix (below).**
- **F. `utils/` reference** — the helper library (text filters, tracing, string/time utils) indexed to the lessons that use it.

### Appendix E — Coverage matrix (every package + fundamentals/eval doc → lesson)

| `src/pipecat` package | Lesson(s) |
|---|---|
| `frames/` | 3 |
| `processors/` (core) | 4 |
| `processors/filters/`, `idle_frame_processor`, `logger`, `text_transformer`, producer/consumer, `async_generator` | 4 |
| `processors/audio/` (VAD processor, buffer) | 7, 22 |
| `processors/aggregators/` | 9, 12, 13, 21 |
| `processors/gstreamer/` | 16 |
| `processors/frameworks/rtvi/` | 23, 29 |
| `processors/frameworks/` (langchain, strands) | 32 |
| `pipeline/` (pipeline, parallel, sync‑parallel, worker) | 5 |
| `pipeline/service_switcher`, `llm_switcher` | 20 |
| `pipeline/job_context`, `job_decorator` | 27 |
| `workers/` (base, llm, runner) | 5, 25, 26, 27 |
| `workers/ui/`, `workers/proxy/` | 29, 28 |
| `bus/` (+ local/network/ui/serializers/adapters) | 24, 28 |
| `registry/` | 25 |
| `runner/` | 30 |
| `serializers/` | 30 |
| `transports/` | 6, 16, 30 |
| `audio/` (vad, turn, resamplers, mixers, filters, dtmf, volume) | 7, 10, 14 |
| `turns/` | 10 |
| `services/` (stt/tts/llm/vision/image/settings/mcp/websocket) | 8, 11, 12, 13, 15, 16, 18 |
| `adapters/` | 11, 12 |
| `transcriptions/` | 8 |
| `clocks/` | 6 |
| `metrics/` | 23 |
| `observers/` | 23 |
| `flows/` | 19 |
| `extensions/` (ivr, voicemail) | 31 |
| `evals/` | 34 |
| `tests/` | 34 |
| `utils/` | Appendix F (referenced throughout) |
| `cli/` | 33 |

| Fundamentals / Evals doc | Lesson |
|---|---|
| service‑settings | 11 |
| custom‑frame‑processor | 4 |
| interruptions | 20 |
| user‑input‑muting | 10 |
| detecting‑user‑idle | 20 |
| stt‑latency‑tuning | 8 |
| context‑summarization | 21 |
| saving‑transcripts | 22 |
| recording‑audio | 22 |
| metrics | 23 |
| voicemail | 31 |
| ivr | 31 |
| agent‑bus | 24 |
| understanding‑the‑bus‑bridge | 24 |
| agent‑registry‑and‑discovery | 25 |
| Evals (harness/judge/scenario/suite) | 34 |

---

## Open questions for you to mark up
1. **Optional side‑quests** — keep avatars (L16), thinking (L17), integrations (L32) in the main spine, or mark them optional?
2. **Capstone providers** — all specialists on Gemini Live, or mix a cheaper text LLM for fan‑out workers?
3. **Depth ceiling** on internals (audio‑context ordering, bus priority queues, RTVI models): full vs "enough to use".
4. Anything still missing, or any lesson you'd split/merge?
