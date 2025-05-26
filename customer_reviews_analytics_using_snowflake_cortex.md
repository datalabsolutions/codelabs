id: snowflake-cortex-callcenter-lab
name: Snowflake Cortex AI for Call Center Transcript Analysis
summary: A self-paced hands-on lab that teaches how to use Snowflake Cortex AI to ingest, extract, structure, translate, analyze, summarize, and answer questions from PDF call center transcripts.
author: datalab-solutions
categories: \["AI", "Cortex", "Call Center", "Text Analysis"]
duration: 90
status: published
license: Apache-2.0
tags: \["snowflake", "cortex-ai", "prompt-engineering", "pdf-extraction", "sentiment-analysis"]
source: internal
analytics: true
level: intermediate
products: \["Snowflake Cortex"]

# Snowflake Cortex AI for Call Center Transcript Analysis

## Overview

This self-paced lab walks you through leveraging Snowflake Cortex AI functions to ingest, process, analyze, and extract insights from unstructured call center transcript data in PDF format. By the end of this lab, you'll be equipped to transform raw transcript text into structured, multilingual, and insightful outputs—all within Snowflake.

### Learning Outcomes

By completing this lab, you will be able to:

* Upload and manage unstructured documents in Snowflake.
* Extract, transform, and analyze call transcript data using Cortex AI functions.
* Generate structured summaries and answer questions from raw transcripts.

---

## 1. Set Up Your Snowflake Environment

Duration: 0:05:00

### Learning Outcome

Set up the necessary Snowflake database, schema, and warehouse context to organize the lab work.

### Step-by-Step Guide

1. Log in to Snowsight or connect using SnowSQL.
2. Run the SQL below to create a clean environment.

```sql
USE WAREHOUSE <YOUR_WAREHOUSE_NAME>;
CREATE DATABASE IF NOT EXISTS LLM_CORTEX_DEMO_DB;
CREATE SCHEMA IF NOT EXISTS LLM_CORTEX_DEMO_DB.CALL_CENTER_ANALYTICS;
USE SCHEMA LLM_CORTEX_DEMO_DB.CALL_CENTER_ANALYTICS;
```

---

## 2. Create a Snowflake Internal Stage and Upload PDFs

Duration: 0:10:00

### Learning Outcome

Create an internal stage to store PDF transcripts and upload documents using either Snowsight or SnowSQL.

### Step-by-Step Guide

1. Create the internal stage:

```sql
CREATE STAGE IF NOT EXISTS CALL_CENTER_TRANSCRIPTS_STAGE
  DIRECTORY = (ENABLE = TRUE)
  COMMENT = 'Internal stage for call center transcript PDFs';
```

2. Upload PDF files:

#### Option A: Snowsight

* Navigate to `LLM_CORTEX_DEMO_DB > CALL_CENTER_ANALYTICS > Stages`.
* Click on `CALL_CENTER_TRANSCRIPTS_STAGE`.
* Use **+ Add Files** to upload your `.pdf` transcripts.

#### Option B: SnowSQL

```bash
PUT file:///path/to/your/files/transcript_1.pdf @CALL_CENTER_TRANSCRIPTS_STAGE AUTO_COMPRESS=FALSE;
```

3. Confirm successful upload:

```sql
LIST @CALL_CENTER_TRANSCRIPTS_STAGE;
```

---

## 3. Extract Text from PDFs

Duration: 0:10:00

### Learning Outcome

Use the `PARSE_DOCUMENT` function to extract text from PDF files and store the content.

### Step-by-Step Guide

1. Create a table to hold the raw parsed content:

```sql
CREATE OR REPLACE TABLE RAW_TRANSCRIPTS (
    FILE_NAME VARCHAR,
    RAW_TEXT VARIANT
);
```

2. Run `PARSE_DOCUMENT` on all files:

```sql
INSERT INTO RAW_TRANSCRIPTS
SELECT
    RELATIVE_PATH,
    SNOWFLAKE.CORTEX.PARSE_DOCUMENT(@CALL_CENTER_TRANSCRIPTS_STAGE, RELATIVE_PATH, OBJECT_CONSTRUCT('mode', 'OCR'))
FROM DIRECTORY(@CALL_CENTER_TRANSCRIPTS_STAGE);
```

3. View the extracted text:

