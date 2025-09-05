id: snowflake-intelligence-callcenter-lab
name: Snowflake Intelligence: Call Centre Analytics with AI Agents
summary: A self-paced hands-on lab that teaches how to use Snowflake Cortex AI to ingest, extract, structure, translate, analyze, summarize, and answer questions from audio recording of call center transcripts.
author: Douglas Day
categories: ["AI", "Cortex", "Call Center", "Cortex Analyst", "Cortex Search", "Agentic AI", "Snowflake Intelligence"]
environments: Web
duration: 60
status: Published
license: Apache-2.0
tags: ["snowflake", "cortex-ai", "cortex-analyst", "cortex-search", "agentic-ai", "snowflake-intelligence"]
source: internal
analytics account: G-02FDYMQBCN
feedback link: https://github.com/datalab-solutions/snowflake-codelabs/issues
level: advanced
products: ["Snowflake Cortex Functions", "Cortex Analyst", "Cortex Search", "Agentic AI", "Snowflake Intelligence"]

# Snowflake Intelligence: Call Centre Analytics with AI Agents

## Overview

Duration: 0:03:00

### Introduction
This hands-on lab introduces participants to **Snowflake Cortex AI’s ability to analyze unstructured call center conversations** using large language models. Unlike traditional BI workflows, this lab shows how to ingest, transcribe, enrich, and structure **raw audio recordings (.wav/.mp3)** and transcript documents (.txt/.pdf) directly inside Snowflake. You will explore functions such as `AI_TRANSCRIBE`, `SUMMARIZE`, `SENTIMENT`, `AI_SENTIMENT`, `AI_CLASSIFY`, `AI_COMPLETE`, and `EXTRACT_ANSWER`. These tools empower you to:

* Convert call recordings into searchable transcripts.
* Summarize long conversations into concise overviews.
* Measure overall and entity-specific sentiment.
* Classify call types by intent (complaint, query, sales, cancellation, etc.).
* Extract key answers like customer name, call reason, or resolution.
* Generate structured insights, action items, and follow-ups using completions.

In addition, you will:

* Create a **Semantic View** that unifies transcripts, classifications, and sentiment into a single dataset for BI or Cortex Analyst.
* Deploy a **Cortex Search Service** to perform contextual, vector-based retrieval across transcripts.
* Use **Cortex Analyst** to enable guided, natural language Q&A on call data.

By the end of this lab, you will have transformed **raw call recordings** into **actionable business intelligence**, equipping analysts and support managers with the ability to identify trends, improve service quality, and uncover insights faster.

### What You'll Learn

#### AI SQL

