id: snowflake-cortex-callcenter-lab
name: Snowflake Cortex AI for Call Center Transcript Analysis
summary: A self-paced hands-on lab that teaches how to use Snowflake Cortex AI to ingest, extract, structure, translate, analyze, summarize, and answer questions from PDF call center transcripts.
author: datalab-solutions
categories: ["AI", "Cortex", "Call Center", "Text Analysis"]
environments: Web
duration: 90
status: Published
license: Apache-2.0
tags: ["snowflake", "cortex-ai", "prompt-engineering", "pdf-extraction", "sentiment-analysis"]
source: internal
analytics account: UA-XXXXXXXXX-X
feedback link: https://github.com/datalab-solutions/snowflake-codelabs/issues
level: intermediate
products: ["Snowflake Cortex"]

# Snowflake Cortex AI for Call Center Transcript Analysis

## Overview

Duration: 0:03:00

### Introduction
This hands-on lab introduces participants to Snowflake Cortex AI’s ability to extract valuable insights from unstructured documents using large language models. The lab uses examples of call center transcripts stored as PDFs. Participants will explore functions such as PARSE\_DOCUMENT, COMPLETE, TRANSLATE, SENTIMENT, ENTITY\_SENTIMENT, CLASSIFY\_TEXT, SUMMARIZE, and EXTRACT\_ANSWER. These tools empower users to parse, translate, analyze, classify, and query unstructured customer support data to uncover sentiment, highlight issues, and summarize conversations at scale.

### What You'll Learn

