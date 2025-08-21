id: snowflake-cortex-search-earnings-calls
name: Snowflake Cortex Search: Earnings Call Q&A
summary: Build a semantic search experience over earnings call transcripts using Snowflake Cortex Search with chunking, metadata, filters, and grounded Q&A.
author: Douglas Day
categories: ["AI", "Cortex", "Search", "RAG"]
environments: Web
duration: 60
status: Published
license: Apache-2.0
tags: ["snowflake", "cortex-search", "semantic-search", "earnings-calls", "rag"]
source: internal
analytics account: UA-XXXXXXXXX-X
feedback link: https://github.com/datalab-solutions/snowflake-codelabs/issues
level: intermediate
products: ["Snowflake Cortex Search"]

# Snowflake Cortex Search: Earnings Call Q&A

## Overview

Duration: 0:03:00

### Introduction

In this lab, you’ll use Snowflake Cortex Search to create a semantic search experience over a corpus of earnings call transcripts. You’ll prepare data (including chunking and metadata), build a Cortex Search index, run queries with filters, and wire a simple grounded Q&A pattern.

### What You'll Learn

* How to prepare and chunk unstructured transcripts for search
* How to include rich metadata for precise filtering
* How to create and validate a Cortex Search index in Snowsight
* How to run semantic queries and apply filters
* How to ground an LLM answer on top search results (RAG-style)

### Prerequisites

* A Snowflake account in a region where Cortex Search is supported
* Role with privileges to create databases, stages, and Cortex Search indexes
* Prior completion of the PARSE_DOCUMENT step (optional but recommended) from the Call Center lab, or any table with transcript text

> 4a1 Tip: If you completed the Call Center lab, you already have `LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT (FILE_NAME, TRANSCRIPT)` to use as your source.

### Download Code

All SQL blocks are embedded below. Optionally, reuse assets from your previous labs.

---

## Environment Configuration

Duration: 0:04:00

### Learning Outcome

Ensure a consistent Snowflake environment and identify the source transcripts table.

### Description

We’ll reuse the `LLM_CORTEX_DEMO_DB` database and `STAGE` schema for convenience.

```sql
-- Set context (adjust role as needed)
USE DATABASE LLM_CORTEX_DEMO_DB;
USE SCHEMA STAGE;
USE WAREHOUSE USER_STD_XSMALL_WH;
```

> 4dd If you don’t have transcripts yet, see the PARSE_DOCUMENT section in the Call Center lab to build `STAGE.TRANSCRIPT` from PDFs.

---

## Prepare the Corpus: Chunking and Metadata

Duration: 0:12:00

### Learning Outcome

Create compact, searchable text chunks and attach useful metadata for filtering (e.g., date, speaker, company).

### Description

Shorter chunks improve retrieval quality. We’ll split each transcript into paragraph-like segments, remove empty lines, and keep a simple word count to inspect chunk sizes. Then we’ll optionally enrich with extracted fields if available.

### Step 1: Create Chunk Table

```sql
-- Create a chunked view of each transcript by splitting on double newlines
CREATE OR REPLACE TABLE LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CHUNKS AS
SELECT
	t.FILE_NAME,
	ROW_NUMBER() OVER (PARTITION BY t.FILE_NAME ORDER BY f.index) AS CHUNK_ID,
	TRIM(f.value::string) AS TEXT,
	REGEXP_COUNT(f.value::string, '\\S+') AS WORD_COUNT
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT t,
		 LATERAL FLATTEN(input => SPLIT(t.TRANSCRIPT, '\n\n')) f
WHERE TRIM(f.value::string) <> '';

-- Quick sanity check
SELECT FILE_NAME, COUNT(*) AS CHUNKS, AVG(WORD_COUNT) AS AVG_WORDS
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CHUNKS
GROUP BY FILE_NAME
ORDER BY CHUNKS DESC;
```

### Step 2: Optional – Enrich with Extracted Metadata

If you completed the EXTRACT_ANSWER step in the Call Center lab, join metadata like caller name and call date.

```sql
-- This step is optional and depends on the presence of TRANSCRIPT_CALLER
CREATE OR REPLACE VIEW LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CHUNKS_ENRICHED AS
SELECT
	c.FILE_NAME,
	c.CHUNK_ID,
	c.TEXT,
	c.WORD_COUNT,
	tc.CALLER_NAME,
	tc.CALL_DATE,
	tc.CALL_DURATION
FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CHUNKS c
LEFT JOIN LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CALLER tc
	USING (FILE_NAME);

-- If you don't have TRANSCRIPT_CALLER, you can use TRANSCRIPT_CHUNKS directly
```

> 4a1 Tip: You can add any structured fields (ticker, quarter, language, etc.) if available. More metadata enables better filtered search.

---

## Create a Cortex Search Index (Snowsight UI)

Duration: 0:08:00

### Learning Outcome

Build a semantic search index over your chunked corpus using the Snowflake UI.

### Description

We’ll use Snowsight to create and populate a Cortex Search index over the `TRANSCRIPT_CHUNKS_ENRICHED` (or `TRANSCRIPT_CHUNKS`) table.

