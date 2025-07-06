# Setting Up the MCP Server with Docker Desktop

## Learning Outcome
Learn how to install, configure, and run the Snowflake Cortex MCP Server locally using Docker Desktop to enable natural language querying through AI agents like Claude.

---

## Step 1: Prerequisites

Before you begin, ensure the following are ready:

* Docker Desktop installed and running ([Download for Windows](https://docs.docker.com/desktop/setup/install/windows-install/))
* Your `stock_prices.yaml` model published in Snowflake Cortex Analyst
* Access to a Snowflake account with Cortex enabled
* Clone of the MCP Server repo:

```bash
git clone https://github.com/Snowflake-Labs/snowflake-cortex-agent-mcp-server.git
cd snowflake-cortex-agent-mcp-server
```

---

## Step 2: Create a `.env` File

Create a `.env` file in the root of the project to configure your environment:

```ini
MCP_SERVER_PORT=8080
MCP_MODEL_NAME=stock_prices
MCP_SNOWFLAKE_ACCOUNT=<your_account_region>
MCP_SNOWFLAKE_USERNAME=<your_username>
MCP_SNOWFLAKE_PASSWORD=<your_password>
MCP_SNOWFLAKE_WAREHOUSE=USER_STD_XSMALL_WH
MCP_SNOWFLAKE_DATABASE=CORTEX_ANALYST_DB
MCP_SNOWFLAKE_SCHEMA=DATA
MCP_SNOWFLAKE_ROLE=ACCOUNTADMIN
```

Replace the placeholders with your Snowflake credentials and region. This configuration tells the MCP server how to locate and access the `stock_prices` model.

---

## Step 3: Build the Docker Image

Open a terminal from the root of the repo and run:

```bash
docker build -t cortex-mcp-server .
```

This will build the server image with all dependencies.

---

## Step 4: Run the Server in Docker Desktop

Now run the server container using your `.env` file:

```bash
docker run -p 8080:8080 --env-file .env cortex-mcp-server
```

This will start the server and make it accessible at:
```
http://localhost:8080
```

Use Docker Desktop to view logs and confirm the container is running.

---

## Step 5: Test the Server Health

Check if the server is live:

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"ok"}
```

---

## Step 6: Connect Claude (or Your LLM Client)

Send a request to the MCP server with a question and model:

```json
{
  "question": "What is the average closing price for Apple in 2025?",
  "model": "stock_prices"
}
```

The MCP Server will:

* Look up the `stock_prices.yaml` semantic model
* Forward the request to Cortex Analyst
* Return a structured result + SQL

---

You're now ready to interact with Snowflake Cortex Analyst using natural language via the MCP protocol and Docker Desktop.