* Upload and manage unstructured documents in Snowflake
* Extract and transform transcript text with [`PARSE_DOCUMENT`](https://docs.snowflake.com/en/sql-reference/functions/parse_document-snowflake-cortex)
* Structure data using prompt engineering and the [`COMPLETE`](https://docs.snowflake.com/en/sql-reference/functions/complete-snowflake-cortex) function
* Translate text with [`TRANSLATE`](https://docs.snowflake.com/en/sql-reference/functions/translate-snowflake-cortex)
* Analyze sentiment using [`SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/sentiment-snowflake-cortex) and [`ENTITY_SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/entity_sentiment-snowflake-cortex)
* Classify call intent using [`CLASSIFY_TEXT`](https://docs.snowflake.com/en/sql-reference/functions/classify_text-snowflake-cortex)
* Summarize content with [`SUMMARIZE`](https://docs.snowflake.com/en/sql-reference/functions/summarize-snowflake-cortex)
* Extract answers using [`EXTRACT_ANSWER`](https://docs.snowflake.com/en/sql-reference/functions/extract_answer-snowflake-cortex)

### Download Code

Download the source code for this lab [here] (https://github.com/datalabsolutions/AI-Labs/raw/main/snowflake-cortex-callcenter-lab/assets/audio-files.zip)

### Prerequisites

Duration: 0:01:00

* A [Snowflake account](https://trial.snowflake.com/?owner=SPN-PID-452710) in a region where **Snowflake Cortex LLM functions** are supported
* Basic familiarity with SQL and the Snowflake UI
* Access all the scripts for this Lab [on GitHub](https://github.com/datalabsolutions/AI-Labs/tree/main/snowflake-cortex-callcenter-lab)

> 💡 **Tip:** Use the [LLM Function Availability](https://docs.snowflake.com/en/user-guide/snowflake-cortex/llm-functions#availability) page to check which cloud regions are supported.

## Environment Configuration

Duration: 0:05:00

### Learning Outcome

Create the core Snowflake resources needed to run the AI Lab. This includes a database, warehouse, schemas, and a stage for uploading PDFs.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/01-AI-LAB-CONFIGURATION.sql).

### Description

This setup script prepares your Snowflake environment to ingest and process unstructured call center transcripts.

* `CREATE DATABASE` ensures your lab operates in a clean and isolated environment.
* `CREATE WAREHOUSE` provisions compute resources for running your queries. It’s configured to minimize cost with automatic suspend/resume settings.
* `CREATE SCHEMA` creates logical namespaces for raw files (`RAW`) and processed/intermediate data (`STAGE`).
* `CREATE STAGE` sets up a secure location to upload PDF documents. It supports directory table creation and uses Snowflake-managed encryption.

### Set Snowflake Context

Before executing any commands, set your session to the appropriate context:

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA RAW;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create the Database

This command creates a new database named `LLM_CORTEX_DEMO_DB` if it doesn't already exist. Using `IF NOT EXISTS` ensures the script is idempotent and can be rerun safely without causing errors if the database already exists.

```sql
CREATE DATABASE IF NOT EXISTS LLM_CORTEX_DEMO_DB;
```

### Step 2: Create a Compute Warehouse

This step provisions a virtual compute warehouse named `USER_STD_XSMALL_WH`. It is configured with the following parameters:

* **Size**: `XSMALL` – small and cost-effective for light workloads.
* **Type**: `STANDARD` – supports most use cases.
* **Auto Suspend**: `60 seconds` – pauses automatically after inactivity to save credits.
* **Auto Resume**: `TRUE` – resumes automatically when a query is submitted.
* **Initially Suspended**: `TRUE` – starts in a paused state until needed.

```sql
CREATE OR REPLACE WAREHOUSE USER_STD_XSMALL_WH
WITH
    WAREHOUSE_SIZE = 'XSMALL'
    WAREHOUSE_TYPE = 'STANDARD'
    AUTO_SUSPEND = 60
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = TRUE;
```

### Step 3: Create Required Schemas

Schemas are used to logically separate and organize objects within a database.

* `RAW`: stores the ingested PDF files and unprocessed content.
* `STAGE`: used for parsed, structured, or intermediate content.

Using `IF NOT EXISTS` prevents duplication errors.

```sql
CREATE SCHEMA IF NOT EXISTS LLM_CORTEX_DEMO_DB.RAW;
CREATE SCHEMA IF NOT EXISTS LLM_CORTEX_DEMO_DB.STAGE;
```

### Step 4: Create an Internal Stage for PDF Uploads

This internal stage acts as a Snowflake-managed file storage area. It is configured to:

* Support directory-style file access via the `DIRECTORY = (ENABLE = TRUE)` setting
* Encrypt uploaded files using Snowflake’s **Server-Side Encryption (SSE)**

You will upload call center PDF transcripts into this stage for processing in later steps.

```sql
CREATE OR REPLACE STAGE LLM_CORTEX_DEMO_DB.RAW.INT_STAGE_DOC_RAW
    DIRECTORY = ( ENABLE = true )
    ENCRYPTION = ( TYPE = 'SNOWFLAKE_SSE' );
```

### Upload PDF Files to the Internal Stage

Your internal stage `LLM_CORTEX_DEMO_DB.RAW.INT_STAGE_DOC_RAW` is already set up.

#### Using Snowsight:

1. In Snowsight, go to **Databases**.
2. Click on `LLM_CORTEX_DEMO_DB` > `RAW` > `Stages`.
3. Select `INT_STAGE_DOC_RAW`.
4. Click the **+ Files** tab.
5. Click **Upload** and add one or more call center transcript PDFs.

---

## PARSE\_DOCUMENT

Duration: 0:07:00

### Learning Outcome

Use the `PARSE_DOCUMENT()` function to extract the textual content from uploaded PDF files stored in the internal stage, and load that content into a structured table. This allows unstructured documents to be processed and queried using SQL.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/02-AI-LAB-PARSE_DOCUMENT.sql).

### Description

The `PARSE_DOCUMENT()` function is part of the Snowflake Cortex AI suite. It enables extraction of raw text from documents (PDFs, DOCX, etc.) into a usable SQL format.

In this step, we:

* Read files from an internal stage.
* Use `PARSE_DOCUMENT()` in LAYOUT mode to preserve formatting.
* Store the parsed output into a transcript table.

The result is a table with one row per document, containing the filename and its full transcript.

### Set Snowflake Context

Before running the extraction steps, ensure you're working in the correct context:

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table for Parsed Results

This table will store the parsed transcript text alongside the original filename. It acts as the primary source for downstream analysis like sentiment, summarization, and classification.

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT (
    FILE_NAME STRING,
    TRANSCRIPT VARCHAR
);
```

> 💡 The `VARCHAR` type is suitable because Cortex will return the full text as a single block.

### Step 2: Extract PDF Content from the Stage

This SQL block:

* Lists distinct PDF file paths from the internal stage.
* Uses `PARSE_DOCUMENT()` to read and convert each file into text.
* Loads the result into the `TRANSCRIPT` table.

We use `TO_VARCHAR(...:content::string)` to safely extract the content portion from the returned JSON variant.

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
SELECT 
    FILE_NAME,
    TO_VARCHAR(
        SNOWFLAKE.CORTEX.PARSE_DOCUMENT(
            @LLM_CORTEX_DEMO_DB.RAW.INT_STAGE_DOC_RAW,
            FILE_PATH,
            { 'mode': 'LAYOUT' }
        ):content::string
    ) AS TRANSCRIPT
FROM (
    SELECT DISTINCT
        METADATA$FILENAME AS FILE_PATH,
        SPLIT_PART(METADATA$FILENAME, '/', -1) AS FILE_NAME
    FROM @LLM_CORTEX_DEMO_DB.RAW.INT_STAGE_DOC_RAW/
) A;
```

> 🔍 `LAYOUT` mode retains line breaks and layout structure — useful for keeping the dialogue or sections readable.
> ⚠️ Scanned image-based PDFs won’t extract correctly. Consider running OCR first if the file contains no embedded text.

### Step 3: View Parsed Results

Query the table to review which files were parsed and inspect their content:

```sql
SELECT FILE_NAME, TRANSCRIPT FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

You should see each uploaded file with its corresponding parsed text ready for further analysis.

---

## EXTRACT\_ANSWER

Duration: 0:07:00

### Learning Outcome

Use the `EXTRACT_ANSWER()` function to identify specific information from each call center transcript, such as the caller's name, the date of the call, and its duration. This lets you transform long-form conversational data into structured, queryable columns.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/03-AI-LAB-EXTRACT_ANSWER.sql).

### Description

The `EXTRACT_ANSWER()` function allows you to pose natural-language questions to Cortex and extract a specific answer from a block of text. It is well-suited for pulling discrete facts from unstructured data.

In this step, we:

* Extract key values like `CALLER_NAME`, `CALL_DATE`, and `CALL_DURATION` from each transcript
* Store the result in a structured table alongside the original transcript

We also demonstrate how to convert the model output into valid SQL types (DATE, FLOAT, etc.) using `TRY_TO_DATE()` and `TRY_TO_NUMBER()`.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table to Store Caller Metadata

This new table will hold both the raw transcript and extracted values for analysis.

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER (
    FILE_NAME VARCHAR,
    CALLER_NAME VARCHAR,
    CALL_DATE DATE,
    CALL_DURATION FLOAT,
    TRANSCRIPT VARCHAR
);
```

> 💡 Storing both raw and derived data together makes this table self-contained and easy to validate.

### Step 2: Extract Answers Using Prompts

We apply three natural-language prompts:

* "What is the name of the caller?"
* "What is the Date of the call?"
* "What is the call duration?"

Each prompt returns an array of potential answers. We extract the top answer using `[0]:answer::string` and apply data cleaning before type conversion.

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER  
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.EXTRACT_ANSWER(
        TRANSCRIPT,
        'What is the name of the caller?'
    )[0]:answer::string AS CALLER_NAME,

    TRY_TO_DATE(REPLACE(SNOWFLAKE.CORTEX.EXTRACT_ANSWER(
        TRANSCRIPT,
        'What is the Date of the call?'
    )[0]:answer::string,' ','')) AS CALL_DATE,

    TRY_TO_NUMBER(REPLACE(SNOWFLAKE.CORTEX.EXTRACT_ANSWER(
        TRANSCRIPT,
        'What is the call duration?'
    )[0]:answer::string,' ','')) AS CALL_DURATION,

    TRANSCRIPT AS TRANSCRIPT
FROM 
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

> 🔍 The use of `REPLACE(..., ' ', '')` ensures that Cortex answers like " 5 minutes " are correctly converted.
> 🛠 `TRY_TO_DATE()` and `TRY_TO_NUMBER()` prevent failures if the answer is blank or not a valid format.

### Step 3: View Extracted Caller Details

```sql
SELECT * FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER;
```

This will display the extracted metadata next to the transcript — ready for further enrichment, filtering, or analytics.

---

## SUMMARIZE

Duration: 0:05:00

### Learning Outcome

Use the `SUMMARIZE()` function to create a natural-language summary of each call center transcript. Summaries help reduce long conversations into concise descriptions that capture the main themes, customer issues, resolutions, and actions taken.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/04-AI-LAB-SUMMARIZE.sql).

### Description

The `SUMMARIZE()` function is a one-line API that distills the key elements of a transcript. This is useful for:

* Generating executive summaries
* Tagging transcripts for review
* Providing previews or digest versions in dashboards

The summaries are generated using the `snowflake-arctic` model under the hood.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table to Store Summaries

We store both the summary and original transcript to preserve traceability.

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY (
    FILE_NAME VARCHAR,
    TRANSCRIPT_SUMMARY VARCHAR,
    TRANSCRIPT VARCHAR
);
```

> 💡 Saving the original transcript allows you to revise prompts later if needed.

### Step 2: Generate Summaries with `SUMMARIZE()`

This query uses the `SUMMARIZE()` function to process all transcripts and return a concise textual summary.

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.SUMMARIZE(TRANSCRIPT) AS TRANSCRIPT_SUMMARY,
    TRANSCRIPT
FROM 
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

> 🧠 The model intelligently finds main points, topics, and outcomes without needing a specific prompt.

> 🔄 You can also run this incrementally by filtering new transcripts using a WHERE clause.

### Step 3: View the Summaries

```sql
SELECT * FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY;
```

Review the generated summaries to validate their tone and informativeness. These can be used directly in reporting interfaces or to trigger follow-up actions.

---

### SENTIMENT

Duration: 0:05:00

### Learning Outcome

Use the `SENTIMENT()` function to measure the emotional tone of a call transcript. This function returns a numerical score between -1 and 1, indicating negative, neutral, or positive sentiment. This analysis helps identify frustrated customers or celebrate excellent service.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/05-AI-LAB-SENTIMENT.sql).

### Description

The `SENTIMENT()` function processes free-form text and returns a floating-point score:

* `-1.0` represents very negative tone (e.g., angry, disappointed)
* `0.0` represents neutral tone (e.g., factual, emotionless)
* `+1.0` represents very positive tone (e.g., appreciative, satisfied)

Sentiment scores help in building dashboards for support performance and alerting systems for unhappy customer interactions.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table for Sentiment Scores

This table captures the sentiment value alongside each transcript.

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT (
    FILE_NAME VARCHAR,
    OVERALL_SENTIMENT FLOAT,
    TRANSCRIPT VARCHAR
);
```

> 💡 You can later join this table with summaries or caller info to analyze sentiment by date, customer, or issue type.

### Step 2: Apply `SENTIMENT()` to Transcripts

This query processes every transcript and returns a sentiment score.

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.SENTIMENT(TRANSCRIPT) AS OVERALL_SENTIMENT,
    TRANSCRIPT
FROM 
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

> 📈 Use this data to monitor average sentiment over time or set alerts for very negative interactions.
> 🛠 This function is fast and works well on large volumes of text with little tuning.

### Step 3: View Sentiment Scores

```sql
SELECT * FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT;
```

You should see each file with a numeric sentiment score that reflects the customer’s tone throughout the conversation.

---

## ENTITY\_SENTIMENT

Duration: 0:06:00

### Learning Outcome

Use the `ENTITY_SENTIMENT()` function to assess how specific elements ("Tone of voice", "Issue Resolved", "Follow up action") are discussed in each call transcript. Unlike `SENTIMENT()` which provides an overall mood score, `ENTITY_SENTIMENT()` offers sentiment feedback for specific labeled concepts.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/06-AI-LAB-ENTITY_SENTIMENT.sql).

### Description

The `ENTITY_SENTIMENT()` function analyzes a transcript with respect to user-defined entity labels and returns a JSON array. Each entity is associated with:

* A `sentiment` label: Positive, Neutral, or Negative
* A `confidence` score: a float indicating model certainty

This is particularly useful for:

* Flagging unresolved issues
* Tracking performance improvements by topic
* Evaluating call quality across dimensions

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table for Entity Sentiment

This table stores the structured variant output from the Cortex function.

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT (
    FILE_NAME STRING,
    PRODUCT_ENTITY_SENTIMENT VARIANT,
    TRANSCRIPT VARIANT
);
```

### Step 2: Extract Sentiment for Specific Labels

We define target labels using `ARRAY_CONSTRUCT()`. This example uses three predefined aspects of call quality:

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.ENTITY_SENTIMENT(
        TRANSCRIPT,
        ARRAY_CONSTRUCT('Tone of voice', 'Issue Resolved', 'Follow up action')
    ) AS PRODUCT_ENTITY_SENTIMENT,
    TRANSCRIPT AS TRANSCRIPT
FROM
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

> 🎯 You can customize the list of entities to match internal QA criteria.
> 💡 Use variant format here so that JSON response can be explored and flattened later.

### Step 3: Flatten JSON Output into Tabular Form

Use `LATERAL FLATTEN` to convert the array into row-based output for easy filtering:

```sql
SELECT
    FILE_NAME,
    flattened.value:entity::STRING AS ENTITY,
    flattened.value:sentiment::STRING AS SENTIMENT,
    flattened.value:confidence::FLOAT AS CONFIDENCE
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT,
     LATERAL FLATTEN(INPUT => PRODUCT_ENTITY_SENTIMENT) AS flattened;
```

> 📊 This result shows one row per label per transcript — ideal for QA review and comparison dashboards.

### Step 4: Pivot Results into One Row per Transcript

You can transform entity results into columns using aggregation:

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT_FINAL AS
SELECT 
    FILE_NAME,
    MAX(CASE WHEN category.value:entity::STRING = 'Tone of voice' THEN category.value:sentiment::STRING END) AS TONE_OF_VOICE,
    MAX(CASE WHEN category.value:entity::STRING = 'Issue Resolved' THEN category.value:sentiment::STRING END) AS ISSUE_RESOLVED,
    MAX(CASE WHEN category.value:entity::STRING = 'Follow up action' THEN category.value:sentiment::STRING END) AS FOLLOW_UP
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT,
     LATERAL FLATTEN(INPUT => PRODUCT_ENTITY_SENTIMENT) AS category
GROUP BY FILE_NAME;
```

---


## CLASSIFY\_TEXT

Duration: 0:05:00

### Learning Outcome

Use the `CLASSIFY_TEXT()` function to categorize each transcript into a predefined set of labels. This helps you organize transcripts by intent or topic, enabling faster filtering, tagging, and operational response.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/07-AI-LAB-CLASSIFY_TEXT.sql).

### Description

The `CLASSIFY_TEXT()` function evaluates a block of text and assigns the most semantically appropriate label from a list of user-provided options.

This is especially helpful for:

* Triage queues (e.g., Complaint vs. Inquiry vs. Follow-up)
* Building dashboards that break down call volumes by reason
* Training support staff with labeled scenarios

The function returns a `label` and an optional `score` indicating how confident the model is in its selection.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table for Transcript Classification

This table stores the predicted classification label for each transcript.

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CLASSIFICATION (
    FILE_NAME VARCHAR,
    CALL_CLASSIFICATION VARCHAR,
    TRANSCRIPT VARCHAR
);
```

### Step 2: Run `CLASSIFY_TEXT()` on Each Transcript

This query classifies each transcript into one of the provided categories using semantic matching.

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CLASSIFICATION 
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.CLASSIFY_TEXT(
        TRANSCRIPT,
        ARRAY_CONSTRUCT('Report Incident', 'Complaint', 'Follow up')
    ):label::string AS CALL_CLASSIFICATION,
    TRANSCRIPT
FROM
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

> 🎯 You can expand or modify the label list to suit your support taxonomy.
> 💬 Optional: Extract the confidence score with `:score::FLOAT` to identify uncertain classifications.

### Step 3: View Classified Transcripts

```sql
SELECT * FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CLASSIFICATION;
```

This allows you to segment and route calls based on their classification, improving operational workflows and analytics.

---

## COMPLETE

Duration: 0:08:00

### Learning Outcome

Learn how to use the `COMPLETE()` function with tailored prompts to generate structured outputs, summaries, ratings, and red flag detection based on transcript text. This step introduces prompt engineering to control the model’s output format and tone.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/08-AI-LAB-COMPLETE.sql).

### Description

The `COMPLETE()` function is one of the most versatile tools in the Snowflake Cortex suite. It supports open-ended prompts and free-form answers, ideal for:

* Custom summaries and emails
* Quality ratings
* Escalation checks
* Extracting structured content like JSON or bullet lists

Prompt construction is key. Effective prompts include instruction, format guidance, tone, and the transcript.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Example 1: One-Sentence Summary

Summarize a call with one concise sentence, ideal for dashboards or preview cards.

| **Technique** | **Prompt Line**                                          |
| ------------- | -------------------------------------------------------- |
| Instruction   | Summarize the following call transcript in one sentence: |
| Data          | TRANSCRIPT                                               |

```sql
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'snowflake-arctic',
        'Summarize the following call transcript in one sentence: ' || TRANSCRIPT
    ) AS CALL_SUMMARY
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME = 'audiofile11.pdf';
```

### Example 2: Bullet Summary for Team Leader

Format call insights as a set of short, professional bullet points for quick triage.

| **Technique**        | **Prompt Line**                                                                  |
| -------------------- | -------------------------------------------------------------------------------- |
| Role / Persona       | You are a senior support team lead.                                              |
| Instruction          | Read the following transcript and summarize it into exactly three bullet points. |
| Constraint           | Keep each bullet point under 15 words and use a professional tone.               |
| Format Specification | Use hyphens for each bullet.                                                     |
| Data                 | TRANSCRIPT                                                                       |

```sql
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'snowflake-arctic',
        'You are a senior support team lead. ' ||
        'Read the following transcript and summarize it into exactly three bullet points. ' ||
        'Keep each bullet point under 15 words and use a professional tone. ' ||
        'Use hyphens for each bullet. ' ||
        'Transcript: ' || TRANSCRIPT
    ) AS BULLET_SUMMARY
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME = 'audiofile11.pdf';
```

### Example 3: Escalation Detection

Check whether a conversation requires escalation using simple classification logic.

| **Technique**  | **Prompt Line**                                      |
| -------------- | ---------------------------------------------------- |
| Role / Persona | You are a triage assistant.                          |
| Instruction    | Does this call require escalation? Answer YES or NO. |
| Constraint     | If YES, explain briefly in one sentence why.         |
| Data           | TRANSCRIPT                                           |

```sql
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'snowflake-arctic',
        'You are a triage assistant. ' ||
        'Does this call require escalation? Answer YES or NO. ' ||
        'If YES, explain briefly in one sentence why. ' ||
        'Transcript: ' || TRANSCRIPT
    ) AS ESCALATION_FLAG
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME IN ('audiofile11.pdf', 'audiofile79.pdf');
```

### Example 4: Call Quality Score

Rate the call performance on clarity, empathy, and professionalism. Output is formatted to be parsed easily.

| **Technique**        | **Prompt Line**                                                                       |
| -------------------- | ------------------------------------------------------------------------------------- |
| Role / Persona       | You are a quality control AI.                                                         |
| Instruction          | Rate the call on a scale of 1–5 stars based on clarity, empathy, and professionalism. |
| Format Specification | Format as "Score: X/5 - Reason".                                                      |
| Data                 | TRANSCRIPT                                                                            |

```sql
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'snowflake-arctic',
        'You are a quality control AI. ' ||
        'Rate the call on a scale of 1–5 stars based on clarity, empathy, and professionalism. ' ||
        'Format as "Score: X/5 - Reason". ' ||
        'Transcript: ' || TRANSCRIPT
    ) AS QUALITY_SCORE
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME = 'audiofile11.pdf';
```

### Example 5: Follow-Up Email Draft

Generate a customer-facing follow-up message after the call. This is helpful for automating agent tasks or QA verification.

| **Technique**  | **Prompt Line**                                                          |
| -------------- | ------------------------------------------------------------------------ |
| Role / Persona | You are a customer service agent.                                        |
| Instruction    | Based on this transcript, write a short follow-up email under 100 words. |
| Tone & Style   | Keep it friendly and professional.                                       |
| Data           | TRANSCRIPT                                                               |

```sql
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'snowflake-arctic',
        'You are a customer service agent. ' ||
        'Based on this transcript, write a short follow-up email under 100 words. ' ||
        'Keep it friendly and professional. ' ||
        'Transcript: ' || TRANSCRIPT
    ) AS FOLLOW_UP_EMAIL
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME = 'audiofile11.pdf';
```

### Example 6: Compliance Red Flags

Identify potential compliance violations or red flags for further review.

| **Technique**        | **Prompt Line**                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| Role / Persona       | You are a risk compliance assistant.                                                                  |
| Instruction          | Read the following transcript and identify any red flags (e.g., threats to cancel, abusive language). |
| Constraint           | If no red flags are found, return "None".                                                             |
| Format Specification | Use bullet points for each red flag.                                                                  |
| Data                 | TRANSCRIPT                                                                                            |

```sql
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'snowflake-arctic',
        'You are a risk compliance assistant. ' ||
        'Read the following transcript and identify any red flags (e.g., threats to cancel, abusive language). ' ||
        'If no red flags are found, return "None". ' ||
        'Use bullet points for each red flag. ' ||
        'Transcript: ' || TRANSCRIPT
    ) AS RED_FLAGS
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME = 'audiofile11.pdf';
```

> 💡 The `COMPLETE()` function gives you full creative control. Prompt clarity and output consistency improve with well-structured instructions and formatting hints.

---

## COMPLETE ADVANCED

Duration: 0:08:00

### Learning Outcome

Apply advanced prompt engineering techniques with the `COMPLETE()` function using multi-message format and model-specific parameters. Learn to:

* Chain system/user messages
* Control tone, temperature, and token usage
* Output structured JSON suitable for automation
* Parse and flatten model responses with metadata

> 💡 **Tip:** Try experimenting with different models to see how they affect tone, structure, and verbosity. Snowflake currently supports a variety of models including:
>
> * `snowflake-arctic`
> * `llama2-70b-chat`
> * `mistral-7b`
> * `gemma-7b-it`
> * `mixtral-8x7b`

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/09-AI-LAB-COMPLETE-ADVANCED.sql).

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

---

### Step 1: Call Review Summary with Arctic Model

This query uses the `snowflake-arctic` model and a single message in the `COMPLETE()` array to simulate a call quality assistant. It analyzes the transcript and produces:

* A suggested reply the agent could send to the customer
* Internal follow-up actions for the agent
* A short tone analysis

You can tune the output using temperature and max\_tokens parameters.

* Suggested customer response
* Agent follow-up actions
* Brief tone analysis

```sql
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'snowflake-arctic',
        [
            {
                'role': 'user',
                'content': 'You are a call center quality assistant. ' ||
                           'Based on the following transcript, generate: ' ||
                           '\n\n1. A suggested response to the customer ' ||
                           '\n2. Recommended follow-up actions for the agent ' ||
                           '\n3. A brief tone analysis ' ||
                           '\n\nTranscript:\n' || TRANSCRIPT
            }
        ],
        {
            'temperature': 0.5,
            'max_tokens': 300
        }
    ) AS CALL_REVIEW_SUMMARY
