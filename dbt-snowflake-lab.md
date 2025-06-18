id: dbt-snowflake-lab
name: dbt with Snowflake
summary: A self-paced hands-on lab that teaches how to use dbt with Snowflake for data transformation and modeling.
author: datalab-solutions
categories: ["dbt", "Snowflake", "ELT", "data transformation", "data modeling"]
environments: Web
duration: 90
status: Published
license: Apache-2.0
tags: ["snowflake", "dbt", "data-transformation", "data-modeling"]
source: internal
analytics account: UA-XXXXXXXXX-X
feedback link: https://github.com/datalab-solutions/snowflake-codelabs/issues
level: intermediate
products: ["dbt Cloud", "Snowflake"]

# dbt with Snowflake Quickstart

## Introduction

dbt (data build tool) is an open-source transformation workflow that empowers data analysts and engineers to transform data in the warehouse using simple SQL SELECT statements. dbt turns these statements into tables and views, enabling modular, version-controlled analytics engineering.

In this guide, you’ll use **dbt Cloud**—the fully managed, cloud-based platform for dbt. dbt Cloud simplifies setup, provides a collaborative web-based IDE, automates deployments, and offers integrated documentation and lineage features. These benefits help teams move faster and ensure data quality with less overhead.

This quickstart will walk you through setting up a dbt Cloud project with Snowflake, from initialization to deployment.

By the end of this quickstart, you'll have:

* A working dbt project connected to Snowflake
* A simple data model built and deployed
* An understanding of core dbt concepts like models, materializations, and testing



<p align="center">
  <img src="codelab-portal/public/dbt-snowflake-lab/img/Snowflake_Logo.svg.png" alt="Snowflake Logo" height="28"/>
  &nbsp;&nbsp;&nbsp;
  <img src="codelab-portal/public/dbt-snowflake-lab/img/dbt-logo.png" alt="dbt Logo" height="28"/>
</p>

## Prerequisites

To follow this quickstart, you'll need:

* A Snowflake trial account
* A dbt Cloud account (free tier is sufficient)
* A connection established between dbt Cloud and Snowflake using **Partner Connect**:

  * Sign in to Snowflake
  * Navigate to **Partner Connect** from the top menu
  * Select **dbt** and follow the prompts to connect your Snowflake environment to a new dbt Cloud project

## Project Setup

Once connected to dbt Cloud via Partner Connect:

1. You will be redirected to dbt Cloud where a new account and project will be created automatically.
2. Name your project `DBT_LAB`.
3. Choose **dbt-managed repository** when prompted. This allows you to use the integrated code editor in dbt Cloud without needing GitHub or GitLab.
4. After setup, you'll land on the **Overview** page of your project. Click on the "Develop" tab to start editing your project.

### Access FINANCE_ECONOMICS Dataset via Snowflake Marketplace

To access the FINANCE_ECONOMICS share from the Snowflake Marketplace:

1. Log into Snowsight (the Snowflake Web UI).
2. Navigate to Marketplace in the left sidebar.
3. In the search bar, type "Finance and Economics Data by Cybersyn".
4. Click on the dataset and press the Get button.
5. Choose the Snowflake role and database name you’d like to use (you can use FINANCE_ECONOMICS as the database name).
6. Confirm and wait for the share to be added.
7. Once added, you can explore the shared database in Snowsight under the name you chose and connect to the tables via dbt by referencing them as a source.


### Create your folder structure

```text
models/
├── dimensions/
├── facts/
└── staging/
```

## Define Your Sources

Create or update the `sources.yml` file inside the `models` folder of your dbt project, and add the following content:

```yaml
sources:
  - name: FINANCE_ECONOMICS
    description: Financial Data Available on Snowflake Marketplace
    database: FINANCE_ECONOMICS
    schema: CYBERSYN
    tables:        
      - name: STOCK_PRICE_TIMESERIES
        description: Stock Prices
      - name: FX_RATES_TIMESERIES
        description: Forex Rates by Day
      - name: COMPANY_INDEX
        description: List of Companies
```

