# Pipeline & Frame Processing

> Learn how Pipecat's pipeline architecture orchestrates frame processing for voice AI applications

The **Pipeline** is the core orchestration component in Pipecat that connects frame processors together, creating a structured path for data to flow through your voice AI application.

## Basic Pipeline Structure

A Pipeline takes a list of frame processors and connects them in sequence. Here's a simple voice AI pipeline:

```python
pipeline = Pipeline([
    transport.input(),              # Receives user audio
    stt,                            # Speech-to-text conversion
    context_aggregator.user(),      # Collect user responses
    llm,                            # Language model processing
    tts,                            # Text-to-speech conversion
    transport.output(),             # Sends audio to user
    context_aggregator.assistant(), # Collect assistant responses
])
```

## Understanding Frames and Frame Processing

**Frames** are data containers that carry information through your pipeline. Each frame contains a specific type of data that processors can examine and act upon. Frames automatically receive unique identifiers and names (like `TranscriptionFrame#1`).

Common frame types include: Audio frames, Text frames, Image frames, System frames (control signals), and Context frames (conversation history and state).

**Frame Processors** are the workers in your pipeline. Each processor: receives frames from the previous processor, processes the data, creates new frames with its output, and passes frames along to the next processor. Processors are modular and reusable — you can swap STT or LLM providers without changing the rest of your pipeline.

### Frame Types

```python
@dataclass
class SystemFrame(Frame):
    """System frames are queued with high priority."""
    pass

@dataclass
class DataFrame(Frame):
    """Data frames are queued and processed in order."""
    pass

@dataclass
class ControlFrame(Frame):
    """Control frames are queued and processed in order."""
    pass
```

* **SystemFrames**: High-priority and ordered with other SystemFrames; interruptions do not discard them.
* **DataFrames & ControlFrames**: Queued and processed in order (audio output, text, images).

### How Frame Processors Work

Every frame processor follows the same pattern with two key methods:

```python
class TranscriptionLogger(FrameProcessor):
    async def process_frame(self, frame: Frame, direction: FrameDirection):
        # Always call parent first
        await super().process_frame(frame, direction)
        # Handle specific frame types
        if isinstance(frame, TranscriptionFrame):
            print(f"Transcription: {frame.text}")
        # Push frame to next processor
        await self.push_frame(frame, direction)
```

* **`process_frame()`**: Inspect and handle incoming frames
* **`push_frame()`**: Send frames upstream or downstream

## How Data Flows Through Pipelines

**Order matters**: Processors must be arranged so that each receives the frame types it needs. `transport.input()` creates `InputAudioRawFrame`s → `stt` outputs `TranscriptionFrame`s → `llm` generates `LLMTextFrame`s → `tts` converts to audio → `transport.output()` sends audio back.

**Processors always push frames**: Processors don't consume frames, they pass them along, allowing multiple processors to use the same data stream.

### Parallel Processing

Use `ParallelPipeline` to create branches where each branch receives all upstream frames (often paired with filters/gates):

```python
pipeline = Pipeline([
    transport.input(), stt, context_aggregator.user(), llm,
    ParallelPipeline([
        [FunctionFilter(english_filter), english_tts],
        [FunctionFilter(spanish_filter), spanish_tts],
    ]),
    transport.output(), context_aggregator.assistant(),
])
```

## Key Takeaways

* **Order matters** — arrange processors so each gets the frames it needs.
* **Processors push frames** — they pass frames downstream, not consume them.
* **Frame types determine processing** — SystemFrames use a high-priority queue; Data/Control frames use the non-system queue.
* **Queuing ensures reliability** and **parallel processing** enables conditional logic.

*Offline copy. Source: https://docs.pipecat.ai/pipecat/learn/pipeline*
