id: snowflake-cortex-analyst-trading-data
name: Snowflake Cortex Analyst: Querying NASDAQ Trading Data
summary: A hands-on lab to learn Snowflake Cortex Analyst for natural language querying of financial time series data.
author: DOuglas Day
categories: ["AI", "Cortex", "Finance", "Data Analysis"]
environments: Web
duration: 90
status: Published
license: Apache-2.0
tags: ["snowflake", "cortex-analyst", "natural-language-processing", "finance-data"]
source: internal
analytics account: G-02FDYMQBCN
feedback link: https://github.com/datalab-solutions/snowflake-codelabs/issues
level: intermediate
products: ["Snowflake Cortex Analyst"]



Duration: 0:05:00

### Introduction

This AI Lab introduces **Snowflake Cortex Analyst**, a powerful natural language interface that allows users to ask questions about structured data without writing SQL. You'll learn how to prepare your environment, transform trading time series data, and query it using Cortex Analyst.

### What You'll Learn

* How to set up your Snowflake environment for Cortex Analyst
* How to access the Finance & Economics data from the Marketplace
* How to reshape data using dynamic tables for efficient querying
* How to build a semantic model and interact with it using natural language prompts
* How to enhance your semantic model with custom metrics and verified queries
* How to set up an MCP server for AI agent integration

### Prerequisites