This tells dbt how to locate and describe the tables shared through the Snowflake Marketplace.

After saving this file, you're ready to start building models based on these sources.

## Update Your dbt Project Configuration

Next, update the contents of your `dbt_project.yml` file to match the structure below. This sets up the project name, paths, and default materializations for models in different folders:

```yaml
name: 'datalab_dbt_internal'
version: '1.0.0'
config-version: 2

profile: 'default'

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

target-path: "target"
clean-targets:
  - "target"
  - "dbt_packages"

models:
  datalab_dbt_internal:   
    dimensions:
      +materialized: view        
    facts:      
      +materialized: view      
    staging:
      +materialized: table
```

This configuration ensures models placed in specific subfolders (like `staging`) are materialized as tables, while others (like `dimensions` and `facts`) are built as views by default.

## Create Staging Models

Start by creating two SQL files inside the `models/staging/` directory:

### Date Staging Model

This model generates a list of dates from January 1st, 1999 up to the current date:

Create a new file called `stg_date_list.sql` inside the `models/staging/` directory and add the following:

```sql
with
    tbl_dates as (

        select '1999-01-01'::date as date, 1 as day_over_all
        union all
        select dateadd(dd, 1, date)::date as date, day_over_all + 1 as day_over_all
        from tbl_dates
        where dateadd(dd, 1, date)::date < current_date()

    )
select date, day_over_all
from tbl_dates
```

> This model uses a recursive CTE to generate a complete date list for later joining with time-series data.

### Stock Price Staging Model

This model selects and pivots relevant stock price data for a list of key tickers:

Create a new file called `stg_stock_price.sql` inside the `models/staging/` directory and add the following:

```sql
with
    pivoted as (
        select *
        from
            (
                select ticker, primary_exchange_code, asset_class, date, variable, value
                from {{ source("FINANCE_ECONOMICS", "STOCK_PRICE_TIMESERIES") }}
                where
                    ticker in ('SNOW', 'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'META', 'TSLA','AMZN')
            ) pivot (
                max(value) for variable in (
                    'nasdaq_volume',
                    'post-market_close',
                    'all-day_high',
                    'pre-market_open',
                    'all-day_low'
                )
            ) as p
    )

select
    ticker as ticker_id,
    'USD' as currency_id,
    date as date,
    primary_exchange_code as primary_exchange_code,
    asset_class as asset_class,
    "'nasdaq_volume'" as nasdaq_volume,
    "'post-market_close'" as post_market_close,
    "'all-day_high'" as all_day_high,
    "'pre-market_open'" as pre_market_open,
    "'all-day_low'" as all_day_low
from pivoted
order by date desc
```

> This transformation filters for eight major tech tickers and reshapes the data for analysis.

### Ticker Staging Model

Create a new file called `stg_ticker.sql` inside the `models/staging/` directory and add the following:

```sql
select distinct ticker
from {{ source("FINANCE_ECONOMICS", "STOCK_PRICE_TIMESERIES") }}
```

> This simple model extracts a unique list of stock tickers from the `STOCK_PRICE_TIMESERIES` table.

### Exchange Rates Staging Model

Create a new file called `stg_exchange_rates.sql` inside the `models/staging/` directory and add the following:

