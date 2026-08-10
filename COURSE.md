# Pipecat, From Zero — A Complete Course Over All 380 Examples

*A progressive, concept-first course covering every example in `examples/`. No prior Python or voice-AI experience needed. Each module leads with the idea, shows annotated real code, links the official docs, gives you something to run and to break, and ends with a quick self-check.*

---

## How to read this course

Go top to bottom. You are **not** meant to read all 380 files — the file tables at the end of each module tell you which file to open when you want a specific provider or variation. Run the ⭐ *Start here* file in each module, do the 🔨 *Modify it* exercise, and move on.

### The template in every module

| Icon | Meaning |
|------|---------|
| ⏱ | Time & difficulty |
| 🎯 | The concept, in plain language |
| 📄 | Official docs page(s) |
| 🗺 | Frame-flow diagram (how data moves) |
| 💻 | Annotated real code from the repo |
| 🐍 | *Python note* — a language idea explained where it appears |
| ▶️ | **Run it** — the exact command and what you should see/hear |
| 🔨 | **Modify it** — a small challenge (with a hint) |
| ⚠️ | **Common errors** and fixes |
| ✅ | **Checkpoint** — answer before moving on |
| 📚 | Every file in the folder |

### Suggested learning path & time budget

| Phase | Parts | Folders | ~Time |
|-------|-------|---------|-------|
| **A. Core loop** (do these first, in order) | 0–1 | `getting-started/` | 90 min |
| **B. Each piece of the loop** | 2–8 | transports, turn-mgmt, STT, context, LLM, functions, TTS | 3–4 h |
| **C. Provider catalogs** (skim, pick one each) | 9 | `voice/` | 30 min |
| **D. Speech-to-speech & reasoning** | 10–11 | `realtime/`, `thinking/` | 1–2 h |
| **E. Multimodal** | 12 | `vision/`, `video-*` | 1 h |
| **F. Knowledge & structure** | 13–15 | `mcp/`, `rag/`, `flows/` | 2 h |
| **G. Production polish** | 16–17 | `features/`, `audio/`, `observability/` | 1–2 h |
| **H. Capstone: multi-agent A2A** | 18–19 | `multi-worker/` | 2–3 h |

*"Skip if" guidance appears per module. If you only have one evening, do Phase A + Part 6 (voice agent) + Part 7 (function calling).*

There is a **Glossary** at the very end — jump there any time a term is unfamiliar.

---

## Part 0 — Orientation & the Python you need

⏱ **20 min · absolute beginner**

### 0.1 What Pipecat is
Pipecat is an open-source Python framework for building **voice and multimodal AI agents** — programs you talk to that talk back, in real time. It connects three AI services (speech-to-text, a language model, text-to-speech) and a network **transport** (how audio reaches the user), keeping the round-trip fast (typically 500–800 ms) so it feels like a real conversation. Docs: <https://docs.pipecat.ai/pipecat/get-started/introduction>.

### 0.2 The mental model: a pipeline of frames

Everything moving through a Pipecat app is a **frame** — a small typed packet (a chunk of audio, transcribed text, an LLM token, or a control signal). Frames flow through a **pipeline**: an ordered list of **processors**, each of which handles frames and passes them on.

🗺 **A single voice turn:**
```
  🎤 you speak
     │  (audio frames)
     ▼
[transport.input] ──▶ [STT] ──▶ [user aggregator] ──▶ [LLM] ──▶ [TTS] ──▶ [transport.output] ──▶ 🔊 bot speaks
     audio            text        adds to context      reply     audio          playback
```

Docs: <https://docs.pipecat.ai/pipecat/learn/pipeline>.

### 0.3 The Python you actually need

You'll meet the same handful of ideas everywhere. Read these once; the 🐍 notes later reinforce them in context.

- **Imports** — `from pipecat.services.cartesia.tts import CartesiaTTSService` just loads a class from the library. The dotted path is folders: `pipecat/services/cartesia/tts.py`.
- **`os.environ["CARTESIA_API_KEY"]`** — reads a secret from your environment (loaded from `.env` by `load_dotenv()`), keeping keys out of code.
- **`async def` / `await`** — voice apps do many things at once (listening while speaking). `async def` marks a function that can pause at `await` points without freezing the program. You mostly just put `await` before calls that go over the network.
- **Decorators** — `@transport.event_handler("on_client_connected")` attaches your function to an event ("when a user connects, run this").
- **Configuring objects** — `CartesiaTTSService(api_key=..., settings=CartesiaTTSService.Settings(voice="..."))` is just building an object with options.

### 0.4 The skeleton shared by all 380 files

Open any example and you'll see this shape. Memorize it and every file becomes readable:

```python
transport_params = {                     # how the user can connect (chosen at launch)
    "webrtc": lambda: TransportParams(audio_in_enabled=True, audio_out_enabled=True),
    "daily":  lambda: DailyParams(...),
}

async def run_bot(transport, runner_args):
    stt = DeepgramSTTService(api_key=...)          # 1. build services
    llm = OpenAILLMService(api_key=...)
    tts = CartesiaTTSService(api_key=...)
    pipeline = Pipeline([transport.input(), stt, ..., llm, tts, transport.output()])  # 2. wire them
    worker = PipelineWorker(pipeline)              # 3. one agent = one pipeline

    @transport.event_handler("on_client_connected")   # 4. react to events
    async def _(transport, client): ...

    runner = WorkerRunner()                        # 5. run & supervise workers
    await runner.add_workers(worker)
    await runner.run()

async def bot(runner_args):                        # entry point (also Pipecat Cloud)
    transport = await create_transport(runner_args, transport_params)
    await run_bot(transport, runner_args)

if __name__ == "__main__":
    from pipecat.runner.run import main; main()
```

🐍 **Python note — dict of lambdas.** `transport_params` maps a name to a *lambda* (a tiny unnamed function). The params aren't built until the transport is chosen at launch, so unused ones cost nothing. `lambda: X` means "a function that returns `X`."

Key words: a **`PipelineWorker`** is one agent running one pipeline. The **`WorkerRunner`** starts and supervises workers — one, or many (that's how multi-agent works in Part 18). A **transport** is swapped at launch with `-t webrtc|daily|twilio`.

### 0.5 Setup once
From the repo root:
```bash
uv sync --all-extras                 # install Pipecat + all provider extras
cp env.example .env                  # then edit .env and add keys for providers you'll use
uv run python getting-started/01-say-one-thing.py
# open http://localhost:7860/client/ and click Connect
```
You only need API keys for the providers an example actually imports. Add `-t daily` or `-t twilio -x <ngrok-host>` to use other transports.

⚠️ **Common setup errors:** `KeyError: 'CARTESIA_API_KEY'` → the key isn't in `.env` (or you didn't `cp env.example .env`). Nothing happens in the browser → allow **microphone** permission and check you're on `http://localhost:7860/client/`. `Address already in use` → another example is still running; stop it or add `--port 7861`.

---

## Part 1 — Foundations: the `getting-started/` ladder

⏱ **60–90 min · beginner · do this first**

🎯 **Concept.** These ten files add exactly one idea at a time, from "make the computer say a sentence" to "an agent that calls functions." Running them in order is the fastest way to internalize the framework. Docs: <https://docs.pipecat.ai/pipecat/get-started/quickstart>, <https://docs.pipecat.ai/pipecat/learn/your-first-agent>.

**What each rung adds:**