FROM
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME = 'audiofile11.pdf';
```

---

### Step 2: Summarize Transcript with LLaMA 2

This prompt uses the `llama2-70b-chat` model with a structured message array. The `system` role sets the context (you are a summarizer), and the `user` role passes in the instruction. The result is a two-line summary along with rich metadata for audit and logging.

```sql
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'llama2-70b-chat',
        [
            {
                'role': 'system',
                'content': 'You are a professional summarizer. Extract key information clearly and concisely.'
            },
            {
                'role': 'user',
                'content': 'Summarize this transcript in 1-2 sentences: ' || TRANSCRIPT
            }
        ],
        {
            'temperature': 0.3,
            'top_p': 0.9,
            'max_tokens': 200
        }
    ) AS TRANSCRIPT_SUMMARY,
    TRANSCRIPT_SUMMARY:choices[0]:messages::string,
    TRY_TO_TIMESTAMP(TRANSCRIPT_SUMMARY:created::string) AS CREATED,
    TRANSCRIPT_SUMMARY:model::string AS MODEL,
    TRANSCRIPT_SUMMARY:usage:completion_tokens::number AS COMPLETION_TOKENS,
    TRANSCRIPT_SUMMARY:usage:prompt_tokens::number AS PROMPT_TOKENS,
    TRANSCRIPT_SUMMARY:usage:total_tokens::number AS TOTAL_TOKENS
