Lets find out what Miai can assisst us with.

In the prompt window in the middle ofthe screen type



```plaintext
What can you help with?
```

We can see that Maia can assist us with:

* Pipeline Development
* Data Warehouse Integration
* Data Engineering Best Practices
* Pipeline Analysis & Optimization

Lets get Maia to assis in building some piplein to extract data from the audio transcript we just uploaded.

```plaintext
I want to extract the audio from the .mp3 files that are saved in EXTRACT.INT_STAGE_DOC snowflake stage

```

EXTRACT LOAD

```plaintext
Create an incremental audio files extract from snowflake stage:

**Name**: EXTRACT_AUDIO_TRANSCRIPT
**Folder**: 01 - EXTRACT

**Source**: @EXTRACT.INT_STAGE_DOC
**Target**: EXTRACT.AUDIO_FILES (existing table)
**Key**: CALL_TRANSCRIPT_ID (unique identifier)  
**Load Type**: Incremental - exclude existing records

**Required Output Fields**:
- CALL_TRANSCRIPT_ID, FILE_PATH, AUDIO_FILE, AUDIO_FILE_URL,
- LAST_MODIFIED FILE_SIZE, LAST_MODIFIED, FILE_EXTENSION

```


```plaintext
Create an incremental extract lookup pipeline:

**Name**: EXTRACT_LOOKUP
**Folder**: 01 - EXTRACT

**Source**: @EXTRACT.INT_STAGE_DOC
**File**: LOOKUP.json
**Target**: EXTRACT.LOOKUP (existing table)
**File Format**: EXTRACT.JSON_FORMAT
**Key**: LOOKUP_FILTER, LOOKUP_ID (unique identifier)  
**Load Type**: Incremental - exclude existing records
```

STAGE LOAD

```plaintext
Create an incremental audio transcription pipeline:

**Name**: STAGE_AUDIO_TRANSCRIPT
**Folder**: 02 - STAGE

**Source**: EXTRACT.AUDIO_FILES  
**Target**: STAGE.AUDIO_TRANSCRIPT (existing table)  
**Key**: TRANSCRIPT_ID (unique identifier)  
**Load Type**: Incremental - exclude existing records

**Guidelines**: Use AI_TRANSCRIBE function to convert audio files to text transcripts.

**Required Output Fields**:
- TRANSCRIPT_ID, FILE_PATH, AUDIO_FILE_URL, FILE_SIZE, LAST_MODIFIED
- TRANSCRIPT_JSON, DURATION, TRANSCRIPT, TRANSCRIPTION_DATE  
- CHARACTER_COUNT, WORD_COUNT

```




DIMENSION LOAD

## DIM_CALL_TYPE

```plaintext
Create Dimension Load

**Name**: LOAD_DIM_CALL_TYPE
**Folder**: 03 - LOAD

**Source**: EXTRACT.LOOKUP  
**Filter**: LOOKUP_FILTER = "CALL_TYPE"
**Target**: DWH.DIM_CALL_TYPE (existing table)  
**Natural Key**: CALL_TYPE_CODE (unique identifier)  
**Load Type**: Incremental Load
**Validation Errors**: If there are validation errors check manually

**Guidelines**: Use Calculator component to rename source columns to match target table structure, then Table Update for MERGE operation.  

```

> ⚠️ **Validation Errors**  
> - Manually validate the join expression.
> - Change When Matched = TRUE

--

##LOAD_DIM_CALL_SENTIMENT

```plaintext
Create Dimension Load

**Name**: LOAD_DIM_CALL_SENTIMENT
**Folder**: 03 - LOAD

**Source**: EXTRACT.LOOKUP  
**Filter**: LOOKUP_FILTER = "CALL_SENTIMENT"
**Target**: DWH.DIM_CALL_SENTIMENT (existing table)  
**Natural Key**: CALL_SENTIMENT_CODE (unique identifier)  
**Load Type**: Incremental Load
**Validation Errors**: If there are validation errors check manually

**Guidelines**: 
Use Calculator component to rename source columns to match target table structure.

Table Update for MERGE INTO operation. 
Insert of new records,
When Matched = TRUE
Update all existing records


```