### Steps

1. In Snowsight, open the left navigation.
2. Go to AI & ML > Cortex Search (name may appear under “AI & ML” or “Cortex” depending on region).
3. Click “Create Search Index”.
4. Configure the index:
	 - Source: `LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CHUNKS_ENRICHED` (or `TRANSCRIPT_CHUNKS`)
	 - Text column: `TEXT`
	 - Metadata columns: `FILE_NAME`, `CHUNK_ID`, and any of `CALLER_NAME`, `CALL_DATE`, `CALL_DURATION`
	 - Warehouse: `USER_STD_XSMALL_WH`
	 - Index name: `EARNINGS_SEARCH`
5. Create the index and wait for indexing to complete.

> 6a7 If the UI differs in your region/edition, follow the Cortex Search docs for equivalent steps.

---

## Run Semantic Queries and Apply Filters

Duration: 0:10:00

### Learning Outcome

Use Cortex Search to retrieve the most relevant transcript chunks and refine results with metadata filters.

### Description

Use the Search UI (or SQL API, per docs) to test queries and apply filters.

### Try these queries in the Search UI

* What did Apple say about guidance in Q1 2025?
* Summarize customer churn drivers discussed in the last quarter.
* Did management mention AI investment or hiring plans?

### Add filters

* Filter by `CALL_DATE` range (e.g., last 365 days)
* Filter by `FILE_NAME` (specific company/meeting)

> 4a1 Tip: Inspect returned `FILE_NAME` and `CHUNK_ID` to jump back to source context quickly.

---

## Grounded Q&A (RAG-style) with COMPLETE()

Duration: 0:15:00

### Learning Outcome

Compose a grounded answer by passing top search snippets into an LLM prompt.

### Description

This pattern retrieves top-N relevant chunks and feeds them to `SNOWFLAKE.CORTEX.COMPLETE` with instructions to answer concisely and cite sources.

> 4d6 Note: The SQL API for querying a Cortex Search index can vary by release. Use the official docs to obtain top-N results into a common table expression named `HITS` with columns `(FILE_NAME, CHUNK_ID, TEXT)`.

```sql
-- PSEUDO-CODE for search; replace with the documented SQL API for your region
-- with HITS as (
--   SELECT FILE_NAME, CHUNK_ID, TEXT
--   FROM TABLE( SNOWFLAKE.CORTEX.SEARCH('EARNINGS_SEARCH', :query, OBJECT_CONSTRUCT('k', 5)) )
-- )
-- SELECT * FROM HITS;
```

Once you have a `HITS` CTE, you can ground an answer:

```sql
-- Example: build a single context block from top results and generate an answer
WITH HITS AS (
	-- Replace this SELECT with your actual Cortex Search query
	SELECT FILE_NAME, CHUNK_ID, TEXT
	FROM LLM_CORTEX_DEMO_DB.STAGE.TRANSCRIPT_CHUNKS
	WHERE FILE_NAME = 'example.pdf'
	QUALIFY ROW_NUMBER() OVER (ORDER BY CHUNK_ID) <= 3
),
CONTEXT AS (
	SELECT STRING_AGG(
					 'Source: ' || FILE_NAME || ' #' || CHUNK_ID || '\n' || TEXT,
					 '\n\n---\n\n'
				 ) AS CONTEXT_TEXT
	FROM HITS
)
SELECT SNOWFLAKE.CORTEX.COMPLETE(
	'snowflake-arctic',
	'You are an expert earnings call analyst. Using only the CONTEXT below, answer the QUESTION concisely. '
	|| 'If the answer is not in the context, say you do not know. Cite sources by file name and chunk id.'
	|| '\n\nQUESTION: ' || :question
	|| '\n\nCONTEXT:\n' || (SELECT CONTEXT_TEXT FROM CONTEXT)
) AS ANSWER;
```

> 4a1 Tip: Keep CONTEXT under model token limits. Use `LIMIT`/`TOP N` and chunk sizes of 100–300 words for good results.

---

## Evaluate and Tune

Duration: 0:06:00

### Learning Outcome

Measure retrieval quality and iterate on chunking, metadata, and filters.

### Description

Try these adjustments:

* Chunking: test sentence-based vs paragraph-based splits
* Metadata: add quarter, ticker, or language; filter more precisely
* k: vary top-N results (e.g., 3 vs 8) and compare answer quality
* Formatting: instruct the model to output citations consistently

---

## Conclusion and Next Steps

Duration: 0:02:00

### What You’ve Accomplished

* Prepared and chunked transcripts with metadata
* Built a Cortex Search index and ran semantic queries
* Implemented a grounded Q&A flow with COMPLETE()

### Next Steps

1. Automate chunking/index refresh via tasks or dynamic tables
2. Add UI (e.g., Streamlit) to expose search + Q&A to users
3. Extend corpus to more documents and add richer metadata

### Additional Resources

* Snowflake Cortex Search documentation (region-specific)
* Snowflake Cortex LLM functions reference
* RAG best practices for retrieval and prompt construction

 