FROM
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME = 'audiofile11.pdf';
```

---

### Step 3: Draft Professional Email Response

This example uses a multi-message format to generate a complete professional email reply based on the conversation. The `system` message sets up tone and structure. The `user` message includes the transcript. The output contains a formatted email and tokens metadata.

```sql
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'llama2-70b-chat',
        [
            {
                'role': 'system',
                'content': 'You are a customer service representative crafting professional email responses. ' ||
                           'Your goal is to write a polite, clear, and helpful reply to the customer. ' ||
                           'Focus on being empathetic, addressing the main issue, and including any necessary follow-up steps. ' ||
                           'Respond in the form of an email, with a subject line, greeting, body, and sign-off.'
            },
            {
                'role': 'user',
                'content': 'Please write a professional email response to the following call transcript: ' || TRANSCRIPT
            }
        ],
        {
            'temperature': 0.4,
            'top_p': 0.9,
            'max_tokens': 300
        }
    ) AS EMAIL_RESPONSE_JSON,
    EMAIL_RESPONSE_JSON:choices[0]:messages::string AS EMAIL_RESPONSE,
    TRY_TO_TIMESTAMP(EMAIL_RESPONSE:created::string) AS CREATED,
    EMAIL_RESPONSE:model::string AS MODEL,
    EMAIL_RESPONSE:usage:completion_tokens::number AS COMPLETION_TOKENS,
    EMAIL_RESPONSE:usage:prompt_tokens::number AS PROMPT_TOKENS,
    EMAIL_RESPONSE:usage:total_tokens::number AS TOTAL_TOKENS