```sql
SELECT FILE_NAME, RAW_TEXT:content::STRING AS EXTRACTED_TEXT FROM RAW_TRANSCRIPTS;
```

---

## 4. Best Practices for Prompt Engineering

Duration: 0:10:00

### Learning Outcome

Understand the components of effective prompts for structured information extraction using Cortex AI, and learn how to write prompts that yield reliable, structured outputs.

### What Makes a Good Prompt?

Effective prompts typically include the following elements:

* **Instruction**: Clearly define what the model should do (e.g., "Extract the customer name from the transcript").
* **Role / Persona**: Set the perspective or assumed knowledge level of the model (e.g., "You are a data analyst reviewing customer service transcripts").
* **Context**: Provide background or sample content that frames the data (e.g., a portion of a transcript).
* **Constraints or Guidelines**: Specify required output format and error handling (e.g., "If information is missing, use 'N/A'").
* **Examples (Few-Shot)**: Include examples when possible to demonstrate the desired behavior.
* **Tone & Style**: Optional for tasks needing a specific writing style or professional tone.
* **Format Specification**: Define output style, such as JSON, CSV, or plain text.
* **Subject Matter**: Anchor prompts in domain-specific language or terminology.
* **Target Audience**: Ensure the output is tailored to the user who will consume the results.
* **Data**: Supply clear, well-structured input data to avoid confusion.

### Example Prompt (Simple)

```
Extract the customer name, issue description, resolution status, and agent name from the transcript below. If a field is missing, return "N/A". Format your response as JSON.

Transcript:
Hello, this is Mark. I'm calling about a billing error on my last invoice... [continues]

JSON Output:
```

### Example Prompt (Expanded with Role/Persona)

```
You are a professional data annotator tasked with extracting structured fields from customer service transcripts. Your goal is to return:
- Customer Name
- Issue Description
- Resolution Status
- Agent Name

If any field is unavailable, return "N/A". Use the following transcript:

Transcript:
Hi, this is Jane. I'm following up on a delay in service delivery from last week... [continues]

Return the result as a valid JSON object.
```

### Example with User/Assistant/System Roles

```json
{
  "system": "You are an AI assistant skilled at information extraction from customer service transcripts.",
  "user": "Extract the fields: Customer Name, Issue Description, Resolution Status, and Agent Name. Return JSON. If not found, use 'N/A'.",
  "assistant": {
    "Customer Name": "Jane",
    "Issue Description": "Delay in service delivery",
    "Resolution Status": "Resolved",
    "Agent Name": "Tom"
  }
}
```

### Exploring Parameters: `top_p` and `top_k`

* **`top_p` (nucleus sampling)** controls diversity. Lower values (e.g. `0.1`) make the output more deterministic. Higher values (e.g. `0.9`) allow for more varied responses.
* **`top_k`** limits how many top tokens to sample from. A smaller `top_k` (e.g. 5) narrows the response range.

#### Example: Same prompt with different `top_p` values

```sql
-- More deterministic output
SELECT SNOWFLAKE.CORTEX.COMPLETE('mistral-7b', '<prompt>', OBJECT_CONSTRUCT('top_p', 0.1));

-- More creative output
SELECT SNOWFLAKE.CORTEX.COMPLETE('mistral-7b', '<prompt>', OBJECT_CONSTRUCT('top_p', 0.9));
```

Try experimenting with both `top_p` and `top_k` to fine-tune outputs based on your use case.

---

## 5. Convert to JSON Using COMPLETE

Duration: 0:15:00

### Learning Outcome

Use the `COMPLETE` function to extract structured fields such as customer name, issue description, and agent details from the raw transcript text.

### Step-by-Step Guide

1. Create a table to store structured data:

```sql
CREATE OR REPLACE TABLE STRUCTURED_TRANSCRIPTS (
    FILE_NAME VARCHAR,
    TRANSCRIPT_ID VARCHAR,
    CUSTOMER_NAME VARCHAR,
    ISSUE_DESCRIPTION VARCHAR,
    RESOLUTION_STATUS VARCHAR,
    AGENT_NAME VARCHAR,
    STRUCTURED_JSON VARIANT
);
```

2. Use `COMPLETE` to parse fields from the extracted content:

