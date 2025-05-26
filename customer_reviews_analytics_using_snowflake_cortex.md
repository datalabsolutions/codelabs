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
* Extract and transform transcript text with [`PARSE_DOCUMENT`](https://docs.snowflake.com/en/sql-reference/functions/parse_document).
* Structure data using prompt engineering and the [`COMPLETE`](https://docs.snowflake.com/en/sql-reference/functions/complete) function.
* Translate text with [`TRANSLATE`](https://docs.snowflake.com/en/sql-reference/functions/translate).
* Analyze sentiment using [`SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/sentiment) and [`ENTITY_SENTIMENT`](https://docs.snowflake.com/en/sql-reference/functions/entity_sentiment).
* Summarize content with [`SUMMARIZE`](https://docs.snowflake.com/en/sql-reference/functions/summarize).
* Extract answers using [`EXTRACT_ANSWER`](https://docs.snowflake.com/en/sql-reference/functions/extract_answer).

---

### Prerequisites

Duration: 0:01:00

To complete this lab, you will need:

* A [Snowflake account](https://trial.snowflake.com/?owner=SPN-PID-452710) in a cloud region where **Snowflake Cortex LLM functions** are supported.
* Basic familiarity with SQL and the Snowflake UI.

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
