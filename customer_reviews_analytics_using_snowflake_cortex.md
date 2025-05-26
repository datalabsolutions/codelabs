id: snowflake-cortex-callcenter-lab
name: Snowflake Cortex AI for Call Center Transcript Analysis
summary: A self-paced hands-on lab that teaches how to use Snowflake Cortex AI to ingest, extract, structure, translate, analyze, summarize, and answer questions from PDF call center transcripts.
author: datalab-solutions
categories: \["AI", "Cortex", "Call Center", "Text Analysis"]
environments: Web
duration: 90
status: Published
license: Apache-2.0
tags: \["snowflake", "cortex-ai", "prompt-engineering", "pdf-extraction", "sentiment-analysis"]
source: internal
analytics account: UA-XXXXXXXXX-X
feedback link: [https://github.com/datalab-solutions/snowflake-codelabs/issues](https://github.com/datalab-solutions/snowflake-codelabs/issues)
level: intermediate
products: \["Snowflake Cortex"]

# Snowflake Cortex AI for Call Center Transcript Analysis

## Overview

Duration: 0:03:00

This hands-on lab introduces participants to Snowflake Cortex AI’s ability to extract valuable insights from unstructured documents using large language models. The lab uses examples of call center transcripts stored as PDFs. Participants will explore functions such as [`PARSE_DOCUMENT`](https://docs.snowflake.com/en/sql-reference/functions/parse_document), [`COMPLETE`](https://docs.snowflake.com/en/sql-reference/functions/complete), [`TRANSLATE`](https://docs.snowflake.com/en/sql-reference/functions/translate), [`SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/sentiment), [`ENTITY_SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/entity_sentiment), [`SUMMARIZE`](https://docs.snowflake.com/en/sql-reference/functions/summarize), and [`EXTRACT_ANSWER`](https://docs.snowflake.com/en/sql-reference/functions/extract_answer). These tools empower users to parse, translate, analyze, and query unstructured customer support data to uncover sentiment, highlight issues, and summarize conversations at scale.

Whether you're a data engineer, business analyst, or AI enthusiast, this lab will help you understand how to turn raw documents into structured, actionable data using generative AI.

---

### What you'll learn

* Upload and manage unstructured documents in Snowflake.
* Extract and transform transcript text with [`PARSE_DOCUMENT`](https://docs.snowflake.com/en/sql-reference/functions/parse_document-snowflake-cortex).
* Structure data using prompt engineering and the [`COMPLETE`](https://docs.snowflake.com/en/sql-reference/functions/complete-snowflake-cortex) function.
* Translate text with [`TRANSLATE`](https://docs.snowflake.com/en/sql-reference/functions/translate-snowflake-cortex).
* Analyze sentiment using [`SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/sentiment-snowflake-cortex) and [`ENTITY_SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/entity_sentiment-snowflake-cortex).
* Summarize content with [`SUMMARIZE`](https://docs.snowflake.com/en/sql-reference/functions/summarize-snowflake-cortex).
* Extract answers using [`EXTRACT_ANSWER`](https://docs.snowflake.com/en/sql-reference/functions/extract_answer-snowflake-cortex).

---

### Prerequisites

Duration: 0:01:00

To complete this lab, you will need:

* A [Snowflake account](https://trial.snowflake.com/?owner=SPN-PID-452710) in a cloud region where **Snowflake Cortex LLM functions** are supported.
* Basic familiarity with SQL and the Snowflake UI.
* Access all the scripts for this Lab [on Github](https://github.com/datalabsolutions/AI-Labs/tree/main/snowflake-cortex-callcenter-lab)  

> 💡 **Tip:** Not all Snowflake regions currently support Cortex LLM functions. Use the [LLM Function Availability](https://docs.snowflake.com/en/user-guide/snowflake-cortex-overview#llm-function-availability) page to check which cloud regions are supported before creating your account.

---

## Setup Environment

Duration: 0:10:00

### Learning Outcome

Prepare your Snowflake environment by creating a new database, warehouse, schemas, and internal stage, and upload call center transcript PDFs to that stage.

### Step 1: Create Database Objects

```sql
-- Step 1: Create Database
CREATE DATABASE IF NOT EXISTS LLM_CORTEX_DEMO_DB;

-- Step 2: Create Warehouse
CREATE OR REPLACE WAREHOUSE USER_STD_XSMALL_WH
WITH
    WAREHOUSE_SIZE = 'XSMALL'
    WAREHOUSE_TYPE = 'STANDARD'
    AUTO_SUSPEND = 60       -- suspend after 60 seconds of inactivity
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = TRUE;

-- Step 3: Create Schemas
CREATE SCHEMA IF NOT EXISTS LLM_CORTEX_DEMO_DB.RAW;
CREATE SCHEMA IF NOT EXISTS LLM_CORTEX_DEMO_DB.STAGE;

-- Step 4: Create Internal Stage for PDFs
CREATE OR REPLACE STAGE LLM_CORTEX_DEMO_DB.RAW.INT_STAGE_DOC_RAW
    DIRECTORY = ( ENABLE = true )
    ENCRYPTION = ( TYPE = 'SNOWFLAKE_SSE' );
```

### Step 2: Upload PDF Files to the Internal Stage

Your internal stage `LLM_CORTEX_DEMO_DB.RAW.INT_STAGE_DOC_RAW` is already set up.

#### Using Snowsight:

1. In Snowsight, go to **Databases**.
2. Click on `LLM_CORTEX_DEMO_DB` > `RAW` > `Stages`.
3. Select `INT_STAGE_DOC_RAW`.
4. Click the **+ Files** tab.
5. Click **Upload** and add one or more call center transcript PDFs.

---

## Parse PDF Documents

Duration: 0:07:00

### Learning Outcome

Use the `PARSE_DOCUMENT()` function to extract the contents of uploaded PDF files from your internal stage and store them in a structured format as Markdown text.

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

This table will store the extracted Markdown content for each uploaded file:

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT (
    FILE_NAME STRING,
    TRANSCRIPT VARIANT
);
```

### Step 2: Extract PDF Content from Stage

The query below uses `PARSE_DOCUMENT()` to extract and convert each PDF to Markdown format. Ensure you run this in the same warehouse and context created earlier:

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT
SELECT
    METADATA$FILENAME AS FILE_NAME,
    TRANSCRIPT(
        '{"format": "markdown"}',
        $1
    ) AS PARSED_CONTENT
FROM @LLM_CORTEX_DEMO_DB.RAW.INT_STAGE_DOC_RAW;
```

> 💡 **Note:** This approach stores both the filename and parsed content for downstream use. The Markdown format keeps the extracted structure readable for further processing.

### Step 3: View Parsed Results

Run the following query to view the extracted content from your PDF files:

```sql
SELECT
    FILE_NAME,
    PARSED_CONTENT
FROM LLM_CORTEX_DEMO_DB.STAGE.PARSED_TRANSCRIPTS;
```
---

## Identify Caller Using `EXTRACT_ANSWER`

Duration: 0:05:00

### Learning Outcome

Use `EXTRACT_ANSWER()` to extract the name of the customer (caller) from each parsed call center transcript.

### Set Snowflake Context

Before proceeding, make sure your session is using the correct database, schema, and warehouse:

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create a Table for Caller Names

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER (
    FILE_NAME STRING,
    CALLER_NAME STRING,
    TRANSCRIPT VARIANT
);
```

### Step 2: Use `EXTRACT_ANSWER()` to Find the Caller’s Name

This query asks the model to extract the name of the customer involved in the conversation:

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER
SELECT
    FILE_NAME,
    EXTRACT_ANSWER(
        'gpt-4',
        'What is the name of the customer speaking in this transcript? Only return the name.',
        PARSED_CONTENT:text
    ) AS CALLER_NAME,
    PARSED_CONTENT:text AS TRANSCRIPT
FROM LLM_CORTEX_DEMO_DB.STAGE.PARSED_TRANSCRIPTS;
```

### Step 3: View Extracted Caller Names

```sql
SELECT *
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER;
```

---
## Identity Complaint using `SUMMARIZE`

Duration: 0:05:00

### Learning Outcome

Use the `SUMMARIZE()` function to generate a concise summary of each call center transcript, with a focus on the main complaint raised by the customer.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create Table for Summary Results

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY (
    FILE_NAME STRING,
    MAIN_COMPLAINT STRING,
    TRANSCRIPT VARIANT
);
```

### Step 2: Summarize Using `SUMMARIZE()`

This prompt asks the model to focus on the customer's complaint:

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY
SELECT
    FILE_NAME,
    SUMMARIZE(
        'gpt-4',
        'Summarize the main complaint made by the customer in this transcript.',
        PARSED_CONTENT:text
    ) AS MAIN_COMPLAINT,
    PARSED_CONTENT AS TRANSCRIPT
FROM LLM_CORTEX_DEMO_DB.STAGE.PARSED_TRANSCRIPTS;
```

### Step 3: View Summary Results

```sql
SELECT *
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SUMMARY;
```

---

## Extract Product Sentiment Using `SENTIMENT`

Duration: 0:03:00

### Learning Outcome

Use Snowflake Cortex’s `SENTIMENT()` function to evaluate the general emotional tone of each call center transcript.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create Table for Overall Sentiment

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT (
    FILE_NAME STRING,
    OVERALL_SENTIMENT STRING,
    TRANSCRIPT VARIANT
);
```

### Step 2: Run Sentiment Analysis

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT
SELECT
    FILE_NAME,
    SENTIMENT(PARSED_CONTENT:text) AS OVERALL_SENTIMENT,
    PARSED_CONTENT AS TRANSCRIPT
FROM LLM_CORTEX_DEMO_DB.STAGE.PARSED_TRANSCRIPTS;
```

### Step 3: View Sentiment Results

```sql
SELECT *
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_SENTIMENT;
```

---

## Extract Product Sentiment Using `ENTITY_SENTIMENT`

Duration: 0:03:00

### Learning Outcome

Use Snowflake Cortex’s `ENTITY_SENTIMENT()` function to identify and analyze sentiment directed at specific products mentioned in each transcript.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create Table for Product Entity Sentiment

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT (
    FILE_NAME STRING,
    PRODUCT_ENTITY_SENTIMENT VARIANT,
    TRANSCRIPT VARIANT
);
```

### Step 2: Extract Entity Sentiment

This step applies the `ENTITY_SENTIMENT()` function to analyze how the transcript discusses key business concepts — specifically `Cost`, `Quality`, and `Delivery Time`. The result is a structured array with entity names, associated sentiment (e.g., positive, neutral, negative), and confidence scores.

```sql
INSERT INTO LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT
SELECT
    FILE_NAME,
    ENTITY_SENTIMENT(
        PARSED_CONTENT:text,
        ARRAY_CONSTRUCT('Cost', 'Quality', 'Delivery Time')
    ) AS PRODUCT_ENTITY_SENTIMENT,
    PARSED_CONTENT AS TRANSCRIPT
FROM LLM_CORTEX_DEMO_DB.STAGE.PARSED_TRANSCRIPTS;
```

### Step 3: View Entity Sentiment Results

The `PRODUCT_ENTITY_SENTIMENT` column contains an array of JSON objects. In this query, we use the `FLATTEN` table function to expand that array into individual rows, so each product entity is listed with its corresponding sentiment and confidence score.

To expand the `PRODUCT_ENTITY_SENTIMENT` array into rows for each entity:

```sql
SELECT
    FILE_NAME,
    flattened.value:entity::STRING AS ENTITY,
    flattened.value:sentiment::STRING AS SENTIMENT,
    flattened.value:confidence::FLOAT AS CONFIDENCE
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT,
     LATERAL FLATTEN(INPUT => PRODUCT_ENTITY_SENTIMENT) AS flattened;
```

### Step 4: Create Flattened Table with Individual Sentiment Columns

This step prepares a structured table where each column corresponds to one of the target entities (`Cost`, `Quality`, `Delivery Time`). This makes it easier to compare sentiment across transcripts.

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_COLUMNS AS
SELECT
    FILE_NAME,
    TRANSCRIPT,
    MAX(CASE WHEN flattened.value:entity::STRING = 'Cost' THEN flattened.value:sentiment::STRING END) AS COST,
    MAX(CASE WHEN flattened.value:entity::STRING = 'Quality' THEN flattened.value:sentiment::STRING END) AS QUALITY,
    MAX(CASE WHEN flattened.value:entity::STRING = 'Delivery Time' THEN flattened.value:sentiment::STRING END) AS DELIVERY_TIME
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_SENTIMENT,
     LATERAL FLATTEN(INPUT => PRODUCT_ENTITY_SENTIMENT) AS flattened
GROUP BY FILE_NAME, TRANSCRIPT;
```

### Step 5: Query Sentiment by Entity

This query lets you retrieve the structured results per transcript with the sentiment classification for each of the three product-related dimensions.

```sql
SELECT *
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_ENTITY_COLUMNS;
```

---

## Extract Product Information Using `COMPLETE`

Duration: 0:06:00

### Learning Outcome

Use the `COMPLETE()` function to extract structured product-related information from each call center transcript. This can include product names, features discussed, complaints, or inquiries made by the customer.

### Set Snowflake Context

```sql
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

### Step 1: Create Table to Store Extracted Product Data

```sql
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_PRODUCTS AS
SELECT
    FILE_NAME,
    COMPLETE(
      'gpt-4',
      'Extract a JSON list of all products mentioned in this transcript. For each product, include the name, any feature discussed, and a short description of what the customer said about it.',
      PARSED_CONTENT:text
    ) AS PRODUCT_DETAILS,
    PARSED_CONTENT AS TRANSCRIPT
FROM LLM_CORTEX_DEMO_DB.STAGE.PARSED_TRANSCRIPTS;
```

### Step 2: View Extracted Product Details

```sql
SELECT *
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_PRODUCTS;
```

> 💡 **Tip:** The `COMPLETE()` function allows flexible prompt engineering — you can adjust the prompt to extract more specific attributes like pricing, satisfaction levels, or support needs.

---
