# Production stacks of hosted cascaded voice-agent platforms (excluding ElevenLabs), as of November 2026

Research date: 2026-11-17. All prices are list prices read from vendor pages via search excerpts in November 2026 unless a different date is given. "Vendor claim" means the number is self-reported and not independently verified. Several secondary sources used here are vendor blogs writing about competitors (Bland on Vapi, Cartesia on Retell, Telnyx on Twilio, LiveKit on Retell/Vapi, AssemblyAI on Cartesia); they are flagged where used, and were only used for facts they quote from the competitor's own pages.

## 1. Layer-by-layer stack of each platform (transport, orchestration, STT, LLM, TTS, turn detection, telephony)

### Takeaway
The field splits into three architectural shapes: (a) proprietary orchestration layers that resell third-party STT/LLM/TTS (Vapi, Retell, Twilio ConversationRelay, Synthflow), (b) model owners that wrap their own speech models in a hosted agent runtime (Deepgram, Cartesia, AssemblyAI, Bland, Sarvam, Telnyx partly), and (c) open-source-framework clouds where the customer ships agent code and brings models (LiveKit Cloud, Pipecat Cloud). Turn detection has moved from VAD-silence timers to dedicated models in almost every stack (Vapi fusion model, LiveKit turn detector, Pipecat Smart Turn, Deepgram Flux, Cartesia Ink-2, AssemblyAI semantic endpointing).

### Cited Findings

#### Comparison table (stack by layer)

