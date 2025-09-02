
Lets deploy the schema for the data warehouse.  This will include destination tables for EXTRACT, STAGE and DWH schema.

We will use a job BUILD_SCHEMA_DW to deploy all these objects.

Navigate to 00 - DDL \ BUILD_SCHEMA_DW 


## Extract ETL

### Create Extract Job: EXTRACT_AUDIO_TRANSCRIPT
```plaintext
Task: Create a pipeline to do incremental extract of audio files (.MP3) stored in a snowflake stage.

Job Name: EXTRACT_AUDIO_TRANSCRIPT
Folder: 01 - EXTRACT

Source: @EXTRACT.INT_STAGE_DOC
Target: EXTRACT.AUDIO_FILES (existing table)
Unique Identifier: CALL_TRANSCRIPT_ID
Load Type: Incremental - exclude existing records

Guidelines: 
Filter: RELATIVE_PATH LIKE .mp3

Output Fields:
CALL_TRANSCRIPT_ID
FILE_PATH
AUDIO_FILE
AUDIO_FILE_URL
LAST_MODIFIED 
FILE_SIZE
LAST_MODIFIED
FILE_EXTENSION

```

### Create Extract Job: EXTRACT_LOOKUP
```plaintext
Task: Create a pipeline to do incremental extract of json file stored in a snowflake stage.

Job Name: EXTRACT_LOOKUP
Folder: 01 - EXTRACT

Source: @EXTRACT.INT_STAGE_DOC
Target: EXTRACT.LOOKUP (existing table)
File: LOOKUP.json
File Format: EXTRACT.JSON_FORMAT
Unique Identifier: LOOKUP_FILTER, LOOKUP_ID  
Load Type: Incremental - exclude existing records
```

## Stage ETL

### Create Transformation Job: STAGE_AUDIO_TRANSCRIPT

```plaintext
Task: Create a job to do incremental load of audio transcription:

Job Name: STAGE_AUDIO_TRANSCRIPT
Job Type: Transformation
Folder: 02 - STAGE

Source: EXTRACT.AUDIO_FILES  
Target: STAGE.AUDIO_TRANSCRIPT (existing table)  
Unique Identifier: TRANSCRIPT_ID (unique identifier)  
Load Type: Incremental - exclude existing records

Guidelines: Use AI_TRANSCRIBE function to convert audio files to JSON extract the audio_duration and text attributes.

Required Output Fields:
TRANSCRIPT_ID 
FILE_PATH
AUDIO_FILE_URL
FILE_SIZE
LAST_MODIFIED
TRANSCRIPT_JSON
DURATION
TRANSCRIPT
TRANSCRIPTION_DATE
CHARACTER_COUNT
WORD_COUNT
```

### Create Transformation Job: STAGE_AUDIO_TRANSCRIPT_ANALYSIS

```plaintext
Task: To create a complex data transformation pipeline step by step.
First create a blank transformation pipeline.

Job Name: STAGE_AUDIO_TRANSCRIPT_ANALYSIS
Folder: 02 - STAGE
```

```plaintext
Task: Create a connection to source table

Component: Table Input
Component Name: Input Audio Transcript

Source: STAGE.AUDIO_TRANSCRIPT
Columns:
CALL_TRANSCRIPT_ID
TRANSCRIPTION_DATE
AUDIO_FILE_URL
TRANSCRIPT
DURATION
CHARACTER_COUNT
WORD_COUNT
```


```plaintext
Task: Extract the call centre agent name from the transcript.
Component: Cortex Extract Answer
Component Name: Extract Answer
Column: AGENT_NAME_AI
Question: What is the name of the caller centre agent?
```

```plaintext
Task: Summarise the call centre transcript
Component: Cortex Summarise
Component Name: Summarise
```

```plaintext
Task: Add a sentiment classification
Component: Cortex Sentiment
Component Name: Sentiment
```