FROM
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME = 'audiofile11.pdf';
```

---

### Step 4: Structure Transcript into JSON Dialogue

In this example, the transcript is transformed into a structured JSON format. It:

* Tags each speaker by role
* Labels each speech line with an "order"
* Stores results in a VARIANT column (`TRANSCRIPT_JSON`) for later flattening

You also explicitly define the schema Snowflake Cortex should follow using the `response_format` parameter. This schema is written using [JSON Schema](https://json-schema.org/), a standard format for describing the structure of JSON data. This ensures the output adheres to a predictable structure, making it easier to validate and consume in downstream applications.

#### 🧠 Model Response Guidance:

* **Simple tasks** (e.g., summarization, entity extraction): No need for schema enforcement.
* **Medium-complexity tasks** (e.g., explanation with reasoning): Add `Respond in JSON` to the prompt.
* **Complex reasoning tasks** (e.g., assessing conversation quality): Use high-performance models (e.g., `claude-3-5-sonnet`, `mistral-large2`), add `Respond in JSON`, and include a detailed schema in the prompt.

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_DIALOGUE (
    FILE_NAME VARCHAR,
    TRANSCRIPT_JSON VARIANT,
    TRANSCRIPT VARCHAR
);

INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_DIALOGUE
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
        'llama2-70b-chat',
        [
            {
                'role': 'system',
                'content': 'You will receive a conversation transcript between the tags <transcript></transcript>. ' ||
                           'Your task is to: ' ||
                           '\n1. Identify the caller and the agent. ' ||
                           '\n2. Convert the transcript into a structured JSON conversation. ' ||
                           '\n3. Tag each line by role, name, order. ' ||
                           '\n4. Respond in JSON under a top-level "dialogue" key.'
            },
            {
                'role': 'user',
                'content': '<transcript>' || TRANSCRIPT || '</transcript>'
            }
        ],
        {
            'temperature': 0.3,
            'top_p': 0.9,
            'response_format': {
                'type': 'json',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'dialogue': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'order': { 'type': 'integer' },
                                    'role': { 'type': 'string' },
                                    'name': { 'type': 'string' },
                                    'speach': { 'type': 'string' }
                                },
                                'required': ['order', 'role', 'name', 'speach']
                            }
                        }
                    },
                    'required': ['dialogue']
                }
            }
        }
    ) AS TRANSCRIPT_JSON,
    TRANSCRIPT
FROM
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
WHERE FILE_NAME = 'audiofile11.pdf';
```

