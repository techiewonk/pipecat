# Pipecat Examples — Full Inventory

Every runnable example in `examples/` — **380 Python files across 21 top-level folders**. Descriptions use each file's docstring where present, otherwise are derived from its filename and the Pipecat service classes it imports.

> Requested as step 1 of a two-part task. Part 2 (deferred): plan an **all-in-one A2A** build — **Gemini Live** provider, running **both** local (in-memory bus) **and** distributed (Redis/PGMQ) topologies. See the `multi-worker/` section for the building blocks.

## Contents

- [`getting-started/`](#getting-started) (10)
- [`voice/`](#voice) (68)
- [`function-calling/`](#function-calling) (45)
- [`transcription/`](#transcription) (23)
- [`realtime/`](#realtime) (26)
- [`update-settings/`](#update-settings) (91)
- [`flows/`](#flows) (12)
- [`multi-worker/`](#multi-worker) (19)
- [`persistent-context/`](#persistent-context) (8)
- [`context-summarization/`](#context-summarization) (4)
- [`turn-management/`](#turn-management) (10)
- [`thinking/`](#thinking) (9)
- [`mcp/`](#mcp) (4)
- [`vision/`](#vision) (7)
- [`video-avatar/`](#video-avatar) (6)
- [`video-processing/`](#video-processing) (6)
- [`transports/`](#transports) (5)
- [`features/`](#features) (18)
- [`audio/`](#audio) (3)
- [`observability/`](#observability) (3)
- [`rag/`](#rag) (3)

---

<a id="getting-started"></a>
## `getting-started/`  (10)

Progressive introduction to Pipecat, from a single spoken line to a full voice agent with function calling. `a`/`local` variants run audio on your machine instead of the browser.

| File | What it does |
|------|--------------|
| `01-say-one-thing.py` | Say one thing |
| `01a-local-audio.py` | Local: audio |
| `02-llm-say-one-thing.py` | Llm say one thing |
| `03-still-frame.py` | Still frame |
| `03a-local-still-frame.py` | Local: still frame |
| `04-sync-speech-and-image.py` | Sync speech and image |
| `05-speaking-state.py` | Speaking state |
| `06-voice-agent.py` | Voice agent |
| `06a-voice-agent-local.py` | Voice agent local |
| `07-function-calling.py` | Function calling |


<a id="voice"></a>
## `voice/`  (68)

Complete STT + LLM + TTS voice-agent pipelines, one per speech-service provider. `-http` = HTTP streaming TTS; `-turns` = provider turn detection; `-sagemaker` = models on AWS SageMaker; `-vad-only` = minimal VAD test bot.

| File | What it does |
|------|--------------|
| `voice-aicoustics-vad-only.py` | Minimal VAD-only test bot for AICQuailVADAnalyzer |
| `voice-aicoustics.py` | Full voice agent — Deepgram STT, OpenAI LLM, Cartesia TTS |
| `voice-assemblyai-turn-detection.py` | Full voice agent — AssemblyAI STT, OpenAI LLM, Cartesia TTS |
| `voice-assemblyai.py` | Full voice agent — AssemblyAI STT, OpenAI LLM, Cartesia TTS |
| `voice-asyncai-http.py` | Full voice agent — Deepgram STT, OpenAI LLM, Async.ai TTS — HTTP streaming |
| `voice-asyncai.py` | Full voice agent — Deepgram STT, OpenAI LLM, Async.ai TTS |
| `voice-aws-strands.py` | Full voice agent — AWS STT, AWS TTS |
| `voice-aws.py` | Full voice agent — AWS STT, AWS LLM, AWS TTS |
| `voice-azure-http.py` | Full voice agent — Azure STT, Azure LLM, Azure TTS — HTTP streaming |
| `voice-azure.py` | Full voice agent — Azure STT, Azure LLM, Azure TTS |
| `voice-camb.py` | Full voice agent — Deepgram STT, OpenAI LLM, Camb.ai TTS |
| `voice-cartesia-http.py` | Full voice agent — Cartesia STT, OpenAI LLM, Cartesia TTS — HTTP streaming |
| `voice-cartesia-turns.py` | Full voice agent — OpenAI LLM, Cartesia TTS — provider turn detection |
| `voice-cartesia.py` | Full voice agent — Cartesia STT, OpenAI LLM, Cartesia TTS |
| `voice-deepgram-flux-sagemaker.py` | Full voice agent — AWS LLM — Flux low-latency, on SageMaker |
| `voice-deepgram-flux.py` | Full voice agent — OpenAI LLM — Flux low-latency |
| `voice-deepgram-http.py` | Full voice agent — Deepgram STT, OpenAI LLM, Deepgram TTS — HTTP streaming |
| `voice-deepgram-sagemaker.py` | Full voice agent — AWS LLM — on SageMaker |
| `voice-deepgram.py` | Full voice agent — Deepgram STT, OpenAI LLM, Deepgram TTS |
| `voice-elevenlabs-http.py` | Full voice agent — ElevenLabs STT, OpenAI LLM, ElevenLabs TTS — HTTP streaming |
| `voice-elevenlabs.py` | Full voice agent — ElevenLabs STT, OpenAI LLM, ElevenLabs TTS |
| `voice-fal.py` | Full voice agent — Fal STT, OpenAI LLM, Cartesia TTS |
| `voice-fish.py` | Full voice agent — Deepgram STT, OpenAI LLM, Fish Audio TTS |
| `voice-funasr.py` | Full voice agent — FunASR STT, OpenAI LLM, Cartesia TTS |
| `voice-gladia-vad.py` | Full voice agent — Gladia STT, OpenAI LLM, Cartesia TTS — VAD-only |
| `voice-gladia.py` | Full voice agent — Gladia STT, OpenAI LLM, Cartesia TTS |
| `voice-google-audio-in.py` | Full voice agent — Google LLM, Google TTS |
| `voice-google-gemini-tts.py` | Full voice agent — Google STT, Google LLM, Google TTS |
| `voice-google-http.py` | Full voice agent — Google STT, Google LLM, Google TTS — HTTP streaming |
| `voice-google-image.py` | A conversational AI bot using Gemini for both LLM, STT and TTS |
| `voice-google.py` | Full voice agent — Google STT, Google LLM, Google TTS |
| `voice-gradium.py` | Full voice agent — Gradium STT, OpenAI LLM, Gradium TTS |
| `voice-groq.py` | Full voice agent — Groq STT, Groq LLM, Groq TTS |
| `voice-hume.py` | Full voice agent — Deepgram STT, OpenAI LLM, Hume TTS |
| `voice-inworld-http.py` | Full voice agent — Deepgram STT, OpenAI LLM, Inworld TTS — HTTP streaming |
| `voice-inworld.py` | Full voice agent — Deepgram STT, OpenAI LLM, Inworld TTS |
| `voice-kokoro.py` | Full voice agent — Deepgram STT, OpenAI LLM, Kokoro TTS |
| `voice-krisp-viva.py` | Interruptible bot with Krisp VIVA noise filtering, turn detection, and IP |
| `voice-langchain.py` | Full voice agent — Deepgram STT, Cartesia TTS |
| `voice-lmnt.py` | Full voice agent — Deepgram STT, OpenAI LLM, LMNT TTS |
| `voice-minimax.py` | Full voice agent — Deepgram STT, OpenAI LLM, MiniMax TTS |
| `voice-mistral.py` | Full voice agent — Mistral STT, OpenAI LLM, Mistral TTS |
| `voice-moonshine.py` | Full voice agent — Moonshine STT, OpenAI LLM, Cartesia TTS |
| `voice-neuphonic-http.py` | Full voice agent — Deepgram STT, OpenAI LLM, Neuphonic TTS — HTTP streaming |
| `voice-neuphonic.py` | Full voice agent — Deepgram STT, OpenAI LLM, Neuphonic TTS |
| `voice-nvidia-sagemaker.py` | Full voice agent — NVIDIA LLM — on SageMaker |
| `voice-nvidia-segmented.py` | Full voice agent — NVIDIA STT, NVIDIA LLM, NVIDIA TTS |
| `voice-nvidia.py` | Full voice agent — NVIDIA STT, NVIDIA LLM, NVIDIA TTS |
| `voice-openai-http.py` | Full voice agent — OpenAI STT, OpenAI LLM, OpenAI TTS — HTTP streaming |
| `voice-openai-responses-http.py` | Full voice agent — Deepgram STT, Cartesia TTS — Responses API, HTTP streaming |
| `voice-openai-responses.py` | Full voice agent — Deepgram STT, Cartesia TTS — Responses API |
| `voice-openai.py` | Full voice agent — OpenAI STT, OpenAI LLM, OpenAI TTS |
| `voice-piper.py` | Full voice agent — Deepgram STT, OpenAI LLM, Piper TTS |
| `voice-pockettts.py` | Full voice agent — Deepgram STT, OpenAI LLM, Pockettts TTS |
| `voice-resemble.py` | Full voice agent — Deepgram STT, OpenAI LLM, Resembleai TTS |
| `voice-rime-http.py` | Full voice agent — Deepgram STT, OpenAI LLM, Rime TTS — HTTP streaming |
| `voice-rime.py` | Full voice agent — Deepgram STT, OpenAI LLM, Rime TTS |
| `voice-sarvam-http.py` | Full voice agent — Sarvam STT, Sarvam LLM, Sarvam TTS — HTTP streaming |
| `voice-sarvam.py` | Full voice agent — Sarvam STT, Sarvam LLM, Sarvam TTS |
| `voice-smallest.py` | Full voice agent — Smallest STT, OpenAI LLM, Smallest TTS |
| `voice-soniox-turn-detection.py` | Full voice agent — Soniox STT, OpenAI LLM, Soniox TTS |
| `voice-soniox.py` | Full voice agent — Soniox STT, OpenAI LLM, Soniox TTS |
| `voice-speechmatics-vad.py` | Full voice agent — Speechmatics STT, OpenAI LLM, Speechmatics TTS — VAD-only |
| `voice-speechmatics.py` | Full voice agent — Speechmatics STT, OpenAI LLM, Speechmatics TTS |
| `voice-together.py` | Full voice agent — Together STT, Together LLM, Together TTS |
| `voice-xai-http.py` | Full voice agent — Deepgram STT, xAI LLM, xAI TTS — HTTP streaming |
| `voice-xai.py` | Full voice agent — xAI STT, xAI LLM, xAI TTS |
| `voice-xtts.py` | Full voice agent — Deepgram STT, OpenAI LLM, Xtts TTS |


<a id="function-calling"></a>
## `function-calling/`  (45)

LLM tool/function calling across providers. Suffixes: `-async` (async handlers), `-stream` (streaming), `-video` (vision + tools), `-direct` (direct registration), `-advanced-functionschema` (typed FunctionSchema).

| File | What it does |
|------|--------------|
| `function-calling-advanced-functionschema.py` | Advanced: defining a tool with an explicit ``FunctionSchema`` |
| `function-calling-anthropic-async-stream.py` | Example: async function call with intermediate updates |
| `function-calling-anthropic-async.py` | Function calling — Anthropic — async tools |
| `function-calling-anthropic-video.py` | Function calling — Anthropic — with video/vision |
| `function-calling-anthropic.py` | Function calling — Anthropic |
| `function-calling-aws-video.py` | Function calling — AWS — with video/vision |
| `function-calling-aws.py` | Function calling — AWS |
| `function-calling-azure.py` | Function calling — Azure |
| `function-calling-baseten.py` | Function calling — Baseten |
| `function-calling-cerebras.py` | Function calling — Cerebras |
| `function-calling-crusoe.py` | Function calling — Crusoe |
| `function-calling-deepseek.py` | Function calling — DeepSeek |
| `function-calling-direct.py` | Function calling — OpenAI |
| `function-calling-fireworks.py` | Function calling — Fireworks |
| `function-calling-google-async-stream.py` | Example: async function call with intermediate updates |
| `function-calling-google-async.py` | Function calling — Google — async tools |
| `function-calling-google-vertex.py` | Function calling — Google — via Vertex AI |
| `function-calling-google-video.py` | Function calling — Google — with video/vision |
| `function-calling-google.py` | Function calling — Google |
| `function-calling-grok.py` | Function calling — xAI |
| `function-calling-groq.py` | Function calling — Groq |
| `function-calling-inception.py` | Function calling — Inception |
| `function-calling-missing-handler.py` | Manual demonstration of the missing-handler (developer-error) recovery path |
| `function-calling-mistral.py` | Function calling — Mistral |
| `function-calling-moondream-video.py` | Function calling — OpenAI — with video/vision |
| `function-calling-nebius.py` | Function calling — Nebius |
| `function-calling-novita.py` | Function calling — Novita |
| `function-calling-nvidia.py` | Function calling — NVIDIA |
| `function-calling-ollama.py` | Function calling — Ollama |
| `function-calling-openai-async-stream.py` | Example: async function call with intermediate updates |
| `function-calling-openai-async.py` | Function calling — OpenAI — async tools |
| `function-calling-openai-responses-async-stream.py` | Example: async function call with intermediate updates |
| `function-calling-openai-responses-async.py` | Function calling — OpenAI — Responses API, async tools |
| `function-calling-openai-responses-http.py` | Function calling — OpenAI — Responses API, HTTP streaming |
| `function-calling-openai-responses-video-http.py` | Function calling — OpenAI — Responses API, with video/vision, HTTP streaming |
| `function-calling-openai-responses-video.py` | Function calling — OpenAI — Responses API, with video/vision |
| `function-calling-openai-responses.py` | Function calling — OpenAI — Responses API |
| `function-calling-openai-video.py` | Function calling — OpenAI — with video/vision |
| `function-calling-openai.py` | Function calling — OpenAI |
| `function-calling-openrouter.py` | Function calling — OpenRouter |
| `function-calling-perplexity.py` | A conversational Perplexity bot |
| `function-calling-qwen.py` | Function calling — Qwen |
| `function-calling-sambanova.py` | Function calling — SambaNova |
| `function-calling-sarvam.py` | Function calling — Sarvam |
| `function-calling-together.py` | Function calling — Together |


<a id="transcription"></a>
## `transcription/`  (23)

Standalone speech-to-text pipelines per STT provider; `-translation`/`-turns`/`-flux` add translation, turn-aware, and low-latency streaming variants.

| File | What it does |
|------|--------------|
| `transcription-assemblyai.py` | Speech-to-text — AssemblyAI |
| `transcription-azure.py` | Speech-to-text — Azure |
| `transcription-cartesia-turns.py` | Speech-to-text — Cartesia — provider turn detection |
| `transcription-cartesia.py` | Speech-to-text — Cartesia |
| `transcription-deepgram-flux.py` | Speech-to-text — Deepgram — Flux low-latency |
| `transcription-deepgram.py` | Speech-to-text — Deepgram |
| `transcription-elevenlabs.py` | Speech-to-text — ElevenLabs |
| `transcription-funasr.py` | Speech-to-text — FunASR |
| `transcription-gladia-translation.py` | Speech-to-text — Gladia — with translation |
| `transcription-gladia.py` | Speech-to-text — Gladia |
| `transcription-google-llm.py` | Speech-to-text — Google |
| `transcription-google.py` | Speech-to-text — Google |
| `transcription-gradium.py` | Speech-to-text — Gradium |
| `transcription-mistral.py` | Speech-to-text — Mistral |
| `transcription-nvidia.py` | Speech-to-text — NVIDIA |
| `transcription-openai.py` | Speech-to-text — OpenAI |
| `transcription-soniox.py` | Speech-to-text — Soniox |
| `transcription-speechmatics.py` | Speech-to-text — Speechmatics |
| `transcription-together.py` | Speech-to-text — Together |
| `transcription-whisper-local.py` | Speech-to-text — Whisper — on-device |
| `transcription-whisper-mlx.py` | Speech-to-text — Whisper |
| `transcription-whisper.py` | Speech-to-text — Whisper |
| `transcription-xai.py` | Speech-to-text — xAI |


<a id="realtime"></a>
## `realtime/`  (26)

Realtime / multimodal speech-to-speech models. `-async-tool` adds async function calling; `-video` adds vision; `-locally-driven-turns` drives turns locally; `-grounding`/`-google-search` add web grounding.

| File | What it does |
|------|--------------|
| `realtime-aws-nova-sonic-async-tool.py` | Example: async function call with the AWS Nova Sonic LLM service |
| `realtime-aws-nova-sonic.py` | Realtime speech-to-speech — AWS |
| `realtime-azure-async-tool.py` | Example: async function call with the Azure Realtime LLM service |
| `realtime-azure.py` | Realtime speech-to-speech — Azure |
| `realtime-gemini-live-async-tool.py` | Example: async function call with the Gemini Live LLM service |
| `realtime-gemini-live-files-api.py` | Realtime speech-to-speech — gemini-live-files-api — Files API |
| `realtime-gemini-live-google-search.py` | Realtime speech-to-speech — Google — web search |
| `realtime-gemini-live-graceful-end.py` | Realtime speech-to-speech — gemini-live-graceful-end |
| `realtime-gemini-live-grounding-metadata.py` | Realtime speech-to-speech — gemini-live-grounding-metadata — grounding metadata |
| `realtime-gemini-live-locally-driven-turns.py` | Gemini Live with locally-driven turn detection |
| `realtime-gemini-live-vertex.py` | Realtime speech-to-speech — Google Vertex — via Vertex AI |
| `realtime-gemini-live-video.py` | Realtime speech-to-speech — gemini-live-video — with video/vision |
| `realtime-gemini-live.py` | Realtime speech-to-speech — gemini-live |
| `realtime-grok-async-tool.py` | Example: async function call with the Grok Realtime LLM service |
| `realtime-grok-locally-driven-turns.py` | Grok Realtime with locally-driven turn detection |
| `realtime-grok.py` | Grok Voice Agent Realtime Example |
| `realtime-inworld-locally-driven-turns.py` | Inworld Realtime with locally-driven turn detection |
| `realtime-inworld.py` | Inworld Realtime Example |
| `realtime-openai-async-tool.py` | Example: async function call with the OpenAI Realtime LLM service |
| `realtime-openai-live-video.py` | Realtime speech-to-speech — OpenAI — with video/vision |
| `realtime-openai-locally-driven-turns.py` | OpenAI Realtime with locally-driven turn detection |
| `realtime-openai-text.py` | Realtime speech-to-speech — OpenAI |
| `realtime-openai.py` | Realtime speech-to-speech — OpenAI |
| `realtime-ultravox-async-tool.py` | Example: async function call with the Ultravox Realtime LLM service |
| `realtime-ultravox-text.py` | Realtime speech-to-speech — Ultravox |
| `realtime-ultravox.py` | Realtime speech-to-speech — Ultravox |


<a id="update-settings"></a>
## `update-settings/`  (91)

Changing service parameters at runtime (voice, model, language, etc.), split by service type. `-http` variants use the HTTP service class.

### `update-settings/llm/`

Runtime LLM setting changes (model, temperature, etc.) per provider.

| File | What it does |
|------|--------------|
| `llm-anthropic.py` | Runtime LLM settings updates — Anthropic |
| `llm-aws-bedrock.py` | Runtime LLM settings updates — AWS |
| `llm-aws-nova-sonic.py` | Runtime LLM settings updates — AWS |
| `llm-azure-realtime.py` | Runtime LLM settings updates — Azure |
| `llm-azure.py` | Runtime LLM settings updates — Azure |
| `llm-cerebras.py` | Runtime LLM settings updates — Cerebras |
| `llm-deepseek.py` | Runtime LLM settings updates — DeepSeek |
| `llm-fireworks.py` | Runtime LLM settings updates — Fireworks |
| `llm-gemini-live-vertex.py` | Runtime LLM settings updates — Google Vertex — via Vertex AI |
| `llm-gemini-live.py` | Runtime LLM settings updates — gemini-live |
| `llm-google-vertex.py` | Runtime LLM settings updates — Google — via Vertex AI |
| `llm-google.py` | Runtime LLM settings updates — Google |
| `llm-grok-realtime.py` | Runtime LLM settings updates — Grok |
| `llm-grok.py` | Runtime LLM settings updates — xAI |
| `llm-groq.py` | Runtime LLM settings updates — Groq |
| `llm-mistral.py` | Runtime LLM settings updates — Mistral |
| `llm-nvidia.py` | Runtime LLM settings updates — NVIDIA |
| `llm-ollama.py` | Runtime LLM settings updates — Ollama |
| `llm-openai-realtime.py` | Runtime LLM settings updates — OpenAI |
| `llm-openai-responses-http.py` | Runtime LLM settings updates — OpenAI — Responses API, HTTP streaming |
| `llm-openai-responses.py` | Runtime LLM settings updates — OpenAI — Responses API |
| `llm-openai.py` | Runtime LLM settings updates — OpenAI |
| `llm-openrouter.py` | Runtime LLM settings updates — OpenRouter |
| `llm-perplexity.py` | Runtime LLM settings updates — Perplexity |
| `llm-qwen.py` | Runtime LLM settings updates — Qwen |
| `llm-sambanova.py` | Runtime LLM settings updates — SambaNova |
| `llm-sarvam.py` | Runtime LLM settings updates — Sarvam |
| `llm-together.py` | Runtime LLM settings updates — Together |
| `llm-ultravox-realtime.py` | Runtime LLM settings updates — Ultravox |

### `update-settings/stt/`

Runtime STT setting changes (language, model, etc.) per provider.

| File | What it does |
|------|--------------|
| `stt-assemblyai.py` | Runtime STT settings updates — AssemblyAI |
| `stt-aws-transcribe.py` | Runtime STT settings updates — AWS |
| `stt-azure.py` | Runtime STT settings updates — Azure |
| `stt-cartesia.py` | Runtime STT settings updates — Cartesia |
| `stt-deepgram-flux.py` | Runtime STT settings updates — Deepgram — Flux low-latency |
| `stt-deepgram-sagemaker.py` | Runtime STT settings updates — Deepgram — on SageMaker |
| `stt-deepgram.py` | Runtime STT settings updates — Deepgram |
| `stt-elevenlabs-realtime.py` | Runtime STT settings updates — ElevenLabs |
| `stt-elevenlabs.py` | Runtime STT settings updates — ElevenLabs |
| `stt-fal.py` | Runtime STT settings updates — Fal |
| `stt-gladia.py` | Runtime STT settings updates — Gladia |
| `stt-google.py` | Runtime STT settings updates — Google |
| `stt-gradium.py` | Runtime STT settings updates — Gradium |
| `stt-groq.py` | Runtime STT settings updates — Groq |
| `stt-nvidia-segmented.py` | Runtime STT settings updates — NVIDIA |
| `stt-nvidia.py` | Runtime STT settings updates — NVIDIA |
| `stt-openai-realtime.py` | Runtime STT settings updates — OpenAI |
| `stt-sarvam.py` | Runtime STT settings updates — Sarvam |
| `stt-soniox.py` | Runtime STT settings updates — Soniox |
| `stt-speechmatics.py` | Runtime STT settings updates — Speechmatics |
| `stt-whisper-api.py` | Runtime STT settings updates — OpenAI |
| `stt-whisper-mlx.py` | Runtime STT settings updates — Whisper |
| `stt-whisper.py` | Runtime STT settings updates — Whisper |

### `update-settings/tts/`

Runtime TTS setting changes (voice, speed, etc.) per provider.

| File | What it does |
|------|--------------|
| `tts-asyncai-http.py` | Runtime TTS settings updates — Async.ai — HTTP streaming |
| `tts-asyncai.py` | Runtime TTS settings updates — Async.ai |
| `tts-aws-polly.py` | Runtime TTS settings updates — AWS |
| `tts-azure-http.py` | Runtime TTS settings updates — Azure — HTTP streaming |
| `tts-azure.py` | Runtime TTS settings updates — Azure |
| `tts-camb.py` | Runtime TTS settings updates — Camb.ai |
| `tts-cartesia-http.py` | Runtime TTS settings updates — Cartesia — HTTP streaming |
| `tts-cartesia.py` | Runtime TTS settings updates — Cartesia |
| `tts-deepgram-http.py` | Runtime TTS settings updates — Deepgram — HTTP streaming |
| `tts-deepgram-sagemaker.py` | Runtime TTS settings updates — Deepgram — on SageMaker |
| `tts-deepgram.py` | Runtime TTS settings updates — Deepgram |
| `tts-elevenlabs-http.py` | Runtime TTS settings updates — ElevenLabs — HTTP streaming |
| `tts-elevenlabs.py` | Runtime TTS settings updates — ElevenLabs |
| `tts-fish.py` | Runtime TTS settings updates — Fish Audio |
| `tts-gemini.py` | Runtime TTS settings updates — Google |
| `tts-google-http.py` | Runtime TTS settings updates — Google — HTTP streaming |
| `tts-google-stream.py` | Runtime TTS settings updates — Google — streaming |
| `tts-gradium.py` | Runtime TTS settings updates — Gradium |
| `tts-groq.py` | Runtime TTS settings updates — Groq |
| `tts-hume.py` | Runtime TTS settings updates — Hume |
| `tts-inworld-http.py` | Runtime TTS settings updates — Inworld — HTTP streaming |
| `tts-inworld.py` | Runtime TTS settings updates — Inworld |
| `tts-kokoro.py` | Runtime TTS settings updates — Kokoro |
| `tts-lmnt.py` | Runtime TTS settings updates — LMNT |
| `tts-minimax.py` | Runtime TTS settings updates — MiniMax |
| `tts-neuphonic-http.py` | Runtime TTS settings updates — Neuphonic — HTTP streaming |
| `tts-neuphonic.py` | Runtime TTS settings updates — Neuphonic |
| `tts-nvidia.py` | Runtime TTS settings updates — NVIDIA |
| `tts-openai.py` | Runtime TTS settings updates — OpenAI |
| `tts-piper-http.py` | Runtime TTS settings updates — Piper — HTTP streaming |
| `tts-piper.py` | Runtime TTS settings updates — Piper |
| `tts-pockettts.py` | Runtime TTS settings updates — Pocket Tts |
| `tts-resembleai.py` | Runtime TTS settings updates — Resembleai |
| `tts-rime-http.py` | Runtime TTS settings updates — Rime — HTTP streaming |
| `tts-rime.py` | Runtime TTS settings updates — Rime |
| `tts-sarvam-http.py` | Runtime TTS settings updates — Sarvam — HTTP streaming |
| `tts-sarvam.py` | Runtime TTS settings updates — Sarvam |
| `tts-speechmatics.py` | Runtime TTS settings updates — Speechmatics |
| `tts-xtts.py` | Runtime TTS settings updates — Xtts |


<a id="flows"></a>
## `flows/`  (12)

Structured, stateful conversations built with Pipecat Flows — predefined and dynamic paths with state management.

| File | What it does |
|------|--------------|
| `food_ordering.py` | A food ordering flow example for Pipecat Flows |
| `food_ordering_advanced_functionschema.py` | An "advanced" food ordering flow example using FlowsFunctionSchema |
| `hello_world.py` | A 'Hello-World' introduction to Pipecat Flows |
| `insurance_quote.py` | Insurance Quote Example using Pipecat Flows |
| `llm_switching.py` | A LLM switching flow example for Pipecat Flows |
| `multi_worker_handoff.py` | Multi-worker handoff: a free-form LLM router and a structured Flows worker |
| `patient_intake.py` | A patient intake flow example for Pipecat Flows |
| `podcast_interview.py` | Pipecat Podcast Interview Example |
| `restaurant_reservation.py` | A restaurant reservation flow example for Pipecat Flows |
| `utils.py` | Utility functions for Pipecat Flows examples |
| `warm_transfer.py` | 'Warm Handoff' Example using Pipecat Flows |

### `flows/assets/hold_music/`

Asset helper used by the flows examples.

| File | What it does |
|------|--------------|
| `hold_music.py` | hold_music |


<a id="multi-worker"></a>
## `multi-worker/`  (19)

Agent-to-agent (A2A) patterns: agents that hand off, fan out in parallel, delegate to sidecars, run across machines, or bridge to a UI. **This is the folder your planned all-in-one A2A build draws from.**

### `multi-worker/code-assistant/`

Voice access to your codebase via a Claude Agent SDK sidecar worker behind `job(...)`.

| File | What it does |
|------|--------------|
| `code-assistant.py` | Voice code assistant powered by Claude Agent SDK |
| `code_worker.py` | Code worker that explores a codebase using Claude Agent SDK |

### `multi-worker/distributed-handoff/pgmq-handoff/`

Handoff across processes over a Postgres/PGMQ bus (Supabase-friendly).

| File | What it does |
|------|--------------|
| `llm.py` | LLM worker — run on Machine B (or locally alongside ``main.py``) |
| `main.py` | Main transport worker — run on Machine A |

### `multi-worker/distributed-handoff/redis-handoff/`

Local-handoff split across separate processes over a Redis bus.

| File | What it does |
|------|--------------|
| `llm.py` | LLM worker — run on Machine B (or locally alongside ``main.py``) |
| `main.py` | Main transport worker — run on Machine A |

### `multi-worker/local-handoff/`

Two LLM workers hand off control within one process over an in-memory bus.

| File | What it does |
|------|--------------|
| `local-handoff-two-agents-tts.py` | Two LLM workers with per-worker TTS voices |
| `local-handoff-two-agents.py` | Two LLM workers with a main worker bridging transport to the bus |

### `multi-worker/parallel-debate/`

One worker fans a job out to three LLM context workers in parallel and synthesizes their replies.

| File | What it does |
|------|--------------|
| `parallel-debate.py` | Parallel debate using job groups |

### `multi-worker/remote-proxy-assistant/`

WebSocket proxy pair linking a local transport to a remote LLM worker — no shared bus.

| File | What it does |
|------|--------------|
| `assistant.py` | Remote assistant LLM server |
| `main.py` | Main transport worker with a WebSocket proxy to a remote LLM server |

### `multi-worker/sensor-controller/`

Voice agent forwards questions to a sidecar PipelineWorker that owns a simulated sensor.

| File | What it does |
|------|--------------|
| `sensor-controller.py` | Voice agent + sensor-controller worker, both as plain PipelineTasks |
| `sensor.py` | Temperature sensor processors for the sensor-controller example |

### `multi-worker/ui-worker/async-tasks/`

ui_job_group fans out long-running work, streaming progress + cancellation to the UI.

| File | What it does |
|------|--------------|
| `bot.py` | Async tasks — the UIWorker fans out long-running work and streams progress |

### `multi-worker/ui-worker/deixis/`

Worker reads the user's current selection from the snapshot ("explain this").

| File | What it does |
|------|--------------|
| `bot.py` | Deixis — the UIWorker grounds in what the user just selected |

### `multi-worker/ui-worker/document-review/`

Synthesis demo: snapshot + deixis + form-fill actions + async job groups in one app.

| File | What it does |
|------|--------------|
| `bot.py` | Document review — the synthesis demo |

### `multi-worker/ui-worker/form-fill/`

Accessibility-first, voice-guided form walkthrough.

| File | What it does |
|------|--------------|
| `bot.py` | Form-fill — a voice-guided, accessible form walkthrough |

### `multi-worker/ui-worker/hello-snapshot/`

Smallest UIWorker example: voice grounded in whatever is on the page.

| File | What it does |
|------|--------------|
| `bot.py` | Hello UIWorker — the smallest possible accessibility-snapshot demo |

### `multi-worker/ui-worker/shopping-list/`

Every voice turn drives the UI; speech is input, the screen is source of truth.

| File | What it does |
|------|--------------|
| `bot.py` | Shopping list — every voice turn drives the UI; speech is incidental |


<a id="persistent-context"></a>
## `persistent-context/`  (8)

Maintaining conversation context/memory across sessions per provider.

| File | What it does |
|------|--------------|
| `persistent-context-anthropic.py` | Persistent cross-session context — Anthropic |
| `persistent-context-aws-nova-sonic.py` | Persistent cross-session context — AWS |
| `persistent-context-gemini.py` | Persistent cross-session context — context-gemini |
| `persistent-context-grok-realtime.py` | Grok Realtime persistent context example |
| `persistent-context-openai-realtime.py` | Persistent cross-session context — OpenAI |
| `persistent-context-openai-responses-http.py` | Persistent cross-session context — OpenAI — Responses API, HTTP streaming |
| `persistent-context-openai-responses.py` | Persistent cross-session context — OpenAI — Responses API |
| `persistent-context-openai.py` | Persistent cross-session context — OpenAI |


<a id="context-summarization"></a>
## `context-summarization/`  (4)

Summarizing conversation history to stay under token limits.

| File | What it does |
|------|--------------|
| `context-summarization-dedicated-llm.py` | Example demonstrating advanced context summarization configuration |
| `context-summarization-google.py` | Example demonstrating context summarization feature |
| `context-summarization-manual-openai.py` | Example demonstrating manual context summarization via a function call |
| `context-summarization-openai.py` | Example demonstrating context summarization feature |


<a id="turn-management"></a>
## `turn-management/`  (10)

Turn detection, interruption handling, idle detection, and user-input management.

| File | What it does |
|------|--------------|
| `turn-management-detect-user-idle.py` | turn management detect user idle |
| `turn-management-filter-incomplete-turns-function-calling.py` | Example 22: Filter Incomplete Turns |
| `turn-management-filter-incomplete-turns-user-idle.py` | Example 22: Filter Incomplete Turns with User Idle Re-Prompts |
| `turn-management-filter-incomplete-turns.py` | Example 22: Filter Incomplete Turns |
| `turn-management-interruption-config.py` | turn management interruption config |
| `turn-management-smart-turn-local-coreml.py` | turn management smart turn local coreml — on-device |
| `turn-management-smart-turn-local.py` | turn management smart turn local — on-device |
| `turn-management-turn-tracking-observer.py` | turn management turn tracking observer |
| `turn-management-user-assistant-turns.py` | turn management user assistant turns — provider turn detection |
| `turn-management-user-mute-strategy.py` | turn management user mute strategy |


<a id="thinking"></a>
## `thinking/`  (9)

LLM reasoning/thinking modes, with and without function calling.

| File | What it does |
|------|--------------|
| `thinking-anthropic.py` | Reasoning/thinking mode — Anthropic |
| `thinking-functions-anthropic.py` | Reasoning/thinking mode — Anthropic |
| `thinking-functions-google-vertex.py` | Reasoning/thinking mode — Google — via Vertex AI |
| `thinking-functions-google.py` | Reasoning/thinking mode — Google |
| `thinking-functions-openai-responses.py` | Reasoning/thinking mode — OpenAI — Responses API |
| `thinking-google-vertex.py` | Reasoning/thinking mode — Google — via Vertex AI |
| `thinking-google.py` | Reasoning/thinking mode — Google |
| `thinking-openai-responses-http.py` | Reasoning/thinking mode — OpenAI — Responses API, HTTP streaming |
| `thinking-openai-responses.py` | Reasoning/thinking mode — OpenAI — Responses API |


<a id="mcp"></a>
## `mcp/`  (4)

Model Context Protocol tool-server integration (stdio and streamable HTTP).

| File | What it does |
|------|--------------|
| `mcp-multiple-mcp.py` | mcp multiple mcp |
| `mcp-stdio.py` | mcp stdio |
| `mcp-streamable-http-gemini-live.py` | mcp streamable http gemini live — HTTP streaming |
| `mcp-streamable-http.py` | mcp streamable http — HTTP streaming |


<a id="vision"></a>
## `vision/`  (7)

Image understanding with multimodal LLMs.

| File | What it does |
|------|--------------|
| `vision-anthropic.py` | Image understanding — Anthropic |
| `vision-aws.py` | Image understanding — AWS |
| `vision-gemini-flash.py` | Image understanding — gemini-flash |
| `vision-moondream.py` | Image understanding — Moondream |
| `vision-openai-responses-http.py` | Image understanding — OpenAI — Responses API, HTTP streaming |
| `vision-openai-responses.py` | Image understanding — OpenAI — Responses API |
| `vision-openai.py` | Image understanding — OpenAI |


<a id="video-avatar"></a>
## `video-avatar/`  (6)

Talking-head video avatar integrations, as a transport or a video service.

| File | What it does |
|------|--------------|
| `video-avatar-heygen-transport.py` | Video avatar — HeyGen (as transport) |
| `video-avatar-heygen-video-service.py` | Video avatar — HeyGen (as video service) |
| `video-avatar-lemonslice-transport.py` | Video avatar — LemonSlice (as transport) |
| `video-avatar-simli-video-service.py` | Video avatar — Simli (as video service) |
| `video-avatar-tavus-transport.py` | Video avatar — Tavus (as transport) |
| `video-avatar-tavus-video-service.py` | Video avatar — Tavus (as video service) |


<a id="video-processing"></a>
## `video-processing/`  (6)

Video track manipulation: mirroring, GStreamer sources, and custom tracks.

| File | What it does |
|------|--------------|
| `video-processing-custom-video-track.py` | Example demonstrating custom video tracks output with Daily transport |
| `video-processing-gstreamer-filesrc.py` | video processing gstreamer filesrc — with video/vision |
| `video-processing-gstreamer-videotestsrc.py` | video processing gstreamer videotestsrc — with video/vision |
| `video-processing-local-mirror.py` | video processing local mirror — with video/vision, on-device |
| `video-processing-mirror.py` | video processing mirror — with video/vision |
| `video-processing.py` | video processing — with video/vision |


<a id="transports"></a>
## `transports/`  (5)

Transport-layer examples (WebRTC, Daily, LiveKit, MoQ, Vonage).

| File | What it does |
|------|--------------|
| `transports-daily.py` | transports daily |
| `transports-livekit.py` | transports livekit |
| `transports-moq.py` | MOQ (Media over QUIC) transport example |
| `transports-small-webrtc.py` | transports small webrtc |
| `transports-vonage.py` | Example of using OpenAI Realtime voice LLM service with Vonage Video Connector transport |


<a id="features"></a>
## `features/`  (18)

Assorted capabilities and patterns not covered by the other folders.

| File | What it does |
|------|--------------|
| `features-add-tool-change-messages.py` | Manual validation harness for the ``add_tool_change_messages`` feature |
| `features-app-resources.py` | Example demonstrating ``PipelineWorker(app_resources=...)`` |
| `features-before-and-after-events.py` | features before and after events |
| `features-concurrent-llm-evaluation.py` | features concurrent llm evaluation |
| `features-concurrent-llm-rtvi-ignored-sources.py` | RTVIObserver ignored sources example |
| `features-custom-frame-processor.py` | features custom frame processor |
| `features-dtmf-menu.py` | A keypad-driven phone menu (IVR) bot |
| `features-gpu-container-local-bot.py` | features gpu container local bot — on-device |
| `features-live-translation.py` | features live translation — with translation |
| `features-pattern-pair-voice-switching.py` | Pattern Pair Voice Switching Example with Pipecat |
| `features-service-switcher.py` | features service switcher |
| `features-switch-languages.py` | features switch languages |
| `features-switch-voices.py` | features switch voices |
| `features-text-transforms.py` | Voice formatting with individual text transforms |
| `features-user-email-gathering.py` | features user email gathering |
| `features-voice-formatter.py` | Voice formatting with VoiceFormatter |
| `features-voicemail-detection.py` | features voicemail detection |
| `features-wake-phrase.py` | features wake phrase |


<a id="audio"></a>
## `audio/`  (3)

Audio recording, background sound, and sound effects.

| File | What it does |
|------|--------------|
| `audio-bot-background-sound.py` | audio bot background sound |
| `audio-recording.py` | Audio Recording Example with Pipecat |
| `audio-sound-effects.py` | audio sound effects |


<a id="observability"></a>
## `observability/`  (3)

Pipeline monitoring: observers, heartbeats, and metrics export.

| File | What it does |
|------|--------------|
| `observability-heartbeats.py` | observability heartbeats |
| `observability-observer.py` | observability observer |
| `observability-sentry-metrics.py` | observability sentry metrics |


<a id="rag"></a>
## `rag/`  (3)

Retrieval-augmented generation, grounding, and long-term memory.

| File | What it does |
|------|--------------|
| `rag-gemini-grounding-metadata.py` | rag gemini grounding metadata — grounding metadata |
| `rag-gemini.py` | CrossFit Games 2025 Rulebook RAG Demo |
| `rag-mem0.py` | Mem0 Personalized Voice Agent Example with Pipecat |