```sql
INSERT INTO STRUCTURED_TRANSCRIPTS
SELECT
    rt.FILE_NAME,
    MD5(rt.FILE_NAME || rt.RAW_TEXT:content::STRING),
    PARSE_JSON(SNOWFLAKE.CORTEX.COMPLETE(...)):"Customer Name"::STRING,
    PARSE_JSON(SNOWFLAKE.CORTEX.COMPLETE(...)):"Issue Description"::STRING,
    PARSE_JSON(SNOWFLAKE.CORTEX.COMPLETE(...)):"Resolution Status"::STRING,
    PARSE_JSON(SNOWFLAKE.CORTEX.COMPLETE(...)):"Agent Name"::STRING,
    PARSE_JSON(SNOWFLAKE.CORTEX.COMPLETE(...))
FROM RAW_TRANSCRIPTS rt;
```

3. Verify results:

```sql
SELECT * FROM STRUCTURED_TRANSCRIPTS;
```

---

## 6. Translate Using TRANSLATE

Duration: 0:05:00

### Learning Outcome

Translate extracted transcript content into another language using the `TRANSLATE` function.

### Step-by-Step Guide

1. Add a new column to store translated output:

```sql
ALTER TABLE STRUCTURED_TRANSCRIPTS ADD COLUMN TRANSLATED_TEXT VARCHAR;
```

2. Translate the raw text from English to Spanish:

```sql
UPDATE STRUCTURED_TRANSCRIPTS st
SET TRANSLATED_TEXT = SNOWFLAKE.CORTEX.TRANSLATE(
    (SELECT rt.RAW_TEXT:content::STRING FROM RAW_TRANSCRIPTS rt WHERE rt.FILE_NAME = st.FILE_NAME),
    'en', 'es'
);
```

3. View the translated text:

```sql
SELECT FILE_NAME, CUSTOMER_NAME, ISSUE_DESCRIPTION, TRANSLATED_TEXT FROM STRUCTURED_TRANSCRIPTS;
```

---

## 7. Sentiment Analysis

Duration: 0:10:00

### Learning Outcome

Analyze the emotional tone of the transcripts overall and for specific entities like 'agent' or 'product'.

### Step-by-Step Guide

1. Add columns for storing sentiment outputs:

```sql
ALTER TABLE STRUCTURED_TRANSCRIPTS
ADD COLUMN OVERALL_SENTIMENT_SCORE FLOAT,
ADD COLUMN ENTITY_SENTIMENT_JSON VARIANT;
```

2. Update overall sentiment:

```sql
UPDATE STRUCTURED_TRANSCRIPTS st
SET OVERALL_SENTIMENT_SCORE = SNOWFLAKE.CORTEX.SENTIMENT(...);
```

3. Analyze sentiment for specific entities:

```sql
UPDATE STRUCTURED_TRANSCRIPTS st
SET ENTITY_SENTIMENT_JSON = SNOWFLAKE.CORTEX.ENTITY_SENTIMENT(...);
```

4. View results:

```sql
SELECT FILE_NAME, CUSTOMER_NAME, OVERALL_SENTIMENT_SCORE,
       ENTITY_SENTIMENT_JSON:categories[0]:sentiment::STRING AS OVERALL_SENTIMENT_CATEGORY,
       ENTITY_SENTIMENT_JSON FROM STRUCTURED_TRANSCRIPTS;
```

5. Drill into entity-level sentiment:

```sql
SELECT FILE_NAME, s.value:"name"::STRING, s.value:"sentiment"::STRING, s.value:"score"::FLOAT
FROM STRUCTURED_TRANSCRIPTS, LATERAL FLATTEN(INPUT => ENTITY_SENTIMENT_JSON:categories) s
WHERE s.value:"name"::STRING != 'overall';
```

---

## 8. Summarize Using SUMMARIZE

Duration: 0:05:00

### Learning Outcome

Summarize lengthy transcripts to quickly understand key points.

### Step-by-Step Guide

1. Add a summary column:

```sql
ALTER TABLE STRUCTURED_TRANSCRIPTS ADD COLUMN SUMMARY VARCHAR;
```

2. Generate summaries:

```sql
UPDATE STRUCTURED_TRANSCRIPTS st
SET SUMMARY = SNOWFLAKE.CORTEX.SUMMARIZE(
    (SELECT rt.RAW_TEXT:content::STRING FROM RAW_TRANSCRIPTS rt WHERE rt.FILE_NAME = st.FILE_NAME)
);
```