> ⚠️ **Validation Errors**  
> - Manually validate the join expression.
> - Change When Matched = TRUE


##LOAD_DIM_CALL_SENTIMENT

```plaintext
Create Dimension Load

**Name**: LOAD_DIM_CALL_SENTIMENT
**Folder**: 03 - LOAD

**Source**: EXTRACT.LOOKUP  
**Filter**: LOOKUP_FILTER = "CALL_SENTIMENT"
**Target**: DWH.DIM_CALL_SENTIMENT (existing table)  
**Natural Key**: CALL_SENTIMENT_CODE (unique identifier)  
**Load Type**: Incremental Load
**Validation Errors**: If there are validation errors check manually

**Guidelines**: 
Use Calculator component to rename source columns to match target table structure.

Table Update for MERGE INTO operation. 
Insert of new records,
When Matched = TRUE
Update all existing records


```

> ⚠️ **Validation Errors**  
> - Manually validate the join expression.
> - Change When Matched = TRUE




```plaintext
Create Dimension Load

**Name**: LOAD_DIM_CALL_STATUS
**Folder**: 03 - LOAD

**Source**: EXTRACT.LOOKUP  
**Filter**: LOOKUP_FILTER = "CALL_STATUS"
**Target**: DWH.DIM_CALL_SENTIMENT (existing table)  
**Natural Key**: CALL_SENTIMENT_CODE (unique identifier)  
**Load Type**: Incremental Load
**Validation Errors**: If there are validation errors check manually

**Guidelines**: Use Calculator component to rename source columns to match target table structure, then Table Update for MERGE operation.  

```

> ⚠️ **Validation Errors**  
> - Manually validate the join expression.
> - Change When Matched = TRUE




Create Dimension Load

**Name**: LOAD_DIM_AGENT
**Folder**: 03 - LOAD

**Source**: STAGE.LOOKUP
**Filter**: LOOKUP_FILTER = "CALL_STATUS"
**Target**: DWH.DIM_CALL_STATUS (existing table)
**Natural Key**: CALL_STATUS_CODE (unique identifier)
**Load Type**: Incremental Load
**Validation Errors**: If there are validation errors let me check manually

**Guidelines**:
Use Calculator component to rename source columns to match target table structure.

Only Use Table Update
Insert of new records, When Matched = TRUE
Update all existing records

##DIM_CALL_TYPE

Run this 


Name: LOAD_DIM_PRODUCT_TYPE
Folder: 03 - LOAD

Source: EXTRACT.REFERENCE_DATA
Filter: REF_TYPE = "PRODUCT_TYPE"
Target: DWH.DIM_PRODUCT_TYPE (existing table)
Natural Key: PRODUCT_TYPE_CODE (unique identifier)
Load Type: Incremental Load
Validation Errors: If there are validation errors check manually

Guidelines: Use Calculator component to rename source columns to match target table structure, then Table Update for merge operation


Create Dimension Load

Name: LOAD_DIM_SENTIMENT
Folder: 03 - LOAD

Source: EXTRACT.LOOKUP
Filter: LOOKUP_FILTER = "SENTIMENT"
Target: DWH.DIM_SENTIMENT (existing table)
Natural Key: SENTIMENT_CODE (unique identifier)
Load Type: Incremental Load
Validation Errors: If there are validation errors check manually

Guidelines: Use Calculator component to rename source columns to match target table structure, then Table Update for merge operation

Column Mapping:

LOOKUP_CODE → SENTIMENT_CODE
LOOKUP_SHORT_NAME → SENTIMENT
LOOKUP_DESC → SENTIMENT_DESC
LOOKUP_SORT_ORDER → SENTIMENT_SORT_ORDER

```plaintext
Create Type 1 Dimension

**Name**: LOAD_DIM_CALL_SENTIMENT
**Folder**: 03 - LOAD

**Source**: EXTRACT.LOOKUP  
**Filter**: LOOKUP_FILTER = "CALL_SENTIMENT"
**Target**: DWH.DIM_CALL_SENTIMENT (existing table)  
**Business Key**: CALL_SENTIMENT_CODE (unique identifier)  
**Load Type**: Full Load

**Guidelines**: Use MERGE statement
```

