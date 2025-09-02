# Lab: Stage Audio Transcript Analysis Pipeline

## Learning Outcome
- Build a step-by-step transformation pipeline in Matillion.
- Extract agent name and derive an agent code from transcripts.
- Summarize transcripts and classify call attributes with AI prompts.
- Add sentiment score and load results incrementally into a target table.

## Description
Create a complex stage pipeline that reads audio transcript records, enriches them using AI-driven components, standardizes output fields, and writes only new analysis rows to STAGE.AUDIO_TRANSCRIPT_ANALYSIS.

## Steps

### Step 1 — Create a blank transformation pipeline
```plaintext
Name: STAGE_AUDIO_TRANSCRIPT_ANALYSIS
Folder: 02 - STAGE
Source: STAGE.AUDIO_TRANSCRIPT (existing table)
```

### Step 2 — Read source transcripts
Component: Table Input  
Source: STAGE.AUDIO_TRANSCRIPT  
Columns:
- CALL_TRANSCRIPT_ID
- TRANSCRIPTION_DATE
- AUDIO_FILE_URL
- TRANSCRIPT
- DURATION
- CHARACTER_COUNT
- WORD_COUNT

### Step 3 — Extract agent name (AI)
Task: Extract the call centre agent name from the transcript.  
Component: Extract Answer  
Question: What is the call centre agent's name?  
Output Column: AGENT_NAME_AI

### Step 4 — Parse agent name from JSON
Task: Extract the answer from the AGENT_NAME_AI JSON.  
Component: Calculator  
Output Column: AGENT_NAME  
Guidelines:
- Parse the “answer” field from AGENT_NAME_AI JSON to text.
- Trim whitespace; handle nulls defensively.

### Step 5 — Derive agent code (initials)
Task: What are the initials of the call centre agent (combined)?  
Component: Calculator  
Output Column: AGENT_CODE  
Guidelines:
- Derive uppercase initials from AGENT_NAME (e.g., “Sam Lee” → “SL”).

### Step 6 — Summarize the transcript
Task: Summarise the transcript content.  
Component: Summarise  
Output Column: CALL_SUMMARY

### Step 7 — Classify call attributes (AI)
Task: Extract the following information from the call centre transcript using AI prompts. Create one Extract Answer component per attribute and return only the specified codes.

1) Column: CALL_TYPE_CODE  
Prompt:
```plaintext
Categorise the call into one of the following:

BILLING: Billing enquiry. Questions about charges, payments, or invoices.
TECHNICAL_SUPPORT: Technical support. Help resolving technical issues or access problems.
COMPLAINT: Complaint. Customer expresses dissatisfaction or reports a problem.
INFORMATION: Information request. Caller asks for information or clarification.
SALES: Sales/upgrade. Interest in buying or upgrading a product or service.
CANCELLATION: Cancellation. Caller wants to cancel a subscription or service.
OTHER: Other. Does not fit known categories; requires manual review or enrichment.

Return only the codes: BILLING, TECHNICAL_SUPPORT, COMPLAINT, INFORMATION, SALES, CANCELLATION, OTHER.
```

2) Column: CALL_STATUS_CODE  
Prompt:
```plaintext
Has the call been resolved?

YES: Issue resolved. Problem fully addressed during the interaction.
PARTIAL: Partially resolved. Follow-ups or actions still required.
NO: Not resolved. Issue unresolved; escalation likely.

Return only the codes: YES, PARTIAL, NO.
```

3) Column: CALL_PRIORITY_CODE  
Prompt:
```plaintext
What is the priority of this call?

LOW: Items that can be solved within 3 days.
MEDIUM: Target resolution within 24-72 hours.
HIGH: Requires action within 24 hours.
CRITICAL: Immediate action required; severe impact likely.

Return only the codes: LOW, MEDIUM, HIGH, CRITICAL.
```

4) Column: CALL_SENTIMENT_CODE  
Prompt:
```plaintext
What is the overall sentiment of this call?

NEGATIVE: Dissatisfied.
NEUTRAL: No strong feelings.
POSITIVE: Very satisfied.

Return only the codes: NEGATIVE, NEUTRAL, POSITIVE.
```

### Step 8 — Add sentiment score
Task: Add a sentiment score.  
Component: Sentiment  
Output Column: CALL_SENTIMENT_SCORE

### Step 9 — Standardize output column names
Component: Calculator (Rename/Derive)  
Guidelines:
- Map source to target-friendly names:
  - TRANSCRIPT → CALL_TRANSCRIPT
  - TRANSCRIPTION_DATE → CALL_DATE
  - DURATION → CALL_DURATION
  - CHARACTER_COUNT → CALL_CHARACTER_COUNT
  - WORD_COUNT → CALL_WORD_COUNT

### Step 10 — Insert only new records into target
Task: Insert into STAGE.AUDIO_TRANSCRIPT_ANALYSIS; only insert new records.  
Guidelines:
- Add Existing Records check: Table Input on STAGE.AUDIO_TRANSCRIPT_ANALYSIS (CALL_TRANSCRIPT_ID only).
- Left join (anti-join) on CALL_TRANSCRIPT_ID; filter where target ID is NULL.
- Component: Table Output (Append)  
Target: STAGE.AUDIO_TRANSCRIPT_ANALYSIS  
Columns:
- CALL_TRANSCRIPT_ID
- CALL_SUMMARY
- CALL_TRANSCRIPT
- CALL_DATE
- AGENT_CODE
- AGENT_NAME
- CALL_TYPE_CODE
- CALL_PRIORITY_CODE
- CALL_STATUS_CODE
- CALL_DURATION
- CALL_CHARACTER_COUNT
- CALL_WORD_COUNT

## Key Requirements
- Use AI components to extract/classify; enforce “return only codes” in prompts.
- Handle nulls and trimming in Calculator steps.
- Ensure anti-join logic prevents duplicates.