```sql
WITH TBL_DATES AS (

SELECT DATE AS CALENDAR_DATE
FROM {{ ref('stg_date_list') }}
)
, CURRENCY_PAIRS AS
(
 SELECT DISTINCT   
     VARIABLE
    ,BASE_CURRENCY_ID
    ,QUOTE_CURRENCY_ID
    
FROM  
    {{ source('FINANCE_ECONOMICS', 'FX_RATES_TIMESERIES') }}
)
, DATE_PAIRS AS (

SELECT
     D.CALENDAR_DATE
    ,C.VARIABLE
    ,C.BASE_CURRENCY_ID
    ,C.QUOTE_CURRENCY_ID
FROM TBL_DATES D
CROSS JOIN CURRENCY_PAIRS C
)
, COMBINED AS (

 SELECT
        dp.CALENDAR_DATE,
        dp.VARIABLE,
        dp.BASE_CURRENCY_ID,
        dp.QUOTE_CURRENCY_ID,
        er.VALUE,
        er.DATE AS rate_date
    FROM DATE_PAIRS dp
    LEFT JOIN {{ source('FINANCE_ECONOMICS', 'FX_RATES_TIMESERIES') }}  er
        ON dp.VARIABLE = er.VARIABLE
        AND dp.CALENDAR_DATE = er.DATE

)
,
FILLED_FORWARD AS (
    -- Use window function to fill forward the last known rate
    SELECT
        CALENDAR_DATE,
        VARIABLE,
        BASE_CURRENCY_ID,
        QUOTE_CURRENCY_ID,
        -- Fill rate using LAST_VALUE over ordered dates with IGNORE NULLS
        LAST_VALUE(VALUE) IGNORE NULLS OVER (
            PARTITION BY VARIABLE
            ORDER BY CALENDAR_DATE
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS FILLED_RATE
    FROM COMBINED
)

-- Final result: one row per date per currency pair, with a filled-in rate
SELECT
    CALENDAR_DATE,
    VARIABLE,
    BASE_CURRENCY_ID,
    QUOTE_CURRENCY_ID,
    FILLED_RATE AS RATE
FROM
    FILLED_FORWARD
ORDER BY
    VARIABLE
    , CALENDAR_DATE
```

> This model performs forward-filling on FX rates to ensure every currency pair has a value for each calendar date.

###  Company Index Staging Model

Create a new file called `stg_companies.sql` inside the `models/staging/` directory and add the following:

```sql
select distinct primary_ticker, company_name, primary_exchange_name, entity_level
from {{ source("FINANCE_ECONOMICS", "COMPANY_INDEX") }}
```

> This model extracts distinct companies with metadata including their exchange and entity level.

###  Asset Class Staging Model

Create a new file called `stg_asset_class.sql` inside the `models/staging/` directory and add the following:

```sql
select distinct ifnull(asset_class, 'Unknown') as asset_class
from {{ source("FINANCE_ECONOMICS", "STOCK_PRICE_TIMESERIES") }}
```

## Create Dimensions

>  This model extracts a list of distinct asset classes from the stock price timeseries data, defaulting to `'Unknown'` where no asset class is specified.

### Asset Class Dimension Model

Create a new file called `dim_asset_class.sql` inside the `models/dimensions/` directory and add the following:

```sql
select asset_class, md5(asset_class) as asset_class_key
from {{ ref("stg_asset_class") }}
```

> This model assigns a surrogate key to each asset class using an MD5 hash.

### Currency Dimension Model

Create a new file called `dim_currency.sql` inside the `models/dimensions/` directory and add the following:

```sql
with
    tbl_currencies as (
        select distinct
            base_currency_id as currency_id, base_currency_name as currency_name
        from {{ source("FINANCE_ECONOMICS", "FX_RATES_TIMESERIES") }}

        union

        select distinct
            quote_currency_id as currency_id, quote_currency_name as currency_name
        from {{ source("FINANCE_ECONOMICS", "FX_RATES_TIMESERIES") }}
    )

select md5(currency_id) as currency_key, currency_id, currency_name
from tbl_currencies
```

> This model generates a distinct list of currencies along with hashed keys.

### Date Dimension Model

Create a new file called `dim_date.sql` inside the `models/dimensions/` directory and add the following:

