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

[Download Demo Files (ZIP)](https://github.com/datalabsolutions/AI-Labs/raw/main/snowflake-cortex-callcenter-lab/assets/audio-files.zip)

This hands-on lab introduces participants to Snowflake Cortex AI’s ability to extract valuable insights from unstructured documents using large language models. The lab uses examples of call center transcripts stored as PDFs. Participants will explore functions such as [`PARSE_DOCUMENT`](https://docs.snowflake.com/en/sql-reference/functions/parse_document), [`COMPLETE`](https://docs.snowflake.com/en/sql-reference/functions/complete), [`TRANSLATE`](https://docs.snowflake.com/en/sql-reference/functions/translate), [`SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/sentiment), [`ENTITY_SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/entity_sentiment), [`SUMMARIZE`](https://docs.snowflake.com/en/sql-reference/functions/summarize), and [`EXTRACT_ANSWER`](https://docs.snowflake.com/en/sql-reference/functions/extract_answer). These tools empower users to parse, translate, analyze, and query unstructured customer support data to uncover sentiment, highlight issues, and summarize conversations at scale.

Whether you're a data engineer, business analyst, or AI enthusiast, this lab will help you understand how to turn raw documents into structured, actionable data using generative AI.

## What you'll learn

* Upload and manage unstructured documents in Snowflake.
* Extract and transform transcript text with [`PARSE_DOCUMENT`](https://docs.snowflake.com/en/sql-reference/functions/parse_document-snowflake-cortex).
* Structure data using prompt engineering and the [`COMPLETE`](https://docs.snowflake.com/en/sql-reference/functions/complete-snowflake-cortex) function.
* Translate text with [`TRANSLATE`](https://docs.snowflake.com/en/sql-reference/functions/translate-snowflake-cortex).
* Analyze sentiment using [`SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/sentiment-snowflake-cortex) and [`ENTITY_SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/entity_sentiment-snowflake-cortex).
* Summarize content with [`SUMMARIZE`](https://docs.snowflake.com/en/sql-reference/functions/summarize-snowflake-cortex).
* Extract answers using [`EXTRACT_ANSWER`](https://docs.snowflake.com/en/sql-reference/functions/extract_answer-snowflake-cortex).

## Prerequisites
Duration: 0:01:00

* A [Snowflake account](https://trial.snowflake.com/?owner=SPN-PID-452710) in a cloud region where **Snowflake Cortex LLM functions** are supported.
* Basic familiarity with SQL and the Snowflake UI.
* Access all the scripts for this Lab [on Github](https://github.com/datalabsolutions/AI-Labs/tree/main/snowflake-cortex-callcenter-lab)

> 💡 **Tip:** Not all Snowflake regions currently support Cortex LLM functions. Use the [LLM Function Availability](https://docs.snowflake.com/en/user-guide/snowflake-cortex-overview#llm-function-availability) page to check which cloud regions are supported before creating your account.

## Environment Configuration

Duration: 0:05:00

### Learning Outcome

Create the core Snowflake resources needed to run the AI Lab. This includes a database, warehouse, schemas, and a stage for uploading PDFs.

### Download Script

Download he source code for this step [here](https://github.com/datalabsolutions/AI-Labs/tree/main/snowflake-cortex-callcenter-lab/scripts\01-AI-LAB-CONFIGURATION.sql). 

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

```sql
CREATE DATABASE IF NOT EXISTS LLM_CORTEX_DEMO_DB;
```

### Step 2: Create a Compute Warehouse

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

```sql
CREATE SCHEMA IF NOT EXISTS LLM_CORTEX_DEMO_DB.RAW;
CREATE SCHEMA IF NOT EXISTS LLM_CORTEX_DEMO_DB.STAGE;
```

### Step 4: Create an Internal Stage for PDF Uploads

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

## Parse Call Center Transcripts from PDF

Duration: 0:07:00

### Learning Outcome

Use the `PARSE_DOCUMENT()` function to extract the contents of uploaded PDF files from your internal stage and store them in a structured format.

### Download Script

Download he source code for this step [here](https://github.com/datalabsolutions/AI-Labs/tree/main/snowflake-cortex-callcenter-lab/scripts\02-AI-LAB-PARSE_DOCUMENT.sql). 

### Instructions

You will now query the internal stage and use Snowflake Cortex to extract and parse the call center transcripts.

### Set Snowflake Context

Ensure you're working in the correct context before running the extraction steps:

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table for Parsed Results

This table will store the extracted content for each uploaded file:

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT (
    FILE_NAME STRING,
    TRANSCRIPT VARCHAR
);
```

### Step 2: Extract PDF Content from Stage

The query below uses `PARSE_DOCUMENT()` to extract and convert each PDF to readable layout format:

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
FROM
(
    SELECT DISTINCT
        METADATA$FILENAME AS FILE_PATH,
        SPLIT_PART(METADATA$FILENAME, '/', -1) AS FILE_NAME
    FROM @LLM_CORTEX_DEMO_DB.RAW.INT_STAGE_DOC_RAW/
) AS A;
```

💡 **Note:** This approach stores both the filename and parsed content for downstream use.

### Step 3: View Parsed Results

Run the following query to view the extracted content from your PDF files:

```sql
SELECT FILE_NAME, TRANSCRIPT
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

---

## Extract Answers Using EXTRACT\_ANSWER

Duration: 0:07:00

### Learning Outcome

Use the `EXTRACT_ANSWER()` function to identify specific details in a transcript, such as the caller’s name, call date, and duration, and store them in a structured table.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/03-AI-LAB-EXTRACT_ANSWER.sql).

### Instructions

This process allows you to extract named attributes from each call center transcript using targeted natural language prompts.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table to Store Caller Metadata

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER 
(
    FILE_NAME VARCHAR,
    CALLER_NAME VARCHAR,
    CALL_DATE DATE,
    CALL_DURATION FLOAT,
    TRANSCRIPT VARCHAR
);
```

### Step 2: Extract Caller Details with EXTRACT\_ANSWER

This step uses `EXTRACT_ANSWER()` to isolate structured values from each transcript using natural language prompts. The function returns an array of response objects. We access the first element `[0]` of the array, and retrieve the actual `answer` using the `:answer::string` projection.

* `CALLER_NAME` is extracted by asking a direct question and accessing the top-ranked answer.
* `CALL_DATE` is converted to a valid date using `TRY_TO_DATE()` after cleaning whitespace.
* `CALL_DURATION` is parsed as a number using `TRY_TO_NUMBER()` to make it usable for aggregation or filtering.

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

### Step 3: View Extracted Caller Details

```sql
SELECT * FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER;
```

---

## Summarize Transcripts Using SUMMARIZE

Duration: 0:05:00

### Learning Outcome

Use the `SUMMARIZE()` function to generate a concise, natural language summary of each call center transcript.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/04-AI-LAB-SUMMARIZE.sql).

### Instructions

This allows you to extract the high-level meaning of each conversation, which is useful for reporting, escalation, or triage workflows.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table to Store Summaries

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY 
(
    FILE_NAME VARCHAR,
    TRANSCRIPT_SUMMARY VARCHAR,
    TRANSCRIPT VARCHAR
);
```

### Step 2: Generate Summaries with SUMMARIZE

This step uses the `SUMMARIZE()` function to produce a natural language summary of the full transcript. It processes the call dialogue and returns a concise description of what the call was about — including main themes, complaints, resolutions, or support actions mentioned.

The summary is especially useful for non-technical stakeholders, QA analysts, or automation workflows that depend on quick insights rather than full text review.

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.SUMMARIZE(TRANSCRIPT) AS TRANSCRIPT_SUMMARY,
    TRANSCRIPT
FROM 
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

### Step 3: View Summaries

```sql
SELECT *
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY;
```

---

## Analyze Overall Sentiment Using SENTIMENT

Duration: 0:05:00

### Learning Outcome

Use the `SENTIMENT()` function to detect the overall emotional tone of a transcript. This is especially helpful for assessing how a customer felt during a conversation.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/05-AI-LAB-SENTIMENT.sql).

### Instructions

This function returns a numeric sentiment score ranging from -1 (very negative) to +1 (very positive), with 0 indicating neutral tone.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table to Store Sentiment Scores

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT 
(
    FILE_NAME VARCHAR,
    OVERALL_SENTIMENT FLOAT,
    TRANSCRIPT VARCHAR
);
```

### Step 2: Apply SENTIMENT Function to Transcripts

Each transcript is analyzed to produce an overall sentiment score. This step runs `SENTIMENT()` against all rows in the transcript table and stores results for downstream insights.

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.SENTIMENT(TRANSCRIPT) AS OVERALL_SENTIMENT,
    TRANSCRIPT
FROM 
    LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

### Step 3: View Sentiment Scores

```sql
SELECT *
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT;
```

---

## Analyze Entity Sentiment Using ENTITY\_SENTIMENT

Duration: 0:06:00

### Learning Outcome

Use the `ENTITY_SENTIMENT()` function to extract and evaluate how specific aspects — such as "Tone of voice", "Issue Resolved", and "Follow up action" — are discussed in each call transcript.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/06-AI-LAB-ENTITY_SENTIMENT.sql).

### Instructions

This analysis focuses on targeted topics within transcripts and evaluates whether the sentiment around those entities is positive, neutral, or negative. The output is a JSON array that can be flattened to inspect each entity’s sentiment.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table for Entity-Level Sentiment

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT (
    FILE_NAME STRING,
    PRODUCT_ENTITY_SENTIMENT VARIANT,
    TRANSCRIPT VARIANT
);
```

### Step 2: Extract Sentiment for Specific Entities

This query applies the `ENTITY_SENTIMENT()` function to analyze sentiment for targeted entities within each transcript.

The `ARRAY_CONSTRUCT()` function is used to define the list of entity labels we want Cortex to evaluate. In this case, we specify:

* `Tone of voice`
* `Issue Resolved`
* `Follow up action`

These are passed into the function as an array input. Cortex will search for each of these in the transcript and return structured sentiment scores (positive, neutral, or negative) with confidence values.

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

### Step 3: View Flattened Sentiment by Entity

Use the following query to transform the JSON result into a row-per-entity view using `FLATTEN()`:

```sql
SELECT
    FILE_NAME,
    flattened.value:entity::STRING AS ENTITY,
    flattened.value:sentiment::STRING AS SENTIMENT,
    flattened.value:confidence::FLOAT AS CONFIDENCE
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT,
     LATERAL FLATTEN(INPUT => PRODUCT_ENTITY_SENTIMENT) AS flattened;
```

---

## Classify Transcripts Using CLASSIFY\_TEXT

Duration: 0:05:00

### Learning Outcome

Use the `CLASSIFY_TEXT()` function to categorize each call center transcript into predefined categories such as 'Report Incident', 'Complaint', or 'Follow up'.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/07-AI-LAB-CLASSIFY_TEXT.sql).

### Instructions

This classification helps group calls by intent or purpose. The function compares transcript content to label categories and returns the most appropriate label based on semantic similarity.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table for Transcript Classification

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CLASSIFICATION 
(
    FILE_NAME VARCHAR,
    CALL_CLASSIFICATION VARCHAR,
    TRANSCRIPT VARCHAR
);
```

### Step 2: Classify Transcripts Using CLASSIFY\_TEXT

This step uses the `CLASSIFY_TEXT()` function with a predefined list of labels. It stores the most probable label into the classification table.

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

### Step 3: View Classified Results

```sql
SELECT *
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CLASSIFICATION;
```

---

## Extract Structured Product Information Using COMPLETE

Duration: 0:07:00

### Learning Outcome

Use the `COMPLETE()` function to extract detailed product references from transcripts and store the output as a structured JSON.

### Instructions

This function enables you to generate custom, structured outputs by engineering a prompt that guides the model to return specific fields. This is useful when extracting data that doesn’t fit predefined functions.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table to Store Product Details

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_PRODUCTS AS
SELECT
    FILE_NAME,
    SNOWFLAKE.CORTEX.COMPLETE(
      'gpt-4',
      'Extract a JSON list of all products mentioned in this transcript. For each product, include the name, any feature discussed, and a short description of what the customer said about it.',
      TRANSCRIPT
    ) AS PRODUCT_DETAILS,
    TRANSCRIPT
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT;
```

### Step 2: View Extracted Product Information

```sql
SELECT *
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_PRODUCTS;
```