---

### Step 5: Flatten Dialogue for Tabular Review

Once you've generated structured JSON dialogue, this step uses `LATERAL FLATTEN` to unpack each message into tabular rows for easy querying, filtering, or reporting. This is useful for dashboards and transcript-level analytics.

```sql
SELECT
    FILE_NAME,    
    d.value:"role"::STRING AS "ROLE",
    d.value:"name"::STRING  AS "NAME",
    d.value:"speach"::STRING AS "SPEACH",
    d.value:"order"::NUMBER AS "ORDER"
FROM
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_DIALOGUE,
    LATERAL FLATTEN(
        input => TRANSCRIPT_JSON:"structured_output"[0]:"raw_message":"dialogue"
    ) AS d;
```

This final step transforms your structured dialogue JSON into a clean SQL table for visual review, search, or BI dashboard integration.

---
## FINAL

Duration: 0:07:00

### Learning Outcome

Bring together all outputs from previous steps—parsed transcripts, extracted answers, sentiment analysis, summaries, classifications, and completions—into a unified, queryable dataset. This is ideal for final reporting, QA review, dashboarding, or export.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/10-AI-LAB-FINAL.sql).

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create Final Consolidated View

This SQL script consolidates multiple tables into a comprehensive result that includes everything we’ve derived:

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_FINAL AS
SELECT
    T.FILE_NAME,
    C.CALLER_NAME,
    C.CALL_DATE,
    C.CALL_DURATION,
    S.TRANSCRIPT_SUMMARY,
    M.OVERALL_SENTIMENT,
    CL.CALL_CLASSIFICATION,
    E.PRODUCT_ENTITY_SENTIMENT,
    T.TRANSCRIPT
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT T
LEFT JOIN LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER C USING (FILE_NAME)
LEFT JOIN LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY S USING (FILE_NAME)
LEFT JOIN LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT M USING (FILE_NAME)
LEFT JOIN LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CLASSIFICATION CL USING (FILE_NAME)
LEFT JOIN LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT E USING (FILE_NAME);
```

> 🔍 This final table aggregates raw and model-generated data in a single view, enabling unified access for downstream applications.

### Step 2: Preview and Export

You can preview results with:

```sql
SELECT * FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_FINAL;
```

## Conclusion

Congratulations on completing the Snowflake Cortex AI for Call Center Transcript Analysis lab!

### What You Learned

Throughout this lab, you explored a wide range of Snowflake Cortex LLM functions including:

* `PARSE_DOCUMENT()` – Extract structured text from unstructured PDF documents
* `EXTRACT_ANSWER()` – Pull specific fields from call transcripts using natural language
* `SUMMARIZE()` – Generate concise overviews of long conversations
* `SENTIMENT()` and `ENTITY_SENTIMENT()` – Analyze tone and target-specific emotional signals
* `CLASSIFY_TEXT()` – Categorize transcripts into meaningful labels
* `COMPLETE()` – Use prompt engineering to create summaries, flags, and structured outputs

### Alternate Use Cases

These techniques are broadly applicable beyond call center transcripts. Here are a few examples:

* Legal document summarization
* Customer support email triage
* Interview transcription analysis
* Insurance claim intake and validation
* Product review classification and scoring

### Further Exploration

If you're interested in going deeper, consider exploring:

* Cortex Search Service for semantic and vector search over large document collections
* Implementing Retrieval-Augmented Generation (RAG) pipelines by combining Cortex Search with `COMPLETE()` for grounded, context-aware answers
* Creating your own chatbot in Streamlit using Snowflake Cortex and a vector store to answer customer queries with enterprise-specific knowledge

---

> 🎓 If you participated in this lab as part of a Datalab AI training session, you should receive a certified badge of attendance.

Thank you very much for joining us!

Visit us at [www.datalab.co.za](https://www.datalab.co.za) to learn more about our AI training programs and data analytics solutions.

Stay connected and get updates on new labs by following us on [LinkedIn](https://www.linkedin.com/company/datalabsolutions).

---