- **01 – say one thing:** minimal app — a `TTSService` + `transport.output()`. On connect it queues `TTSSpeakFrame("Hello there!")` then `EndFrame`. Teaches the skeleton, frames, worker/runner.
- **01a – local audio:** same, but uses your computer's mic/speaker instead of the browser.
- **02 – LLM says one thing:** insert an LLM so the words are *generated*, not hard-coded.
- **03 / 03a – still frame:** emit a static image — frames aren't only audio/text.
- **04 – sync speech and image:** make an image and speech land together (frame timing).
- **05 – speaking state:** react to "bot started/stopped speaking" events.
- **06 – voice agent:** the first *complete* conversation loop (STT + LLM + TTS + context memory + VAD). **This is the reference architecture.**
- **06a – voice agent local:** the full agent on local audio.
- **07 – function calling:** let the LLM call a Python function mid-conversation (Part 7).

🗺 **The full loop (example 06):**
```
[transport.input] ─▶ [STT] ─▶ [user_aggregator] ─▶ [LLM] ─▶ [TTS] ─▶ [transport.output] ─▶ [assistant_aggregator]
                                     │                                                              │
                                     └───────────────── shared LLMContext (conversation memory) ────┘
```

💻 **Annotated core of `06-voice-agent.py`:**
```python
stt = DeepgramSTTService(api_key=os.environ["DEEPGRAM_API_KEY"])   # audio ➜ text
tts = CartesiaTTSService(                                          # text ➜ audio
    api_key=os.environ["CARTESIA_API_KEY"],
    settings=CartesiaTTSService.Settings(voice="71a7ad14-...-01c121"),  # which voice
)
llm = OpenAILLMService(                                            # the "brain"
    api_key=os.environ["OPENAI_API_KEY"],
    settings=OpenAILLMService.Settings(
        system_instruction="You are a helpful assistant in a voice conversation..."),  # persona + rules
)

context = LLMContext()                                            # the running transcript
user_aggregator, assistant_aggregator = LLMContextAggregatorPair( # capture both sides into context
    context,
    user_params=LLMUserAggregatorParams(vad_analyzer=SileroVADAnalyzer()),  # VAD = detect end of speech
)

pipeline = Pipeline([                                             # ORDER = data flow
    transport.input(),   # mic audio in
    stt,                 # ➜ text
    user_aggregator,     # ➜ remember what the user said
    llm,                 # ➜ generate reply
    tts,                 # ➜ speech
    transport.output(),  # ➜ play it
    assistant_aggregator,# ➜ remember what the bot said
])

worker = PipelineWorker(pipeline, params=PipelineParams(enable_metrics=True, enable_usage_metrics=True))

@transport.event_handler("on_client_connected")                  # when someone joins…
async def on_client_connected(transport, client):
    context.add_message({"role": "developer", "content": "Please introduce yourself to the user."})
    await worker.queue_frames([LLMRunFrame()])                   # …make the bot speak first
```

🐍 **Python note — tuple unpacking.** `user_aggregator, assistant_aggregator = LLMContextAggregatorPair(...)` splits the two returned objects into two variables in one line.

🐍 **Python note — why order matters.** A `Pipeline([...])` runs its list front-to-back for user data and back-to-front for bot data. Putting `assistant_aggregator` *after* `transport.output()` means the bot's words are recorded only once actually sent.

▶️ **Run it.** `uv run python getting-started/06-voice-agent.py` → open `http://localhost:7860/client/`, Connect, and the bot greets you. Speak; it replies within ~1 s.

🔨 **Modify it.** (1) Change the TTS `voice` id to another Cartesia voice. (2) Rewrite `system_instruction` to make it a pirate. (3) Copy `07`'s `get_current_weather` idea in and give the bot a tool. *Hint: tools are added via `LLMContext(tools=[...])`, shown in Part 7.*

⚠️ **Common errors.** Bot never speaks first → you removed the `on_client_connected` handler or the `LLMRunFrame()`. It talks over you → VAD isn't configured (`vad_analyzer=SileroVADAnalyzer()` missing). Garbled/no audio → wrong or missing `CARTESIA_API_KEY`, or browser mic blocked.

✅ **Checkpoint.**
1. Which processor turns your voice into text, and which turns text back into voice?
2. What is the `LLMContext` for, and why are there *two* aggregators?
3. What does `SileroVADAnalyzer` decide?

<details><summary>Answers</summary>

1. `DeepgramSTTService` (STT) → text; `CartesiaTTSService` (TTS) → voice.
2. The context is the conversation memory sent to the LLM each turn; the user aggregator records what you said, the assistant aggregator records what the bot said.
3. When you've *stopped* speaking, so the bot knows it's its turn.
</details>

📚 **All `getting-started/` files:**

| File | What it teaches |
|------|---------------|
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

---

## Part 2 — The Pipeline & Frames (and Transports)

⏱ **30 min · beginner**

🎯 **Concept.** You've seen a pipeline; now name its parts. A **frame** is a typed data packet. A **`FrameProcessor`** is a node that receives frames, optionally transforms them, and pushes frames downstream. A **`Pipeline`** is an ordered list of processors. A **`PipelineWorker`** runs one pipeline as one agent. The **`WorkerRunner`** supervises workers. **Transports** are the first/last processor — they connect the pipeline to the world. Docs: <https://docs.pipecat.ai/pipecat/learn/pipeline>, <https://docs.pipecat.ai/pipecat/learn/transports>, <https://docs.pipecat.ai/pipecat/fundamentals/custom-frame-processor>.

🗺 **Where transports sit:**
```
  world ──▶ [transport.input()] ──▶ ...your processors... ──▶ [transport.output()] ──▶ world
            (mic/network in)                                   (speaker/network out)
```

💻 **A custom processor is just a class with one method:**
```python
class TranscriptionLogger(FrameProcessor):
    async def process_frame(self, frame, direction):
        await super().process_frame(frame, direction)     # always call super first
        if isinstance(frame, TranscriptionFrame):         # only react to what you care about
            logger.info(f"User said: {frame.text}")
        await self.push_frame(frame, direction)           # always pass the frame along
```
🐍 **Python note — `isinstance(frame, X)`.** Checks a frame's type so you handle only the frames you mean to. Forgetting `push_frame` "swallows" frames and stalls the pipeline.

▶️ **Run it.** Any example accepts a transport switch: `uv run python transports/transports-daily.py` (needs `DAILY_API_KEY`), or add `-t daily` to most examples.

🔨 **Modify it.** Add a `TranscriptionLogger`-style processor to `getting-started/06` right after `stt` and watch your words print. *Hint: import `FrameProcessor` from `pipecat.processors.frame_processor` and `TranscriptionFrame` from `pipecat.frames.frames`.*

⚠️ **Common errors.** Pipeline hangs → a custom processor didn't call `push_frame`. Wrong transport → `DAILY_API_KEY` missing when using `-t daily`.

✅ **Checkpoint.** What two calls must every `process_frame` override make? *(Answer: `super().process_frame(...)` first, and `push_frame(...)` to forward the frame.)*

📚 **Transport examples:**

| File | What it teaches |
|------|-----------------|
| `transports-daily.py` | transports daily |
| `transports-livekit.py` | transports livekit |
| `transports-moq.py` | MOQ (Media over QUIC) transport example |
| `transports-small-webrtc.py` | transports small webrtc |
| `transports-vonage.py` | Example of using OpenAI Realtime voice LLM service with Vonage Video Connector transport |

---

## Part 3 — Speech Input & Turn Detection

⏱ **45 min · beginner→intermediate**

🎯 **Concept.** Natural conversation hinges on knowing **when the user finished talking**. Pipecat blends **VAD** (speech vs. silence), **transcription** signals, and optional **turn-detection models** (including on-device "smart turn"). Related controls: **interruptions** (user talks over the bot), **idle detection** (user goes quiet), and **muting** (ignore user audio at set times). Docs: <https://docs.pipecat.ai/pipecat/learn/speech-input>, <https://docs.pipecat.ai/pipecat/fundamentals/interruptions>, <https://docs.pipecat.ai/pipecat/fundamentals/detecting-user-idle>, <https://docs.pipecat.ai/pipecat/fundamentals/user-input-muting>.

