# Project Overview: Temp Mail Worker

This repository contains a Cloudflare Worker designed to function as a temporary email inbox. It receives emails via Cloudflare Email Routing, parses their content, and stores them in a Cloudflare D1 database. It also exposes API endpoints for email retrieval and includes a scheduled cleanup mechanism.

## Core Technologies & Frameworks

*   **Cloudflare Workers**: Serverless execution environment.
*   **Hono**: Fast, tiny, and simple web framework for Workers.
*   **Cloudflare D1**: Serverless SQL database.
*   **Postal-Mime**: Library for robust email MIME parsing.
*   **Bun**: JavaScript runtime and package manager.
*   **TypeScript**: For type safety.

## Project Structure

```
. (project root)
├───src/
│   ├───index.ts              # Main Worker entry point (exports handlers)
│   ├───app.ts                # Hono application setup and HTTP API routes
│   ├───handlers/             # Event handler modules
│   │   ├───emailHandler.ts   # Logic for processing incoming emails (parsing, D1 insertion)
│   │   └───scheduledHandler.ts # Logic for hourly email cleanup
│   └───db/                   # Database interaction layer
│       ├───index.ts          # Re-exports D1 query functions
│       └───queries.ts        # Contains specific D1 SQL query functions
│
├───db/                       # SQL schema and migration files
│   ├───schema.sql            # D1 table creation (emails table)
│   └───indexes.sql           # D1 index creation (for performance)
│
├───package.json              # Project metadata and dependencies
├───wrangler.jsonc            # Cloudflare Worker configuration
├───tsconfig.json             # TypeScript configuration
├───README.md                 # Human-readable project documentation
└───GEMINI.md                 # This file (Agent-specific documentation)
```

## Cloudflare Worker Configuration (`wrangler.jsonc`)

*   **`main`**: `src/index.ts` - Specifies the Worker's entry point.
*   **`compatibility_date`**: Ensures consistent runtime behavior.
*   **`d1_databases`**: Defines the D1 binding (`DB`) to the `temp-mail-emails` database. The `database_id` must be set to the actual ID of the deployed D1 database.
*   **`triggers.crons`**: Configures a scheduled trigger (`0 * * * *`) to run the `scheduled` handler hourly for email cleanup.

## Key Handlers & Logic

### `email` Handler (`src/handlers/emailHandler.ts`)

*   **Trigger**: Activated by Cloudflare Email Routing (catch-all rule for `iusearch.lol` forwarding to this Worker).
*   **Functionality**:
    1.  Parses the raw email stream (`message.raw`) using `postal-mime`.
    2.  Generates a unique CUID for the email.
    3.  Inserts email metadata (from, to, subject, received_at, html_content, text_content) into the `emails` table in D1 via `db.insertEmail`.
    4.  Logs basic email information.

### `scheduled` Handler (`src/handlers/scheduledHandler.ts`)

*   **Trigger**: Activated hourly by the cron trigger defined in `wrangler.jsonc`.
*   **Functionality**:
    1.  Calculates the timestamp for 3 days ago.
    2.  Deletes emails older than this timestamp from the `emails` table in D1 via `db.deleteOldEmails`.
    3.  Logs the cleanup operation's status.

### HTTP API Endpoints (`src/app.ts`)

*   **`GET /emails/:emailAddress`**:
    *   Retrieves a paginated list of email summaries for a given recipient email address.
    *   Uses `limit` and `offset` query parameters.
    *   Queries D1 via `db.getEmailsByRecipient`.
*   **`GET /inbox/:emailId`**:
    *   Retrieves the full content of a specific email by its ID.
    *   Queries D1 via `db.getEmailById`.
    *   Ensures `null` is returned for missing `subject`, `html_content`, `text_content` to prevent `D1_TYPE_ERROR`.

## Database Schema & Migrations

*   The D1 database schema is defined in `db/schema.sql`.
*   Indexes for performance are defined in `db/indexes.sql`.
*   These SQL files are applied manually using `wrangler d1 execute --remote` after deployment.

## Development & Deployment

*   **Local Development**: `bun dev` (connects to remote D1).
*   **Deployment**: `bun deploy`.

## Current State & TODOs

This project is a functional starting point. Key areas for future development include:

*   **R2 for Attachments**: Implement storage of email attachments in Cloudflare R2.
*   **Web Client**: Develop a frontend application to interact with the API.
*   **Mutable Domains**: Add functionality for managing multiple temporary domains.
*   **Improved Docs**: Enhance API reference and deployment considerations.
*   **Email Sending**: Integrate with a third-party email sending service.