```plaintext
Task: Extract the following information from the call centre transcript.
Component: Cortex Multi-Prompt
Component Name: Complete

--------------------------------------------------
Column: CALL_TYPE_CODE
Prompt: Categorise the call into one of the following?

BILLING:Billing enquiry. Questions about charges, payments, or invoices.
TECHNICAL_SUPPORT: Technical support. Help resolving technical issues or access problems.
COMPLAINT: Complaint. Customer expresses dissatisfaction or reports a problem.
INFORMATION: Information request. Caller asks for information or clarification.
SALES: Sales/upgrade. Interest in buying or upgrading a product or service.
CANCELLATION: Cancellation. Caller wants to cancel a subscription or service.
OTHER: Other. Does not fit known categories; requires manual review or enrichment.

You must return ONE of the codes: BILLING, TECHNICAL_SUPPORT, COMPLAINT, INFORMATION, SALES, CANCELLATION, OTHER

--------------------------------------------------
Column: CALL_STATUS_CODE
Prompt: Has the call be resolved?

YES: Issue resolved. Problem fully addressed during the interaction.
PARTIAL: Partially resolved. Follow-ups or actions still required.
NO: Not resolved. Issue unresolved; escalation likely.

You must return ONE of the codes: YES, PARTIAL, NO

--------------------------------------------------
Column: CALL_PRIORITY_CODE
Prompt: What is the priority of this call?

LOW: Items that can be solved within 3 days.
MEDIUM: Target resolution within 24-72 hours.
HIGH: Requires action within 24 hours.
CRITICAL: Immediate action required; severe impact likely.

--------------------------------------------------
You must return ONE of the codes: LOW, MEDIUM, HIGH, CRITICAL

Column: CALL_SENTIMENT_SCORE
Prompt: Calculate a Call Sentiment Score between -1 and 1?

```

```plaintext

Component: Calculator
Component Name: Data Extraction

Task: Extract the answer from the AGENT_NAME_AI json and upper case.
Column: AGENT_NAME

Task: Extract the sentiment from the sentiment_TRANSCRIPT json and upper case.
Column: CALL_SENTIMENT_CODE

Task: What are the initials of the caller centre agent. combined using REGEX and upper case?
Column: AGENT_CODE

```

```plaintext
Task: Review the pipeline ensure you have all the columns.  
Component: Rename
Component Name: Rename
Columns: 
CALL_TRANSCRIPT_ID
CALL_SUMMARY
CALL_TRANSCRIPT
CALL_DATE
AGENT_CODE
AGENT_NAME
CALL_TYPE_CODE 
CALL_SENTIMENT_CODE
CALL_PRIORITY_CODE 
CALL_STATUS_CODE
CALL_DURATION 
CALL_CHARACTER_COUNT
CALL_WORD_COUNT
CALL_SENTIMENT_SCORE

Task: Insert into STAGE.AUDIO_TRANSCRIPT_ANALYSIS. 
Component: Table Ouput
Component Name: Insert Audio Transcript Analysis
```

```plaintext
Task: Add Filter to exclude existing records that have already been loaded
Component: SQL
Component Name: Filter Existing Records
Guidelines: Add this between Input Audio Transcript and Extract Answer
```

## DWH ETL
### Create Load Job: DIM_AGENT

```plaintext
Task: Load unique agent records into DIM_AGENT
Job Name: LOAD_DIM_AGENT
Job Type: Transformation
Folder: 03 - LOAD

Source: STAGE.AUDIO_TRANSCRIPT_ANALYSIS
Target: DWH.DIM_AGENT (existing table)
Unique Identifier: AGENT_CODE
Load Type: Incremental Load
Component: Table Input, SQL, Calculator, Table Ouput

Guidelines:
Use distinct AGENCT_CODE and AGENT_NAME
Ensure all columns are upper case
Filter Existing Records
```
### Create Load Job: DIM_CALL_PRIORITY

```plaintext
Task: Create Dimension Load for DIM_CALL_PRIORITY

Job Name: LOAD_DIM_CALL_PRIORITY
Job Type: Transformation
Folder: 03 - LOAD

Source: EXTRACT.LOOKUP  
Filter: LOOKUP_FILTER = "CALL_PRIORITY"
Target: DWH.DIM_CALL_PRIORITY (existing table)  
Unique Identifier: CALL_PRIORITY_CODE
Load Type: Incremental Load

Guidelines:
Component: Calculator
Ensure all columns are upper case

Component: SQL
Filter for records that do not exist in destination

Component: Table Ouput
Insert records into destination

```  
### Create Load Job: DIM_CALL_SENTIMENT