⭐ **Start here:** `turn-management-detect-user-idle.py`.

💻 **Escalating idle handling (annotated):**
```python
class IdleHandler:
    def __init__(self):
        self._retry_count = 0                     # remember how many times we've nudged

    async def handle_idle(self, aggregator):
        self._retry_count += 1
        if self._retry_count == 1:                # 1st: gentle nudge
            msg = {"role": "developer", "content": "The user has been quiet. Politely ask if they're still there."}
            await aggregator.push_frame(LLMMessagesAppendFrame([msg], run_llm=True))
        elif self._retry_count == 2:              # 2nd: firmer
            ...
        else:                                     # 3rd: say goodbye and end
            await aggregator.push_frame(TTSSpeakFrame("It seems you're busy. Have a nice day!"))
            await aggregator.push_frame(EndWorkerFrame())
```
🐍 **Python note — `self` and state.** The class stores `_retry_count` on `self`, so it persists between idle events. `LLMMessagesAppendFrame([msg], run_llm=True)` injects a message *and* tells the LLM to respond.

▶️ **Run it.** `uv run python turn-management/turn-management-detect-user-idle.py`, connect, then stay silent — watch it nudge, then end.

🔨 **Modify it.** Change the number of retries before goodbye, and reword each nudge. Then try `turn-management-smart-turn-local.py` to feel model-based turn-taking vs. plain VAD.

⚠️ **Common errors.** It ends too fast / never → idle timeout too short/long (see `runner_args` and `PipelineParams`). The `-coreml` smart-turn example needs Apple Silicon; use `turn-management-smart-turn-local.py` otherwise.

✅ **Checkpoint.** Name three signals Pipecat can combine to decide the user's turn ended. *(VAD, transcription, a turn-detection model.)*

📚 **All turn-management files:**

| File | What it teaches |
|------|-----------------|
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

---

## Part 4 — Speech to Text (STT)

⏱ **30 min · beginner**

🎯 **Concept.** STT converts incoming audio frames into text frames. Every provider is a drop-in `STTService` — same slot, different vendor. Variants: **`-http`** (request/response), **`-turns`** (also emits turn signals), **`-flux`** (ultra-low latency), **`-translation`** (transcribe + translate), **local** (on-device, no API). Docs: <https://docs.pipecat.ai/pipecat/learn/speech-to-text>, latency tuning: <https://docs.pipecat.ai/pipecat/fundamentals/stt-latency-tuning>.

⭐ **Start here:** `transcription-deepgram.py`.

💻 **A minimal STT-only pipeline (annotated):**
```python
stt = DeepgramSTTService(
    api_key=os.environ["DEEPGRAM_API_KEY"],
    settings=DeepgramSTTService.Settings(language=Language.EN),   # configure the recognizer
)
tl = TranscriptionLogger()                                        # our custom printer (Part 2)
vad_processor = VADProcessor(vad_analyzer=SileroVADAnalyzer())    # gate on real speech

pipeline = Pipeline([transport.input(), vad_processor, stt, tl, transport.output()])
```
🐍 **Python note — enums.** `Language.EN` is an *enum* value — a named constant that prevents typos like `"engish"`.

▶️ **Run it.** `uv run python transcription/transcription-deepgram.py`, connect, speak — your words print in the terminal. No LLM/TTS here; pure transcription.

🔨 **Modify it.** Swap for `transcription-whisper-local.py` (no API key, runs locally) and compare latency. Try `transcription-gladia-translation.py` for live translation.

⚠️ **Common errors.** Empty transcripts → mic muted or VAD gating everything. Local Whisper slow first run → it downloads the model once.

✅ **Checkpoint.** What does an `STTService` output, and what typically comes *before* it? *(Text frames; `transport.input()` and often a VAD processor.)*

📚 **Standalone STT (compare providers):**

| File | What it teaches |
|------|-----------------|
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

**Change STT settings at runtime** (language, model, endpointing):

| File | What it teaches |
|------|-----------------|
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

---

## Part 5 — Context & Memory

⏱ **40 min · intermediate**

🎯 **Concept.** An LLM has no memory of its own. Pipecat builds a **context** (the running message list) and feeds it to the model each turn; the **context aggregator pair** fills it automatically. Two challenges follow: **persistence** (survive reconnects/sessions) and **summarization** (compress old turns to save tokens and cost). Docs: <https://docs.pipecat.ai/pipecat/learn/context-management>, <https://docs.pipecat.ai/pipecat/fundamentals/context-summarization>.

🗺 **Where context lives:**
```
user_aggregator ─▶ [ LLMContext: system, user, assistant, user, ... ] ◀─ assistant_aggregator
                                  │ sent to the LLM every turn
                                  ▼
                    summarizer (optional) — collapses old turns into one summary message
```

💻 **Adding a first message and running the LLM:**
```python
context = LLMContext()                                    # empty transcript
context.add_message({"role": "developer", "content": "Please introduce yourself."})
await worker.queue_frames([LLMRunFrame()])                # trigger a response now
```
🐍 **Python note — messages are dicts.** Each message is a `dict` with `role` and `content`. Roles: `system`/`developer` (instructions), `user`, `assistant`.

▶️ **Run it.** `uv run python persistent-context/persistent-context-openai.py`, chat, disconnect, reconnect — it remembers.

🔨 **Modify it.** In a summarization example, lower the token threshold so it triggers after a few turns, and log the produced summary.

⚠️ **Common errors.** Bot "forgets" instantly → aggregators missing/misordered. Costs spike on long chats → add summarization.

✅ **Checkpoint.** Why does an LLM need Pipecat to manage context? *(The model is stateless; Pipecat resends the whole conversation each turn.)*

📚 **Persistent context (per provider; realtime ones keep memory in-model):**

| File | What it teaches |
|------|-----------------|
| `persistent-context-anthropic.py` | Persistent cross-session context — Anthropic |
| `persistent-context-aws-nova-sonic.py` | Persistent cross-session context — AWS |
| `persistent-context-gemini.py` | Persistent cross-session context — context-gemini |
| `persistent-context-grok-realtime.py` | Grok Realtime persistent context example |
| `persistent-context-openai-realtime.py` | Persistent cross-session context — OpenAI |
| `persistent-context-openai-responses-http.py` | Persistent cross-session context — OpenAI — Responses API, HTTP streaming |
| `persistent-context-openai-responses.py` | Persistent cross-session context — OpenAI — Responses API |
| `persistent-context-openai.py` | Persistent cross-session context — OpenAI |

**Context summarization (four strategies):**

| File | What it teaches |
|------|-----------------|
| `context-summarization-dedicated-llm.py` | Example demonstrating advanced context summarization configuration |
| `context-summarization-google.py` | Example demonstrating context summarization feature |
| `context-summarization-manual-openai.py` | Example demonstrating manual context summarization via a function call |
| `context-summarization-openai.py` | Example demonstrating context summarization feature |

---

## Part 6 — LLM Inference

⏱ **20 min · beginner**

🎯 **Concept.** The LLM reads the context and produces the reply. Swapping models is a one-line change — every provider is an `LLMService` in the same slot. These files focus on **updating LLM settings at runtime** (model, temperature, system prompt). Docs: <https://docs.pipecat.ai/pipecat/learn/llm>, <https://docs.pipecat.ai/pipecat/fundamentals/service-settings>.

💻 **Configuring and later updating an LLM:**
```python
llm = OpenAILLMService(api_key=os.environ["OPENAI_API_KEY"],
    settings=OpenAILLMService.Settings(system_instruction="You are helpful and brief."))
# ...later, at runtime:
await llm.queue_frame(LLMUpdateSettingsFrame({"temperature": 0.2}))   # push a change as a frame
```
🐍 **Python note — everything is a frame.** Even a settings change travels as a frame (`LLMUpdateSettingsFrame`), so it stays ordered with the conversation.