```sql
select 
    YEAR(DATE) * 10000 + MONTH(DATE) * 100 + DAY(DATE) AS DATE_KEY,
    DATE,
    DAY_OVER_ALL,
    EXTRACT(DAY FROM DATE) AS DAY_OF_MONTH,
    DATEDIFF('day', DATE_TRUNC('quarter', DATE), DATE) + 1 AS DAY_OF_QUARTER,
    DAYOFYEAR(DATE) AS DAY_OF_YEAR,
    CASE 
        WHEN DAYOFWEEK(DATE) = 0 THEN 6 
        ELSE DAYOFWEEK(DATE) - 1 
    END + 1 AS DAY_OF_WEEK_NUMBER,
    CASE
        WHEN DAYOFWEEK(DATE) = 0 THEN 'Sun'
        WHEN DAYOFWEEK(DATE) = 1 THEN 'Mon'
        WHEN DAYOFWEEK(DATE) = 2 THEN 'Tue'
        WHEN DAYOFWEEK(DATE) = 3 THEN 'Wed'
        WHEN DAYOFWEEK(DATE) = 4 THEN 'Thu'
        WHEN DAYOFWEEK(DATE) = 5 THEN 'Fri'
        WHEN DAYOFWEEK(DATE) = 6 THEN 'Sat'
    END AS DAY_OF_WEEK_NAME_SHORT
from {{ ref("stg_date_list") }}
order by day_over_all asc
```

> This model creates a full-featured date dimension with multiple attributes for temporal analysis.

### Ticker Dimension Model

Create a new file called `dim_ticker.sql` inside the `models/dimensions/` directory and add the following:

```sql
select
    md5(ticker) as ticker_key,
    ticker,
    c.company_name,
    c.primary_exchange_name
from {{ ref("stg_ticker") }} t
left join {{ ref("stg_companies") }} c on c.primary_ticker = t.ticker
```
> This model enriches the list of tickers with company names and exchange information.

## Create Fact Models


### Exchange Rate Fact Model

Create a new file called `fact_exchange_rate.sql` inside the `models/facts/` directory and add the following:

```sql
select
    dd.date_key,
    variable,
    bc.currency_key as base_currency_key,
    qc.currency_key as quote_currency_key,
    rate
from {{ ref("stg_exchange_rates") }} as fx
left join {{ ref("dim_date") }} as dd on fx.calendar_date = dd.date
left join {{ ref("dim_currency") }} as bc on fx.base_currency_id = bc.currency_id
left join {{ ref("dim_currency") }} as qc on fx.quote_currency_id = qc.currency_id

order by variable, dd.date_key
```

> This model transforms exchange rate data into a fact table by joining it with dimension keys.

### Stock Price Fact Model

Create a new file called `fact_stock_price.sql` inside the `models/facts/` directory and add the following:

```sql
select
    ticker_key,
    dc.currency_key,
    dd.date_key,
    asset_class_key,
    primary_exchange_code,
    nasdaq_volume,
    post_market_close,
    all_day_high,
    pre_market_open,
    all_day_low
from {{ ref("stg_stock_price") }} sp
left join {{ ref("dim_date") }} dd on dd.date = sp.date
left join {{ ref("dim_ticker") }} dt on dt.ticker = sp.ticker_id
left join {{ ref("dim_currency") }} dc on dc.currency_id = sp.currency_id
left join {{ ref("dim_asset_class") }} ac on ac.asset_class = sp.asset_class
```

> 💹 This fact table contains enriched stock price metrics linked to their respective dimensions for analytics.



## Run Your Models

Once your models are created, you can build them in dbt Cloud using the command line:

1. Open a new command line or terminal in dbt Cloud.
2. Type the following command and press Enter:

```bash
dbt build
```

This command will:
- Run all your models
- Run any tests you have defined
- Build tables and views in your Snowflake database

3. Watch the output for any errors or warnings. If you see errors, review the messages and check your model files.
4. After the build completes, you can use the **Docs** tab in dbt Cloud to explore your project and see how your models are connected.

## Next Steps

- [ ] Add tests to your models for data quality
- [ ] Explore dbt documentation for advanced features
- [ ] Try building additional models or sources

---

### Contact Us

For more information or support, please contact:

- **Company Name:** [Datalab Solutions]
- **Contact Email:** [hello@datalab.co.uk]
- **Website:** [https://datalabsolutions.co.uk](https://datalabsolutions.co.uk)