```plaintext
Task: Create Dimension Load for DIM_CALL_SENTIMENT 

Job Name: LOAD_DIM_CALL_SENTIMENT
Folder: 03 - LOAD

Source: EXTRACT.LOOKUP  
Filter: LOOKUP_FILTER = "CALL_SENTIMENT"
Target: DWH.DIM_CALL_SENTIMENT (existing table)  
Unique Identifier: CALL_SENTIMENT_CODE
Load Type: Incremental Load

Guidelines:
Component: Calculator
Ensure all columns are upper case

Component: SQL
Filter for records that do not exist in destination

Component: Table Ouput
Insert records into destination
```

### Create Load Job: DIM_CALL_STATUS

```plaintext
Task: Create Dimension Load for DIM_CALL_STATUS

Job Name: LOAD_DIM_CALL_STATUS
Folder: 03 - LOAD

Source: EXTRACT.LOOKUP  
Filter: LOOKUP_FILTER = "CALL_STATUS"
Target: DWH.DIM_CALL_STATUS (existing table)  
Unique Identifier: CALL_STATUS_CODE
Load Type: Incremental Load

Guidelines:
Component: Calculator
Ensure all columns are upper case

Component: SQL
Filter for records that do not exist in destination

Component: Table Ouput
Insert records into destination

```  


### Create Load Job: DIM_CALL_TYPE

```plaintext
Task: Create Dimension Load for DIM_CALL_TYPE

Job Name: LOAD_DIM_CALL_TYPE
Folder: 03 - LOAD

Source: EXTRACT.LOOKUP  
Filter: LOOKUP_FILTER = "CALL_TYPE"
Target: DWH.DIM_CALL_TYPE (existing table)  
Unique Identifier: CALL_TYPE_CODE
Load Type: Incremental Load

Guidelines:
Component: Calculator
Ensure all columns are upper case

Component: SQL
Filter for records that do not exist in destination

Component: Table Ouput
Insert records into destination

```





### Create Load Job: DIM_CALL_STATUS

```plaintext
Task: Create Dimension Load for DIM_CALL_STATUS

Job Name: LOAD_DIM_CALL_STATUS
Folder: 03 - LOAD

Source: EXTRACT.LOOKUP  
Filter: LOOKUP_FILTER = "CALL_STATUS"
Target: DWH.DIM_CALL_STATUS (existing table)  
Unique Identifier: CALL_STATUS_CODE
Load Type: Incremental Load
Component: Table Input, SQL, Calculator, Table Ouput

Guidelines:
Ensure all columns are upper case
Filter Existing Records
```


### Create Load Job: FCT_CALL_TRANSCRIPT
```plaintext
Task: Create Load Process for FCT_CALL_TRANSCRIPT
Job Name: LOAD_FCT_CALL_TRANSCRIPT
Job Type: Transformation
Folder: 03 - LOAD

Source: STAGE.AUDIO_TRANSCRIPT_ANALYSIS
Target: DWH.FCT_CALL_TRANSCRIPT (existing table)

Unique Identifier: CALL_TRANSCRIPT_ID (unique identifier)
Load Type: Incremental Load
Validation Errors: If there are validation errors let me check manually

Dimension Lookup: 
DWH.DIM_AGENT
DWH.DIM_CALL_PRIORITY
DWH.DIM_CALL_SENTIMENT
DWH.DIM_CALL_STATUS
DWH.DIM_CALL_TYPE

Guidelines: 
Create lookups for the dimensions that include the natural keys and surrogate keys.
Join these to the results from the audio transcript table.
```

### Create Load Job: PARENT_LOAD_DWH
```plaintext
Task: Create a Parent Orchestration Job. 
Job Name: PARENT_LOAD_DWH
Job Type: Orchastration
Folder: 03 - LOAD 

Guidelines:
Use DWH Schema
First truncate all the dimensions (tables prefixed with DIM_) 
Then truncate all the fact tables (tables prefixed with FCT_) 

Then run all the load dimension jobs (Jobs starting with LOAD_DIM_)Then run all the load fact jobs (Jobs starting with LOAD_FCT_)

The load jobs are in the folder: 03 - Load
```