▶️ **Run it.** `uv run python update-settings/llm/llm-openai.py` (or `llm-gemini-live.py` for the Gemini path you're targeting).

🔨 **Modify it.** Start terse, then push an update mid-chat that makes replies verbose — no restart needed.

⚠️ **Common errors.** Update ignored → sent before the service initialized; send it after `on_client_connected`. Wrong model name → provider 400 error.

✅ **Checkpoint.** How do you change temperature without restarting? *(Push an `LLMUpdateSettingsFrame`.)*

📚 **Runtime LLM settings (per provider, incl. Vertex & Gemini Live):**

| File | What it teaches |
|------|-----------------|
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

---

## Part 7 — Function Calling (tools)

⏱ **45 min · intermediate · high value**

🎯 **Concept.** Function calling lets the LLM *do* things — look up data, hit an API, trigger an action — by returning a structured "call this function with these arguments." Pipecat runs your Python function and feeds the result back. Shapes: **plain**, **`-async`** (await network + push interim updates), **`-stream`** (stream partial results), **`-video`** (vision + tools), **`-direct`** (auto-inferred schema), **`-advanced-functionschema`** (explicit typed schema). Docs: <https://docs.pipecat.ai/pipecat/learn/function-calling>.

⭐ **Start here:** `getting-started/07-function-calling.py`, then your provider's file here.

💻 **Defining a tool and wiring it (annotated, from example 07):**
```python
async def get_current_weather(params: FunctionCallParams, location: str, format: str):
    """Get the current weather.
    Args:
        location: The city and state, e.g. "San Francisco, CA".
        format: "celsius" or "fahrenheit".
    """                                                    # ← the docstring IS the tool's schema
    await params.result_callback({"conditions": "nice", "temperature": "75"})  # return to the LLM

@llm.event_handler("on_function_calls_started")            # speak while the tool runs
async def on_function_calls_started(service, function_calls):
    await tts.queue_frame(TTSSpeakFrame("Let me check on that."))

context = LLMContext(tools=[get_current_weather, get_restaurant_recommendation])  # register tools
```
🐍 **Python note — docstrings as schema.** Pipecat reads the function's name, typed arguments, and docstring to tell the LLM how to call it. Write clear docstrings — the model relies on them.

▶️ **Run it.** `uv run python getting-started/07-function-calling.py`, connect, ask "What's the weather in Paris?" — you'll hear "Let me check on that," then the answer.

🔨 **Modify it.** (1) Add a third tool `get_time(location)`. (2) Make `get_current_weather` truly `async` with a real HTTP call (see `function-calling-*-async.py`). (3) Try `function-calling-advanced-functionschema.py` to declare an explicit `FunctionSchema`.

⚠️ **Common errors.** LLM never calls the tool → vague docstring, or the tool wasn't passed to `LLMContext(tools=[...])`. "Hangs" after a call → you forgot `await params.result_callback(...)`.

✅ **Checkpoint.** (1) Where does the tool's schema come from? (2) How do you keep the user company while a slow tool runs?

<details><summary>Answers</summary>

1. The function's name, typed parameters, and docstring.
2. Handle `on_function_calls_started` and speak a filler line (or use an `-async` handler that pushes interim updates).
</details>

📚 **All function-calling examples (pick provider, then variant):**

| File | What it teaches |
|------|-----------------|
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

---

## Part 8 — Text to Speech (TTS)

⏱ **20 min · beginner**

🎯 **Concept.** TTS turns the LLM's text into audio frames for playback. Every provider is a drop-in `TTSService`; `-http` variants use request/response instead of streaming. These files focus on **changing voice/speed/model at runtime**. Docs: <https://docs.pipecat.ai/pipecat/learn/text-to-speech>.

💻 **Configuring a voice, and switching it live:**
```python
tts = CartesiaTTSService(api_key=os.environ["CARTESIA_API_KEY"],
    settings=CartesiaTTSService.Settings(voice="71a7ad14-...-01c121"))
# switch voice mid-conversation:
await tts.queue_frame(TTSUpdateSettingsFrame({"voice": "<another-voice-id>"}))
```

▶️ **Run it.** `uv run python update-settings/tts/tts-cartesia.py`; trigger the switch and hear the voice change.

🔨 **Modify it.** Map two voice ids to "male"/"female" and switch when the user says either. (See `features-switch-voices.py` in Part 16 for a full version.)

⚠️ **Common errors.** Silence → wrong voice id for that provider. Choppy audio on `-http` → expected; streaming variants are smoother.

✅ **Checkpoint.** Difference between streaming and `-http` TTS? *(Streaming emits audio as generated; `-http` returns it in one response — simpler, slightly higher latency.)*

📚 **Runtime TTS settings (per provider):**

| File | What it teaches |
|------|-----------------|
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

---

## Part 9 — Full Voice Agents: the provider catalog

⏱ **30 min · beginner · skim, don't read all 68**

🎯 **Concept.** This folder is a **catalog**: one complete STT+LLM+TTS voice agent per speech provider. They're nearly identical to `getting-started/06` — only the service classes differ. Use it as a menu: when you want to try ElevenLabs TTS or AssemblyAI STT, open that file. Naming: `-http` = HTTP streaming TTS; `-turns` = provider turn detection; `-sagemaker` = model hosted on AWS SageMaker; `-vad-only` = a minimal VAD test bot.

⭐ **Start here:** `voice-cartesia.py` (Cartesia STT+TTS, OpenAI LLM) — the smoothest first run.

🐍 **Python note — "drop-in" swapping.** Because every provider subclasses the same base (`STTService`/`TTSService`/`LLMService`), changing vendors is literally changing the imported class name and its `Settings`. The pipeline shape never changes.

▶️ **Run it.** `uv run python voice/voice-cartesia.py` → connect and talk. Then diff it against `getting-started/06-voice-agent.py` — you'll see they're the same skeleton.

🔨 **Modify it.** Mix and match: take `voice-elevenlabs.py`'s TTS with `voice-deepgram.py`'s STT in one file. You'll learn that services are interchangeable Lego bricks.

⚠️ **Common errors.** Provider 401 → that vendor's key not in `.env`. A vendor needs an extra you didn't install → `uv sync --all-extras` (or the specific extra from the service's docs page).

✅ **Checkpoint.** What's the only thing that changes between `voice-cartesia.py` and `voice-elevenlabs.py`? *(The TTS service class + its settings; the pipeline is identical.)*

📚 **The full voice catalog (68 providers/variants):**

| File | What it teaches |
|------|-----------------|
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

---

## Part 10 — Realtime speech-to-speech (incl. Gemini Live)

⏱ **60 min · intermediate · your A2A target**

🎯 **Concept.** So far the loop was STT → LLM → TTS (three services). **Realtime** models collapse all three into **one speech-to-speech model** (OpenAI Realtime, **Gemini Live**, AWS Nova Sonic, Grok, Inworld, Ultravox). You send audio, you get audio — lower latency, and the model handles turns server-side. Trade-off: fewer swappable parts. Variants: `-async-tool` (async function calling), `-video` (vision), `-locally-driven-turns`, `-grounding`/`-google-search` (web grounding). Docs: the realtime services under <https://docs.pipecat.ai/pipecat/learn/llm> and each provider's page.

⭐ **Start here:** `realtime-gemini-live.py`.

🗺 **Realtime collapses the middle:**
```
[transport.input] ──▶ [ Gemini Live: speech-in ➜ think ➜ speech-out ] ──▶ [transport.output]
                         (one service replaces STT + LLM + TTS)
```

💻 **Gemini Live with tools + web search (annotated):**
```python
weather_function = FunctionSchema(                 # tools are declared as explicit schemas here
    name="get_current_weather",
    description="Get the current weather",
    properties={"location": {"type": "string", "description": "City, State"},
                "format": {"type": "string", "enum": ["celsius", "fahrenheit"]}},
    required=["location", "format"],
    handler=fetch_weather_from_api,                # your async function
)
search_tool = {"google_search": {}}                # a Gemini-native tool
tools = ToolsSchema(
    standard_tools=[weather_function, restaurant_function],
    custom_tools={AdapterType.GEMINI: [search_tool]},   # provider-specific tools go here
)

llm = GeminiLiveLLMService(
    api_key=os.environ["GOOGLE_API_KEY"],
    settings=GeminiLiveLLMService.Settings(
        system_instruction=system_instruction,
        voice="Aoede",                             # Puck, Charon, Kore, Fenrir, Aoede
    ),
    tools=tools,
)

context = LLMContext()                             # Gemini Live drives turns server-side;
                                                   # aggregation still works without turn frames
pipeline = Pipeline([transport.input(), context_user, llm, context_assistant, transport.output()])
```
🐍 **Python note — `FunctionSchema` vs. docstring tools.** In Part 7 the docstring *was* the schema. Realtime providers usually want an explicit `FunctionSchema` object (name, `properties`, `required`, `handler`). Same idea, more explicit.

⚠️ **Known quirk (from the file's own comment).** With `GeminiVertexLiveLLMService` you currently can't use `google_search` alongside other tools. Use the non-Vertex `GeminiLiveLLMService` for the combined setup.

▶️ **Run it.** `uv run python realtime/realtime-gemini-live.py` (needs `GOOGLE_API_KEY`), connect, ask something requiring search ("What's the news about X?") and something using a tool ("weather in Tokyo?").

🔨 **Modify it.** (1) Change `voice="Aoede"` to another Gemini voice. (2) Add a third `FunctionSchema` tool. (3) Try `realtime-gemini-live-video.py` and show it something on camera; then `realtime-gemini-live-locally-driven-turns.py` to control turns yourself.

✅ **Checkpoint.** (1) What three services does one realtime model replace? (2) Where do provider-specific tools like `google_search` go?

<details><summary>Answers</summary>

1. STT, LLM, and TTS.
2. In `ToolsSchema(custom_tools={AdapterType.GEMINI: [...]})`.
</details>

📚 **All realtime examples:**

| File | What it teaches |
|------|-----------------|
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

---

## Part 11 — Reasoning / Thinking

⏱ **25 min · intermediate**

🎯 **Concept.** "Thinking" models spend hidden tokens reasoning before answering, improving hard questions. Pipecat can surface or suppress that reasoning and combine it with function calling. Files split by provider (Anthropic, Google, Google Vertex, OpenAI Responses) and by whether tools are involved (`thinking-functions-*`).

⭐ **Start here:** `thinking-anthropic.py`, then `thinking-functions-anthropic.py`.

💻 **Enabling thinking is a settings flag:**
```python
llm = AnthropicLLMService(api_key=os.environ["ANTHROPIC_API_KEY"],
    settings=AnthropicLLMService.Settings(enable_thinking=True, thinking_budget_tokens=1024))
```
🐍 **Python note — booleans & budgets.** `enable_thinking=True` turns it on; a token *budget* caps how long it reasons so latency stays bounded.

▶️ **Run it.** `uv run python thinking/thinking-anthropic.py`, ask a multi-step puzzle, and notice the more careful answer.

🔨 **Modify it.** Lower the thinking budget and watch quality vs. speed trade off. Add a tool via `thinking-functions-anthropic.py`.

⚠️ **Common errors.** No visible effect → the base model doesn't support thinking, or the budget is tiny. Higher latency → expected; thinking costs time and tokens.

✅ **Checkpoint.** What does a thinking *budget* control? *(How many hidden reasoning tokens the model may use before answering.)*

📚 **All thinking examples:**

| File | What it teaches |
|------|-----------------|
| `thinking-anthropic.py` | Reasoning/thinking mode — Anthropic |
| `thinking-functions-anthropic.py` | Reasoning/thinking mode — Anthropic |
| `thinking-functions-google-vertex.py` | Reasoning/thinking mode — Google — via Vertex AI |
| `thinking-functions-google.py` | Reasoning/thinking mode — Google |
| `thinking-functions-openai-responses.py` | Reasoning/thinking mode — OpenAI — Responses API |
| `thinking-google-vertex.py` | Reasoning/thinking mode — Google — via Vertex AI |
| `thinking-google.py` | Reasoning/thinking mode — Google |
| `thinking-openai-responses-http.py` | Reasoning/thinking mode — OpenAI — Responses API, HTTP streaming |
| `thinking-openai-responses.py` | Reasoning/thinking mode — OpenAI — Responses API |

---

## Part 12 — Vision, Video & Avatars

⏱ **50 min · intermediate**

🎯 **Concept.** Pipecat is multimodal: video frames flow through the pipeline like audio. Three related folders:

- **`vision/`** — send an image/camera frame to a multimodal LLM and get a description ("what am I holding?").
- **`video-processing/`** — manipulate the video track itself (mirror, GStreamer sources, custom tracks) — pure frame processing, no LLM needed.
- **`video-avatar/`** — give the bot a **talking-head face** (Tavus, HeyGen, Simli, LemonSlice), either as a transport or a video service.

Docs: multimodal overview under <https://docs.pipecat.ai/pipecat/learn/overview>.

⭐ **Start here:** `vision/vision-openai.py`.

💻 **Vision is "LLM + an image frame":** you add a camera-enabled transport and a multimodal `LLMService`; when the user asks about what they're showing, the current video frame is attached to the context and described.

🐍 **Python note — frames carry any media.** The same `push_frame` machinery moves `ImageRawFrame`/video frames; a vision model is just an LLM that accepts image frames alongside text.

▶️ **Run it.** `uv run python vision/vision-openai.py`, enable camera, hold something up, ask "what is this?". For a face: `uv run python video-avatar/video-avatar-tavus-transport.py` (needs Tavus key).

🔨 **Modify it.** Swap `vision-openai.py` for `vision-moondream.py` (a small local vision model). Try `video-processing-mirror.py` to see track manipulation with no AI at all.

⚠️ **Common errors.** No image seen → camera not enabled in the browser, or transport has `video_in_enabled=False`. Avatar not rendering → avatar vendor key/room misconfigured.

✅ **Checkpoint.** What's the difference between `vision/` and `video-processing/`? *(Vision sends frames to an LLM for understanding; video-processing transforms the video track itself, often with no LLM.)*

📚 **Vision (image understanding):**

| File | What it teaches |
|------|-----------------|
| `vision-anthropic.py` | Image understanding — Anthropic |
| `vision-aws.py` | Image understanding — AWS |
| `vision-gemini-flash.py` | Image understanding — gemini-flash |
| `vision-moondream.py` | Image understanding — Moondream |
| `vision-openai-responses-http.py` | Image understanding — OpenAI — Responses API, HTTP streaming |
| `vision-openai-responses.py` | Image understanding — OpenAI — Responses API |
| `vision-openai.py` | Image understanding — OpenAI |

**Video processing (track manipulation):**

| File | What it teaches |
|------|-----------------|
| `video-processing-custom-video-track.py` | Example demonstrating custom video tracks output with Daily transport |
| `video-processing-gstreamer-filesrc.py` | video processing gstreamer filesrc — with video/vision |
| `video-processing-gstreamer-videotestsrc.py` | video processing gstreamer videotestsrc — with video/vision |
| `video-processing-local-mirror.py` | video processing local mirror — with video/vision, on-device |
| `video-processing-mirror.py` | video processing mirror — with video/vision |
| `video-processing.py` | video processing — with video/vision |

**Video avatars (talking-head faces):**

| File | What it teaches |
|------|-----------------|
| `video-avatar-heygen-transport.py` | Video avatar — HeyGen (as transport) |
| `video-avatar-heygen-video-service.py` | Video avatar — HeyGen (as video service) |
| `video-avatar-lemonslice-transport.py` | Video avatar — LemonSlice (as transport) |
| `video-avatar-simli-video-service.py` | Video avatar — Simli (as video service) |
| `video-avatar-tavus-transport.py` | Video avatar — Tavus (as transport) |
| `video-avatar-tavus-video-service.py` | Video avatar — Tavus (as video service) |

---

## Part 13 — Tools via MCP (Model Context Protocol)

⏱ **30 min · intermediate**

🎯 **Concept.** In Part 7 you wrote tools as Python functions in your file. **MCP** lets your bot use tools hosted by a **separate tool server** — a standard protocol so one server (memory, filesystem, a SaaS API) plugs into any MCP-aware app. Pipecat connects via `MCPClient` over **stdio** (a local subprocess) or **streamable HTTP** (a remote server), and the server's tools appear to the LLM just like local ones.

⭐ **Start here:** `mcp-stdio.py`.

💻 **Attaching an MCP server's tools (annotated):**
```python
from mcp import StdioServerParameters
from pipecat.services.mcp_service import MCPClient

llm = AnthropicLLMService(api_key=os.environ["ANTHROPIC_API_KEY"], ...)

mcp = MCPClient(StdioServerParameters(command="...", args=[...]))  # launch/connect the tool server
tools = await mcp.register_tools(llm)                              # its tools become the LLM's tools
context = LLMContext(tools=tools)
```
🐍 **Python note — subprocess vs. HTTP.** *stdio* runs the tool server as a child process on your machine (great for local tools). *streamable HTTP* points at a URL (great for shared/remote tools). Same `MCPClient`, different parameters.

▶️ **Run it.** `uv run python mcp/mcp-stdio.py` — the example wires a memory tool server; ask the bot to remember something, then recall it. `mcp-multiple-mcp.py` connects several servers at once.

🔨 **Modify it.** Point `mcp-streamable-http.py` at a different MCP server URL. Combine an MCP tool with a local Python tool from Part 7 in one bot.

⚠️ **Common errors.** "command not found" → the stdio server binary isn't installed/on PATH. No tools appear → `register_tools` not awaited, or the server failed to start (check its logs).

✅ **Checkpoint.** How does an MCP tool differ from a Part 7 tool? *(It lives in a separate, standardized tool server instead of in your bot's file.)*

📚 **All MCP examples:**

| File | What it teaches |
|------|-----------------|
| `mcp-multiple-mcp.py` | mcp multiple mcp |
| `mcp-stdio.py` | mcp stdio |
| `mcp-streamable-http-gemini-live.py` | mcp streamable http gemini live — HTTP streaming |
| `mcp-streamable-http.py` | mcp streamable http — HTTP streaming |

---

## Part 14 — RAG & Grounding

⏱ **30 min · intermediate**

🎯 **Concept.** LLMs don't know your private documents and can hallucinate. **RAG** (Retrieval-Augmented Generation) retrieves relevant text and puts it in the context so answers are grounded in *your* data. Related: **grounding metadata** (the model cites where facts came from) and **long-term memory** (Mem0) that persists facts across sessions.

⭐ **Start here:** `rag-gemini.py`.

💻 **The RAG shape:** on each user question, retrieve matching chunks (from a vector store or a file), add them to the context as a message, then let the LLM answer using them. The examples use Gemini's grounding and Mem0's memory to do this.

🐍 **Python note — "context stuffing."** RAG is mostly "fetch relevant text, add it to the messages list before calling the LLM." No new pipeline magic — just smarter context building (Part 5).

▶️ **Run it.** `uv run python rag/rag-gemini.py` and ask about content in the example's knowledge source (`examples/assets/rag-content.txt`).

🔨 **Modify it.** Replace the knowledge file with your own text and ask questions about it. Try `rag-mem0.py` and teach it a fact, reconnect, and see it recalled. Use `rag-gemini-grounding-metadata.py` to print citations.

⚠️ **Common errors.** Answers ignore your docs → retrieval returned nothing (empty/mismatched source). No citations → use the `-grounding-metadata` variant.

✅ **Checkpoint.** In one sentence, what does RAG add to a plain LLM call? *(Relevant retrieved text injected into the context so the answer is grounded in your data.)*

📚 **All RAG examples:**

| File | What it teaches |
|------|-----------------|
| `rag-gemini-grounding-metadata.py` | rag gemini grounding metadata — grounding metadata |
| `rag-gemini.py` | CrossFit Games 2025 Rulebook RAG Demo |
| `rag-mem0.py` | Mem0 Personalized Voice Agent Example with Pipecat |

---

## Part 15 — Structured Conversations: Flows

⏱ **60 min · intermediate→advanced**

🎯 **Concept.** For tasks with steps — intake forms, ordering, reservations, triage — a single free-form prompt is unreliable. **Pipecat Flows** models the conversation as a graph of **nodes**, each with its own instructions and allowed tools; a **`FlowManager`** moves between nodes as the user progresses. This improves accuracy and keeps the bot on-task. Docs: <https://docs.pipecat.ai/pipecat-flows> and the folder's own `README.md`.

⭐ **Start here:** `flows/hello_world.py`, then `flows/food_ordering.py`.

💻 **A node and a transition (annotated, from `hello_world.py`):**
```python
def create_initial_node() -> NodeConfig:
    return NodeConfig(
        name="initial",
        role_messages=[{"role": "system", "content": "You are a friendly assistant."}],
        task_messages=[{"role": "system", "content": "Ask the user their favorite color."}],
        functions=[record_favorite_color],           # only this tool is allowed in this node
    )

async def record_favorite_color(flow_manager, color: str) -> tuple[str, NodeConfig]:
    # do something with `color`, then RETURN THE NEXT NODE to move the conversation forward
    return "Thanks!", create_end_node()
```
🐍 **Python note — return a `(result, next_node)` tuple.** A flow function returns both what to say and *which node comes next*. That return value is how the graph advances — the core idea in Flows.

▶️ **Run it.** `uv run python flows/hello_world.py`, answer the color question, and watch it transition to the end node. Then `flows/food_ordering.py` for a real multi-step order.

🔨 **Modify it.** Add a node to `hello_world.py` that asks a second question (favorite animal) before ending. Explore `patient_intake.py`, `insurance_quote.py`, `restaurant_reservation.py`, `warm_transfer.py`, and `multi_worker_handoff.py` (a bridge to Part 18).

⚠️ **Common errors.** Conversation stuck → a flow function didn't return a next node. Bot goes off-script → tools not scoped to the node (`functions=[...]`).

✅ **Checkpoint.** What does a flow function return, and why? *(A tuple of the spoken result and the next `NodeConfig`, so the graph advances.)*

📚 **All flows examples:**

| File | What it teaches |
|------|-----------------|
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

*Supporting asset:* `flows/assets/hold_music/hold_music.py` — plays hold music during the `warm_transfer.py` handoff (not a standalone example).

---

## Part 16 — Everyday Features & Audio

⏱ **45 min · intermediate**

🎯 **Concept.** A grab-bag of production-useful patterns you'll reach for constantly: wake phrases, live translation, switching service/voice/language mid-call, DTMF phone menus, voicemail detection, email gathering, text transforms, plus the **custom `FrameProcessor`** reference. The `audio/` folder covers recording, background ambience, and sound effects.

⭐ **Start here:** `features-custom-frame-processor.py` (the canonical "write your own processor"), then `features-service-switcher.py`.

💻 **Switching a whole service at runtime** is the same "push a frame / swap the object" idea you've seen; `features-pattern-pair-voice-switching.py` and `features-switch-voices.py` show voice swaps, `features-switch-languages.py` shows language swaps.

🐍 **Python note — patterns, not new APIs.** Almost everything here is a recombination of Parts 2–8: a custom processor, an event handler, or a settings-update frame. Once the core clicks, these read easily.

▶️ **Run it.** `uv run python features/features-wake-phrase.py` (bot ignores you until you say the wake word), or `features/features-live-translation.py` (speak one language, hear another). `audio/audio-recording.py` saves the conversation to disk.

🔨 **Modify it.** Change the wake phrase. Add a background bed with `audio-bot-background-sound.py`. Chain a `features-text-transforms.py` processor to censor a word.

⚠️ **Common errors.** Wake phrase never triggers → phrase too long/uncommon for STT; pick 2–3 clear words. DTMF menu does nothing → needs a phone transport (`-t twilio`).

✅ **Checkpoint.** Most features here are built from which earlier building blocks? *(Custom processors, event handlers, and settings-update frames — Parts 2–8.)*

📚 **All features:**

| File | What it teaches |
|------|-----------------|
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

**Audio:**

| File | What it teaches |
|------|-----------------|
| `audio-bot-background-sound.py` | audio bot background sound |
| `audio-recording.py` | Audio Recording Example with Pipecat |
| `audio-sound-effects.py` | audio sound effects |

---

## Part 17 — Observing & Debugging

⏱ **20 min · intermediate**

🎯 **Concept.** In production you need to *see* what the pipeline is doing: latency (TTFB), per-service processing time, token usage, and health. **Observers** subscribe to frames without altering them; **heartbeats** confirm the pipeline is alive; **Sentry metrics** ship performance data to a dashboard. Docs: <https://docs.pipecat.ai/pipecat/fundamentals/metrics>.

⭐ **Start here:** `observability-observer.py`.

💻 **An observer watches frames read-only:**
```python
class MyObserver(BaseObserver):
    async def on_push_frame(self, data):          # called for every frame, but never blocks the flow
        logger.debug(f"{data.source} -> {data.destination}: {type(data.frame).__name__}")
```
🐍 **Python note — observer vs. processor.** A *processor* sits *in* the pipeline and can change frames; an *observer* sits *beside* it and only watches. Use observers for logging/metrics so you don't risk breaking the flow.

▶️ **Run it.** `uv run python observability/observability-observer.py` and watch frames stream by in the log. `observability-heartbeats.py` prints liveness; `observability-sentry-metrics.py` needs a Sentry DSN.

🔨 **Modify it.** Filter the observer to log only `TranscriptionFrame`s and TTFB. Add `enable_metrics=True` (you saw it in example 06) and read the timing output.

⚠️ **Common errors.** Nothing logged → observer not registered with the worker/runner. Sentry silent → missing/invalid DSN.

✅ **Checkpoint.** Why prefer an observer over a processor for logging? *(It can't accidentally alter or stall the frame flow.)*

📚 **All observability examples:**

| File | What it teaches |
|------|-----------------|
| `observability-heartbeats.py` | observability heartbeats |
| `observability-observer.py` | observability observer |
| `observability-sentry-metrics.py` | observability sentry metrics |

---

## Part 18 — Multi-Agent A2A: the capstone

⏱ **2–3 h · advanced · this is where it all comes together**

🎯 **Concept.** Everything so far was **one** agent (one `PipelineWorker`). Pipecat is also a **multi-agent** system: the same `WorkerRunner` coordinates many agents that talk over a shared message **bus**. A normal bot is just the one-agent case — so every app is already multi-agent-ready. Agent-to-agent (A2A) patterns:

- **Handoff** — several LLM agents swap "who's talking" on one audio pipeline (greeter → support).
- **Parallel fan-out (job coordination)** — one agent dispatches a job to several peers at once and synthesizes their replies.
- **Sidecar** — the main pipeline delegates to a long-lived peer agent (a code agent, a hardware controller).
- **Distributed bus** — the same patterns, but agents run in separate processes/machines over Redis or PGMQ.
- **Proxy** — two WebSocket proxies bridge a local agent to a remote one, no shared bus.
- **UI worker** — an agent bridges the bus to a web client so voice is grounded in on-screen state.

Docs: <https://docs.pipecat.ai/pipecat/learn/agent-handoff>, <https://docs.pipecat.ai/pipecat/learn/job-coordination>, <https://docs.pipecat.ai/pipecat/learn/distributed-agents>, <https://docs.pipecat.ai/pipecat/learn/proxy-agents>, <https://docs.pipecat.ai/pipecat/learn/ui-worker>, and the bus internals at <https://docs.pipecat.ai/pipecat/fundamentals/agent-bus>.

🗺 **The bus model:**
```
                         ┌──────────────── shared message bus ────────────────┐
                         │                        │                           │
   [main PipelineWorker] │           [LLMWorker: greeter]         [LLMWorker: support]
   STT/TTS + transport   │           (own LLM + context)          (own LLM + context)
   bridges audio to bus ─┘   activate/deactivate = "who's talking now"
```

### 18a — Handoff (`local-handoff/`)
⭐ **Start here.** A **main** `PipelineWorker` owns STT/TTS and the transport, and **bridges** frames to the bus. Two `LLMWorker`s (greeter + support) sit on the bus; only one is *active* at a time.

💻 **Annotated (from `local-handoff-two-agents.py`):**
```python
class AcmeLLMTask(LLMWorker):
    @tool                                              # expose a tool to THIS agent's LLM
    async def transfer_to_agent(self, params, agent: str, reason: str):
        await self.activate_worker(                    # hand control to another agent…
            agent,
            args=LLMWorkerActivationArgs(...),
            deactivate_self=True,                      # …and step aside
        )

# in run_bot:
runner = WorkerRunner(handle_sigint=runner_args.handle_sigint)
main = PipelineWorker(pipeline, bus=runner.bus, ...)   # main bridges transport <-> bus
await runner.add_workers(build_greeter(), build_support(), main)   # many agents, one runner
await runner.run()
```
🐍 **Python note — `activate_worker` / `deactivate_self`.** Handoff isn't function calls between agents; it's flipping *which* agent is active on the shared audio. The greeter calls a tool that activates support and deactivates itself.

### 18b — Parallel fan-out / job coordination (`parallel-debate/`)
💻 **Annotated (from `parallel-debate.py`):**
```python
async def debate(params, topic: str):
    async with params.pipeline_worker.job_group(       # dispatch to several peers at once
        DebateWorker("advocate"), DebateWorker("critic"), DebateWorker("analyst"),
    ) as group:
        results = await group.run(topic)               # wait for all three perspectives
    # …then the main agent synthesizes results into one spoken answer
```
🐍 **Python note — `async with ... as group`.** An *async context manager* sets up the job group, guarantees cleanup, and `await group.run(...)` gathers every peer's result before continuing.

### 18c — Sidecars, distributed, proxy, UI
- **Sidecar:** `code-assistant/` (a Claude Agent SDK worker answering codebase questions behind `job(...)`) and `sensor-controller/` (a worker owning a simulated sensor).
- **Distributed:** `distributed-handoff/redis-handoff/` and `pgmq-handoff/` run the handoff across processes over a network bus — same code shape, different `bus=`.
- **Proxy:** `remote-proxy-assistant/` links a local transport to a remote LLM worker via `WebSocketProxyClient`/`Server`, no shared bus.
- **UI workers:** `ui-worker/*` bridge the bus to a web client (snapshot of the page, deixis "explain this", form-fill, async job progress).

▶️ **Run it.** `cd examples/multi-worker && cp env.example .env` then `uv run python local-handoff/local-handoff-two-agents.py`. Ask the greeter something only "support" handles and feel the handoff. Then `parallel-debate/parallel-debate.py` — give it a topic and hear three views synthesized.

🔨 **Modify it.** (1) Add a third agent (e.g. "billing") to the handoff and a `transfer_to_agent` path to it. (2) In parallel-debate, add a fourth `DebateWorker("historian")`. (3) Point the handoff at a `RedisBus` (see `distributed-handoff/redis-handoff/`) to split agents across processes.

⚠️ **Common errors.** Handoff silent → the main worker isn't bridging to `runner.bus`, or no agent is active on connect. Job group hangs → a peer never returns its result. Redis/PGMQ examples fail → the bus service (Redis/Postgres) isn't running or `DATABASE_URL`/Redis URL is unset.

✅ **Checkpoint.**
1. What makes an app "multi-agent" instead of single-agent?
2. In handoff, how does control actually move between agents?
3. What does `job_group(...)` give you that a single agent can't?

<details><summary>Answers</summary>

1. More than one worker on the shared bus, coordinated by one `WorkerRunner`.
2. By activating another worker and deactivating the current one (not by calling it like a function).
3. Parallel dispatch to multiple peers and collection of all their results before answering.
</details>

📚 **Local (single process, in-memory bus):**

| File | What it teaches |
|------|-----------------|
| `local-handoff-two-agents-tts.py` | Two LLM workers with per-worker TTS voices |
| `local-handoff-two-agents.py` | Two LLM workers with a main worker bridging transport to the bus |
| File | What it teaches |
|------|-----------------|
| `parallel-debate.py` | Parallel debate using job groups |
| File | What it teaches |
|------|-----------------|
| `code-assistant.py` | Voice code assistant powered by Claude Agent SDK |
| `code_worker.py` | Code worker that explores a codebase using Claude Agent SDK |
| File | What it teaches |
|------|-----------------|
| `sensor-controller.py` | Voice agent + sensor-controller worker, both as plain PipelineTasks |
| `sensor.py` | Temperature sensor processors for the sensor-controller example |

**Distributed (separate processes, network bus):**

| File | What it teaches |
|------|-----------------|
| `llm.py` | LLM worker — run on Machine B (or locally alongside ``main.py``) |
| `main.py` | Main transport worker — run on Machine A |
| File | What it teaches |
|------|-----------------|
| `llm.py` | LLM worker — run on Machine B (or locally alongside ``main.py``) |
| `main.py` | Main transport worker — run on Machine A |
| File | What it teaches |
|------|-----------------|
| `assistant.py` | Remote assistant LLM server |
| `main.py` | Main transport worker with a WebSocket proxy to a remote LLM server |

**UI workers (bus ↔ web client):**

| File | What it teaches |
|------|-----------------|
| `bot.py` | Hello UIWorker — the smallest possible accessibility-snapshot demo |
| File | What it teaches |
|------|-----------------|
| `bot.py` | Shopping list — every voice turn drives the UI; speech is incidental |
| File | What it teaches |
|------|-----------------|
| `bot.py` | Form-fill — a voice-guided, accessible form walkthrough |
| File | What it teaches |
|------|-----------------|
| `bot.py` | Deixis — the UIWorker grounds in what the user just selected |
| File | What it teaches |
|------|-----------------|
| `bot.py` | Async tasks — the UIWorker fans out long-running work and streams progress |
| File | What it teaches |
|------|-----------------|
| `bot.py` | Document review — the synthesis demo |

---

## Part 19 — Build your own: a Gemini Live A2A

⏱ **project · advanced**

This ties the course to your stated goal: an all-in-one A2A system on **Gemini Live**, runnable **locally and distributed**.

**Recommended build order:**
1. **One Gemini Live agent** (Part 10) — get `realtime-gemini-live.py` talking, with one tool.
2. **Add a second agent + handoff** (Part 18a) — wrap Gemini Live inside `LLMWorker`s and swap control with `activate_worker`. ⚠️ Because Gemini Live is speech-to-speech, the **main** worker still owns the transport and bridges audio to the bus; each child agent is a Gemini Live LLM on the bus. Confirm turn behavior — Gemini Live drives turns server-side and doesn't emit turn frames.
3. **Add parallel fan-out** (Part 18b) — a `debate`-style tool that dispatches to several Gemini agents and synthesizes.
4. **Go distributed** (Part 18c) — switch the in-memory bus for `RedisBus`/`PgmqBus` so agents run in separate processes. The agent code stays the same; only `bus=` changes.
5. **Optional UI worker** (Part 18) — surface state to a web client.

**Open questions to settle before coding** (we'll plan these together next): how many specialist agents and their roles; whether fan-out agents are all Gemini Live or a cheaper text LLM; local vs. Redis vs. PGMQ for the first cut; and whether you want a UI. Bring these and we'll design the architecture.

Docs to keep open: agent handoff, job coordination, and distributed agents (links in Part 18).

---

## Appendix — Glossary

- **Frame** — a typed packet of data flowing through the pipeline (audio, text, image, or a control signal).
- **Processor (`FrameProcessor`)** — a node that receives frames, optionally transforms them, and pushes them onward. Sits *in* the pipeline.
- **Observer** — watches frames read-only, *beside* the pipeline; used for logging/metrics.
- **Pipeline** — an ordered list of processors; order defines data flow.
- **PipelineWorker** — one agent = one pipeline.
- **Worker / BaseWorker / LLMWorker / LLMContextWorker** — units of work on the bus; an `LLMWorker` owns its own LLM + context; a coordinator can be a plain `BaseWorker` with no pipeline.
- **WorkerRunner** — starts and supervises one or many workers; owns the bus.
- **Bus** — the shared message channel workers use to communicate (in-memory, Redis, or PGMQ).
- **BusBridgeProcessor** — routes frames between a transport pipeline and the bus (how the main worker connects audio to agents).
- **Transport** — how users connect (WebRTC, Daily, Twilio, local audio, LiveKit…); the first/last processor.
- **STT / LLM / TTS service** — speech-to-text / language model / text-to-speech; drop-in, provider-swappable.
- **Realtime / speech-to-speech model** — one model replacing STT+LLM+TTS (e.g., Gemini Live).
- **VAD (Voice Activity Detection)** — detects speech vs. silence (e.g., `SileroVADAnalyzer`) to sense turn ends.
- **Turn detection** — deciding when the user finished; combines VAD, transcription, and optional models.
- **LLMContext** — the running list of messages sent to the LLM each turn (the conversation memory).
- **Context aggregator pair** — two processors that record user and assistant turns into the context.
- **Function calling / tool** — the LLM returning a structured call your Python function fulfills.
- **FunctionSchema / ToolsSchema** — explicit tool declarations (name, params, handler), used esp. by realtime providers.
- **MCP (Model Context Protocol)** — a standard for tools hosted in a separate server, attached via `MCPClient`.
- **RAG** — retrieving relevant text and injecting it into the context to ground answers.
- **Flows / FlowManager / NodeConfig** — modeling a structured conversation as a graph of nodes with scoped tools.
- **Handoff** — moving control between agents by activating one and deactivating another.
- **Job group / job coordination** — dispatching work to multiple agents in parallel and collecting results.
- **RTVI** — the real-time protocol a `UIWorker` uses to talk to a web client.
- **`RunnerArguments` / `create_transport`** — plumbing that selects the transport at launch and starts the bot.
- **Extra** — an optional install group (e.g. `pipecat-ai[deepgram,cartesia]`) pulling in a provider's dependencies.