* Upload and manage unstructured call center data in Snowflake
* Transcribe audio with [`AI_TRANSCRIBE`](https://docs.snowflake.com/en/sql-reference/functions/ai_transcribe)
* Summarize transcripts with [`SUMMARIZE`](https://docs.snowflake.com/en/sql-reference/functions/summarize-snowflake-cortex)
* Analyze sentiment using [`SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/sentiment-snowflake-cortex) and [`AI_SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/ai_sentiment)
* Classify call intent with [`AI_CLASSIFY`](https://docs.snowflake.com/en/sql-reference/functions/ai_classify)
* Extract structured details with [`EXTRACT_ANSWER`](https://docs.snowflake.com/en/sql-reference/functions/extract_answer-snowflake-cortex)
* Perform advanced completions with [`AI_COMPLETE`](https://docs.snowflake.com/en/sql-reference/functions/ai_complete)
* Explore prompt building with [`PROMPT`](https://docs.snowflake.com/en/sql-reference/functions/prompt) to simplify and structure code
* Aggregate textual data and generate concise summaries with [`AI_AGG`](https://docs.snowflake.com/en/sql-reference/functions/ai_agg)

#### CORTEX ANALYST

* Assemble insights into a unified [SEMANTIC VIEW](https://docs.snowflake.com/en/sql-reference/sql/create-semantic-view) for BI and Q&A
* Enable guided Q&A with [CORTEX ANALYST](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)

#### CORTEX SEARCH

* Deploy a [CORTEX SEARCH SERVICE](https://docs.snowflake.com/en/sql-reference/sql/create-cortex-search) for transcript retrieval

#### AGENTS

* Build [CORTEX AGENTS](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents) to orchestrate across both structured and unstructured data sources to deliver insights.

#### SNOWFLAKE INTELLIGENCE

* Combine [CORTEX ANALYST](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst), [CORTEX SEARCH SERVICE](https://docs.snowflake.com/en/sql-reference/sql/create-cortex-search), and [CORTEX AGENTS](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents) into a single [SNOWFLAKE INTELLIGENCE](https://docs.snowflake.com/en/user-guide/snowflake-cortex/snowflake-intelligence) chat experience that powers advanced call center analytics.

### Download Source Files

Download all source SQL files for this lab [here](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2Fdatalabsolutions%2FAI-Labs%2Ftree%2Fmain%2Fsnowflake-snowflake-intelligence-callcenter-lab%2Fscripts)

### Prerequisites

Duration: 0:01:00

* A [Snowflake account](https://trial.snowflake.com/?owner=SPN-PID-452710) in a region where **Snowflake Cortex LLM functions** are supported
* Basic familiarity with SQL and the Snowflake UI
* Access all the scripts for this Lab [on GitHub](https://github.com/datalabsolutions/AI-Labs/tree/main/snowflake-snowflake-intelligence-callcenter-lab)
* [Download all the audio files](https://github.com/datalabsolutions/AI-Labs/blob/a27daf7c5d6f72949cc73c820351348d755bbd9c/snowflake-snowflake-intelligence-callcenter-lab/assets/audio_files/audio-files.zip?raw=1)

> 💡 **Tip:** Explore this interactive walkthrough to learn how to sign up for a [Snowflake account](https://app.supademo.com/demo/cmbw9nmxe0606xw0izxyku479).

> 💡 **Tip:** Use the [LLM Function Availability](https://docs.snowflake.com/en/user-guide/snowflake-cortex/llm-functions#availability) page to check which cloud regions are supported.


## Environment Configuration

Duration: 0:04:00

### Learning Outcome
Create the core Snowflake resources needed to run the AI Lab. This includes a database, warehouse, schemas, and a stage for uploading audio and transcript files.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/01-AI-LAB-CONFIGURATION.sql).

### Description
This setup script prepares your Snowflake environment to ingest and process unstructured call center data.

* `CREATE DATABASE` ensures your lab operates in a clean, isolated environment.
* `CREATE WAREHOUSE` provisions compute resources for your queries and is configured to minimize cost via automatic suspend/resume.
* `CREATE SCHEMA` creates logical namespaces for raw files (`RAW`), processed/intermediate data (`STAGE`), and consolidated analytics objects (`ANALYTICS`).
* `CREATE STAGE` sets up a secure location to upload audio and transcript documents (`.mp3`, `.wav`, `.pdf`, `.txt`), supports directory-style access, and uses Snowflake‑managed encryption.

### Step 1: Create the Database
This command creates a database named `CALL_CENTER_DB` if it doesn’t already exist. Using `IF NOT EXISTS` ensures the script is idempotent and safe to rerun.

```sql
CREATE DATABASE IF NOT EXISTS CALL_CENTER_DB;
```

### Step 2: Create a Compute Warehouse

This step provisions a warehouse named `USER_STD_XSMALL_WH` with cost‑efficient settings:

* Size: `XSMALL` — small and cost‑effective for light workloads.
* Type: `STANDARD` — supports most use cases.
* Auto Suspend: `60` seconds — saves credits after inactivity.
* Auto Resume: `TRUE` — resumes automatically on query.
* Initially Suspended: `TRUE` — starts paused until needed.

```sql
CREATE OR REPLACE WAREHOUSE USER_STD_XSMALL_WH
WITH
    WAREHOUSE_SIZE = 'XSMALL'
    WAREHOUSE_TYPE = 'STANDARD'
    AUTO_SUSPEND = 60
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = TRUE;
```

> 💡 **Tip:** Auto-suspend after 60 seconds prevents unnecessary credit usage. Auto-resume ensures queries always run when needed.

### Step 3: Create Required Schemas

Schemas help organize your database objects.

```sql
CREATE SCHEMA IF NOT EXISTS CALL_CENTER_DB.RAW;
CREATE SCHEMA IF NOT EXISTS CALL_CENTER_DB.STAGE;
CREATE SCHEMA IF NOT EXISTS CALL_CENTER_DB.ANALYTICS;
```

* `RAW` stores the ingested audio and transcript files.
* `STAGE` is used for parsed, structured, or AI-enriched data.
* `ANALYTICS` is reserved for semantic views, aggregated results, and reporting tables.

Using `IF NOT EXISTS` prevents duplication errors and makes the script safe to rerun.

### Step 4: Create an Internal Stage for Uploads

The internal stage is where you will upload audio files. 

```sql
CREATE OR REPLACE STAGE CALL_CENTER_DB.RAW.INT_STAGE_DOC_RAW
    DIRECTORY = ( ENABLE = true )
    ENCRYPTION = ( TYPE = 'SNOWFLAKE_SSE' );
```
> 🔒 **Note:** Files uploaded here are secured with Snowflake’s Server-Side Encryption (SSE).


### Step 5: Configure Snowflake Intelligence Database

Ensure that the Snowflake Intelligence database exists.  If this does not exist you will not be able to create agents later in the lab.

```sql
CREATE DATABASE IF NOT EXISTS SNOWFLAKE_INTELLIGENCE;
GRANT USAGE ON DATABASE SNOWFLAKE_INTELLIGENCE TO ROLE PUBLIC;

CREATE SCHEMA IF NOT EXISTS SNOWFLAKE_INTELLIGENCE.AGENTS;
GRANT USAGE ON SCHEMA SNOWFLAKE_INTELLIGENCE.AGENTS TO ROLE PUBLIC;

ALTER ACCOUNT SET CORTEX_ENABLED_CROSS_REGION = 'ANY_REGION';
```

### Step 6: Upload Files to the Stage

Your internal stage `CALL_CENTER_DB.RAW.INT_STAGE_DOC_RAW` is now set up.

1. In Snowsight, go to **Databases**.
2. Select `CALL_CENTER_DB` → `RAW` → **Stages**.
3. Click on `INT_STAGE_DOC_RAW`.
4. Click **+ Files** and upload one or more audio recordings (MP3/WAV).

> 🔒 **Note:** The zip file that you [downloaded](https://github.com/datalabsolutions/AI-Labs/blob/a27daf7c5d6f72949cc73c820351348d755bbd9c/snowflake-snowflake-intelligence-callcenter-lab/assets/audio_files/audio-files.zip?raw=1) will need to be unzipped.  You need to upload the individual files.

---

## AI_TRANSCRIBE

Duration: 0:06:00

### Learning Outcome
Use the `AI_TRANSCRIBE()` function to convert staged audio files into structured transcripts. This process enables downstream analytics by transforming unstructured `.wav` and `.mp3` recordings into searchable text.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/02-AI-LAB-CORTEX-AI_TRANSCRIBE.sql).

### Description
The `AI_TRANSCRIBE()` function allows Snowflake to process audio files directly from a stage and generate text transcripts. This is a critical step for working with call center data, as it turns raw recordings into usable data for summarization, sentiment analysis, classification, and search.

In this step, you will:

* List staged audio files available for transcription.
* Create a table (`AUDIO_FILES`) to manage file metadata.
* Run transcription jobs using `AI_TRANSCRIBE()`.
* Persist results into a new table with transcripts, quality checks, and basic metrics.

### Step 1: Set Snowflake Context
Ensure you are working in the correct database, schema, and warehouse. Run each of these commands before executing subsequent queries:

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA RAW;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 2: List Staged Audio Files

Check which audio files are staged and available for transcription.

```sql
LIST @CALL_CENTER_DB.RAW.INT_STAGE_DOC_RAW/;
```

### Step 3: Create an Audio Files Table

Here we create a table that **references the staged files** and captures essential metadata like file path, size, last modified date, extension, and a generated `CALL_ID`. This table acts as a catalog of files and will be used later to feed into `AI_TRANSCRIBE()`.

Two important functions are used here:

* **`DIRECTORY()`** – returns metadata about files in an internal stage, including file path, size, and modification time.
* **`TO_FILE()`** – creates a Snowflake `FILE` object from a file in a stage, which can then be passed into functions like `AI_TRANSCRIBE()` to read the actual content.

By combining these, we are building a structured reference table that both **tracks the metadata** and **stores handles to the actual staged audio files**.

```sql
CREATE OR REPLACE TABLE CALL_CENTER_DB.RAW.AUDIO_FILES 
AS
    SELECT 
        RELATIVE_PATH AS "FILE_PATH",
        TO_FILE('@CALL_CENTER_DB.RAW.INT_STAGE_DOC_RAW', RELATIVE_PATH) AS "AUDIO_FILE",
        BUILD_STAGE_FILE_URL('@CALL_CENTER_DB.RAW.INT_STAGE_DOC_RAW',RELATIVE_PATH) AS "AUDIO_FILE_URL",
        SIZE AS "FILE_SIZE",
        LAST_MODIFIED,
        SPLIT_PART(RELATIVE_PATH, '.', -1) AS "FILE_EXTENSION",
        REPLACE(RELATIVE_PATH, '.mp3', '') AS "CALL_ID"
    FROM 
        DIRECTORY('@CALL_CENTER_DB.RAW.INT_STAGE_DOC_RAW')
    WHERE 
        RELATIVE_PATH ILIKE '%.mp3' 
    OR  RELATIVE_PATH ILIKE '%.wav';
```

### Step 4: Preview Audio Files

Verify that the `AUDIO_FILES` table was populated correctly.

```sql
SELECT * FROM CALL_CENTER_DB.RAW.AUDIO_FILES LIMIT 1;
```

### Step 5: Transcribe Audio Files

Here we use the `AI_TRANSCRIBE()` function to process each `AUDIO_FILE` and return a **JSON object** containing transcript text and metadata. We then extract the transcript text from the JSON using:

```sql
TRANSCRIPT_JSON:text::STRING AS "TRANSCRIPT"
```

To enrich the results further, we calculate additional metrics:

* **`LENGTH(TRANSCRIPT)`** – counts the total number of characters in the transcript.
* **`ARRAY_SIZE(SPLIT(TRANSCRIPT, ' '))`** – splits the transcript on spaces and counts the resulting array size, effectively giving a **word count**.
* A **status flag** (`SUCCESS`, `FAILED`, `SHORT`) is added to quickly validate transcription quality.

```sql
CREATE OR REPLACE TABLE CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES 
AS
    SELECT 
        CALL_ID,
        FILE_PATH,
        AUDIO_FILE_URL,
        FILE_SIZE,
        LAST_MODIFIED,
        AI_TRANSCRIBE(AUDIO_FILE) AS "TRANSCRIPT_JSON",
        TRANSCRIPT_JSON:audio_duration::FLOAT AS "DURATION",
        TRANSCRIPT_JSON:text::STRING AS "TRANSCRIPT",
        CURRENT_TIMESTAMP() AS "TRANSCRIPTION_DATE",
        LENGTH(TRANSCRIPT) AS "CHARACTER_COUNT",
        ARRAY_SIZE(SPLIT(TRANSCRIPT, ' ')) AS "WORD_COUNT",
        CASE 
            WHEN TRANSCRIPT IS NULL THEN 'FAILED'
            WHEN CHARACTER_COUNT < 10 THEN 'SHORT'
            ELSE 'SUCCESS'
        END AS "TRANSCRIPT_STATUS"
    FROM 
        CALL_CENTER_DB.RAW.AUDIO_FILES
    ORDER BY
        FILE_SIZE ASC; 
```

### Step 6: Preview Transcriptions

Check the results of your transcription job.

```sql
SELECT * FROM CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES LIMIT 10;
```

---

You now have raw audio recordings transcribed into searchable text, complete with metadata, character counts, and word counts. This table will serve as the foundation for the next steps, including summarization, sentiment analysis, classification, and Q\&A.


## EXTRACT_ANSWER

Duration: 0:05:00

### Learning Outcome
Use `SNOWFLAKE.CORTEX.EXTRACT_ANSWER()` to pull precise facts from call transcripts (e.g., the call center agent’s name), and persist those answers for downstream analytics.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/03-AI-LAB-CORTEX-EXTRACT_ANSWER.sql).

### Description
`EXTRACT_ANSWER()` performs question‑answering over text and returns an **array of candidate answers**, each with an **answer string** and a **relevance score**. We’ll:

* Ask a targeted question against each transcript.
* Parse the first (highest‑ranked) answer and its score.
* Persist the extracted value for reuse in later steps.

> 💡 **Tip:** Start with a small subset (e.g., one `CALL_ID`) to validate accuracy, then run across the dataset.

### Step 1: Set Snowflake Context
Run each statement to ensure you’re in the correct database, schema, and warehouse.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 2: Extract the Agent’s Name from Each Transcript

Here we ask: **“What is the name of the call center agent?”** The function returns an array; we select the top candidate’s `answer` and `score`.

```sql
SELECT
    CALL_ID,
    TRANSCRIPT,
    SNOWFLAKE.CORTEX.EXTRACT_ANSWER(
        TRANSCRIPT,
        'What is the name of the call center agent?'
    ) AS AGENT_JSON,
    AGENT_JSON[0]:answer::TEXT AS CALL_CENTER_AGENT,
    AGENT_JSON[0]:score::TEXT  AS CALL_CENTER_AGENT_SCORE
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES;
```

> 🔎 **Why array indexing?** `EXTRACT_ANSWER()` may return multiple candidates. `AGENT_JSON[0]` selects the best‑scoring one.

### Step 3: Persist Extracted Answers

Store the agent’s name (and keep the transcript if you want easy verification later). This makes the result reusable by other steps and BI tools.

```sql
CREATE OR REPLACE TABLE CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_AGENT AS

WITH CTE_AGENT AS (
    SELECT
        CALL_ID,
        TRANSCRIPT,
        SNOWFLAKE.CORTEX.EXTRACT_ANSWER(
            TRANSCRIPT,
            'What is the name of the call center agent?'
        ) AS AGENT_JSON,
        AGENT_JSON[0]:answer::TEXT AS CALL_CENTER_AGENT
    FROM CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
)

SELECT
    CALL_ID,
    TRANSCRIPT,
    CALL_CENTER_AGENT
FROM CTE_AGENT;
```

### Step 4: Preview Saved Results

Confirm that the table contains expected values.

```sql
SELECT * FROM CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_AGENT LIMIT 10;
```

---

### Notes & Troubleshooting

* **Ambiguous names:** If the transcript includes multiple people, refine the question (e.g., “What is the **agent’s** name?” vs. “What is the **customer’s** name?”).
* **Missing values:** Some calls may not explicitly mention a name; the model may return an empty array. Consider adding a `WHERE` filter or default value logic when persisting.
* **Extend the pattern:** You can repeat the same approach to extract **customer name**, **account number**, **ticket ID**, or **promise‑to‑pay date**—simply change the question.


## AI_CLASSIFY

Duration: 0:06:00

### Learning Outcome

Use `SNOWFLAKE.CORTEX.AI_CLASSIFY()` to assign each transcript to a business‑relevant class (e.g., Complaint, Query, Sales). You’ll progress from a quick single‑row test to a robust, persisted classification table—learning how task descriptions, label descriptions, output modes, and few‑shot examples improve quality.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/04-AI-LAB-CORTEX-AI_CLASSIFY.sql).

### Description

`AI_CLASSIFY()` maps unstructured text to one or more labels and returns **JSON** with a `labels` array (and, when enabled, scores and details). Importantly, the function can be used at **increasing levels of sophistication** to shape and control the output. In this module we **build the final query step‑by‑step** so you can see how each parameter influences the result—improving confidence, reducing drift, and producing stable, explainable outputs suitable for BI and QA workflows.

* Start simple with only a **label list** and a short **task\_description** (fast sanity check).
* Add **label descriptions** to tighten decision boundaries and resolve ambiguity.
* Set **output\_mode** (`'single'` vs `'multi'`) to fit your taxonomy.
* Provide **few‑shot examples** to steer borderline cases and improve consistency.

> 💡 **Tip:** Begin with a single `CALL_ID` to validate definitions and examples before scaling up.

---

### Step 1: Set Snowflake Context

Run each statement in order so queries execute in the correct context.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 2: Quick Classification (Single Row)

**Key addition:** Introduce a **task_description** to make the objective explicit.

```sql
SELECT
    CALL_ID,
    TRANSCRIPT,
    SNOWFLAKE.CORTEX.AI_CLASSIFY
    (
        TRANSCRIPT,
        ['Complaint', 'Query', 'Support Request', 'Sales', 'Cancellation','Other'],
        {
            'task_description': 'Classify the type of customer service call'
        }
    ) AS CALL_TYPE_JSON,
    CALL_TYPE_JSON:labels[0]::TEXT AS CALL_TYPE
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
WHERE   
    CALL_ID = 'CALL_20250728_10050';
```

> 💡 **Tip:** `task_description` reduces ambiguity (e.g., classify by **reason for contact** rather than **tone**).

---

### Step 3: Quick Classification (With Descriptions)

**Key addition:** Add **descriptions for each label** so the model understands boundaries between categories.

```sql
SELECT
    CALL_ID,
    TRANSCRIPT,
    AI_CLASSIFY
    (
        TRANSCRIPT,
        [
            {
                'label': 'Complaint',
                'description': 'Caller reports a problem or dissatisfaction'
            },
            {
                'label': 'Query',
                'description': 'Caller asks for information or clarification'
            },
            {
                'label': 'Support Request',
                'description': 'Caller needs help to resolve something'
            },
            {
                'label': 'Sales',
                'description': 'Caller wants to buy or upgrade'
            },
            {
                'label': 'Cancellation',
                'description': 'Caller wants to cancel a service'
            }
        ]
    ) AS CALL_TYPE_JSON,      
    CALL_TYPE_JSON:labels[0]::TEXT AS CALL_TYPE
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES;
```

> 💡 **Tip:** `description` acts like mini‑guidelines for each class, improving separation where transcripts might fit multiple labels.

---

### Step 4: Extended Classification (With Examples)

**Key additions:** Combine a **task\_description**, set **`output_mode: 'single'`**, and include **few‑shot examples** to steer edge cases.

```sql
    SELECT
        CALL_ID,
        TRANSCRIPT,
        AI_CLASSIFY
        (
            TRANSCRIPT,
            [
                {
                    'label': 'Complaint',
                    'description': 'Caller reports a problem or dissatisfaction'
                },
                {
                    'label': 'Query',
                    'description': 'Caller asks for information or clarification'
                },
                {
                    'label': 'Support Request',
                    'description': 'Caller needs help to resolve something'
                },
                {
                    'label': 'Sales',
                    'description': 'Caller wants to buy or upgrade'
                },
                {
                    'label': 'Cancellation',
                    'description': 'Caller wants to cancel a service'
                }
            ],
            {
                'task_description': 'Classify the type of customer service call',
                'output_mode': 'single',
                'examples':  
                [
                    {
                      'input': 'My internet has been down all morning and I am very frustrated',
                      'labels': ['Complaint'],
                      'explanation': 'The caller expresses dissatisfaction and reports a recurring problem'
                    },
                    {
                      'input': 'Can you explain how to change my billing address?',
                      'labels': ['Query'],
                      'explanation': 'The caller is asking for information'
                    },
                    {
                      'input': 'I cannot log into my account, can you help me reset my password?',
                      'labels': ['Support Request'],
                      'explanation': 'The caller is explicitly asking for help to resolve a problem'
                    },
                    {
                      'input': 'I am interested in upgrading to the premium plan, what will it cost?',
                      'labels': ['Sales'],
                      'explanation': 'The caller is showing intent to purchase/upgrade'
                    },
                    {
                      'input': 'I want to cancel my subscription and end my service',
                      'labels': ['Cancellation'],
                      'explanation': 'The caller explicitly wants to cancel their subscription'
                    }
                ]
            }
        ) AS CALL_TYPE_JSON,
        IFNULL(CALL_TYPE_JSON:labels[0]::TEXT,'Other') AS CALL_TYPE
    FROM
        CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES;
```

> 💡 **Tip:** `examples` provide real patterns the model can mirror, reducing borderline misclassifications.

---

### Step 5: Persist Classification Results

**Key addition:** Persist results with the same enriched configuration (including examples) to create a reliable, one‑row‑per‑call table for downstream joins.

```sql
CREATE OR REPLACE TABLE CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_CLASSIFY
AS
  
    WITH CTE_CLASSIFY
    AS
    (
    SELECT
        CALL_ID,
        AI_CLASSIFY
        (
            TRANSCRIPT,
            [
                {
                    'label': 'Complaint',
                    'description': 'Caller reports a problem or dissatisfaction'
                },
                {
                    'label': 'Query',
                    'description': 'Caller asks for information or clarification'
                },
                {
                    'label': 'Support Request',
                    'description': 'Caller needs help to resolve something'
                },
                {
                    'label': 'Sales',
                    'description': 'Caller wants to buy or upgrade'
                },
                {
                    'label': 'Cancellation',
                    'description': 'Caller wants to cancel a service'
                }
            ],
            {
                'task_description': 'Classify the type of customer service call',
                'output_mode': 'single',
                'examples':  
                [
                    {
                      'input': 'My internet has been down all morning and I am very frustrated',
                      'labels': ['Complaint'],
                      'explanation': 'The caller expresses dissatisfaction and reports a recurring problem'
                    },
                    {
                      'input': 'Can you explain how to change my billing address?',
                      'labels': ['Query'],
                      'explanation': 'The caller is asking for information'
                    },
                    {
                      'input': 'I cannot log into my account, can you help me reset my password?',
                      'labels': ['Support Request'],
                      'explanation': 'The caller is explicitly asking for help to resolve a problem'
                    },
                    {
                      'input': 'I am interested in upgrading to the premium plan, what will it cost?',
                      'labels': ['Sales'],
                      'explanation': 'The caller is showing intent to purchase/upgrade'
                    },
                    {
                      'input': 'I want to cancel my subscription and end my service',
                      'labels': ['Cancellation'],
                      'explanation': 'The caller explicitly wants to cancel their subscription'
                    }
                ]
            }
        ) AS CALL_TYPE_JSON,
        IFNULL(CALL_TYPE_JSON:labels[0]::TEXT,'Other') AS CALL_TYPE
    FROM
        CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES AS SRC
    )

    SELECT
        CALL_ID,
        CALL_TYPE
    FROM
        CTE_CLASSIFY;
```

---

### Step 6: Preview Saved Results

Confirm that the table contains expected values.

```sql
SELECT * FROM CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_CLASSIFY LIMIT 10;
```

---

### Notes & Troubleshooting

* **Borderline calls:** Expand label descriptions or examples for tighter guidance.
* **Multi‑label needs:** Switch `output_mode` to `'multi'` (then parse arrays accordingly).
* **Fallback label:** Keep `IFNULL(...,'Other')` to avoid nulls when the model is uncertain.
* **Determinism:** For more stable runs at scale, consider lowering temperature via model‑specific parameters where supported by your environment.


## SENTIMENT

Duration: 0:05:00

### Learning Outcome
Compute an overall sentiment score for each call transcript using `SNOWFLAKE.CORTEX.SENTIMENT()`, then persist the results for reuse in later steps and BI queries.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/05-AI-LAB-CORTEX-SENTIMENT.sql).

### Description
`SENTIMENT()` analyzes free‑text and returns a single sentiment score per input. In this module, you will:

* Score each transcript and quickly **rank by sentiment** to spot strongly positive or negative calls.
* **Persist** the results to a dedicated table to simplify downstream joins and visualizations.

> 💡 **Tip:** Higher scores indicate more positive sentiment. Very short or noisy transcripts may yield weak or null scores—filter or quality‑check as needed.

### Step 1: Set Snowflake Context
Sets the current database, schema, and warehouse so subsequent operations run in the correct environment.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

---

### Step 2: Overall Sentiment Score

Computes overall sentiment for each transcript and orders by score (most positive first).

```sql
SELECT
    CALL_ID,
    TRANSCRIPT,
    SNOWFLAKE.CORTEX.SENTIMENT(TRANSCRIPT) AS OVERALL_SENTIMENT
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
ORDER BY
    OVERALL_SENTIMENT DESC;
```

---

### Step 3: Persist Overall Sentiment

Saves one sentiment score per call into a table for reuse downstream.

```sql
CREATE OR REPLACE TABLE CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_OVERALL_SENTIMENT
AS
    SELECT
        CALL_ID,
        TRANSCRIPT,
        SNOWFLAKE.CORTEX.SENTIMENT(TRANSCRIPT) AS OVERALL_SENTIMENT
    FROM
        CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
    ORDER BY
        OVERALL_SENTIMENT DESC;
```

---

### Step 4: View Sentiment Scores

Preview a sample of saved sentiment scores for verification.

```sql
SELECT * FROM CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_OVERALL_SENTIMENT LIMIT 10;
```

---

### Notes & Troubleshooting

* **Short transcripts:** Consider excluding transcripts under a character/word threshold to avoid weak signals.
* **Language considerations:** Mixed‑language calls can affect accuracy; segment by language if possible.
* **Join for insights:** Join this table with classification and entity sentiment in later steps to understand **why** a call is positive/negative.


## AI_SENTIMENT

Duration: 0:06:00

### Learning Outcome
Use `SNOWFLAKE.CORTEX.AI_SENTIMENT()` to measure **category-level sentiment** (e.g., Brand, Cost, Product) for each transcript, then reshape and persist the results for downstream analysis and BI.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/06-AI-LAB-CORTEX-AI_SENTIMENT.sql).

### Description
`AI_SENTIMENT()` scores sentiment for **specific categories** you define (as an array), returning JSON with a `categories` list. Each list item contains at least:

- `name` — the category string you provided (e.g., `Brand`, `Cost`, `Product`).
- `sentiment` — the model’s sentiment result for that category (cast to `TEXT` in this lab for simplicity).

> 💡 **Tip:** Add or rename categories (e.g., *Agent, Billing, Delivery*) by extending `ARRAY_CONSTRUCT(...)`.


### Step 1: Set Snowflake Context
Run each statement in order so queries execute in the correct environment.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

---

### Step 2: Category Sentiment Score

Uses `SNOWFLAKE.CORTEX.AI_SENTIMENT` to score the specified categories for each transcript.

```sql
SELECT
    CALL_ID,
    TRANSCRIPT,
    SNOWFLAKE.CORTEX.AI_SENTIMENT
    (
        TRANSCRIPT,
        ARRAY_CONSTRUCT('Brand', 'Cost', 'Product')
    ) AS ENTITY_SENTIMENT
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES;
```

> 💡 **Tip:** Start with a few categories; expand only after you’ve validated results on a sample of calls.

---

### Step 3: Transpose Category Sentiment (with `ARRAY_CONSTRUCT` explained)

**About `ARRAY_CONSTRUCT`:**

* `ARRAY_CONSTRUCT('Brand','Cost','Product')` builds a Snowflake **VARIANT array** of strings. We pass this array into `AI_SENTIMENT()` so the model scores **exactly those categories** for each transcript in a single call.
* This approach is clear, repeatable, and easy to extend—just add another string to the array to score a new category.

**About the returned structure:**

* `ENTITY_SENTIMENT` contains a JSON object with a `categories` **array**.
* Each element in `categories` is a JSON object exposing:

  * `name` (the category label you requested)
  * `sentiment` (the model’s sentiment for that category)

We **flatten** the `categories` array to get one row per `(CALL_ID, category)` pair for quick inspection.

```sql
WITH CTE_ENTITY_SENTIMENT
AS
(
    SELECT
        CALL_ID,
        TRANSCRIPT,
        SNOWFLAKE.CORTEX.AI_SENTIMENT
        (
            TRANSCRIPT,
            ARRAY_CONSTRUCT('Brand', 'Cost', 'Product')
        ) AS ENTITY_SENTIMENT
    FROM
        CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES AS SRC
)

SELECT
    CALL_ID,
    TRANSCRIPT,
    CAT.value:name::TEXT      AS "CATEGORY",
    CAT.value:sentiment::TEXT AS "SENTIMENT"
FROM
    CTE_ENTITY_SENTIMENT AS SRC,
LATERAL FLATTEN(INPUT => SRC.ENTITY_SENTIMENT:"categories") AS CAT;
```

> 💡 **Tip:** `LATERAL FLATTEN` expands the `categories` array into rows, making it easier to read, debug, and validate category-level results.

---

### Step 4: Persist Category Sentiment (Pivoted)

Create a table with one row per call and separate columns for each category.

```sql
CREATE OR REPLACE TABLE CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_ENTITY_SENTIMENT
AS

    WITH CTE_ENTITY_SENTIMENT
    AS
    (
        SELECT
            CALL_ID,
            TRANSCRIPT,
            SNOWFLAKE.CORTEX.AI_SENTIMENT
            (
                TRANSCRIPT,
                ARRAY_CONSTRUCT('Brand', 'Cost', 'Product')
            ) AS ENTITY_SENTIMENT
        FROM
            CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES AS SRC
    )

    SELECT
        CALL_ID,
        MAX(CASE WHEN CAT.value:name::TEXT = 'Brand'   THEN CAT.value:sentiment::TEXT   END) AS BRAND_SENTIMENT,
        MAX(CASE WHEN CAT.value:name::STRING = 'Cost'  THEN CAT.value:sentiment::STRING END) AS COST_SENTIMENT,
        MAX(CASE WHEN CAT.value:name::STRING = 'Product' THEN CAT.value:sentiment::STRING END) AS PRODUCT_SENTIMENT
    FROM
        CTE_ENTITY_SENTIMENT AS SRC,
    LATERAL FLATTEN(INPUT => SRC.ENTITY_SENTIMENT:"categories") AS CAT
    GROUP BY
        CALL_ID,
        TRANSCRIPT;
```

> 💡 **Tip:** Pivoting simplifies joins with overall sentiment and classification and works well for side‑by‑side BI charts.

---

### Step 5: Preview Persisted Results

Quickly verify saved category sentiment.

```sql
SELECT * FROM CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_ENTITY_SENTIMENT LIMIT 10;
```

---

### Notes & Troubleshooting

* **Category naming:** Keep category names consistent (including capitalization) across steps.
* **Language:** Mixed‑language transcripts can affect accuracy; segment/translate if needed.
* **Extend:** Add more categories based on your domain (e.g., *Pricing*, *Delivery*, *Agent Professionalism*).


## SUMMARIZE

Duration: 0:05:00

### Learning Outcome
Generate concise summaries for each call transcript using `SNOWFLAKE.CORTEX.SUMMARIZE()`, and persist those summaries for downstream analysis and BI.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/07-AI-LAB-CORTEX-SUMMARISE.sql).

### Description
`SUMMARIZE()` produces a short natural‑language summary of a transcript. You can keep the default behavior for a quick overview or pair it with prompt guidance (e.g., “3 bullets,” “focus on resolution”) to tailor the output to your use case.

> 💡 **Tip:** Summaries help triage long calls quickly and are great inputs for ticket notes or BI cards.


### Step 1: Set Snowflake Context
Sets the current database, schema, and warehouse for summarization.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

---

### Step 2: Summarize Transcripts

Summarizes each transcript using `SNOWFLAKE.CORTEX.SUMMARIZE`. Adjust prompt/parameters as needed for your use case.

```sql
SELECT
    CALL_ID,
    TRANSCRIPT,
    SNOWFLAKE.CORTEX.SUMMARIZE
    (
        TRANSCRIPT
    ) AS TRANSCRIPT_SUMMARY
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES;
```

> 💡 **Tip:** For structured bullet points, prepend guidance like “Summarize in 3 short bullets:” to the transcript text.

---

### Step 3: Persist Summaries

Saves summaries into a table for reuse.

```sql
CREATE OR REPLACE TABLE CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_SUMMARY
AS
    SELECT
        CALL_ID,
        SNOWFLAKE.CORTEX.SUMMARIZE
        (
            TRANSCRIPT
        ) AS TRANSCRIPT_SUMMARY
    FROM
        CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES;
```

> 💡 **Tip:** Persisted summaries make it easy to surface in dashboards and to join with classification and sentiment.

---

### Step 4: Preview Summaries

Displays a sample of saved summaries for verification.

```sql
SELECT * FROM CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_SUMMARY LIMIT 10;
```

---

### Notes & Troubleshooting

* **Very short transcripts:** Consider filtering very short calls; they often yield minimal summaries.
* **Privacy:** If transcripts contain PII, clarify redaction requirements in your prompting or preprocess accordingly.
* **Localization:** If transcripts span multiple languages, summarize per language or translate first for consistent tone.


## AI_COMPLETE (1) 

Duration: 0:07:00

### Learning Outcome
Harness `AI_COMPLETE()` for both free‑text and **structured** completions over call transcripts. Progressively add **PROMPT()**, **named arguments**, **model_parameters**, **response_format** (JSON schema), and **show_details** to control output quality, determinism, structure, and observability.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/08-AI-LAB-CORTEX-AI_COMPLETE-01.sql).

### Description
We’ll **build the final query step‑by‑step**, starting from a minimal prompt and adding controls for safer prompts, deterministic behavior, structured JSON, and runtime metadata.

> 💡 **Tip:** Validate each step on a single `CALL_ID` before scaling to the full dataset.

### Step 1: Set Snowflake Context
Sets the current database, schema, and warehouse for summarization.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 2: Basic AI_COMPLETE

Use the simplest form to smoke‑test completion quality:

* **Signature:** `AI_COMPLETE('<model>', '<string prompt>')`
* **Prompt:** single string (`'Summarize the call transcript. ' || TRANSCRIPT`)
* **Parameters:** defaults (no controls)
* **Output:** free text only (no structure, no metadata)

```sql
SELECT
    CALL_ID,
    AI_COMPLETE
    (
        'snowflake-arctic',
        'Summarize the call transcript. ' || TRANSCRIPT
    )::VARCHAR AS CALL_SUMMARY
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
WHERE   
    CALL_ID = 'CALL_20250728_10050';
```

> 💡 **Tip:** Minimal usage is great for smoke tests but offers little control over style, length, or safety.

---

### Step 3: Use PROMPT() Function

Improve readability of code without changing output type:

* **Use `PROMPT()`** function with placeholders for clean variable insertion

```sql
SELECT
    CALL_ID,
    AI_COMPLETE
    (
        'snowflake-arctic',
        PROMPT('Summarize the call transcript. {0}', TRANSCRIPT)
    )::VARCHAR AS CALL_SUMMARY
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
WHERE   
    CALL_ID = 'CALL_20250728_10050';
```

> 💡 **Tip:** Prefer `PROMPT()` when combining literals + variables to avoid quoting/escaping bugs.

---

### Step 4: Use Named Arguments and Model Parameters

Be more specic by using paramter assignments, particularly when working with more complex longer scripts.
Take more control of the LLM by using the model_parameters:

* **Named Arguments:** `model =>`, `prompt =>` for clarity
* **Model Parameter:** set `temperature`, `top_p`, `max_tokens`, `guardrails`

```sql
SELECT
    CALL_ID,
    AI_COMPLETE
    (
        model  => 'snowflake-arctic',
        prompt => PROMPT('Summarize the call transcript. {0}', TRANSCRIPT),
        model_parameters => {'temperature': 0.2, 'top_p': 0.9, 'max_tokens': 120, 'guardrails': TRUE}
    ) AS CALL_SUMMARY
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
WHERE   
    CALL_ID = 'CALL_20250728_10050';
```

> 💡 **Tip:** Lower `temperature` raises consistency. Use `max_tokens` to cap verbosity.

---

### Step 5: Use Structured Output with Response Format (JSON schema)

Return machine‑readable JSON and extract fields as columns:

* **Response Format:** provide minimal JSON Schema for required fields
* **Parsing:** use JSON paths (e.g., `:summary`) to extract individual fields

> 💡 **Tip (Warning):** You **CANNOT** combine `PROMPT()` with structured JSON output—whether using `response_format` or `show_details`. For these cases, build the prompt via **string concatenation** (e.g., `'... ' || TRANSCRIPT`).

```sql
WITH CTE_RESULT
AS
(
    SELECT
        CALL_ID,
        AI_COMPLETE
        (
            model  => 'snowflake-arctic',
            prompt => 'Summarize the call transcript. ' || TRANSCRIPT,
            model_parameters => {'temperature': 0.2, 'top_p': 0.9, 'max_tokens': 120, 'guardrails': TRUE},
            response_format => {
                'type': 'json',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'summary': {'type': 'string'}
                    },
                    'required': ['summary']
                }
            }
        ) AS CALL_SUMMARY_JSON
    FROM
        CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
    WHERE
        CALL_ID = 'CALL_20250728_10050'
)

SELECT
    CALL_ID,
    CALL_SUMMARY_JSON:summary::string AS "CALL_SUMMARY"
FROM
    CTE_RESULT;
```

---

### Step 6: Enable Show Details for Modela and Token Useage

Add observability to each completion call:

* **Show Details:** prompt/completion/total tokens

```sql
WITH CTE_RESULT
AS
(
    SELECT
        CALL_ID,
        AI_COMPLETE
        (
            model  => 'snowflake-arctic',
            prompt => 'Summarize the call transcript. ' || TRANSCRIPT,
            model_parameters => {'temperature': 0.2, 'top_p': 0.9, 'max_tokens': 120, 'guardrails': TRUE},
            show_details => TRUE
        ) AS CALL_SUMMARY_JSON
    FROM
        CALL_CENTER_DB.STAGE/TRANSCRIBE_AUDIO_FILES
    WHERE
        CALL_ID = 'CALL_20250728_10050'
)

SELECT
    CALL_ID,
    CALL_SUMMARY_JSON:choices[0]:messages::string AS "CALL_SUMMARY",
    CALL_SUMMARY_JSON:model::string AS "MODEL_USED",
    TO_TIMESTAMP_NTZ(CALL_SUMMARY_JSON:created) AS "CREATED_TS",
    CALL_SUMMARY_JSON:usage:completion_tokens::int AS "COMPLETION_TOKENS",
    CALL_SUMMARY_JSON:usage:guardrails_tokens::int AS "GUARDRAILS_TOKENS",
    CALL_SUMMARY_JSON:usage:prompt_tokens::int AS "PROMPT_TOKENS",
    CALL_SUMMARY_JSON:usage:total_tokens::int AS "TOTAL_TOKENS"
FROM
    CTE_RESULT;
```

> 💡 **Tip:** Track token usage by step to understand cost drivers and tune prompts/length limits.

---

### Step 7: Structured Output + Show Details together

Combine structure and observability for robust executions:

* **Structured output:** validate with a JSON Schema and parse reliably
* **Metadata:** capture model and token usage for audits/costs


```sql
WITH CTE_RESULT
AS
(
    SELECT
        CALL_ID,
        AI_COMPLETE
        (
            model  => 'snowflake-arctic',
            prompt => 'Summarize the call transcript. ' || TRANSCRIPT,
            model_parameters => {'temperature': 0.2, 'top_p': 0.9, 'max_tokens': 120, 'guardrails': TRUE},
            response_format => {
                'type': 'json',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'summary': {'type': 'string'}
                    },
                    'required': ['summary']
                }
            },
            show_details => TRUE
        ) AS CALL_SUMMARY_JSON
    FROM
        CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
    WHERE
        CALL_ID = 'CALL_20250728_10050'
)

SELECT
    CALL_ID,
    CALL_SUMMARY_JSON:structured_output[0]:raw_message:summary::string AS "CALL_SUMMARY",
    TO_TIMESTAMP_NTZ(CALL_SUMMARY_JSON:created) AS "CREATED_TS",
    CALL_SUMMARY_JSON:model::string AS "MODEL_USED",
    CALL_SUMMARY_JSON:usage:completion_tokens::int AS "COMPLETION_TOKENS",
    CALL_SUMMARY_JSON:usage:guardrails_tokens::int AS "GUARDRAILS_TOKENS",
    CALL_SUMMARY_JSON:usage:prompt_tokens::int AS "PROMPT_TOKENS",
    CALL_SUMMARY_JSON:usage:total_tokens::int AS "TOTAL_TOKENS"
FROM
    CTE_RESULT;
```

---

### Output behavior: `response_format` and `show_details`

For detailed definitions of return types, see the Snowflake docs: [https://docs.snowflake.com/en/sql-reference/functions/ai\_complete-single-string#returns](https://docs.snowflake.com/en/sql-reference/functions/ai_complete-single-string#returns)

| `show_details`          | `response_format`      | Return type                      | Key fields returned                              |
| ----------------------- | ---------------------- | -------------------------------- | ------------------------------------------------ |
| not specified / `FALSE` | not specified / `NULL` | **String**                       | The model’s free‑text response only.             |
| not specified / `FALSE` | **specified**          | **Object following your schema** | Whatever fields your JSON Schema defines.        |
| **TRUE**                | not specified / `NULL` | **JSON object**                  | `choices`, `created`, `model`, `usage`           |
| **TRUE**                | **specified**          | **JSON object**                  | `structured_output`, `created`, `model`, `usage` |

---

### Notes & Troubleshooting

* **Schema mismatches:** If the model returns text that doesn’t match your JSON schema, relax constraints or tighten the prompt.
* **Determinism:** Lower `temperature` and add explicit format instructions when you need repeatable outputs.
* **Token limits:** Keep prompts succinct (e.g., summarize key points) to avoid truncation.



## AI_COMPLETE (2)

Duration: 0:08:00

### Learning Outcome
By the end of this step you will be able to:
- Design **different types of AI_COMPLETE requests** (structured JSON, free‑text bullets, mixed queries) for call‑center analytics.
- **Choose models per task** (e.g., structured extraction vs. summarization) and understand the trade‑offs.
- **Combine multiple AI_COMPLETE calls** in a single SELECT (Step 5) to leverage **specialized LLMs**—and recognize the **cost implications** of multiple calls.
- **Consolidate** those requests into **one structured payload** (Step 6) using JSON Schema (`type`, `enum`, `items`, `description`) to guide the model—similar to how `AI_CLASSIFY` benefits from label descriptions.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/09-AI-LAB-CORTEX-AI_COMPLETE-02.sql).

### Description
In earlier labs you constructed complete `AI_COMPLETE` function calls. Here, we explore **what kinds of requests** you can make and **when to pick different models**:
- **Task‑specific models:** We use different models for different outcomes (e.g., *structured classification*, *human‑readable bullets*, *action items*). This aligns model strengths with the job to be done.
- **One SELECT, many calls (Step 5):** Combine multiple `AI_COMPLETE` requests—each with its **own model**—in the same query for maximum flexibility. **Trade‑off:** more LLM calls → **higher cost/latency**.
- **One call, unified payload (Step 6):** Merge all fields into a **single JSON Schema** with `type`, `enum`, `items`, and `description`. This both documents your intent and reduces the number of calls.

> 💡 **Tip:** For structured outputs (`response_format`) build prompts via **string concatenation** (e.g., `CONCAT(...)`). Avoid `PROMPT()` when requesting structured JSON.

---

### Step 1: Set Snowflake Context
Sets the current database, schema, and warehouse for summarization.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

---

### Step 2: Structured Output: Multiple Fields

**Details:**

* **Intent:** Normalize key fields (`call_type`, `primary_intent`, `urgency_level`) for analytics.
* **Model choice:** `snowflake-arctic` for **structured extraction** with enums for consistency.
* **Outcome:** Machine‑parseable JSON, easier to store and join.

```sql
SELECT
    CALL_ID,
    AI_COMPLETE
    (
        model => 'snowflake-arctic',
        prompt => CONCAT('Extract structured data from this call center transcript. <Transcript>', TRANSCRIPT, '</Transcript>'),
        response_format => {
            'type':'json',
            'schema':{
                'type':'object',
                'properties':{
                    'call_type':{'type':'string','enum':['inbound','outbound','transfer']},
                    'primary_intent':{'type':'string','enum':['billing','technical_support','complaint','information','sales','cancellation','other']},
                    'urgency_level':{'type':'string','enum':['low','medium','high','critical']}
                },
                'required':['call_type','primary_intent','urgency_level']
            }
        }
    ) AS CLASSIFICATION_JSON
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
WHERE
    CALL_ID = 'CALL_20250728_10050';
```

> 💡 **Tip:** Enums reduce downstream cleaning and improve dashboard filters.

---

### Step 3: Summary

**Details:**

* **Intent:** Give analysts a fast human synopsis.
* **Model choice:** `mistral-large` for **concise bullets/summarization**.
* **Outcome:** Readable text for tickets/triage.

```sql
SELECT
    CALL_ID,
    AI_COMPLETE
    (
        model => 'mistral-large',
        prompt => CONCAT('Summarize this call in 3 concise bullet points. <Transcript>', TRANSCRIPT, '</Transcript>')
    ) AS CALL_SUMMARY
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
WHERE
    CALL_ID = 'CALL_20250728_10050';
```

> 💡 **Tip:** Keep bullets short—ideal for dashboards.

---

### Step 4: Structured Output: Array

**Details:**

* **Intent:** Capture **follow‑ups** that can drive workflows.
* **Model choice:** `claude-4-sonnet` for **explicit action extraction**.
* **Outcome:** `action_items` array that’s simple to persist and query.

```sql
SELECT
    CALL_ID,
    AI_COMPLETE
    (
        model => 'claude-4-sonnet',
        prompt => CONCAT(
          'Extract concrete action items for the agent and customer. ',
          'Return JSON with key "action_items" as an array of strings. ',
          '<Transcript>', TRANSCRIPT, '</Transcript>'
        ),
        response_format => {
            'type':'json',
            'schema':{
                'type':'object',
                'properties':{
                'action_items':{'type':'array','items':{'type':'string'}}
                },
                'required':['action_items']
            }
        }
    ) AS ACTION_ITEMS_JSON
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
WHERE
    CALL_ID = 'CALL_20250728_10050';
```

> 💡 **Tip:** Persist to a task table for SLA tracking.

---

### Step 5: Combined Outputs — Three Prompts in One SELECT

**Details:**

* **Flexibility:** Use **different models** for **different sub‑tasks** (classification, bullets, action items) **in one query**.
* **Trade‑off:** More **LLM calls** → potential **higher cost/latency**; monitor usage.
* **Benefit:** Side‑by‑side outputs simplify comparisons and validation.

```sql
SELECT
    CALL_ID,
    
    ---------------------------------------------------------------------
    -- 1) Classification (JSON)
    ---------------------------------------------------------------------
    AI_COMPLETE
    (
        model => 'snowflake-arctic',
        prompt => CONCAT('Extract structured data from this call center transcript. <Transcript>', TRANSCRIPT, '</Transcript>'),
        response_format => {
            'type':'json',
            'schema':{
                'type':'object',
                'properties':{
                    'call_type':{'type':'string','enum':['inbound','outbound','transfer']},
                    'primary_intent':{'type':'string','enum':['billing','technical_support','complaint','information','sales','cancellation','other']},
                    'urgency_level':{'type':'string','enum':['low','medium','high','critical']}
                },
                'required':['call_type','primary_intent','urgency_level']
            }
        }
    ) AS CLASSIFICATION_JSON,
    ---------------------------------------------------------------------
    -- 2) Summary (text)
    ---------------------------------------------------------------------
    AI_COMPLETE
    (
        model => 'mistral-large',
        prompt => CONCAT('Summarize this call in 3 concise bullet points. <Transcript>', TRANSCRIPT, '</Transcript>')
    ) AS CALL_SUMMARY,
    ---------------------------------------------------------------------
    -- 3) Action items (JSON)
    ---------------------------------------------------------------------
    AI_COMPLETE
    (
        model => 'claude-4-sonnet',
        prompt => CONCAT(
          'Extract concrete action items for the agent and customer. ',
          'Return JSON with key "action_items" as an array of strings. ',
          '<Transcript>', TRANSCRIPT, '</Transcript>'
        ),
        response_format => {
            'type':'json',
            'schema':{
                'type':'object',
                'properties':{
                'action_items':{'type':'array','items':{'type':'string'}}
                },
                'required':['action_items']
            }
        }
    ) AS ACTION_ITEMS_JSON
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
WHERE
    CALL_ID = 'CALL_20250728_10050';
```

> 💡 **Tip:** Consider caching or persisting intermediate outputs to control cost.

---

### Step 6: Unified JSON Payload — One call for multiple outputs

**Details:**

* **Intent:** Reduce total calls by **combining** fields into one **schema‑driven** response.
* **Design:** Use `type`, `enum`, `items`, and `description` in your schema—this **documents intent** and **guides** the model (akin to adding label descriptions in `AI_CLASSIFY`).
* **Trade‑off:** One larger call; tune `max_tokens` accordingly.

```sql
SELECT
    CALL_ID,
    AI_COMPLETE
    (
        model => 'snowflake-arctic',
        prompt => CONCAT('Extract structured data from this call center transcript. <Transcript>', TRANSCRIPT, '</Transcript>'),
        response_format => {
          'type': 'json',
          'schema': {
            'type': 'object',
            'properties': {
              'call_type': { 'type': 'string', 'enum': ['inbound','outbound','transfer'], 'description': 'Overall direction of the call.' },
              'primary_intent': { 'type': 'string', 'enum': ['billing','technical_support','complaint','information','sales','cancellation','other'], 'description': 'Main reason for contact.' },
              'urgency_level': { 'type': 'string', 'enum': ['low','medium','high','critical'], 'description': 'Urgency inferred from the conversation.' },
              'summary_bullets': { 'type': 'array', 'items': { 'type': 'string' }, 'description': 'Three concise bullets.' },
              'action_items': { 'type': 'array', 'items': { 'type': 'string' }, 'description': 'Concrete next steps.' }
            },
            'required': ['call_type','primary_intent','urgency_level','summary_bullets','action_items']
          }
        }
    )::VARIANT AS PAYLOAD
FROM
    CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
WHERE
    CALL_ID = 'CALL_20250728_10050';
```

---

### Notes & Troubleshooting

* **Prompt hygiene:** Use XML‑style tags (e.g., `<Transcript>…</Transcript>`) to scope context.
* **Schema drift:** Keep enums aligned with your taxonomy for stable joins.
* **Cost tuning:** Step 5 maximizes flexibility but can cost more; Step 6 reduces calls but increases token size per call.

## AI_COMPLETE (3)

Duration: 0:08:00

### Learning Outcome

* Extract **structured JSON** with `AI_COMPLETE`, **flatten** arrays with `LATERAL FLATTEN`, and **aggregate** rows with `AI_AGG`.
* Apply a guardrails-aware filter using `OBJECT_KEYS` + `ARRAY_CONTAINS` when persisting results.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/10-AI-LAB-CORTEX-AI_COMPLETE-03.sql).

### Additional Functions

**`LATERAL FLATTEN`**

* **What it does:** Converts each element of a JSON array (or member of an object) in a `VARIANT` column into its **own row**, exposing helper fields like `VALUE`, `INDEX`, and `KEY`.
* **Why use it:** Treat model outputs (e.g., `summary_bullets`, `action_items`) as **relational rows** so you can join, filter, and aggregate—often a prerequisite before applying `AI_AGG`.
* **Common pattern:**

  ```sql
  SELECT t.CALL_ID, f.value::string AS ITEM
  FROM my_table t,
       LATERAL FLATTEN(input => t.json_col:array_field) f;
  ```

**`AI_AGG(text_expr, instruction)`**

* **What it does:** Uses an LLM to **reduce many text rows into a single output** per group, guided by your instruction (e.g., tone, length, format).
* **Why use it:** Ideal for **summarizing bullets**, **merging action items**, or creating **executive digests** after you’ve expanded arrays with `FLATTEN`.
* **Guidance:** Add constraints like *“≤40 words, one sentence”* or *“preserve dates verbatim”* for predictable results.

**`OBJECT_KEYS(variant)`**

* **What it does:** Returns an **array of top‑level keys** from a JSON object stored in a `VARIANT` (e.g., keys present in `SUMMARY_JSON`).
* **Why use it:** Helpful for **introspection/validation** of model responses (e.g., detect special keys such as `guardrails` to handle refusals/redactions).
* **Example:**

  ```sql
  SELECT OBJECT_KEYS(response_variant) AS top_keys FROM my_table;
  ```

**`ARRAY_CONTAINS(element, array)`**

* **What it does:** Returns **TRUE** if `element` exists in `array`. With `VARIANT`, ensure types match (e.g., cast `'guardrails'::VARIANT`).
* **Why use it:** Enables concise **membership tests**—great for filtering rows based on keys discovered by `OBJECT_KEYS`.
* **Example:**

  ```sql
  WHERE ARRAY_CONTAINS('guardrails'::VARIANT, OBJECT_KEYS(SUMMARY_JSON)) = FALSE
  ```

**Combined usage (guardrails filter):**

```sql
WHERE ARRAY_CONTAINS('guardrails'::VARIANT, OBJECT_KEYS(SUMMARY_JSON)) = FALSE
```

---

### Step 1: Set Context

Sets the current database, schema, and warehouse for analysis.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

---

### Step 2: Preview aggregated results for a single call

**Highlights**

* `AI_COMPLETE` with **`response_format` (JSON Schema)** extracts fields + arrays.
* `LATERAL FLATTEN` expands `summary_bullets` / `action_items` into rows.
* `AI_AGG` combines rows into concise outputs for inspection.

```sql
WITH CTE_RESULTS
AS
(
    SELECT
        CALL_ID,
        AI_COMPLETE
        (
            model => 'claude-4-sonnet',
            prompt => CONCAT('Extract structured data from this call center transcript. <Transcript>', TRANSCRIPT, '</Transcript>'),
            model_parameters => {'temperature': 0.1, 'max_tokens': 4096, 'guardrails': FALSE},
            response_format =>
            {
                'type': 'json',
                'schema':
                {
                    'type': 'object',
                    'properties': {
                        'call_type': { 'type': 'string', 'enum': ['inbound','outbound','transfer'], 'description': 'Overall direction of the call.' },
                        'primary_intent': { 'type': 'string', 'enum': ['billing','technical_support','complaint','information','sales','cancellation','other'], 'description': 'Main reason for contact.' },
                        'urgency_level': { 'type': 'string', 'enum': ['low','medium','high','critical'], 'description': 'Urgency inferred from the conversation.' },
                        'issue_resolved': {'type': 'string', 'enum': ['yes', 'no', 'partial']},
                        'summary_bullets': { 'type': 'array', 'items': { 'type': 'string' }, 'description': 'Three concise bullets.' },
                        'action_items': { 'type': 'array', 'items': { 'type': 'string' }, 'description': 'Concrete next steps.' }
                    },
                    'required': ['call_type','primary_intent','urgency_level','summary_bullets','action_items']
                }
            }
        )::VARIANT AS SUMMARY_JSON
    FROM
        CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
    WHERE
        CALL_ID = 'CALL_20250728_10050'
),

CTE_ACTION_ITEMS
AS
(
    SELECT
        SRC.CALL_ID,
        AI.value::string AS ACTION_ITEM
    FROM
        CTE_RESULTS SRC,
    LATERAL FLATTEN(input => SRC.SUMMARY_JSON:action_items) AI
),

CTE_SUMMARY_ITEMS
AS
(
    SELECT
        SRC.CALL_ID,
        SI.value::string AS SUMMARY_ITEM
    FROM
        CTE_RESULTS SRC,
    LATERAL FLATTEN(input => SRC.SUMMARY_JSON:summary_bullets) SI
),

CTE_ROLLUPS
AS
(
    SELECT
        SRC.CALL_ID,
        SRC.SUMMARY_JSON:call_type::string AS CALL_TYPE,
        SRC.SUMMARY_JSON:primary_intent::string AS PRIMARY_INTENT,
        SRC.SUMMARY_JSON:urgency_level::string AS URGENCY_LEVEL,
        SRC.SUMMARY_JSON:issue_resolved::string AS ISSUE_RESOLVED,
        AI_AGG(SI.SUMMARY_ITEM, 'Combine these bullets into one concise sentence (<=40 words), keep key facts.') AS SUMMARY_ITEMS,
        AI_AGG(AI.ACTION_ITEM, 'Combine these into one sentence of action items; retain dates/time windows precisely.') AS ACTION_ITEMS
    FROM
        CTE_RESULTS SRC
    LEFT JOIN CTE_SUMMARY_ITEMS SI
        ON SI.CALL_ID = SRC.CALL_ID
    LEFT JOIN CTE_ACTION_ITEMS AI  
        ON AI.CALL_ID = SRC.CALL_ID
    GROUP BY 1,2,3,4,5
)

SELECT * FROM CTE_ROLLUPS;
```

> 💡 **Tip:** Validate on one `CALL_ID` first; then scale.

---

### Step 3: Persist aggregated results across the dataset

**Highlights**

* Process **all calls** and persist rollups.
* Includes a **guardrails** filter to exclude refused/redacted responses.

```sql
CREATE OR REPLACE TABLE CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_ANALYSIS
AS

    WITH CTE_RESULTS
    AS
    (
        SELECT
            CALL_ID,
            AI_COMPLETE
            (
                model => 'claude-4-sonnet',
                prompt => CONCAT('Extract structured data from this call center transcript. <Transcript>', TRANSCRIPT, '</Transcript>'),
                model_parameters => {'temperature': 0.1, 'max_tokens': 4096, 'guardrails': FALSE},
                response_format =>
                {
                    'type': 'json',
                    'schema':
                    {
                        'type': 'object',
                        'properties': {
                            'call_type': { 'type': 'string', 'enum': ['inbound','outbound','transfer'], 'description': 'Overall direction of the call.' },
                            'primary_intent': { 'type': 'string', 'enum': ['billing','technical_support','complaint','information','sales','cancellation','other'], 'description': 'Main reason for contact.' },
                            'urgency_level': { 'type': 'string', 'enum': ['low','medium','high','critical'], 'description': 'Urgency inferred from the conversation.' },
                            'issue_resolved': {'type': 'string', 'enum': ['yes', 'no', 'partial']},
                            'summary_bullets': { 'type': 'array', 'items': { 'type': 'string' }, 'description': 'Three concise bullets.' },
                            'action_items': { 'type': 'array', 'items': { 'type': 'string' }, 'description': 'Concrete next steps.' }
                        },
                        'required': ['call_type','primary_intent','urgency_level','summary_bullets','action_items']
                    }
                }
            )::VARIANT AS SUMMARY_JSON
        FROM
            CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES
        WHERE
            ARRAY_CONTAINS('guardrails'::VARIANT,OBJECT_KEYS(SUMMARY_JSON)) = FALSE
    ),
    
    CTE_ACTION_ITEMS
    AS
    (
        SELECT
            SRC.CALL_ID,
            AI.value::string AS ACTION_ITEM
        FROM
            CTE_RESULTS SRC,
        LATERAL FLATTEN(input => SRC.SUMMARY_JSON:action_items) AI
    ),
    
    CTE_SUMMARY_ITEMS
    AS
    (
        SELECT
            SRC.CALL_ID,
            SI.value::string AS SUMMARY_ITEM
        FROM
            CTE_RESULTS SRC,
        LATERAL FLATTEN(input => SRC.SUMMARY_JSON:summary_bullets) SI
    ),
    
    CTE_ROLLUPS
    AS
    (
        SELECT
            SRC.CALL_ID,
            SRC.SUMMARY_JSON:call_type::string AS CALL_TYPE,
            SRC.SUMMARY_JSON:primary_intent::string AS PRIMARY_INTENT,
            SRC.SUMMARY_JSON:urgency_level::string AS URGENCY_LEVEL,
            SRC.SUMMARY_JSON:issue_resolved::string AS ISSUE_RESOLVED,
            AI_AGG(SI.SUMMARY_ITEM, 'Combine these items into single bullet list') AS SUMMARY_ITEMS,
            AI_AGG(AI.ACTION_ITEM, 'Combine these items into single bullet list') AS ACTION_ITEMS
        FROM
            CTE_RESULTS SRC
        LEFT JOIN CTE_SUMMARY_ITEMS SI
            ON SI.CALL_ID = SRC.CALL_ID
        LEFT JOIN CTE_ACTION_ITEMS AI  
            ON AI.CALL_ID = SRC.CALL_ID
        GROUP BY 1,2,3,4,5
    )
    
    SELECT
        CALL_ID,
        CALL_TYPE,
        PRIMARY_INTENT,
        URGENCY_LEVEL,
        ISSUE_RESOLVED,
        SUMMARY_ITEMS,
        ACTION_ITEMS
    FROM
        CTE_ROLLUPS;
```

> 💡 **Tip (guardrails filter):** `OBJECT_KEYS(SUMMARY_JSON)` lists top‑level JSON keys; `ARRAY_CONTAINS('guardrails'::VARIANT, …)` tests for a guardrails key. Rows with model refusals/redactions are **excluded**.

---

### Step 4: Preview persisted analysis

Display a sample of saved rollups for verification.

```sql
SELECT * FROM CALL_CENTER_DB.STAGE.TRANSCRIBE_AUDIO_FILES_ANALYSIS LIMIT 10;
```

---

## SEMANTIC VIEW (1)

Duration: 0:04:00

### Learning Outcome
Create a **single analysis view** that stitches together all outputs from prior steps (`AI_TRANSCRIBE`, `EXTRACT_ANSWER`, `AI_CLASSIFY`, `SENTIMENT`/`AI_SENTIMENT`, `SUMMARIZE`, `AI_COMPLETE` + `AI_AGG`). This unified view powers the Cortex Analyst Semantic View in the next page.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/11-AI-LAB-ANALYST-SEMANTIC-VIEW-01.sql).

### Description
We’ll:
- **Create** `CALL_CENTER_DB.ANALYTICS.CALL_CENTER_ANALYSIS` by **LEFT JOIN**‑ing the outputs from earlier steps on `CALL_ID`.


---

### Step 1: Set Context
Sets the current database, schema, and warehouse for analysis.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
````

---

### Step 2: Create a view over the aggregated AI outputs

Combine results from our previous analysis steps into a unified view.

```sql
CREATE OR REPLACE VIEW CALL_CENTER_DB.ANALYTICS.CALL_CENTER_ANALYSIS
AS
    SELECT
        TO_DATE(REGEXP_SUBSTR('CALL_20250728_10050', '\\d{8}'), 'YYYYMMDD') AS CALL_DATE,
        TRANSCRIBE_AUDIO_FILES.CALL_ID,
        TRANSCRIBE_AUDIO_FILES.AUDIO_FILE_URL,
        TRANSCRIBE_AUDIO_FILES.DURATION,      
        TRANSCRIBE_AUDIO_FILES_AGENT.CALL_CENTER_AGENT,
        TRANSCRIBE_AUDIO_FILES_CLASSIFY.CALL_TYPE,
        TRANSCRIBE_AUDIO_FILES_ENTITY_SENTIMENT.BRAND_SENTIMENT,
        TRANSCRIBE_AUDIO_FILES_ENTITY_SENTIMENT.COST_SENTIMENT,
        TRANSCRIBE_AUDIO_FILES_ENTITY_SENTIMENT.PRODUCT_SENTIMENT,
        TRANSCRIBE_AUDIO_FILES_OVERALL_SENTIMENT.OVERALL_SENTIMENT,
        TRANSCRIBE_AUDIO_FILES_ANALYSIS.PRIMARY_INTENT,
        TRANSCRIBE_AUDIO_FILES_ANALYSIS.URGENCY_LEVEL,
        TRANSCRIBE_AUDIO_FILES_ANALYSIS.ISSUE_RESOLVED,
        TRANSCRIBE_AUDIO_FILES_ANALYSIS.SUMMARY_ITEMS,
        TRANSCRIBE_AUDIO_FILES_ANALYSIS.ACTION_ITEMS,
        TRANSCRIBE_AUDIO_FILES_SUMMARY.TRANSCRIPT_SUMMARY,
        TRANSCRIBE_AUDIO_FILES.TRANSCRIPT
    FROM
        STAGE.TRANSCRIBE_AUDIO_FILES
    LEFT JOIN STAGE.TRANSCRIBE_AUDIO_FILES_AGENT
        ON TRANSCRIBE_AUDIO_FILES_AGENT.CALL_ID = TRANSCRIBE_AUDIO_FILES.CALL_ID
    LEFT JOIN STAGE.TRANSCRIBE_AUDIO_FILES_CLASSIFY
        ON TRANSCRIBE_AUDIO_FILES_CLASSIFY.CALL_ID = TRANSCRIBE_AUDIO_FILES.CALL_ID
    LEFT JOIN STAGE.TRANSCRIBE_AUDIO_FILES_ENTITY_SENTIMENT
        ON TRANSCRIBE_AUDIO_FILES_ENTITY_SENTIMENT.CALL_ID = TRANSCRIBE_AUDIO_FILES.CALL_ID
    LEFT JOIN STAGE.TRANSCRIBE_AUDIO_FILES_OVERALL_SENTIMENT
        ON TRANSCRIBE_AUDIO_FILES_OVERALL_SENTIMENT.CALL_ID = TRANSCRIBE_AUDIO_FILES.CALL_ID
    LEFT JOIN STAGE.TRANSCRIBE_AUDIO_FILES_ANALYSIS
        ON TRANSCRIBE_AUDIO_FILES_ANALYSIS.CALL_ID = TRANSCRIBE_AUDIO_FILES.CALL_ID
    LEFT JOIN STAGE.TRANSCRIBE_AUDIO_FILES_SUMMARY
        ON TRANSCRIBE_AUDIO_FILES_SUMMARY.CALL_ID = TRANSCRIBE_AUDIO_FILES.CALL_ID;
```

> 💡 **Tip:** If your `CALL_ID` embeds a date (e.g., `CALL_YYYYMMDD_...`), you can derive `CALL_DATE` using the **column** instead of a literal, e.g.:
> `TO_DATE(REGEXP_SUBSTR(TRANSCRIBE_AUDIO_FILES.CALL_ID, '\\d{8}'), 'YYYYMMDD')`.
> Keep the regex escaped as shown when used inside a string.

---

### Step 3: Preview the view

Quick sanity check to confirm the joins and row counts look right.

```sql
SELECT * FROM CALL_CENTER_DB.ANALYTICS.CALL_CENTER_ANALYSIS LIMIT 10;
```

---




## SEMANTIC VIEW (2)

Duration: 0:07:00

### Learning Outcome
Create a **Cortex Analyst Semantic View** over your curated call‑center dataset, then enrich it with keys, enums, filters, metrics, and verified queries so analysts (and agents) can ask guided questions in natural language.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/11-AI-LAB-ANALYST-SEMANTIC-VIEW-01.sql).

If you want to jump ahead the complete semantic view code is [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/12-AI-LAB-ANALYST-SEMANTIC-VIEW-02.sql).


This step is completed using the Snowflake UI. You will create a Semantic View called `CALL_CENTER_MODEL` in `CALL_CENTER_DB.ANALYTICS`, linking it to your analysis view. The process includes marking keys and enums, adding named filters, defining metrics, and registering verified queries to enable guided analytics and natural language Q&A.

---

### Create the Semantic View (UI)

#### Step 1: Open Cortex Analyst
1. In the main navigation, select **AI & ML**.
2. Click **Cortex Analyst**.

#### Step 2: Start a new Semantic View
1. In the top‑left, choose **Semantic Views**.
2. In the top‑right, click **Create new** → **Create new Semantic View**.

#### Step 3: Wizard - Getting started
Fill these fields:
- **Location to store:** `CALL_CENTER_DB.ANALYTICS`
- **Name:** `CALL_CENTER_MODEL`
- **Description:** `Call Center Analytics Semantic Model`

#### Step 4: Wizard — Select tables
- Navigate to the view **`CALL_CENTER_DB` → `ANALYTICS` → `CALL_CENTER_ANALYSIS`**.
- Select this object as the **source**.

#### Step 5: Wizard - Select columns
- **Select all columns** from `CALL_CENTER_ANALYSIS`.
- Click **Create & Save**.

#### Step 6: Wizard - Connect Cortex Search
- **Leave this blank** don;y select anay columns.
- Click **Create & Save**.

---

### Enrich the Model

#### Step 1: Logical Table & Primary Key
- In the Semantic View, under **Logical Table**, click **+**.
- Click **+ Primary Key** → choose **`CALL_ID`** → **Save**.

#### Step 2: Dimensions 
Open **Dimensions** and for each of the following field select Edit, and then use the following settings.

**Unique column**
- `CALL_ID` → enable **Contains unique values**.

**Set the following as enums** (Is Enum = TRUE):

| Dimension | Set “Is Enum” |
|---|---|
| `CALL_TYPE` | ✅ |
| `BRAND_SENTIMENT` | ✅ |
| `COST_SENTIMENT` | ✅ |
| `PRIMARY_INTENT` | ✅ |
| `URGENCY_LEVEL` | ✅ |

> 💡 **Tip:** Enums constrain possible values and improve classification, filters, and autosuggest.

#### Step 3: Named Filters
Use the table below to add multiple **Named Filters**. In the Semantic View editor, open **Named Filters** → **Add filter** and populate the fields exactly.

| Filter name | Expression | Description | Synonyms |
|---|---|---|---|
| RESOLVED_CALLS | ISSUE_RESOLVED = 'yes' | Filter for calls where issues were resolved | successful calls, resolved issues |
| UNRESOLVED_CALLS | ISSUE_RESOLVED <> 'yes' | Calls still open or partially resolved | open issues, unresolved, pending |
| HIGH_URGENCY | URGENCY_LEVEL = 'high' | Calls marked as high urgency | critical, urgent |
| POSITIVE_PRODUCT_SENTIMENT | PRODUCT_SENTIMENT = 'positive' | Calls with positive product feedback | happy product, positive product |
| NEGATIVE_BRAND_SENTIMENT | brand_sentiment = 'negative' | Calls with negative brand sentiment | brand complaints, unhappy brand |


#### Step 4: Metrics
Add these metrics to the model. Use the **Expression**, **Name**, **Description**, and **Synonyms** as listed.

| Expression | Metric name | Description | Synonyms |
|---|---|---|---|
| AVG(OVERALL_SENTIMENT) | AVG_SENTIMENT_SCORE | Average sentiment score across calls | average sentiment; mean sentiment; sentiment average |
| COUNT(*) | CALL_COUNT | Number of calls | Call Count; Calls |
| SUM(CASE WHEN PRODUCT_SENTIMENT = 'positive' THEN 1 ELSE 0 END) / COUNT(*) * 100 | POSITIVE_PRODUCT_SENTIMENT_RATE | Percentage of calls with positive product sentiment | positive product sentiment percentage; positive product sentiment |
| SUM(CASE WHEN ISSUE_RESOLVED = 'yes' THEN 1 ELSE 0 END) / COUNT(*) * 100 | RESOLUTION_RATE | Percentage of calls with issues resolved successfully | resolution percentage; success rate; issue resolution rate |


#### Step 5: Verified Queries
Add each **Question** and its **SQL** under Verified Queries (click **Run** to validate). Use the table for copy‑paste.

| Question | SQL |
|---|---|
| What is the average sentiment score by agent? | SELECT CALL_CENTER_AGENT, AVG(OVERALL_SENTIMENT) AS AVG_OVERALL_SENTIMENT FROM CALL_CENTER_DB.ANALYTICS.CALL_CENTER_ANALYSIS GROUP BY CALL_CENTER_AGENT ORDER BY CALL_CENTER_AGENT DESC; |
| What is the resolution rate by call intent? | SELECT PRIMARY_INTENT, SUM(CASE WHEN ISSUE_RESOLVED = 'yes' THEN 1 ELSE 0 END) / COUNT(*) * 100 AS RESOLUTION_RATE FROM CALL_CENTER_ANALYSIS GROUP BY PRIMARY_INTENT ORDER BY RESOLUTION_RATE DESC; |
| Which call types are most frequent and how do they score on average sentiment? | SELECT CALL_TYPE, COUNT(*) AS CALL_COUNT, AVG(OVERALL_SENTIMENT) AS AVG_OVERALL_SENTIMENT FROM CALL_CENTER_ANALYSIS GROUP BY CALL_TYPE ORDER BY CALL_COUNT DESC; |
| Which agents have the highest issue‑resolution rate? | SELECT CALL_CENTER_AGENT, SUM(CASE WHEN ISSUE_RESOLVED = 'yes' THEN 1 ELSE 0 END) / COUNT(*) * 100 AS RESOLUTION_RATE FROM CALL_CENTER_ANALYSIS GROUP BY CALL_CENTER_AGENT ORDER BY RESOLUTION_RATE DESC LIMIT 10; |
| Which primary intents are most likely to be high urgency? | SELECT PRIMARY_INTENT, SUM(CASE WHEN URGENCY_LEVEL = 'high' THEN 1 ELSE 0 END) / COUNT(*) * 100 AS HIGH_URGENCY_RATE FROM CALL_CENTER_ANALYSIS GROUP BY PRIMARY_INTENT ORDER BY HIGH_URGENCY_RATE DESC; |

> 💡 **Tip:** Mark verified queries as **onboarding** examples to guide first‑time users.

## CORTEX SEARCH SERVICE

Duration: 0:07:00

### Learning Outcome

In this step, you will create a Cortex Search Service on your call center analysis view, enabling fast, contextual search across transcripts and key attributes. You’ll validate the service using `SEARCH_PREVIEW`, parse results into rows, and support both free-text and filtered queries for advanced analytics.

### Download Script
Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-snowflake-intelligence-callcenter-lab/scripts/12-AI-LAB-SEARCH-SEARCH-SERVICE.sql).

### Description
In this step, you will set up a Cortex Search Service to enable fast, contextual search across your call center transcripts and key attributes. The service will index the `TRANSCRIPT` field as the main searchable text and expose important attributes such as `CALL_ID`, `PRIMARY_INTENT`, `URGENCY_LEVEL`, and `CALL_CENTER_AGENT` for filtering and retrieval. You will validate the search service using the `SEARCH_PREVIEW` function, which allows you to run queries against the indexed data, request specific columns in the results, and apply JSON-based filters to narrow down search results based on attribute values.

> 💡 **Tips**
>
> * Only columns selected inside the service’s `AS (SELECT …)` clause can be returned by `SEARCH_PREVIEW(columns=[…])` or used in filters.
> * Use `TARGET_LAG` to control index refresh cadence (e.g., `'1 Day'`).

---

### Step 1: Set Context

Sets the current database, schema, and warehouse for analysis.

```sql
USE DATABASE CALL_CENTER_DB;
USE SCHEMA ANALYTICS;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

---

### Step 2: Create a search service

Include additional fields that can be used for filtering.

```sql
CREATE OR REPLACE CORTEX SEARCH SERVICE CALL_CENTER_DB.ANALYTICS.CALL_CENTER_SEARCH_SERVICE
ON TRANSCRIPT
ATTRIBUTES CALL_ID,PRIMARY_INTENT,URGENCY_LEVEL,CALL_CENTER_AGENT
WAREHOUSE = USER_STD_XSMALL_WH
TARGET_LAG = '1 Day'
AS
(
    SELECT
        ----------------------------------------------------
        -- Transcript (primary searchable text)
        ----------------------------------------------------
        TRANSCRIPT,

        ----------------------------------------------------
        -- Indexed Fields
        ----------------------------------------------------
        AUDIO_FILE_URL,

        ----------------------------------------------------
        -- Filters (available as filterable fields in queries)
        ----------------------------------------------------
        CALL_ID,
        CALL_CENTER_AGENT,
        PRIMARY_INTENT,
        URGENCY_LEVEL,
        ISSUE_RESOLVED
    FROM
        CALL_CENTER_DB.ANALYTICS.CALL_CENTER_ANALYSIS
    WHERE
        TRANSCRIPT IS NOT NULL
    AND LENGTH(TRANSCRIPT) > 50
);
```

> 💡 **Tip:** Keep the `AS (SELECT …)` list lean—only include fields you plan to return or filter on to keep the index light.

---

### Step 3: SEARCH_PREVIEW (basic)

- `SEARCH_PREVIEW` runs the search service and does not persist results.
- The `query` parameter searches the `TRANSCRIPT` text.
- The `limit` parameter controls the maximum number of returned rows.

```sql
SELECT
    SNOWFLAKE.CORTEX.SEARCH_PREVIEW
    (
        'CALL_CENTER_DB.ANALYTICS.CALL_CENTER_SEARCH_SERVICE',
        '{
            "query": "billing complaint",
            "limit": 5
        }'
    ) AS SEARCH_RESULTS;
```

---

### Step 4: SEARCH_PREVIEW (with columns)
- You can request additional indexed or selected fields to be returned alongside each search hit.
- Use the `columns` parameter in your search query to specify which fields to include in the results.

```sql
SELECT
    SNOWFLAKE.CORTEX.SEARCH_PREVIEW
    (
        'CALL_CENTER_DB.ANALYTICS.CALL_CENTER_SEARCH_SERVICE',
        '{
            "query": "billing complaint",
            "columns": ["CALL_ID", "CALL_CENTER_AGENT","AUDIO_FILE_URL"],
            "limit": 5
        }'
    ) AS SEARCH_RESULTS;
```

> 💡 **Tip:** Column names here must appear in the service’s `AS (SELECT …)` clause.

---

### Step 5: SEARCH\_PREVIEW (parse JSON to rows)

- Use `PARSE_JSON` to convert the JSON response from `SEARCH_PREVIEW` into a Snowflake VARIANT object.
- Apply `LATERAL FLATTEN` to the `"results"` array in the parsed JSON to expand each search result into its own row.
- Select and cast desired fields (e.g., `"CALL_ID"`, `"CALL_CENTER_AGENT"`, `"URGENCY_LEVEL"`) from each flattened result for analysis or display.

- Example pattern:
    ```sql
    WITH CTE_SEARCH_PREVIEW AS (
            SELECT
                    PARSE_JSON(
                            SNOWFLAKE.CORTEX.SEARCH_PREVIEW(
                                    'CALL_CENTER_DB.ANALYTICS.CALL_CENTER_SEARCH_SERVICE',
                                    '{ "query": "billing complaint", "columns": ["CALL_ID", "CALL_CENTER_AGENT","URGENCY_LEVEL"], "limit": 5 }'
                            )
                    ) AS SEARCH_RESULTS
    )
    SELECT
            SEARCH_RESULTS:"request_id"::string AS REQUEST_ID,
            REC.value:"CALL_ID"::string AS CALL_ID,
            REC.value:"CALL_CENTER_AGENT"::string AS CALL_CENTER_AGENT,
            REC.value:"URGENCY_LEVEL"::string AS URGENCY_LEVEL
    FROM
            CTE_SEARCH_PREVIEW,
            LATERAL FLATTEN(input => SEARCH_RESULTS:"results") REC;
    ```

---

### Step 6: SEARCH_PREVIEW (with filter)

- Add a JSON `filter` block to constrain results, such as:
    - Use `@eq` to filter by a specific value (e.g., `URGENCY_LEVEL`).
    - This limits returned results to only those matching the filter condition.

```sql
WITH CTE_SEARCH_PREVIEW AS
(
    SELECT
        PARSE_JSON
        (
            SNOWFLAKE.CORTEX.SEARCH_PREVIEW
            (
                'CALL_CENTER_DB.ANALYTICS.CALL_CENTER_SEARCH_SERVICE',
                '{
                    "query": "billing complaint",
                    "filter": { "@eq": { "URGENCY_LEVEL": "high" } },
                    "columns": ["CALL_ID", "CALL_CENTER_AGENT","URGENCY_LEVEL"],
                    "limit": 5
                }'
            )
        ) AS SEARCH_RESULTS
)

SELECT
    SEARCH_RESULTS:"request_id"::string AS REQUEST_ID,
    REC.value:"CALL_ID"::string AS CALL_ID,
    REC.value:"CALL_CENTER_AGENT"::string AS CALL_CENTER_AGENT,
    REC.value:"URGENCY_LEVEL"::string AS URGENCY_LEVEL
FROM
    CTE_SEARCH_PREVIEW,
    LATERAL FLATTEN(input => SEARCH_RESULTS:"results") REC;
```

---

### Notes & Troubleshooting

* **Attributes vs. filters:** Attributes listed in the service and selected in `AS (SELECT …)` are available both as returned columns and **filter fields**.
* **Index freshness:** Adjust `TARGET_LAG` to control how often the service scans for changes.


## CORTEX AGENTS

Duration: 0:08:00

### Learning Outcome

In this step, you'll configure a Cortex Agent that can intelligently route queries between structured metrics (using Cortex Analyst and your semantic view) and unstructured transcript search (using Cortex Search Service). You'll provide clear instructions to guide the agent's tool selection, link both the semantic view and search service, manage orchestration and access, and validate the agent with test prompts covering both types of data.

### Description

In this step, you’ll create a call‑center agent in Snowsight that can:

This agent can answer questions about call center metrics by querying structured data through Cortex Analyst and your semantic view. It also retrieves relevant passages from call transcripts using Cortex Search, and combines both sources to provide concise, cited responses for multi-part queries.

> 💡 **Tip:** Ensure the objects from previous steps exist and are populated:
>
> * Semantic View: `CALL_CENTER_DB.ANALYTICS.CALL_CENTER_MODEL`
> * Search Service: `CALL_CENTER_DB.ANALYTICS.CALL_CENTER_SEARCH_SERVICE`

---

### Step 1: Open Agents in Snowsight

* In Snowsight, go to **AI & ML → Agents**.
* Click **Create Agent**.

---

### Step 2: About — Name & Location

Fill the agent’s basic details:

* **Location (database.schema):** `SNOWFLAKE_INTELLIGENCE.AGENTS`
* **Name:** `CALL_CENTER_AGENT`
* **Display Name:** `Call Center Agent`
* **Description :** This agent analyzes call‑center conversations and metrics. It uses Cortex Search over call transcripts and Cortex Analyst over a governed semantic view to answer questions with concise, cited responses.

> 💡 **Tip:** Keep the description focused on scope and data sources. It improves planning and tool‑selection quality.

---

### Step 3: Instructions

Paste the following **instructions**:

```
You are a call‑center analytics assistant. When a question involves:
- Structured KPIs/metrics (rates, counts, averages), use Cortex Analyst with the semantic view `CALL_CENTER_DB.ANALYTICS.CALL_CENTER_MODEL`. Return concise numeric answers with clear groupings and time context.
- Unstructured transcripts (who said what, reasons, quotes, summaries), use Cortex Search service `CALL_CENTER_DB.ANALYTICS.CALL_CENTER_SEARCH_SERVICE` and cite the matching call IDs.
- Both: combine results. Clearly label which parts come from Analyst vs Search. Prefer bullet points, 3–5 max. Avoid speculation.
Formatting:
- Keep responses ≤ 4 sentences where possible.
- Include inline call IDs for references (e.g., CALL_20250728_10050).
- Use tables for grouped numeric results.
```

| Sample Questions                                                                                                   |
|-------------------------------------------------------------------------------------------------------------------|
| Which primary_intent has the highest resolution rate? Show % and call count?                                      |
| Find calls with high urgency discussing billing and summarize key issues?                                          |
| By agent, what’s the average overall sentiment and positive product sentiment rate?                               |


---

### Step 4: Tools — Add Cortex Analyst 

Add your governed model for structured queries:

| Field                   | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| **Name**                | `CALL_CENTER_ANALYST`                                 |
| **Tool Type**           | Cortex Analyst                                        |
| **Source**              | **Semantic View**                                     |
| **Schema**              | `CALL_CENTER_DB.ANALYTICS`                            |
| **Semantic View**       | `CALL_CENTER_DB.ANALYTICS.CALL_CENTER_ANALYST`        |
| **Warehouse**           | `USER_STD_XSMALL_WH`                                  |
| **Query timeout (sec)** | `60`                                                  |
| **Description**         | *Comprehensive call‑center analytics (transcripts, sentiment, resolution, action items).* |


---

### Step 5: Tools — Add Cortex Search Service

Wire the agent to your transcript search index:

| Field            | Value                                                 |
| ---------------- | ----------------------------------------------------- |
| **Name**         | `CORTEX_SEARCH_SERVICE`                               |
| **Tool Type**    | Cortex Search Service                                 |
| **Database**     | `CALL_CENTER_DB`                                      |
| **Service**      | `CALL_CENTER_DB.ANALYTICS.CALL_CENTER_SEARCH_SERVICE` |
| **ID Column**    | `AUDIO_FILE_URL`                                      |
| **Title Column** | `CALL_ID`                                             |
| **Description**  |                                                       |

> 💡 **Tip:** Only columns included in the service’s `AS (SELECT …)` clause are available for return and filtering.

---

### Step 6: Orchestration

* In **Orchestration**, leave mode as **Auto**.
* **Planning instructions (optional):**


  If a query spans both structured and unstructured data, state which tool(s) you will use first. Prefer Analyst for numeric comparisons; use Search to retrieve supporting context. If unsure, ask a brief clarifying question.


---

### Step 7: Access

* In **Access**, grant a role that should run the agent we using ACCOUNTADMIN for now.
* Click **Save**.

---

### Step 8: Test the Agent

Try a few prompts:

* *"Which **primary\_intent** has the highest **resolution rate**? Show % and call count."*
* *"Find calls with **high** urgency discussing **billing** and summarize key issues."*
* *"By agent, what’s the **average overall sentiment** and **positive product sentiment rate**?"*

> 💡 **Tip:** If search results look sparse, confirm the search service is refreshed and that transcripts exceed the length threshold used in your index query.

## SNOWFLAKE INTELLIGENCE

Duration: 0:04:00

### Learning Outcome

* Open **Snowflake Intelligence** in Snowsight and launch a chat powered by your **Cortex Agent**.
* Choose the correct **agent**, **location**, and **warehouse**.
* Run a few starter prompts that exercise both **Cortex Analyst** and **Cortex Search**.

### Prerequisites

* Agent created and saved: `CALL_CENTER_AGENT`
* Semantic View published: `CALL_CENTER_DB.ANALYTICS.CALL_CENTER_MODEL`
* Search Service created: `CALL_CENTER_DB.ANALYTICS.CALL_CENTER_SEARCH_SERVICE`
* Warehouse available: `USER_STD_XSMALL_WH`

---

### Step 1: Open Snowflake Intelligence (Snowsight)

1. In the left navigation, click **AI & ML → Snowflake Intelligence**.
2. Click **Create Intelligence**.

> 💡 **Tip:** If you don’t see Intelligence, ensure your role has access to Cortex features and the relevant database/schema.

---

### Step 2: Basics

Fill in the core settings for your chat experience.

| Field                          | Example Value              |
| ------------------------------ | -------------------------- |
| **Name**                       | `CALL_CENTER_INTELLIGENCE` |
| **Location (database.schema)** | `CALL_CENTER_DB.ANALYTICS` |
| **Agent**                      | `CALL_CENTER_AGENT`        |
| **Warehouse**                  | `USER_STD_XSMALL_WH`       |

Click **Create** (or **Save**).

---

### Step 3: Optional Settings

* **Welcome message** (example):

  > *“Ask about call volumes, sentiment trends, and specific conversations. I can search transcripts and run metrics.”*
* **Access**: grant your lab role.
* Leave other defaults as‑is for this lab.

---

### Step 4: Try These Prompts

Use a mix that routes across Analyst and Search via your agent.

* **Analyst‑leaning:** *“What is the average overall sentiment by **primary\_intent**? Show top 5.”*
* **Search‑leaning:** *“Find calls that mention **cancellation** with **high** urgency and summarize the customer’s reasons.”*
* **Hybrid:** *“Which agents have the **highest average sentiment** on calls that mention **refunds**? Include 3 supporting `CALL_ID`s.”*

> 💡 **Tip:** If you don’t see call IDs or context snippets, confirm the **search service** is attached to the agent and includes `CALL_ID` (and any other attributes you want back) in its `AS (SELECT …)` list.

---

### Troubleshooting

* **No/empty results:** Confirm your semantic view and search service are in `CALL_CENTER_DB.ANALYTICS` and populated.
* **Permission errors:** Ensure your role has `USAGE` on the database/schema and warehouse, plus `SELECT` on the underlying objects.
* **Compute:** If responses time out, bump the warehouse size temporarily and retry.

## Conclusion

Congratulations on completing the **Snowflake Cortex AI — Call Center Analytics with AI Agents** lab!

### What You Learned

You worked end‑to‑end across Snowflake Aisql, Cortex Analyst, Cortex Search Services, and Agentic features:

* `AI_TRANSCRIBE()` – Convert staged audio (MP3/WAV) into text transcripts for downstream analytics.
* `EXTRACT_ANSWER()` – Pull precise fields (e.g., agent name) from transcripts using natural language.
* `SUMMARIZE()` – Generate concise overviews of long conversations.
* `SENTIMENT()` and `AI_SENTIMENT()` – Score overall tone and per‑category sentiment (e.g., Brand, Cost, Product).
* `AI_CLASSIFY()` – Categorize calls into business‑relevant labels with task descriptions, enums, and few‑shot examples.
* `AI_COMPLETE()` + `PROMPT()` – Produce both free‑text and **structured JSON** outputs.

* **Semantic View (Cortex Analyst)** – Model dimensions, metrics, and named filters and verified queries.
* **Cortex Search Service** – Create a semantic search index over `TRANSCRIPT` with filterable attributes.
* **Cortex Agents & Snowflake Intelligence** – Orchestrate tools (Analyst + Search) and expose a governed chat experience.

### Alternate Use Cases

These techniques extend far beyond call centers:

* Legal brief and case‑file summarization
* Customer support email triage and routing
* Interview/meeting transcription analysis
* Insurance claims intake & validation
* Product review classification and scoring

### Further Exploration

Dive deeper with these docs and ideas:

* [**AISQL**](https://docs.snowflake.com/en/user-guide/snowflake-cortex/aisql)
* [**Semantic Views**](https://docs.snowflake.com/en/user-guide/views-semantic/overview)
* [**Cortex Analyst**](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)
* [**Cortex Search Service**](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/cortex-search-overview)
* [**Cortex Agents**](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents)
* [**Snowflake Intelligence**](https://docs.snowflake.com/en/user-guide/snowflake-cortex/snowflake-intelligence)



---

> 🎓 If you joined this lab as part of a AI Lab training session, you’ll receive a certified badge of attendance.

Thank you for spending time with us!

Visit **datalab** at [**www.datalab.co.za**](https://www.datalab.co.za) to learn more about our AI training and analytics solutions.

Follow us on [**LinkedIn**](https://www.linkedin.com/company/datalabsolutions) for new labs and updates.