```plaintext
Create Type 1 Dimension

**Name**: LOAD_DIM_CALL_PRIORITY
**Folder**: 03 - LOAD

**Source**: EXTRACT.LOOKUP  
**Filter**: LOOKUP_FILTER = "CALL_PRIORITY"
**Target**: DWH.DIM_CALL_PRIORITY (existing table)  
**Business Key**: CALL_PRIORITY_CODE (unique identifier)  
**Load Type**: Full Load

**Guidelines**: Use MERGE statement
```

```plaintext
Create Type 1 Dimension

**Name**: LOAD_DIM_CALL_STATUS
**Folder**: 03 - LOAD

**Source**: EXTRACT.LOOKUP  
**Filter**: LOOKUP_FILTER = "CALL_STATUS"
**Target**: DWH.DIM_CALL_STATUS (existing table)  
**Business Key**: CALL_STATUS_CODE (unique identifier)  
**Load Type**: Full Load

**Guidelines**: Use MERGE statement, retain SURROGATE_KEY
```






```plaintext
Create an incremental audio transcription transformation pipeline with the following specifications:

**File Name**: `audio-transcription/incremental-audio-transcription.tran.yaml`

**Pipeline Architecture**:

1. **Source Data Input**:
   - Component: Table Input named "Source Audio Files"
   - Table: `CALL_CENTER_ANALYTICS_DW.EXTRACT.AUDIO_FILES`
   - Columns: TRANSCRIPT_ID, FILE_PATH, AUDIO_FILE, AUDIO_FILE_URL, FILE_SIZE, LAST_MODIFIED, FILE_EXTENSION

2. **Existing Records Check**:
   - Component: Table Input named "Existing Transcripts"  
   - Table: `CALL_CENTER_ANALYTICS_DW.STAGE.AUDIO_TRANSCRIPT`
   - Columns: TRANSCRIPT_ID (only)

3. **Incremental Loading Logic**:
   - Component: Join named "Anti Join"
   - Type: LEFT JOIN between Source Audio Files and Existing Transcripts
   - Join condition: Source Audio Files.TRANSCRIPT_ID = Existing Transcripts.TRANSCRIPT_ID
   - Output: All columns from Source Audio Files + EXISTING_TRANSCRIPT_ID from Existing Transcripts

4. **Filter New Records**:
   - Component: Filter named "Filter New Files"
   - Condition: EXISTING_TRANSCRIPT_ID IS NULL
   - Purpose: Only process files that haven't been transcribed yet

5. **AI Transcription Processing**:
   - Component: SQL named "AI Transcription"
   - Function: Use Snowflake's AI_TRANSCRIBE() function to convert AUDIO_FILE (FILE data type) to text
   - Output columns:
     * TRANSCRIPT_ID, FILE_PATH, AUDIO_FILE_URL, FILE_SIZE, LAST_MODIFIED (pass-through)
     * TRANSCRIPT_JSON (full AI_TRANSCRIBE result as VARIANT)
     * DURATION (extracted from AI_TRANSCRIBE result)
     * TRANSCRIPT (clean text extracted from result)
     * TRANSCRIPTION_DATE (current timestamp)
     * CHARACTER_COUNT (length of transcript)
     * WORD_COUNT (word count using ARRAY_SIZE and SPLIT)

6. **Output to Target Table**:
   - Component: Table Output named "Output Transcripts"
   - Target: `CALL_CENTER_ANALYTICS_DW.STAGE.AUDIO_TRANSCRIPT`
   - Mode: APPEND (for incremental loading)
   - Column mapping: 1:1 mapping for all fields

**Key Requirements**:
- Incremental loading: Only process new audio files not already transcribed
- Use AI_TRANSCRIBE function for audio-to-text conversion
- Handle NULL values appropriately with TRY_CAST and COALESCE
- Calculate derived metrics (character count, word count)
- Append new transcriptions to existing table without overwriting

**Expected Behavior**:
When run, pipeline should identify new audio files, transcribe them using AI, and append results to the target table while skipping already processed files.
```