3. Review the output:

```sql
SELECT FILE_NAME, CUSTOMER_NAME, SUMMARY FROM STRUCTURED_TRANSCRIPTS;
```

---

## 9. Extract Answers Using EXTRACT\_ANSWER

Duration: 0:05:00

### Learning Outcome

Ask specific questions about transcript content and retrieve direct answers.

### Step-by-Step Guide

1. Create a table for Q\&A storage:

```sql
CREATE OR REPLACE TABLE TRANSCRIPT_ANSWERS (
    FILE_NAME VARCHAR,
    QUESTION VARCHAR,
    ANSWER VARCHAR
);
```

2. Insert answers for key questions:

```sql
INSERT INTO TRANSCRIPT_ANSWERS
SELECT st.FILE_NAME, 'What was the main issue reported by the customer?',
       SNOWFLAKE.CORTEX.EXTRACT_ANSWER(...)
FROM STRUCTURED_TRANSCRIPTS st;

INSERT INTO TRANSCRIPT_ANSWERS
SELECT st.FILE_NAME, 'What was the resolution provided by the agent?',
       SNOWFLAKE.CORTEX.EXTRACT_ANSWER(...)
FROM STRUCTURED_TRANSCRIPTS st;
```

3. View results:

```sql
SELECT * FROM TRANSCRIPT_ANSWERS ORDER BY FILE_NAME, QUESTION;
```

---

## 10. Clean Up (Optional)

Duration: 0:03:00

### Learning Outcome

Safely remove all lab-related objects to keep your Snowflake account clean.

```sql
DROP DATABASE IF EXISTS LLM_CORTEX_DEMO_DB;
-- Or drop individually:
-- DROP TABLE IF EXISTS STRUCTURED_TRANSCRIPTS;
-- DROP TABLE IF EXISTS RAW_TRANSCRIPTS;
-- DROP TABLE IF EXISTS TRANSCRIPT_ANSWERS;
-- DROP STAGE IF EXISTS CALL_CENTER_TRANSCRIPTS_STAGE;
-- DROP SCHEMA IF EXISTS LLM_CORTEX_DEMO_DB.CALL_CENTER_ANALYTICS;
```

---

## 11. Explore the Cortex Analyst Playground

Duration: 0:07:00

### Learning Outcome

Gain hands-on experience with prompts and models in a no-code environment using Snowflake's Cortex Analyst Playground.

Before you use Cortex AI functions like `COMPLETE`, it's helpful to experiment with your prompts in an interactive environment. Snowflake provides a [Cortex Analyst Playground](https://docs.snowflake.com/en/user-guide/snowflake-cortex/llm-playground) where you can test and refine prompts before integrating them into SQL.

### Step-by-Step Guide

1. **Navigate to the Playground**: Visit the [Cortex Analyst Playground](https://docs.snowflake.com/en/user-guide/snowflake-cortex/llm-playground).

2. **Choose a Model**: Select from models like `mistral-7b`, `mixtral-8x7b`, `llama2-70b`, or `claude-3-5-sonnet`.

3. **Paste Sample Transcript Text**: Use extracted text from your PDFs (e.g., `RAW_TEXT:content`) as input.

4. **Craft Your Prompt**: Use prompts like:

   ```text
   Extract the following fields from this call transcript and return them as a JSON object: Customer Name, Issue Description, Resolution Status, Agent Name.
   If a field is not found, use "N/A".
   Transcript:
   [Paste content here]
   ```

5. **Test and Iterate**: Run your prompt and refine it until the model returns your desired structure.

6. **Copy Your Prompt**: Use the refined version in your `COMPLETE` function for better consistency.

This optional step greatly improves prompt quality and boosts the reliability of your results.

---

## 🎉 Congratulations!

Duration: 0:05:00

You’ve successfully completed the Snowflake Cortex AI lab for call center transcript analysis! You’ve learned how to:

* Ingest unstructured PDFs
* Extract, translate, and summarize text
* Analyze sentiment
* Convert transcripts to structured JSON
* Ask and answer targeted questions

Snowflake Cortex AI makes it possible to derive insights from unstructured data directly within your warehouse. Continue experimenting with models and use cases to deepen your skills!