* A [Snowflake account](https://trial.snowflake.com/?owner=SPN-PID-452710) with access to **Snowflake Cortex Analyst**
* `ACCOUNTADMIN` role or a custom role with necessary privileges
* Familiarity with SQL and your organization’s data

> 💡 **Tip:** Explore this interactive walkthrough to learn how to sign up for a [Snowflake account](https://app.supademo.com/demo/cmbw9nmxe0606xw0izxyku479).

> 💡 **Tip:** Confirm Cortex Analyst availability in your region via the [Feature Availability](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst#region-availability) page.

### Lab Duration

Approximately 60–90 minutes

### Download Code

Download the scripts and prompts [here](https://github.com/datalabsolutions/AI-Labs/tree/main/snowflake-cortex-analyst-nasdaq-trading-data)

## Environment Configuration

Duration: 0:10:00

### Learning Outcome

Create the core Snowflake resources needed to run the AI Lab. This includes a database, warehouse, schemas, and a stage for uploading semantic model files.

### Download Script

Download the environment setup script [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-analyst-nasdaq-trading-data/scripts/01-AI-LAB-CONFIGURATION.sql).

### Description

This setup script prepares your Snowflake environment to work with financial time series data using Cortex Analyst.

* `CREATE DATABASE` ensures your lab operates in a clean and isolated environment.
* `CREATE WAREHOUSE` provisions compute resources for running your queries. It’s configured to minimize cost with automatic suspend/resume settings.
* `CREATE SCHEMA` creates a logical namespace for Cortex-specific tables and models.
* `CREATE STAGE` sets up a secure location to upload semantic YAML model definitions.

### Step 1: Create the Database

This command creates a new database named `CORTEX_ANALYST_DB` if it doesn't already exist. Using `IF NOT EXISTS` ensures the script is idempotent and can be rerun safely.

```sql
CREATE DATABASE IF NOT EXISTS CORTEX_ANALYST_DB;
```

### Step 2: Create a Compute Warehouse

This step provisions a virtual compute warehouse named `USER_STD_XSMALL_WH`. It is configured with the following parameters:

* **Size**: `XSMALL` – small and cost-effective for light workloads.
* **Type**: `STANDARD` – supports most use cases.
* **Auto Suspend**: `60 seconds` – pauses automatically after inactivity.
* **Auto Resume**: `TRUE` – resumes automatically when a query is submitted.
* **Initially Suspended**: `TRUE` – starts in a paused state until needed.

```sql
CREATE OR REPLACE WAREHOUSE USER_STD_XSMALL_WH
  WAREHOUSE_SIZE = XSMALL
  WAREHOUSE_TYPE = STANDARD
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE;
```

### Step 3: Create Logical Schema

Schemas are used to logically separate and organize objects within a database. This script creates the `DATA` schema for your semantic model and transformed data.

```sql
CREATE SCHEMA IF NOT EXISTS CORTEX_ANALYST_DB.DATA;
```

### Step 4: Create Internal Stage

This internal stage acts as a Snowflake-managed file storage area for uploading semantic model YAML files. It is configured to:

* Support directory-style file access
* Encrypt uploaded files using Snowflake’s **Server-Side Encryption (SSE)**

```sql
CREATE OR REPLACE STAGE CORTEX_ANALYST_DB.DATA.SEMANTIC_MODEL
  DIRECTORY = ( ENABLE = TRUE )
  ENCRYPTION = ( TYPE = 'SNOWFLAKE_SSE' );
```

### Step 5: Subscribe to Finance & Economics Dataset

To access financial data:

1. Navigate to **Data Products > Marketplace** in Snowsight
2. Search and select **Finance & Economics**
3. Click **Get**, name the database `FINANCE_ECONOMICS`, and assign to role `PUBLIC`

> 📘 This dataset includes macroeconomic indicators such as interest rates, employment, and GDP. It fuels your Cortex Analyst lab experience.

## Preparing the Data

Duration: 0:12:00

### Learning Outcome

Transform raw long-format stock price data into an analyst-friendly wide format using a dynamic table. This prepares the dataset for natural language querying via Cortex Analyst.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-analyst-nasdaq-trading-data/scripts/02-AI-LAB-PREPARING-DATA.sql).

### Description

The source table contains long-format time series data for NASDAQ tickers, where each row represents a single variable for a specific date and ticker. In this section, you’ll pivot this data into wide format using a dynamic table.

* `SELECT *` lets you inspect the raw schema.
* `MAX(CASE WHEN ...)` is used to deterministically pivot variable rows into columns.
* `DYNAMIC TABLE` ensures the transformed dataset refreshes automatically.

### Step 1: Explore the Source Table

The table `FINANCE_ECONOMICS.CYBERSYN.STOCK_PRICE_TIMESERIES` stores variable-based measurements for each ticker per day.

Run the query below to view the structure:

```sql
SELECT *
FROM FINANCE_ECONOMICS.CYBERSYN.STOCK_PRICE_TIMESERIES;
```

Key columns include:

* `DATE`
* `TICKER`
* `VARIABLE` (e.g., nasdaq\_volume, all-day\_high)
* `VALUE` (numeric measure)

Each variable is stored as a separate row, typical of long-format data.

### Step 2: Transform to Wide Format with a Dynamic Table

We will use a dynamic table to convert this into a wide format for easier querying.

```sql
CREATE OR REPLACE DYNAMIC TABLE CORTEX_ANALYST_DB.DATA.STOCK_PRICE
(
    DATE,
    TICKER,
    ASSET_CLASS,
    PRIMARY_EXCHANGE_CODE,
    PRIMARY_EXCHANGE_NAME,
    VOLUME,
    OPEN_PRICE,
    LOW_PRICE,
    HIGH_PRICE,
    CLOSE_PRICE
)
TARGET_LAG = '1 day'
REFRESH_MODE = AUTO
INITIALIZE = ON_CREATE
WAREHOUSE = USER_STD_XSMALL_WH
AS      
    SELECT
        DATE,
        TICKER,
        ASSET_CLASS,
        PRIMARY_EXCHANGE_CODE,
        PRIMARY_EXCHANGE_NAME,
        MAX(CASE WHEN VARIABLE = 'nasdaq_volume' THEN VALUE ELSE NULL END) AS VOLUME,
        MAX(CASE WHEN VARIABLE = 'pre-market_open' THEN VALUE ELSE NULL END) AS OPEN_PRICE,
        MAX(CASE WHEN VARIABLE = 'all-day_low' THEN VALUE ELSE NULL END) AS LOW_PRICE,
        MAX(CASE WHEN VARIABLE = 'all-day_high' THEN VALUE ELSE NULL END) AS HIGH_PRICE,
        MAX(CASE WHEN VARIABLE = 'post-market_close' THEN VALUE ELSE NULL END) AS CLOSE_PRICE
    FROM
        FINANCE_ECONOMICS.CYBERSYN.STOCK_PRICE_TIMESERIES
    WHERE
        DATE >= DATE_FROM_PARTS(YEAR(CURRENT_DATE()) - 2, 1, 1)
    GROUP BY
        DATE,
        TICKER,
        ASSET_CLASS,
        PRIMARY_EXCHANGE_CODE,
        PRIMARY_EXCHANGE_NAME;
```

### Explanation

* **Dynamic Table**: Refreshes daily based on the `TARGET_LAG = '1 day'` setting.
* **Pivoting Logic**: Uses `MAX(CASE WHEN ...)` to convert row-based variables into columns.
* **Date Filter**: Restricts data to the last two years.
* **Grouping**: Ensures uniqueness for each ticker-date combo.

### Why Use `CASE` Instead of `PIVOT`

Snowflake's `PIVOT` and `UNPIVOT` aren't fully deterministic within dynamic tables. Instead, use `MAX(CASE WHEN ...)` expressions, which are reliable for refreshable objects.

> 📘 Your transformed table `CORTEX_ANALYST_DB.DATA.STOCK_PRICE` is now ready for semantic modeling in Cortex Analyst.

## Creating a Semantic Model in Snowflake

Duration: 0:15:00

### Learning Outcome

Create a semantic model using the Snowflake UI to define your data's structure, measures, and dimensions for natural language querying in Cortex Analyst.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-callcenter-lab/scripts/01-AI-LAB-CONFIGURATION.sql).

### Description

A semantic model defines:

* Tables and columns available for analysis
* Business logic like metrics and aggregations
* Dimensions such as time, ticker, or exchange
* Metadata that helps interpret natural language prompts

This section walks through creating the model using the **Cortex Analyst** interface.

### Step 1: Navigate to Cortex Analyst

1. In Snowsight, open the **left-hand navigation pane**
2. Click **AI & ML**, then select **Cortex Analyst**

### Step 2: Switch to Semantic Models View

Ensure the view is set to **Semantic Models**, not **Semantic Views**.

### Step 3: Select Database and Schema

1. From the top-center selectors:

   * Set the database to `CORTEX_ANALYST_DB`
   * Set the schema to `DATA`

### Step 4: Create a New Semantic Model

1. Click **Create New Model** in the top-right corner
2. In the wizard that appears:

   * **Select from**: `Stages`
   * **Database**: `CORTEX_ANALYST_DB`
   * **Schema**: `DATA`
   * **Stage**: `SEMANTIC_MODEL`
   * **Name**: `stock_prices`
   * **Description**: `Daily NASDAQ Stock Price data`
   * **File name**: `stock_prices.yaml`
3. Click **Next: Select tables**

### Step 5: Select Tables

Navigate to `CORTEX_ANALYST_DB > DATA > Dynamic Tables`, and check the box for `STOCK_PRICE`.
Click **Next: Select columns**.

### Step 6: Select Columns

From the `STOCK_PRICE` table, select:

* `DATE`
* `TICKER`
* `ASSET_CLASS`
* `PRIMARY_EXCHANGE_CODE`
* `PRIMARY_EXCHANGE_NAME`
* `VOLUME`
* `OPEN_PRICE`
* `LOW_PRICE`
* `HIGH_PRICE`
* `CLOSE_PRICE`

Check the option to include sample data from selected columns.
Click **Create and Save** to publish the model.

### Next Steps

To improve performance and usability:

* Edit the YAML to add column descriptions and synonyms
* Define metrics and verified queries in later sections

> 📘 Once saved, your semantic model is available for Cortex Analyst to interpret natural language prompts.

## Exploring Data Using Natural Language Prompts

Duration: 0:08:00

### Learning Outcome

Use natural language prompts in Cortex Analyst to query your semantic model and explore stock data interactively.

### Description

With your semantic model published, you can now interact with your stock price data using simple English prompts. Cortex Analyst translates these into SQL behind the scenes and returns results in table or chart form.

### Step 1: Launch Prompt Interface

1. Open your saved semantic model
2. On the right-hand side, find the **"Enter prompt"** box
3. Type your question and click **Run** to submit

> 💡 Cortex Analyst automatically converts your prompt to SQL and displays the results along with the generated query.

### Sample Prompts to Try

#### Basic Queries

```plaintext
What is the price of AAPL stock?
```

Returns the most recent open, high, low, and close prices for Apple.

```plaintext
Show the closing price of AAPL for the last 5 trading days.
```

Displays the daily closing price for Apple over the last 5 dates.

```plaintext
Which stock had the highest trading volume on the last trading day?
```

Identifies the ticker with the highest `VOLUME` on the most recent date.

---

> 📘 You can also copy and reuse the SQL generated by Analyst if needed.

You’re now ready to explore time series data interactively using natural language.

## Adding Advanced Metrics and Verified Queries

Duration: 0:20:00

### Learning Outcome

Enhance your semantic model with custom metrics and verified queries to improve accuracy and user experience during analysis.

### Description

This section covers how to define business metrics (e.g., ticker count) and verified queries (predefined questions with SQL) in Cortex Analyst.

---

### Part 1: Add a Custom Metric

#### Use Case

Define a metric that counts unique tickers in the dataset.

#### Steps

1. In **Semantic Models**, open the `stock_prices` model.
2. Scroll to **Metrics** and click **Add Metric**.
3. Fill out the metric details:

| Field       | Value                                              |
| ----------- | -------------------------------------------------- |
| Expression  | `COUNT(DISTINCT TICKER)`                           |
| Metric Name | `STOCK_COUNT`                                      |
| Description | `Stock Count`                                      |
| Synonyms    | `number of tickers`, `ticker count`, `stock total` |

4. Click **Save**.

#### Try It

```plaintext
How many stocks are included in the dataset?
```

```plaintext
Show the stock count per asset class.
```

---

### Part 2: Add Verified Queries

#### Use Case

Create verified examples that show users what kinds of questions they can ask and map them to trusted SQL.

#### Steps

1. Open your semantic model in Cortex Analyst.
2. Scroll to the **Verified Queries** section.
3. Click **Add Query**.
4. Fill in:

| Field                | Example Value                                        |
| -------------------- | ---------------------------------------------------- |
| Verified Query Name  | Average Stock Price                                  |
| Question             | What is the average closing price for Apple in 2025? |
| Use in Onboarding    | ✔ Checked                                            |
| Semantic Query (SQL) | See SQL below                                        |

```sql
SELECT AVG(CLOSE_PRICE)
FROM STOCK_PRICE
WHERE TICKER = 'AAPL' AND YEAR(DATE) = 2025;
```

5. Test and save the query.

---

### Additional Verified Query Examples

#### Top 5 Stocks by Volume (last 30 days)

| Field               | Value                                               |
| ------------------- | --------------------------------------------------- |
| Verified Query Name | Top 5 Stocks by Volume                              |
| Question            | Show the top 5 stocks by volume in the last 30 days |
| Use in Onboarding   | ❌ No                                                |

```sql
SELECT TICKER, SUM(VOLUME) AS TOTAL_VOLUME
FROM STOCK_PRICE
WHERE DATE >= CURRENT_DATE - 30
GROUP BY TICKER
ORDER BY TOTAL_VOLUME DESC
LIMIT 5;
```

#### Tesla High Price in January

| Field               | Value                                                 |
| ------------------- | ----------------------------------------------------- |
| Verified Query Name | Tesla High Price in January                           |
| Question            | What was the highest price for Tesla in January 2024? |
| Use in Onboarding   | ❌ No                                                  |

```sql
SELECT MAX(HIGH_PRICE)
FROM STOCK_PRICE
WHERE TICKER = 'TSLA'
AND DATE BETWEEN '2024-01-01' AND '2024-01-31';
```

#### Best Performing Stock by Daily Return

| Field               | Value                                                                |
| ------------------- | -------------------------------------------------------------------- |
| Verified Query Name | Best Performing Stock by Return                                      |
| Question            | Which stock had the highest average daily return over the past year? |
| Use in Onboarding   | ❌ No                                                                 |

```sql
SELECT TICKER,
       AVG((CLOSE_PRICE - OPEN_PRICE)/NULLIF(OPEN_PRICE, 0)) AS AVG_RETURN
FROM STOCK_PRICE
WHERE DATE >= CURRENT_DATE - 365
GROUP BY TICKER
ORDER BY AVG_RETURN DESC
LIMIT 1;
```

#### Top 10 Most Volatile Stocks

| Field               | Value                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Verified Query Name | Top 10 Most Volatile Stocks by Max Daily Range                                           |
| Question            | Which 10 stocks had the highest daily trading volatility percentage in the last 90 days? |
| Use in Onboarding   | ✔ Yes                                                                                    |

```sql
SELECT TICKER,
       MAX((HIGH_PRICE - LOW_PRICE) / NULLIF(OPEN_PRICE, 0)) AS DAILY_VOLATILITY_PERCENTAGE
FROM STOCK_PRICE
WHERE DATE >= CURRENT_DATE - 90
GROUP BY TICKER
HAVING NOT IS_NULL_VALUE(DAILY_VOLATILITY_PERCENTAGE)
ORDER BY DAILY_VOLATILITY_PERCENTAGE DESC
LIMIT 10;
```

> 📘 Add each verified query through the Cortex UI using the **Add Query** interface.

## Improving Output Presentation with Custom Formatting

Duration: 0:07:00

### Learning Outcome

Improve user experience by defining formatting rules to display numerical results as percentages, volumes, and currency values.

### Description

This step shows how to control the formatting of Cortex Analyst query results by adding custom instructions to your semantic model.

---

### Step 1: Identify Formatting Gaps

Run the following prompt in Cortex Analyst:

```plaintext
What day did each of the top 10 most volatile stocks have their highest daily volatility in the last 90 days?
```

Observe the formatting issues:

* Percentages appear as decimals (e.g. `0.234567` instead of `23.46%`)
* Volumes lack thousands separators (e.g. `5234560` instead of `5,234,560`)
* Prices may display unformatted (e.g. `4521.6` instead of `4,521.60`)

---

### Step 2: Add Custom Formatting Instructions

1. Open your semantic model in **Snowsight**
2. Click **Edit**
3. Locate the **Custom Instructions** section
4. Enter:

```
Any percentages must be displayed in the format: 10.00%
Any Volume numbers must be formatted as: 1,000
Any Price numbers must be formatted as: 1,000.00
```

5. Click **Apply**, then **Save** the semantic model

---

### Step 3: Re-run the Prompt

Use the same question to verify formatting improvements:

```plaintext
What day did each of the top 10 most volatile stocks have their highest daily volatility in the last 90 days?
```

**Now the output should show:**

* `Volatility` as percentages like `12.43%`
* `Volumes` with commas: `1,245,678`
* `Prices` with decimal precision: `2,345.00`

---

> ✅ Custom formatting improves clarity and makes dashboards more business-user friendly.


## Deploying a Streamlit Chat Bot

Duration: 0:07:00

### Learning Outcome
Create a basic chatbot interface connected to your Cortex Analyst semantic model using Streamlit in Snowflake.

### Download Script

Download the source code for this step [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-analyst-nasdaq-trading-data/streamlit/trading-chat-bot.py).

### Description
In this section, you'll deploy a Streamlit app that connects directly to your semantic model and enables users to interact with financial data using natural language prompts.

---

### Step-by-Step Instructions

#### Step 1: Navigate to Streamlit Projects

1. In the **left navigation menu**, click on **Projects** → **Streamlit**

#### Step 2: Create a New Streamlit App

1. In the Streamlit screen, click the **+ Streamlit App** button in the top-right corner
2. In the pop-up modal, enter the following details:

   | Field             | Value                 |
   |------------------|-----------------------|
   | App Title        | Trading Chat Bot      |
   | Database         | CORTEX_ANALYST_DB     |
   | Schema           | DATA                  |
   | App Warehouse    | USER_STD_XSMALL_WH    |

#### Step 3: Add the Chatbot Code

1. Open the Streamlit chatbot source file [here](https://github.com/datalabsolutions/AI-Labs/blob/main/snowflake-cortex-analyst-nasdaq-trading-data/streamlit/trading-chat-bot.py)
2. Copy and paste the full code into the editor window of the newly created Streamlit app

#### Step 4: Run Your App

1. Click the **Run** button
2. If you see any warnings or errors, click the **burger menu** (three dots in the top-right corner) and choose **Reboot**

You now have a fully functional chatbot powered by Snowflake Cortex Analyst and accessible via Streamlit.

> 💬 Use this interface to ask financial questions in plain English, backed by your semantic model!


## Conclusion and Next Steps

Duration: 0:03:00

### Learning Outcome

Summarize the key takeaways from the lab and outline next steps to apply Snowflake Cortex Analyst in real-world scenarios.

### Description

You've completed a full hands-on walkthrough of Snowflake Cortex Analyst for financial data. This section recaps your accomplishments and points you toward further enhancements.

---

### What You’ve Accomplished

* Configured your Snowflake environment for Cortex Analyst
* Accessed and transformed financial data from the Snowflake Marketplace
* Created a dynamic table to reshape stock time series data
* Built and deployed a semantic model for natural language querying
* Added custom metrics and verified queries for consistent analysis
* Improved result formatting for better business readability

---

### Next Steps

1. **Expand Your Data Sources**

   * Add more financial and economic tables
   * Integrate internal enterprise data

2. **Enhance Your Semantic Models**

   * Define more custom metrics and business logic
   * Build relationships across multiple tables
   * Include verified queries for key use cases

3. **Integrate with Applications**

   * Use Cortex Analyst in dashboards and apps
   * Combine with chatbots or agentic AI workflows
   * Automate reporting using Analyst outputs

---

### Additional Resources

* [Snowflake Cortex Analyst Docs](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)
* [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
* [Snowflake Marketplace](https://app.snowflake.com/marketplace)

> 🎉 You’re now ready to bring natural language interaction into your analytics workflow using Snowflake Cortex Analyst!