| Platform | Transport | Orchestration | STT | LLM | TTS | Turn detection / interruption | Telephony |
|---|---|---|---|---|---|---|---|
| Vapi | SIP, telephony, WebSocket, WebRTC "via LiveKit/Daily" | Proprietary orchestration layer; not swappable, runs only on Vapi infra | 11 third-party providers (AssemblyAI, Azure, Cartesia, Deepgram, ElevenLabs, Gladia, Google, OpenAI, Soniox, Speechmatics, xAI); Deepgram default in calculator | Third-party (OpenAI, Anthropic, Google, Groq...) or custom OpenAI-compatible endpoint | Third-party (ElevenLabs default in calculator, Cartesia, etc.) | Proprietary "fusion audio-text" endpointing model + custom interruption model; alternatively Deepgram Flux, AssemblyAI, or LiveKit turn detector as "smart endpointing" provider | Free Vapi numbers/SIP; Twilio, Vonage, Telnyx, Plivo; import from Twilio/Telnyx/DIDWW |
| Retell AI | Phone number, SIP trunk, or web | Proprietary orchestration layer | Bundled in "Voice Infra" fee (no separate STT charge); custom STT mode can name Deepgram | 36+ third-party models (OpenAI, Anthropic, Google) priced per minute; own LLM "Tell 1" (beta); custom LLM over WebSocket | Retell platform voices, ElevenLabs, Cartesia, OpenAI, MiniMax, Fish, Inworld | Built-in end-of-turn detection that cannot be swapped; responsiveness / interruption-sensitivity sliders | Retell-managed Twilio/Telnyx numbers or custom SIP |
| Bland AI | Phone (PSTN/SIP), SMS, web chat | Proprietary; "Conversational Pathways" | In-house | In-house, no token charges | In-house (Bland Speech v3) | In-house (custom inference engines, speculative decoding) | Claims to own telephony layer; BYO carrier or Bland's at pass-through |
| Deepgram Voice Agent API | Single WebSocket (`wss://agent.deepgram.com/v1/agent/converse`) | Proprietary, hosted or self-hosted | Own (Flux, Nova-3) | Managed LLM, or BYO: OpenAI, Anthropic, AWS Bedrock, Google, Groq, NVIDIA, custom endpoint | Own (Aura-2, Flux TTS) or BYO OpenAI, ElevenLabs, Cartesia, Amazon Polly | Flux model-integrated end-of-turn (~260 ms), no separate VAD needed | None native; customer connects calls via own app server (e.g. Twilio) |
| LiveKit Cloud | WebRTC (global mesh SFU) + SIP | LiveKit Agents (open source), hosted | Via LiveKit Inference (AssemblyAI, Deepgram, Cartesia...) or plugins | LiveKit Inference: third-party plus self-hosted open-weight Gemma 4 31B | Via Inference (Cartesia, Fish Audio, Inworld...) or plugins | LiveKit audio turn detector (v1 on Inference, v1-mini local CPU) + Silero VAD; adaptive interruption model | Native LiveKit Phone Numbers, direct PSTN carrier links, external SIP trunks |
| Pipecat Cloud (Daily) | Daily WebRTC, WebSocket, SIP/PSTN | Pipecat (open source), customer ships a container image | BYO, 80+ providers | BYO | BYO | Smart Turn v3.x (open model) + Silero VAD; Krisp VIVA noise/voice filtering | Daily SIP/PSTN dial-in/out; Twilio, Telnyx, Plivo, Exotel via WebSocket serializers |
| Cartesia (Line / Managed Agents) | WebSocket and telephony | Proprietary Managed Agents; open-source Line SDK for self-hosted code | Own (Ink-2, Ink-Whisper) | Managed LLM catalog (third-party, token passthrough); Line SDK used LiteLLM (100+ providers) | Own (Sonic 3.5/3.6) | Ink-2 emits turn events (turn.start, turn.eager_end, turn.end); semantic endpointing | Cartesia numbers, BYO Twilio, SIP trunking (beta) |
| AssemblyAI | Single WebSocket (Voice Agent API); components over WebSocket/HTTP | Voice Agent API (hosted; being retired per pricing page) or customer's LiveKit/Pipecat/Vapi | Own (Universal-3.6 Pro Realtime) | LLM Gateway (third-party, per token) | Own (AssemblyAI-TTS-1) | Server-side turn detection; acoustic + semantic endpointing | Twilio SIP, Telnyx integrations |
| Telnyx Voice AI Agents | Own carrier network, WebRTC, SIP | Proprietary agent runtime | Telnyx STT, Deepgram (Telnyx-hosted) | Open-weight models on owned GPUs (e.g. Kimi), or Anthropic/OpenAI | Telnyx Ultra/Natural, Qwen3TTS, Inworld, Rime, Resemble, Murf; ElevenLabs/Azure via BYO key | Built into runtime (details not published) | Own licensed carrier network |
| Twilio ConversationRelay | Twilio Voice call bridged to customer WebSocket (text in/out) | Twilio handles STT/TTS/interruption; customer hosts LLM/agent logic | Google or Deepgram (Nova-2/Nova-3, Flux) | BYO, mandatory | Google, Amazon, ElevenLabs | Deepgram Flux `eotThreshold`; adjustable interruption sensitivity | Twilio Programmable Voice |
| Synthflow | Phone, web chat, SMS, WhatsApp | Proprietary no-code platform | Not disclosed (third-party source says Deepgram/OpenAI) | Mix of own and outside models (per a competitor's characterisation) | Not disclosed | Not disclosed | Own telephony: in-house SBCs and media servers; SIP trunking |
| Hume EVI | WebSocket | Proprietary speech-language model | Own ASR | Own speech-language model; EVI 4-mini requires an external LLM | Own (Octave 2 in EVI 4-mini) | Prosody-based, "always interruptible" | Twilio guide only |
| Sarvam Voice Agents (formerly Samvaad) | Telephony-first | Proprietary | Own (Saaras v3/v4) | Own (Sarvam-105B) plus hosted open-weight models | Own (Bulbul v3 / v4 Flash) | VAD tuning in realtime STT API; rest not disclosed | BYO Exotel, Smartflo, Plivo, Twilio, Vobiz, SIP; Sarvam numbers via Vobiz |

#### Vapi
- Vapi describes itself as "an orchestration layer over three modules: the transcriber, the model, and the voice", each swappable with any provider — [Vapi docs: Core Models](https://docs.vapi.ai/quickstart)
- On top of STT/LLM/TTS Vapi runs its own real-time models: endpointing ("custom fusion audio-text model"), interruption detection, background noise filtering, background voice filtering, backchanneling, emotion detection, filler injection — [Vapi docs: Orchestration Models](https://docs.vapi.ai/how-vapi-works)
- The orchestration layer is "Vapi only": no BYOK and no custom server; it "runs exclusively on Vapi infrastructure". Transport, transcriber, LLM, voice and storage all support BYOK or custom servers — [Vapi docs: Data Flow](https://docs.vapi.ai/security-and-privacy/data-flow)
- Transport types listed: SIP, telephony (Twilio, Telnyx, Plivo), WebSocket, and WebRTC "via LiveKit/Daily" — [Vapi docs: Data Flow](https://docs.vapi.ai/security-and-privacy/data-flow)
- Transcriber providers (11): AssemblyAI, Azure, Cartesia, Deepgram, ElevenLabs, Gladia, Google, OpenAI, Soniox, Speechmatics, xAI — [Vapi docs: Transcribers](https://docs.vapi.ai/providers/transcriber/overview)
- Smart-endpointing guidance: Deepgram Flux when Deepgram is the transcriber; AssemblyAI when it is the transcriber; LiveKit's model for English when Deepgram is not used; Vapi's own for non-English or rule-based; or a custom endpointing model on the customer's server — [Vapi docs: Voice pipeline configuration (dated 2026-10-27)](https://docs.vapi.ai/customization/voice-pipeline-configuration)
- Vapi also exposes OpenAI "GPT-Live" assistants in beta (speech-to-speech), per a third-party pricing tracker reading Vapi's pages on 14 Nov 2026 — [Lexicost](https://lexicost.com/voice-agents/vendors/vapi)

#### Retell AI
- Retell names four layers per agent (telephony, STT, LLM, TTS) and says it "handles turn-taking, interruptions, and background noise between the layers" — [Retell docs: Introduction](https://docs.retellai.com/general/introduction)
- Orchestration layer features: provider fallback, streaming noise filtering, echo cancellation, endpointing and context-aware turn-taking, interruption handling, backchanneling, voicemail detection, transfer, DTMF — [Retell docs: Orchestration Overview](https://docs.retellai.com/general/orchestration_overview)
- Retell's end-of-turn detection is built in and cannot be swapped; tuning is through `responsiveness`, `interruption_sensitivity`, `enable_dynamic_responsiveness`; a custom STT mode accepts `{"provider": "deepgram", "endpointing_ms": ...}` — [LiveKit blog comparison, 2026-10-06 (competitor source quoting Retell's API)](https://livekit.com/blog/retell-vs-vapi-vs-livekit)
- TTS options on the pricing page: Retell Platform Voices, MiniMax, Fish, ElevenLabs (Flash, Multilingual v2, v3, v3 Conversational, v4, v4 Turbo), Cartesia, OpenAI, Inworld; LLM list includes OpenAI, Anthropic and Google models plus Retell's own "Tell 1" (beta) and custom LLM — [Retell pricing](https://www.retellai.com/pricing)
- Retell also offers speech-to-speech models (GPT Realtime family, Grok Voice 3.0, GPT-Live 1) as an alternative to the standard pipeline; Tell-1 "answers right away and reasons while it speaks" — [Retell blog, 2026-10-23](https://www.retellai.com/blog/best-speech-to-speech-ai-apis-phone-calls)
- Custom LLM integration opens one WebSocket per call to the customer's server; Retell keeps transcription, turn-taking, synthesis and the call — [Dasha blog, 2026-10-29 (third party)](https://dasha.ai/blog/vapi-vs-retell)

#### Bland AI
- "Voice, LLM, text-to-speech, speech-to-text. All in-house." — [Bland: About](https://www.bland.ai/about)
- Bland claims to own telephony, STT, LLM, TTS and agent layers, running on "its own GPUs" — [Bland: Product](https://www.bland.ai/product)
- Bland's CIO describes custom inference engines, "low-latency speculative decoding pipelines", acoustic model adaptations, and TTS that begins synthesising before the LLM finishes a sentence — [Unite.AI interview with Juan E. Riojas, 2026-10-15](https://www.unite.ai/juan-e-riojas-chief-information-officer-at-bland-interview-series/)
- 40+ languages; channels include voice, SMS, web chat, iMessage (Enterprise) — [Bland llms-full.txt, updated 2026-10-09](https://www.bland.ai/llms-full.txt)

#### Deepgram Voice Agent API
- One WebSocket runs STT, LLM orchestration and TTS; Deepgram handles end-of-turn detection, barge-in and function calling — [Deepgram: Voice Agent API product page](https://deepgram.com/product/voice-agents)
- Endpoint is `wss://agent.deepgram.com/v1/agent/converse`; configuration is a `Settings` message — [Deepgram docs: Build a Voice Agent](https://developers.deepgram.com/docs/build-a-voice-agent)
- BYO LLM: OpenAI, Anthropic, AWS Bedrock, Google, Groq, NVIDIA or custom endpoint. BYO TTS: OpenAI, ElevenLabs, Cartesia, Amazon Polly — [Deepgram: Voice Agent API](https://deepgram.com/product/voice-agent-api)
- Flux is a streaming STT with model-integrated end-of-turn detection (~260 ms), `EagerEndOfTurn` events, built-in barge-in; multilingual variant covers 10 languages — [Deepgram docs: Flux quickstart](https://developers.deepgram.com/docs/flux/quickstart)
- Nova-3 is general-purpose ASR with no turn detection — [Deepgram docs: Models overview](https://developers.deepgram.com/docs/models-languages-overview)
- Every turn returns a latency report split into STT, LLM time-to-first-token, tool time and TTS — [Deepgram: Voice Agent API product page](https://deepgram.com/product/voice-agents)

#### LiveKit Cloud
- LiveKit Cloud combines a managed global mesh of LiveKit servers, Agent Builder, managed agent hosting, built-in inference, native telephony and observability — [LiveKit docs: LiveKit Cloud](https://docs.livekit.io/intro/cloud/)
- LiveKit Inference offers STT, LLM, TTS and realtime models from OpenAI, Google, AssemblyAI, Deepgram, Cartesia, Fish Audio, Inworld and others; zero data retention by default — [LiveKit docs: Inference](https://docs.livekit.io/agents/models/inference)
- "Over 50" voice AI models on Inference — [LiveKit: Inference product page](https://livekit.com/products/inference)
- Gemma 4 31B is the recommended default LLM, "a latency-optimized, open-weight model served on LiveKit's infrastructure" — [LiveKit docs: LLM overview](https://docs.livekit.io/agents/models/llm/)
- Other Inference LLMs are routed to third parties (e.g. DeepSeek via Baseten/Vercel, Gemini via Google) — [LiveKit docs: Inference](https://docs.livekit.io/agents/models/inference/)
- Turn detector: `v1` full model served on LiveKit Inference; `v1-mini` runs locally on CPU; default in `AgentSession`, paired with Silero VAD — [LiveKit docs: turn detector](https://docs.livekit.io/agents/logic/turns/turn-detector), [LiveKit docs: Turns overview](https://docs.livekit.io/agents/logic/turns)
- Adaptive interruption handling uses acoustic signals to separate barge-ins from backchannels; falls back to VAD-based interruption if Inference is unavailable — [LiveKit docs: Adaptive interruption](https://docs.livekit.io/agents/logic/turns/adaptive-interruption-handling), [LiveKit docs: Quotas](https://docs.livekit.io/deploy/admin/quotas-and-limits)
- Telephony: native LiveKit Phone Numbers; Krisp noise cancellation applied at the SIP trunk; LiveKit says it has "partnered with telephony carriers around the world to link LiveKit's network directly to the PSTN" — [LiveKit docs: LiveKit Cloud](https://docs.livekit.io/intro/cloud/), [LiveKit Series C post, 2026-01-22](https://livekit.com/blog/livekit-series-c)

#### Pipecat Cloud (Daily)
- Customer brings an agent image; the platform handles deploys, session starts, scaling and observability — [Pipecat docs: Pipecat Cloud introduction](https://docs.pipecat.ai/pipecat-cloud/introduction)
- 80+ BYO service providers for LLM/STT/TTS, billed by the provider; enterprise integrated billing for inference on request — [Daily: Pipecat Cloud pricing](https://www.daily.co/pricing/pipecat-cloud)
- Smart Turn v3.2: open-source audio-native turn detection, 23 languages, 8 MB int8 CPU model and 32 MB fp32 GPU model, works with Silero VAD, ~65 ms inference on a Pipecat Cloud 1x instance — [GitHub: pipecat-ai/smart-turn](https://github.com/pipecat-ai/smart-turn)
- Telephony: Daily SIP and PSTN dial-in/out; Twilio billed to provider; WebSocket telephony integrations lack transfers/reconnects, so those need the SIP/PSTN route — [Daily: Pipecat Cloud pricing](https://www.daily.co/pricing/pipecat-cloud), [Dograh blog, 2026-11-07 (third party)](https://www.dograh.com/hub/blogs/pipecat-cloud-pricing)

#### Cartesia
- Managed Agents "handles listening, turn-taking, interruptions, tool calls, and knowledge retrieval around the LLM of your choice" — [Cartesia docs: Managed Agents](https://docs.cartesia.ai/agents/introduction)
- Cartesia stops hosting code-first Line SDK agents on 1 December 2026; the Line SDK stays open source and usable self-hosted; managed LLMs now come from Cartesia's catalog with token usage billed as passthrough — [Cartesia docs: Migrate from the Line SDK](https://docs.cartesia.ai/agents/migrate-from-line-sdk)
- Line SDK used LiteLLM to reach 100+ LLM providers — [GitHub: cartesia-ai/line](https://github.com/cartesia-ai/line)
- Line agents default to Sonic 3.5 (TTS) and Ink 2 (STT); BYO Twilio and SIP trunking (beta) added in 2026 — [Cartesia changelog 2026](https://docs.cartesia.ai/changelog/2026)
- Ink-2 uses semantic endpointing and supports English, Spanish, French, Hindi, Japanese — [Cartesia: Ink](https://www.cartesia.ai/ink)
- Sonic is built on a State Space Model architecture rather than transformers — [Cartesia: Sonic](https://www.cartesia.ai/sonic)

#### AssemblyAI
- Voice Agent API launched 29 April 2026: "the complete voice agent pipeline, built on our own models top to bottom, behind a single WebSocket", $4.50/hr — [AssemblyAI blog](https://www.assemblyai.com/blog/introducing-our-voice-agent-api)
- AssemblyAI's pricing reference now says "The Voice Agent API is being retired. Don't quote it for new builds" and points to Universal-3.6 Pro Realtime + LLM Gateway + TTS API on LiveKit or Pipecat — [AssemblyAI pricing](https://www.assemblyai.com/pricing); the product page still describes it as a production stack — [AssemblyAI: Voice Agent API](https://www.assemblyai.com/products/voice-agent-api)
- Components: Universal-3.6 Pro Realtime (32 languages), AssemblyAI-TTS-1 (6 languages), LLM Gateway; positioned as the STT layer for LiveKit, Pipecat, Vapi — [AssemblyAI: Voice agents](https://www.assemblyai.com/solutions/voice-agents)

#### Telnyx
- Telnyx says it owns a private global MPLS network, co-located GPU clusters, and is a licensed carrier — [Telnyx: Voice AI Agents](https://telnyx.com/products/voice-ai-agents)
- Voice engine includes orchestration, hosted STT (Deepgram, Telnyx STT) and hosted TTS (Telnyx Ultra, Natural, NaturalHD, Qwen3TTS, Inworld, Rime, Resemble, Murf); LLM on "Telnyx owned GPUs" (Kimi cited) or managed Anthropic/OpenAI — [Telnyx: Voice AI pricing](https://telnyx.com/pricing/voice-ai-agents)
- Telnyx also sells a "Conversation Relay" product (text in/out over WebSocket, BYO AI) from $0.05/min — [Telnyx: Conversation Relay](https://telnyx.com/products/conversation-relay)

#### Twilio ConversationRelay
- `<Connect><ConversationRelay>` sends transcribed caller speech to the customer's WebSocket server and converts the text it returns into speech — [Twilio docs: ConversationRelay TwiML (modified 2026-11-05)](https://www.twilio.com/docs/voice/twiml/connect/conversationrelay)
- `transcriptionProvider`: Google or Deepgram; `ttsProvider`: Google, Amazon, ElevenLabs; `eotThreshold` applies only with Deepgram Flux — [Twilio docs: ConversationRelay TwiML](https://www.twilio.com/docs/voice/twiml/connect/conversationrelay)
- Twilio's AI nutrition labels name Deepgram Nova2 and ElevenLabs Flash 2 / 2.5 as base models — [Twilio docs: Conversation Relay](https://www.twilio.com/docs/voice/conversationrelay)
- Twilio invested in Deepgram's Series C — [Deepgram press release, 2026-01-13](https://deepgram.com/learn/press-release-deepgram-raises-series-c)

#### Synthflow
- Synthflow runs its own SBCs and media servers rather than relying on Twilio or Vonage — [Synthflow blog, 2025-10-24](https://synthflow.ai/blog/voice-ai-telephony-infrastructure)
- Regions shown: US, EU, and a Latin America point of presence — [Synthflow homepage](https://synthflow.ai/)

#### Hume EVI
- Hume is sunsetting the TTS and EVI APIs; access ended 13 November 2026 at 12:01 a.m. EST and account data is deleted after that date — [Hume docs: EVI overview](https://dev.hume.ai/voice/docs/speech-to-speech-evi/overview)
- Before sunset: EVI 3 (English, supplemental LLM optional) and EVI 4-mini (11 languages, supplemental LLM required); external LLMs from Anthropic, OpenAI, Google, Fireworks; custom language model via SSE `/chat/completions` — [Hume docs: EVI overview](https://dev.hume.ai/docs/speech-to-speech-evi/overview), [Hume docs: Custom Language Model](https://dev.hume.ai/docs/speech-to-speech-evi/guides/custom-language-model)
- EVI 4-mini paired Octave 2 TTS with a supplemental LLM of the developer's choice — [Releasebot: Hume release notes](https://releasebot.io/updates/hume)

#### Sarvam AI
- The product formerly called Conversations ("Samvaad") is now Voice Agents, "an end-to-end stack for building, deploying, and monitoring voice agents on telephony" — [Sarvam changelog, 2026-08-18](https://docs.sarvam.ai/changelog/2026/8/18)
- Saaras v4 STT: 22 Indian languages + English, five output modes; Bulbul v4 Flash TTS: 11 languages, 200+ voices — [Sarvam docs: Saaras](https://docs.sarvam.ai/api/getting-started/models/saaras), [Sarvam docs: Bulbul](https://docs.sarvam.ai/api/api-guides-tutorials/models/bulbul)
- Sarvam publishes LiveKit and Pipecat production-tuning guides and a Vapi integration guide — [Sarvam changelog, 2026-08-18](https://docs.sarvam.ai/changelog/2026/8/18)

### Inferences
- Vapi's recommendation of a competitor's (LiveKit) turn detector and of Deepgram Flux suggests turn detection is becoming a commodity model layer rather than a durable proprietary moat.
- Retell absorbing STT into a flat "Voice Infra" fee, while exposing only Deepgram in custom STT mode, suggests Deepgram is its primary STT supplier; this is not stated outright by Retell.
- Vapi listing "WebRTC via LiveKit/Daily" suggests it has added LiveKit as a WebRTC transport alongside the Daily infrastructure it launched on in 2023.
- AssemblyAI retiring its hosted agent endpoint within roughly six months of launch, Cartesia ending hosted code-first Line agents, and Hume shutting EVI all point the same way: speech-model vendors are retreating to component roles (or config-driven agents) and leaving code-level orchestration to LiveKit/Pipecat.

### Gaps
- Retell does not publish which STT models sit behind "Voice Infra", nor the architecture of its turn-taking model.
- Synthflow's STT/LLM/TTS vendors are not disclosed on the pages found; the only data point is a third-party benchmark listing "Deepgram / OpenAI" — [CreativeGenius, 2026-05-19](https://creativegenius.ai/research/voice-ai-benchmark-2026), low confidence.
- Bland's model architectures (sizes, base models, whether fine-tuned from open weights) are not public.
- Telnyx's turn-detection approach is not documented in the sources found.
- I did not find whether Vapi or Retell were originally built on Pipecat or LiveKit Agents. The only confirmed lineage is Vapi launching on Daily's WebRTC infrastructure (see section 5).

## 2. Who owns models end-to-end vs. who orchestrates third-party APIs

### Takeaway
Bland, Deepgram, Cartesia, AssemblyAI and Sarvam own their speech models; of these only Bland and Sarvam also claim an in-house LLM in the default path. Vapi, Twilio and Pipecat Cloud own no models in the STT/LLM/TTS path; Retell, LiveKit and Telnyx are hybrids that now self-host at least one model (Tell-1, Gemma 4, open-weight LLMs respectively).

### Cited Findings

| Platform | STT | LLM | TTS | Turn model | Classification |
|---|---|---|---|---|---|
| Bland | Own | Own | Own | Own | Full vertical |
| Sarvam | Own | Own (Sarvam-105B) + hosted open weights | Own | Not disclosed | Full vertical (Indic) |
| Deepgram | Own | Resold/managed or BYO | Own | Own (Flux) | Speech vertical, LLM outsourced |
| Cartesia | Own | Resold catalog, passthrough | Own | Own (Ink-2) | Speech vertical, LLM outsourced |
| AssemblyAI | Own | Gateway to third parties | Own | Own | Speech vertical, LLM outsourced |
| Hume (sunset) | Own | Own SLM + external | Own | Own | Speech vertical |
| Telnyx | Own + hosted Deepgram | Open-weight on own GPUs + resold | Own + partners | Own runtime | Infra vertical (network + GPUs), mixed models |
| LiveKit | Resold | Self-hosted open-weight Gemma 4 + resold | Resold | Own | Framework + infra, mostly resold models |
| Retell | Bundled third-party | Resold + own Tell-1 (beta) | Resold + "platform voices" | Own | Orchestrator, moving toward own LLM |
| Vapi | Resold | Resold | Resold | Own (plus third-party options) | Pure orchestrator |
| Twilio CR | Resold (Google, Deepgram) | None (BYO) | Resold (Google, Amazon, ElevenLabs) | Deepgram Flux | Telephony + relay |
| Pipecat Cloud | BYO | BYO | BYO | Own open model (Smart Turn) | Framework hosting |
| Synthflow | Not disclosed | Mixed | Not disclosed | Not disclosed | No-code orchestrator with own telephony |

- Bland: "We don't wrap anyone's models. We built our own." — [Bland: About](https://www.bland.ai/about)
- Bland's stated reasons for self-hosting: sub-1-second latency, data privacy boundaries, reliability; costs are GPU capital, scheduling, multi-region failover and carrying model maintenance — [Unite.AI interview, 2026-10-15](https://www.unite.ai/juan-e-riojas-chief-information-officer-at-bland-interview-series/)
- Deepgram lists Aura-2, Nova-3, Flux and the Voice Agent API as its own; all models can be deployed as cloud APIs or self-hosted — [Deepgram Series C release, 2026-01-13](https://deepgram.com/learn/press-release-deepgram-raises-series-c)
- Vapi's own models are limited to the orchestration layer; STT, LLM and TTS are "pass-through at cost" — [Vapi docs: Data Flow](https://docs.vapi.ai/security-and-privacy/data-flow), [Vapi pricing](https://vapi.ai/pricing)
- Retell lists its own LLM "Tell 1 Beta" at $0.035/min alongside third-party models — [Retell pricing](https://www.retellai.com/pricing)
- LiveKit: "We've also started to host our models across our data centers so they're colocated with the agents you deploy to LiveKit Cloud" — [LiveKit Series C post, 2026-01-22](https://livekit.com/blog/livekit-series-c)
- LiveKit serves Gemma 4 with SGLang, speculative decoding, full-precision weights, and deliberately low per-GPU load to avoid queueing — [LiveKit blog, 2026-07-02](https://livekit.com/blog/latency-optimized-inference-gemma-4-on-livekit)
- Telnyx: "Run frontier, open-weight models on owned GPUs" — [Telnyx: Voice AI Agents](https://telnyx.com/products/voice-ai-agents)
- Sarvam's per-minute agent rate "covers the application stack ... and the speech, language, and voice models behind it"; open-weight models (Gemma, GLM, DeepSeek, Kimi, Qwen) are served on Sarvam infrastructure — [Sarvam: Voice Agents pricing](https://www.sarvam.ai/products/voice-agents/pricing), [Sarvam docs: pricing](https://docs.sarvam.ai/api/getting-started/pricing)
- A Bland-authored comparison says Sierra combines "frontier, open-weight, and proprietary models", Decagon uses frontier models plus "Decagon Labs" models, and PolyAI, ElevenLabs and Synthflow "mix models of their own with outside ones" — [Bland blog, 2026-11-07 (competitor source)](https://www.bland.ai/blog/best-enterprise-ai-voice-solutions)
- Retell is a Cartesia customer and reports 2–3x faster time to first audio with Cartesia voices than the next best provider on its platform — [Cartesia blog, 2026-10-28 (supplier source)](https://www.cartesia.ai/learn/retell-pricing)

### Inferences
- Self-hosting open-weight LLMs is now the main lever orchestrators use to cut LLM latency and cost (LiveKit Gemma 4, Telnyx Kimi, Sarvam's Token Factory). Among the platforms surveyed, only Bland and Sarvam describe the default LLM as their own model; Retell's Tell-1 is the first sign of a pure orchestrator moving that way.
- "Owns the stack" claims are strongest for Bland; they are vendor statements and no independent audit of what Bland's models derive from was found.

### Gaps
- Whether Bland's or Retell's in-house LLMs are fine-tunes of open-weight models is not public.
- Retell "platform voices": provenance not found.

## 3. Published latency, scale and pricing

### Takeaway
Vendor latency claims (200 ms to 600 ms) are two to five times lower than independent phone-call measurements (roughly 0.9 s to 3 s), and the independent benchmarks disagree with each other on ranking. Platform fees cluster at $0.05–0.055/min for orchestrators, $0.01/min for framework hosting, and $0.05–0.14/min for bundled stacks.

### Cited Findings

#### Pricing table (USD list, November 2026)

| Platform | Platform / runtime fee | What it includes | Models | Typical all-in before telephony | Concurrency |
|---|---|---|---|---|---|
| Vapi | $0.05/min hosting | Hosting only | Pass-through at cost, no markup | $0.082–$0.129/min (calculator: Deepgram + OpenAI + ElevenLabs) | 4 free; 10 Core ($29/mo); 30 Pro ($999/mo min); +$10/line/mo |
| Retell | $0.055/min Voice Infra | Orchestration + STT | LLM $0.0016–$0.64/min; TTS $0.015–$0.10/min | $0.07–$0.31/min advertised; $0.11 default | 20 free; +$8/slot/mo |
| Bland | $0 (Start) / $299/mo (Build) | LLM + STT + TTS | Included | $0.14/min Start; $0.12 Build; ($0.11 Scale on bland.com) | 10 / 50 / (100) |
| Deepgram VA API | Bundled | STT + managed LLM + TTS | Included in Standard | $0.075/min Standard; $0.050 BYO LLM+TTS; $0.163 Advanced | Up to 45 PAYG; Growth up to 60 NA |
| LiveKit Cloud | $0.01/min agent session | Hosting; turn detector free when hosted | Inference per model | $0.0479/min example incl. $0.01 telephony and $0.01 observability | 5 / 20 / up to 600 |
| Pipecat Cloud | $0.01/min (agent-1x) | 0.5 vCPU/1 GB container; 1:1 WebRTC voice free | BYO, billed by provider | Not stated (depends on providers) | Unlimited (pool cap 50 per deployment by default) |
| Cartesia Managed Agents | $0.03/min (see conflict) | STT + TTS + orchestration | LLM billed separately | $0.03/min + LLM | 8 / 12 / 20 / 60 |
| AssemblyAI VA API | Bundled | STT + LLM + TTS | Included | $0.075/min ($4.50/hr); being retired | Not stated |
| Telnyx | $0.05/min voice engine | Orchestration + STT + TTS | LLM per token (Kimi ~$0.006/min) | ~$0.06/min | Not stated |
| Twilio CR | $0.07/min | STT + TTS relay | BYO LLM | $0.07 + voice + LLM | Not stated |
| Sarvam | ₹3.00–₹3.50/min | Everything except telephony | Included | ₹3.00–₹3.50/min, 60-second pulses | 30 on Growth |
| Synthflow | Annual enterprise contract | Scoped per deal | Not itemised | No public per-minute rate | Scoped |
| Hume EVI (sunset) | $0.04–$0.07/min (EVI 3), $0.02–$0.035 (EVI 4-mini) | Speech; external LLM extra | — | Last public rates, July 2026 | — |

- Vapi: $0.05/min hosting, models pass-through, calculator ranges Deepgram $0.0095–0.0099, OpenAI $0.0077–0.0452, ElevenLabs $0.0146–0.0238; Twilio transport $0.008 in / $0.014 out, Telnyx $0.0055, Vonage $0.00814; HIPAA add-on $2,000/mo — [Vapi pricing](https://vapi.ai/pricing)
- Retell: Voice Infra $0.055/min; TTS $0.015 (Retell, Cartesia, OpenAI, MiniMax, Fish, Inworld) to $0.10 (ElevenLabs v3/v4); speech-to-speech GPT Realtime $0.345–$0.38/min, mini $0.07, Grok Voice 3.0 $0.135, GPT-Live 1 $0.05 + backend LLM — [Retell pricing](https://www.retellai.com/pricing)
- Retell telephony $0.015/min US on Retell-managed numbers, free for custom SIP; add-ons $0.005–$0.01/min each; concurrency beyond 20 at $8/slot/month — [Dasha blog, 2026-10-27](https://dasha.ai/blog/retell-ai-pricing), [aivoiceagentvendors.com](https://aivoiceagentvendors.com/vendors/retell-ai)
- Bland: Start $0.14/min, Build $0.12/min + $299/mo, Enterprise custom; "No token charges. No model-provider pass-throughs." — [Bland pricing (bland.ai)](https://www.bland.ai/pricing). The bland.com variant adds a Scale tier at $0.11/min + $499/mo and lists telephony as included — [Bland pricing (bland.com)](https://bland.com/pricing). Bland's own blog says phone is billed separately at carrier cost and that an earlier flat $0.09 rate was replaced in December 2025 — [Bland blog, 2026-11-07](https://www.bland.ai/blog/best-enterprise-ai-voice-solutions)
- Deepgram Voice Agent: Standard $0.075, Standard BYO TTS $0.065, BYO LLM $0.065, BYO LLM+TTS $0.050, Advanced $0.163 per minute of WebSocket connection time; Growth tier about 10% lower — [Deepgram pricing](https://deepgram.com/pricing)
- LiveKit: agent session $0.01/min; plans $0 / $50 / $500 with 1,000 / 5,000 / 50,000 included minutes; Gemma 4 31B $0.0014/min; AssemblyAI Universal-3.6 Pro Streaming $0.0075/min; Fish Audio S2.1 Pro $0.0090/min; US inbound $0.01/min; turn detection $0.50 per 1,000 requests and adaptive interruption $1.20 per 1,000 for self-hosted agents — [LiveKit pricing](https://livekit.com/pricing)
- Pipecat Cloud: agent-1x $0.01 active / $0.0005 reserved per minute; agent-2x $0.02; agent-3x $0.03; Daily PSTN $0.018/min; SIP $0.003–$0.02; Krisp VIVA free to 10k min/month then $0.0015; recording $0.005/min — [Daily: Pipecat Cloud pricing](https://www.daily.co/pricing/pipecat-cloud)
- Cartesia Managed Agents: docs say $0.03/min plus $0.014 telephony, LLM extra — [Cartesia docs: pricing](https://docs.cartesia.ai/pricing); the pricing page shows "$0.06" struck through to $0.03 — [Cartesia pricing](https://www.cartesia.ai/pricing); third parties writing in October/November 2026 still quote $0.06 — [AssemblyAI blog, 2026-11-03](https://www.assemblyai.com/blog/assemblyai-vs-cartesia-voice-agents)
- AssemblyAI: Universal-3.6 Pro Realtime $0.45/hr, TTS $15 per 1M characters, billed on WebSocket-open duration — [AssemblyAI: Voice agents](https://www.assemblyai.com/solutions/voice-agents), [AssemblyAI docs: billing](https://www.assemblyai.com/docs/billing-and-pricing)
- Telnyx: $0.05/min voice engine; "a production agent lands near $0.06 per minute"; SIP from $0.0032/min inbound — [Telnyx: Voice AI pricing](https://telnyx.com/pricing/voice-ai-agents)
- Twilio ConversationRelay $0.07/min on top of voice ($0.0085 in / $0.014 out) — [Cekura blog, 2026-11-10](https://www.cekura.ai/blogs/telnyx-vs-twilio)
- Sarvam: ₹3.50 PAYG, ₹3.25 Pro, ₹3.15 Growth, ₹3.00 Business per 60-second pulse; BYO telephony free — [Sarvam: Voice Agents pricing](https://www.sarvam.ai/products/voice-agents/pricing)
- Synthflow has no per-minute rate, free plan or trial; annual enterprise agreements only — [Synthflow pricing](https://synthflow.ai/pricing)
- Hume last public EVI rates — [UsagePricing tracker](https://www.usagepricing.com/blueprint/hume-ai)
- Third-party worked example at 10,000 inbound minutes/month: LiveKit Ship $367, Vapi $818–$1,289, Retell $932–$1,092, Bland Build $1,584 (arithmetic from list rates, October 2026) — [iimagined.ai, 2026-07-09](https://iimagined.ai/blog/best-voice-ai-platforms-2026)

#### Latency: vendor claims

| Platform | Claim | Source |
|---|---|---|
| Vapi | "<500ms average latency" (homepage); "Sub-600ms response times" (docs intro); "<500-700ms" voice-to-voice target; docs FAQ ~800 ms end-to-end | [Vapi homepage](https://vapi.ai/), [Vapi docs intro](https://docs.vapi.ai/quickstart/introduction), [Vapi docs](https://docs.vapi.ai/quickstart), [Lexicost](https://lexicost.com/voice-agents/vendors/vapi) |
| Retell | ~600 ms | [Retell homepage](https://www.retellai.com/) |
| Bland | ~200 ms response time | [Bland homepage](https://www.bland.ai/) |
| Deepgram | Flux end-of-turn ~260 ms; Aura-2 sub-200 ms TTFB; Speak v2 "as low as 80 ms"; no end-to-end figure published | [Deepgram docs: Flux](https://developers.deepgram.com/docs/flux/quickstart), [Cekura blog](https://www.cekura.ai/blogs/deepgram-api), [Deepgram blog](https://deepgram.com/blog/real-time-voice-ai-stack-agents-architecture-guide) |
| LiveKit | Gemma 4 TTFT 192 ms vs 802–1,006 ms for GPT-4.1 mini / GPT-4.1; time to first sentence 354 ms | [LiveKit: Gemma 4](https://livekit.com/products/inference/gemma-4) |
| Cartesia | Sonic sub-90 ms model latency; Ink-2 0.1 s to final transcript | [Cartesia: Sonic](https://www.cartesia.ai/sonic), [Cartesia: Ink](https://www.cartesia.ai/ink) |
| AssemblyAI | 307 ms median time to final transcript (Pipecat open benchmark); ~90 ms TTS first audio | [AssemblyAI: Voice agents](https://www.assemblyai.com/solutions/voice-agents) |
| Telnyx | Sub-200 ms round trip; inference "sub-100ms" | [Telnyx: Voice AI Agents](https://telnyx.com/products/voice-ai-agents) |
| Twilio CR | <0.5 s median, <0.725 s p95 (internal benchmark) | [Twilio: ConversationRelay](https://www.twilio.com/en-us/products/conversational-ai/conversationrelay) |
| Synthflow | Replies within 500 ms | [Synthflow homepage](https://synthflow.ai/) |

#### Latency: independent or semi-independent measurements

| Benchmark | Method | Results |
|---|---|---|
| Openbenchmarks (2026) | TTFAB from dual-channel recordings of real phone calls, ~430 turns each | Telnyx 1,296 ms p50 / 1,856 p95; ElevenLabs 1,424 / 1,768; Bland 1,520 / 2,248; Vapi 1,558 / 2,008; Retell 1,740 / 2,259 — [Openbenchmarks](https://openbenchmarks.com/voice-agent-latency) |
| Telnyx benchmark, Oct 2026 (vendor-run, open repo) | Last caller sound to first agent sound, ~50 calls each | Telnyx 880 ms p50; Retell 1,000; ElevenLabs 1,340; LiveKit 1,780; Vapi 2,180 — [GitHub: team-telnyx/benchmark](https://github.com/team-telnyx/benchmark/blob/main/voice-ai/2026-10-first-response-latency/report/REPORT.md) |
| Cekura workflow benchmark, updated 3 Nov 2026 | Same agent brief, 82 scenarios x 3 runs, each platform picks own models | Mean response: ElevenLabs 1.27 s; GPT Realtime 1.58; Telnyx 1.82; Pipecat 1.97; Retell 2.21; PolyAI 2.46; LiveKit 2.59; Smallest AI 2.71; Gemini Live 3.05; Vapi 3.08. Pass-all-3-runs: PolyAI 87.8%, Retell 75.6%, LiveKit 70.7%, ElevenLabs 69.5%, Telnyx 68.3%, GPT Realtime 64.6%, Pipecat 63.4%, Vapi 59.8%, Gemini Live 30.5% — [Cekura Bench](https://benchmarks.cekura.ai/voice-agent-workflows), [Cekura blog](https://www.cekura.ai/blogs/benchmarking-language-models-for-real-world-voice-agent-performance-with-cekura) |
| Cekura production voice quality | 9 live production agents, 270 calls | Median latency: Retell 2.38 s; Bland 2.62; Cresta 2.78; PolyAI 2.99; ElevenLabs 3.08; Decagon 3.13; Vapi 3.34; Sierra 3.42; Cognigy 3.76. Bland stopped fastest after barge-in (0.62 s) — [Cekura Bench](https://benchmarks.cekura.ai/experiments/production-voice-agents) |
| CreativeGenius (agency, May 2026) | 12,400 production calls, server-side logs | p50: custom Twilio+Deepgram+Realtime 540 ms; Vapi 620; Retell 680; Bland 720; Synthflow 880 — [CreativeGenius](https://creativegenius.ai/research/voice-ai-benchmark-2026) |
| Vertical AI (Sydney) | TTS first audio on live calls | Cartesia 448 ms median / 604 p90; ElevenLabs 499 / 842 — [VerticalAI, 2026-10-06](https://verticalai.com.au/guides/cartesia-ai) |

- In the Cekura workflow benchmark, 41 of Vapi's 246 calls did not connect and count as failures — [Cekura blog](https://www.cekura.ai/blogs/benchmarking-language-models-for-real-world-voice-agent-performance-with-cekura)
- Openbenchmarks found Vapi's "goodbye" turn showed false starts (399 ms reply duration, start-stop-resume) — [Openbenchmarks](https://openbenchmarks.com/voice-agent-latency)
- A third-party roundup notes the two independent benchmarks reverse the apparent winner (Retell fastest in one, slowest in the other) — [Mercury, 2026-08-24](https://manifesto.mercury.build/blog/best-ai-voice-agents)

#### Scale

| Platform | Figure | Date | Source |
|---|---|---|---|
| Vapi | 3M+ calls/day (~1B/year run rate); "1 Billion calls supported"; 2.5M+ agents; 1M+ developers; ~90 employees | Oct 2026 | [Axiom customer story](https://axiom.co/customers/vapi), [Vapi homepage](https://vapi.ai/) |
| Retell | $100M annualised run rate; 100M+ connected calls/month; 4,000 businesses; <80 employees; $4.6M total funding; profitable since 2025 | 12 Nov 2026 | [BusinessWire](https://www.businesswire.com/news/home/20261111211785/en/Retell-Surpasses-%24100M-in-Annualized-Run-Rate-as-Enterprises-Take-Control-of-Voice-AI) |
| Bland | 796M+ calls to date; 71M+ calls/month; ~100 people; $50M+ raised; claims 1M simultaneous-call capacity; 250+ enterprise customers | 2026 | [Bland: About](https://www.bland.ai/about), [Bland homepage](https://www.bland.ai/), [Bland blog](https://www.bland.ai/blog/best-enterprise-ai-voice-solutions) |
| LiveKit | "Billions of calls a year"; 300,000+ developers; $100M Series C at $1B valuation | Jan 2026 / current site | [LiveKit Series C](https://livekit.com/blog/livekit-series-c), [LiveKit: Agents on Cloud](https://livekit.com/products/agent-cloud-deployment) |
| Deepgram | 200,000+ developers, 1,400 organisations; $130M Series C at $1.3B | Jan / Oct 2026 | [AWS ML blog, 2026-10-19](https://aws.amazon.com/blogs/machine-learning/how-deepgram-optimized-voice-ai-at-scale-with-aws-trainium/), [Deepgram release](https://deepgram.com/learn/press-release-deepgram-raises-series-c) |

### Inferences
- A vendor latency number is only comparable if it states the measurement boundaries. Vendor claims generally measure server-side from end-of-speech detection to first audio byte; independent phone tests include endpointing delay, carrier legs and jitter buffers, which explains most of the 2–5x gap.
- Retell's $100M run rate on ~100M calls/month implies roughly $0.08 of revenue per connected call ($100M / 12 months / 100M calls); against a $0.055/min infra fee this suggests the average connected call is short. This is my arithmetic, not a published figure.
- Vapi's call count (3M/day ≈ 90M/month) and Retell's (100M+/month) and Bland's (71M/month) are the same order of magnitude; none publish minutes.

### Gaps
- No platform publishes minutes of audio, only call counts.
- No Artificial Analysis end-to-end agent-platform benchmark was found in this pass; Artificial Analysis was referenced only for TTS/STT leaderboards by Cartesia.
- Deepgram publishes no end-to-end voice-to-voice number for the Voice Agent API (it says latency "varies with the models, network and configuration").
- The CreativeGenius benchmark is from a single agency and its methodology could not be verified; treat as low confidence.

## 4. Infrastructure: clouds, GPUs, Kubernetes, regions, on-prem/VPC, compliance

### Takeaway
Self-hosted or VPC deployment is available from Bland, Deepgram, Cartesia, Sarvam, Pipecat Enterprise and open-source LiveKit; Vapi explicitly does not offer on-prem. Kubernetes is confirmed for Vapi, Deepgram self-hosted, Pipecat Cloud and Bland's VPC deployments.

### Cited Findings

| Platform | Known infrastructure | Regions | Self-host / VPC | Compliance |
|---|---|---|---|---|
| Vapi | Kubernetes, AWS, Cloudflare, Prometheus, Grafana, Jaeger; Axiom for logs | Not stated | No on-prem (per FAQ, via third party) | HIPAA add-on $2,000/mo, GDPR stated, ZDR; HIPAA mode and ZDR cannot both be on |
| Retell | Not disclosed; "dedicated server" enterprise add-on | Not stated | No self-hosted edition | HIPAA, SOC 2 Type II, GDPR, ISO 27001 |
| Bland | Own GPU fleet; autoscaling Kubernetes on cloud GPU instances in VPC mode (AWS or GCP cited); bare metal on-prem | "Any region" | Bland cloud, customer cloud, on-prem | FedRAMP 20x Class A, ISO 27001, SOC 2 I/II, HIPAA, GDPR, PCI DSS self-attested |
| Deepgram | NVIDIA GPUs only for self-hosted; AWS Trainium2 for Nova-3 batch; Rust model server | Global, EU, India, Australia endpoints | Helm chart on customer Kubernetes; SageMaker; EC2/EKS/ECS G5/G6/G6e; PrivateLink | SOC 2 I/II, GDPR, PCI, HIPAA BAA for enterprise |
| LiveKit Cloud | Own global data-centre network; dedicated co-located GPUs for Gemma 4 | Agents: us-east (Virginia), eu-central (Frankfurt), ap-south (Mumbai) | Open-source server + agents self-hostable; AWS/Azure PrivateLink | "HIPAA-eligible services"; 99.99% uptime target |
| Pipecat Cloud | Kubernetes; Daily WebRTC mesh (10 regions, 30 AZs); on AWS Marketplace | US, Europe, India | Pipecat Enterprise: customer Kubernetes cluster, Daily control plane | SOC 2, HIPAA, GDPR |
| Cartesia | Custom inference engine; Sonic 3 on Amazon SageMaker | Nearest-region routing | On-prem incl. air-gapped, VPC on AWS/GCP/Azure, OEM | DPAs and BAAs on Enterprise |
| Telnyx | Private MPLS network, own co-located GPU clusters at telephony PoPs | EU infrastructure cited | Not found | SOC 2 Type II, HIPAA, PCI DSS, ISO 27001, GDPR |
| Twilio CR | Twilio network, 8 public edge locations | Global | No | PCI caveats per STT/TTS vendor |
| Synthflow | Own SBCs and media servers | US, EU, LatAm PoP | Not found | Enterprise security review |
| Sarvam | Own infrastructure for open-weight models; AWS Marketplace/SageMaker for self-hosting | India | Self-hosted Saaras v3, Bulbul v3, Sarvam Vision in customer AWS VPC | Not found |

- Vapi stack and team size — [Axiom customer story, 2026-10-16](https://axiom.co/customers/vapi)
- Vapi "does not support on-premise deployments" per its FAQ as read by a third party; Bland lists on-prem/VPC as Enterprise; Retell lists a dedicated server add-on but no self-hosted edition — [iimagined.ai](https://iimagined.ai/blog/best-voice-ai-platforms-2026)
- Vapi compliance details and retention tiers — [Lexicost, read 14 Nov 2026](https://lexicost.com/voice-agents/vendors/vapi)
- Retell compliance — [Retell homepage](https://www.retellai.com/)
- Bland deployment modes (Bland cloud, customer cloud, on-prem), 99.999% contractual uptime claim for enterprise, dedicated GPUs — [Bland homepage](https://www.bland.ai/); VPC uses "autoscaling kubernetes clusters backed by cloud GPU instances" and on-prem uses dedicated bare metal — [Unite.AI interview](https://www.unite.ai/juan-e-riojas-chief-information-officer-at-bland-interview-series/); certifications — [Bland llms-full.txt](https://www.bland.ai/llms-full.txt)
- Bland uptime SLA is listed as 99.9% on bland.ai and "99% Uptime SLA" on bland.com — [bland.ai pricing](https://www.bland.ai/pricing); contradicted by [bland.com pricing](https://bland.com/pricing)
- Deepgram self-hosted voice agent via Helm chart, with STT, TTS and turn detection in the customer environment and the LLM at the customer's endpoint — [Deepgram: Voice Agent API](https://deepgram.com/product/voice-agents); NVIDIA-only, dedicated GPUs, no MIG — [Deepgram docs](https://developers.deepgram.com/docs/self-hosted-deployment-environments); AWS options — [Deepgram + AWS](https://deepgram.com/partners/aws); Trainium2 port gave 11–70% more audio per dollar on batch — [AWS ML blog](https://aws.amazon.com/blogs/machine-learning/how-deepgram-optimized-voice-ai-at-scale-with-aws-trainium/)
- LiveKit agent deployment regions — [LiveKit: Agents on Cloud](https://livekit.com/products/agent-cloud-deployment); EU inference region restriction — [LiveKit docs: Inference](https://docs.livekit.io/agents/models/inference); self-hosted vs Cloud table (single-home SFU up to ~3,000 users per room vs global mesh) — [LiveKit docs](https://docs.livekit.io/intro/cloud/)
- Pipecat Cloud: Daily-hosted regions in US, Europe, India; Enterprise runs agents in a customer Kubernetes cluster with secrets staying in-cluster — [Pipecat docs](https://docs.pipecat.ai/pipecat-cloud/introduction), [Pipecat Enterprise](https://docs.pipecat.ai/pipecat-cloud/enterprise/overview); "takes care of k8s, scaling, observability", SOC2/HIPAA/GDPR — [AWS Marketplace listing](https://aws.amazon.com/marketplace/pp/prodview-2uq3wv62gyldg); Daily network footprint — [Daily features](https://www.daily.co/features/)
- Cartesia deployment options — [Cartesia: Sonic](https://www.cartesia.ai/sonic), [Cartesia: Ink](https://www.cartesia.ai/ink); Sonic 3 on SageMaker in Sydney — [VerticalAI](https://verticalai.com.au/guides/cartesia-ai)
- Telnyx compliance and network — [Telnyx blog, 2026-07-31](https://telnyx.com/resources/voice-ai-orchestration-tools); licensed-carrier count is 30+ on one Telnyx page and 45+ on another — [Cekura blog](https://www.cekura.ai/blogs/telnyx-vs-twilio)
- Sarvam self-hosted deployments on AWS — [Sarvam changelog, 2026-08-18](https://docs.sarvam.ai/changelog/2026/8/18)

### Inferences
- Only vendors that own their models can offer a fully self-contained on-prem voice stack; orchestrators that depend on third-party APIs (Vapi, Retell) offer dedicated servers or data-handling add-ons instead.
- Co-location of inference with media/telephony PoPs (Telnyx, LiveKit, Bland) is the common infrastructure answer to inter-vendor network hops.

### Gaps
- Retell's cloud provider, Kubernetes use and regions are not public in sources found.
- GPU vendors/cloud GPU providers for Bland, Cartesia, LiveKit and Telnyx are not named.
- No job-posting or conference-talk evidence was collected in this pass.
- Sarvam compliance certifications and data-centre details not found.

## 5. Open source and open-source lineage

### Takeaway
Two of the hosted platforms are clouds for permissively licensed frameworks (Pipecat BSD-2-Clause, LiveKit Agents open source); Cartesia's Line SDK is open source; the rest are closed. Vapi's confirmed lineage is Daily's WebRTC infrastructure, not a confirmed Pipecat build.

### Cited Findings
- Pipecat is BSD 2-Clause; Smart Turn is BSD 2-Clause with open datasets, training script and weights — [developersdigest (quoting the LICENSE)](https://www.developersdigest.tech/voice-agents/pipecat), [GitHub: pipecat-ai/smart-turn](https://github.com/pipecat-ai/smart-turn)
- "The LiveKit Agents framework is completely open source and available to run locally or host on your own infrastructure" — [LiveKit: Agents on Cloud](https://livekit.com/products/agent-cloud-deployment)
- LiveKit's `v1-mini` turn detector is free to run locally; the full `v1` is a metered Inference service for self-hosted agents — [LiveKit docs: turn detector](https://docs.livekit.io/agents/logic/turns/turn-detector)
- Cartesia's Line SDK is open source on GitHub and remains usable for self-hosted agents after Cartesia stops hosting it — [Cartesia docs](https://docs.cartesia.ai/agents/migrate-from-line-sdk), [GitHub: cartesia-ai/line](https://github.com/cartesia-ai/line)
- Vapi launched in November 2023 "leveraging Daily's global audio infrastructure & real-time AI toolkit", with Deepgram for STT — [Daily blog, 2023-11-09](https://www.daily.co/blog/daily-and-vapi-partner-to-deliver-ai-voice-assistants-as-an-api)
- Daily in 2024 listed Vapi and Tavus as platforms that "leverage Daily's WebRTC infrastructure", separately from "stand up your own Pipecat-based infrastructure" — [Daily blog, 2024-08-20](https://www.daily.co/blog/daily-bots-build-real-time-voice-vision-and-video-ai-agents)
- Dograh is an open-source voice agent platform built on a fork of Pipecat — [Dograh blog, 2026-11-07](https://www.dograh.com/hub/blogs/pipecat-cloud-pricing)
- SAP built its production voice agent on LiveKit Cloud with a cascading pipeline — [SAP Architecture Center, 2026-10-20](https://architecture.learning.sap.com/news/2026/10/20/voice-agent-architecture)
- Open-weight models in hosted stacks: Gemma 4 31B (LiveKit), Kimi and Qwen3TTS (Telnyx), Gemma/GLM/DeepSeek/Kimi/Qwen (Sarvam) — [LiveKit docs](https://docs.livekit.io/agents/models/llm/), [Telnyx pricing](https://telnyx.com/pricing/voice-ai-agents), [Sarvam docs](https://docs.sarvam.ai/api/getting-started/pricing)

### Inferences
- Speech-model vendors (AssemblyAI, Sarvam, Deepgram, Cartesia) all publish LiveKit and Pipecat integrations, which makes these two frameworks the de facto distribution channel for cascaded components.

### Gaps
- The exact LiveKit Agents licence string (Apache-2.0 per the assignment brief) was not re-verified from the repository in this pass; the sources found say only "open source".
- No evidence found that Vapi or Retell currently run on Pipecat or LiveKit Agents internally; Vapi's 2023 use of Daily's "real-time AI toolkit" predates or overlaps the naming of Pipecat and should not be equated with it without further evidence.

## 6. Cascaded vs speech-to-speech on these platforms, and why production stays cascaded

### Takeaway
Every orchestrator now offers speech-to-speech as an option (Retell, Vapi, LiveKit), but vendors and evaluators agree cascaded is still the production default because of observability, tool-calling maturity, component swap, compliance audit trails and cost; the latency advantage of speech-to-speech has narrowed and in some 2026 measurements has disappeared.

### Cited Findings
- LiveKit docs: "For most production agents, a cascaded pipeline is the right default"; cascaded offers mature tool calling, realtime transcription, scripted speech (`say()`), full text audit trail; realtime models are fastest and prosody-aware but have less mature tool calling and limited auditability — [LiveKit docs: Pipeline types](https://docs.livekit.io/agents/models/pipelines/)
- Coval: "Most production deployments in 2026 are cascaded"; typical end-to-end latency 600–1,200 ms cascaded vs 300–700 ms speech-to-speech; cascaded wins on per-stage evaluation — [Coval, 2026-05-01](https://coval.ai/blog/voice-ai-models-2026/)
- Hamming: cascades still win on transparency, debugging and compliance; keep cascades where line-by-line transcripts and deterministic tool calls are required — [Hamming, 2025-12-21 (older)](https://hamming.ai/blog/are-speech-to-speech-models-ready-to-replace-cascade-models)
- SAP moved from a WebSocket + speech-to-speech prototype to WebRTC + cascading pipeline on LiveKit Cloud, citing context-window limits over 10+ minute calls with verbose tool responses, swappable semantic turn detection, custom vocabulary in STT, and graceful per-component fallback — [SAP Architecture Center, 2026-10-20](https://architecture.learning.sap.com/news/2026/10/20/voice-agent-architecture)
- Cartesia (a cascade vendor) reports speech-to-speech models measuring 1,376–1,780 ms response in a benchmark, and cites a 2026 study estimating a from-scratch cascade at 958 ms median; "The latency gap that used to decide this has mostly closed" — [Cartesia, 2026-10-16](https://www.cartesia.ai/learn/speech-to-speech-vs-cascaded)
- arXiv tutorial (2603.05413): cascaded streaming pipeline is "the architecture used by all production voice agents (Vapi, Retell, Bland.ai, and systems built with Pipecat/LiveKit)"; open-weight native S2S (Qwen2.5-Omni) had ~13 s time-to-first-audio; realtime comes from streaming and pipelining, not any single fast model — [arXiv 2603.05413](https://arxiv.org/html/2603.05413)
- Cost: Retell prices GPT Realtime at $0.345–$0.38/min versus $0.0016–$0.064/min for most cascaded LLM choices plus $0.015 TTS — [Retell pricing](https://www.retellai.com/pricing)
- In Cekura's platform benchmark, GPT Realtime was second fastest (1.58 s) but 64.6% on repeatable reliability, and Gemini Live scored 30.5%, versus 68–88% for the leading cascaded platforms — [Cekura Bench](https://benchmarks.cekura.ai/voice-agent-workflows)
- Hybrid designs exist: "half-cascade" (realtime model listens, separate TTS speaks) and S2S with a backend text model (OpenAI GPT-Live delegates reasoning/tools); Retell prices GPT-Live 1 at $0.05/min plus backend LLM — [Evalgent, 2026-07-03](https://www.evalgent.com/blog/cascading-vs-speech-to-speech-voice-agents), [Retell pricing](https://www.retellai.com/pricing)
- Hume's EVI, the main "speech-language model with optional external LLM" hybrid, was shut down on 13 November 2026 — [Hume docs](https://dev.hume.ai/voice/docs/speech-to-speech-evi/overview)
- Soniox wiki: pipelines lose paralinguistic information at transcription; S2S models are harder to control, audit and swap, and tend toward single-vendor lock-in — [Soniox Voice AI Wiki, 2026-07-02](https://soniox.com/wiki/speech-to-speech-models-vs-pipelines)

### Inferences
- Speech-to-speech on these platforms is priced at 5–20x the LLM line of a cascaded agent at Retell's list prices, which alone would keep high-volume contact-centre traffic on cascades regardless of quality.
- The new full-duplex-plus-backend-LLM pattern (GPT-Live) is itself a partial return to a cascade, since reasoning and tools run in a separate text model.
- Dedicated turn-detection and interruption models (Flux, Smart Turn, LiveKit v1, Ink-2) have closed much of the conversational-naturalness gap that originally motivated speech-to-speech.

### Gaps
- The Kwindla Kramer "Voice AI & Voice Agents: An Illustrated Primer" and a16z market maps were not retrieved in this pass; no direct quotes from them are included.
- No platform publishes the share of its traffic running speech-to-speech versus cascaded.
- Most "cascaded still dominates" statements come from vendors or evaluators with a commercial interest in cascades (LiveKit, Cartesia, Coval, Hamming); SAP is the one end-user account found.

## 7. Status changes and other regional players worth flagging

### Takeaway
Three products in the assigned list changed status in 2026: Hume EVI was shut down, AssemblyAI's Voice Agent API is being retired, and Cartesia is ending hosted code-first Line agents in favour of config-driven Managed Agents.

### Cited Findings
- Hume EVI and Octave TTS APIs ended 13 November 2026; Hume now describes itself as "building the data and evaluation layer for emotionally intelligent voice AI" — [Hume docs](https://dev.hume.ai/voice/docs/speech-to-speech-evi/overview), [UsagePricing tracker](https://www.usagepricing.com/blueprint/hume-ai)
- Suggested EVI replacements in one migration guide: OpenAI Realtime, Gemini Live, ElevenLabs Realtime, Ultravox, Deepgram Voice Agent API — [Stork.AI, 2026-11-12](https://www.stork.ai/blog/hume-ai-alternatives-2026)
- AssemblyAI Voice Agent API "is being retired" — [AssemblyAI pricing](https://www.assemblyai.com/pricing)
- Cartesia stops hosting Line SDK agents 1 December 2026 — [Cartesia docs](https://docs.cartesia.ai/agents/migrate-from-line-sdk)
- Sarvam renamed Samvaad/Conversations to Voice Agents and raised Sarvam-105B pricing in August 2026 (₹29.28 / ₹73.2 per 1M input/output tokens) — [Sarvam changelog](https://docs.sarvam.ai/changelog/2026/8/18); the current pricing page shows ₹10 / ₹25 "introductory pricing" through end of 2026 — [Sarvam docs: pricing](https://docs.sarvam.ai/api/getting-started/pricing) (the two conflict; the pricing page is the more recent read)
- Other platforms appearing in independent benchmarks: PolyAI (top repeatable reliability, 87.8%), Smallest AI "Atoms" (56.1% pass, 2.71 s), Cresta, Decagon, Sierra, Cognigy — [Cekura Bench](https://benchmarks.cekura.ai/voice-agent-workflows), [Cekura production benchmark](https://benchmarks.cekura.ai/experiments/production-voice-agents)

### Inferences
- The hosted-agent layer is consolidating around orchestrators and framework clouds; speech-model vendors that tried a bundled agent endpoint either kept it narrow (Deepgram) or pulled back (AssemblyAI, Hume).

### Gaps
- No reliable data collected on Bolna, Gnani, Smallest.ai stack internals, or non-Indian regional players (e.g. China, Middle East, Europe-specific hosts).
- Reasons for Hume's and AssemblyAI's retirements were not found in primary sources.
