## Ask Maia what she can do

```text
Prompt: Maia, what can you help with?
```

![insert Image]

On the left-hand side of the screen, the Maia interface opens. You can see that Maia can help with:

- Pipeline Development
- Data Warehouse Integration
- Architecture & Best Practices
- Pipeline Analysis

Let's start by creating a new data pipeline. Select: 🏗️ Build a new data pipeline.

Maia will respond with some guidelines and questions to improve her response. Let's give her a prompt:

```text
Ingest all .mp3 files from the internal stage @RAW.INT_STAGE_DOC_RAW into Snowflake.
Create a target table STAGE.AUDIO_FILES.
Store the full file content in a BINARY column named AUDIO_FILE.
Generate a signed URL for each file to enable remote access, saved in a column called AUDIO_FILE_URL.
Ensure the process supports repeatable, incremental runs and avoids reloading files that have already been ingested.
```


Use DIRECTORY() to list files from a stage.

Load binary content with TO_FILE().

Generate file URLs with BUILD_STAGE_FILE_URL().

Filter for .mp3 and .wav files using ILIKE.