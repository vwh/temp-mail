# Temp Mail Worker

Cloudflare Worker that acts as a temporary email inbox. It uses Hono for routing, and Cloudflare D1 for storing emails.

**Note**: This project serves as a starting point. While functional, there's a lot more that can be built on top of it!

## TODO List

*   Add R2 for email attachments (currently attachments are ignored).
*   Make a web client to interact with the API (e.g., a simple frontend to view emails).
*   Handle mutable domains (e.g., allowing users to add and manage their own temporary domains).
*   Improve documentation (e.g., more detailed API reference, deployment considerations).

## Features

*   Receives emails via Cloudflare Email Routing.
*   Stores email data in a Cloudflare D1 database.
*   Provides API endpoints to the emails
*   Automatically cleans up old emails

## Prerequisites

Before you begin, ensure you have the following:

*   **Bun**: Installed on your system.
*   **Cloudflare Account**: With access to Workers, Email Routing, and D1.
*   **Wrangler CLI**: Installed globally (`npm i -g wrangler`).

## Setup Guide

### 1. Cloudflare Account Configuration

#### a. Wrangler CLI Login

You need to log in to your Cloudflare account via Wrangler. This will open a browser for authentication.

```bash
wrangler login
```

#### b. Email Routing Setup

1.  **Go to your Cloudflare Dashboard**: Select your domain (`example.com`).
2.  **Navigate to "Email" -> "Email Routing"**.
3.  **Enable Email Routing** if it's not already enabled.
4.  **Create a Catch-all Rule**:
    *   For "Action", choose "Send to Worker".
    *   Select your Worker (e.g., `temp-mail`).
    *   Click "Save".

#### c. D1 Database Creation

1.  **Create the D1 database**: Run this command in your terminal.
    ```bash
    wrangler d1 create temp-mail-emails
    ```
2.  **Copy the `database_id`**: From the output of the above command, copy the `database_id` (it will look like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
3.  **Update `wrangler.jsonc`**: Open `wrangler.jsonc` and replace `database_id` with the `database_id` you just copied.

### 2. Project Dependencies & Database Schema

1.  **Install JavaScript dependencies**:
    ```bash
    bun install
    ```
2.  **Apply D1 Database Schema**: This creates the `emails` table in your D1 database.
    ```bash
    wrangler d1 execute temp-mail-emails --file ./db/schema.sql --remote
    ```
3.  **Apply D1 Database Indexes**: This adds indexes for better query performance.
    ```bash
    wrangler d1 execute temp-mail-emails --file ./db/indexes.sql --remote
    ```

## Running the Worker

### Local Development

To run the worker locally and connect to your **remote D1 database**:

```bash
bun dev
```

### Deployment

To deploy your worker to Cloudflare:

```bash
bun deploy
```

## API Endpoints

Once deployed, you can interact with your worker via these HTTP endpoints:

*   **`GET /emails/:emailAddress`**
    *   **Purpose**: Retrieve a paginated list of email summaries for a specific recipient email address.
    *   **Parameters**:
        *   `:emailAddress` (path): The email address to query (e.g., `x@example.com`).
        *   `limit` (query, optional): Number of emails to return (default: 10).
        *   `offset` (query, optional): Number of emails to skip (default: 0).
    *   **Example**: `https://your-worker-url/emails/x@example.com?limit=5&offset=0`
    *   **Returns**: An array of email objects with `id`, `from_address`, `to_address`, `subject`, `received_at`.

*   **`GET /inbox/:emailId`**
    *   **Purpose**: Retrieve the full content of a specific email.
    *   **Parameters**:
        *   `:emailId` (path): The unique ID of the email.
    *   **Example**: `https://your-worker-url/inbox/some-email-id`
    *   **Returns**: An object containing the `email` details, including `html_content` and `text_content`.

---
