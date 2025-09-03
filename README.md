# Temp Mail Worker

Cloudflare Worker that acts as a temporary email inbox.

**API documentation:** [https://api.barid.site](https://api.barid.site)

AI-made web client: [https://web.barid.site](https://web.barid.site)

## Table of Contents

*   [Features](#features)
*   [Supporters](#supporters)
*   [Community](#community-built-stuff)
*   [Setup Guide](#setup-guide)
    *   [Prerequisites](#prerequisites)
    *   [Project Setup](#project-setup)
    *   [Cloudflare Configuration](#cloudflare-configuration)
        *   [D1 Database Setup](#d1-database-setup)
        *   [KV Namespace Setup](#kv-namespace-setup)
        *   [R2 Bucket Setup](#r2-bucket-setup)
        *   [Email Routing Setup](#email-routing-setup)
*   [Running the Worker](#running-the-worker)
    *   [Cloudflare Information Script (Optional)](#cloudflare-information-script-optional)
    *   [Telegram Logging (Optional)](#telegram-logging-optional)
    *   [Local Development](#local-development)
    *   [Deployment](#deployment)

---

## Features

*   Receives emails via Cloudflare Email Routing.
*   Stores email data in a Cloudflare D1 database.
*   **Attachment Support**: Stores email attachments up to 50MB in Cloudflare R2.
*   Provides comprehensive API endpoints for emails and attachments.
*   Automatically cleans up old emails and attachments.
*   Supports multiple file types including documents, images, and archives.

## Supporters

A big thank you to the individuals who have donated domains to support this project. Your contributions help keep this service running.

| Domain | Donated by |
| --- | --- |
| `barid.site` | [vwh](https://github.com/vwh) |
| `vwh.sh` | [vwh](https://github.com/vwh) |
| `iusearch.lol` | [vwh](https://github.com/vwh) |
| `lifetalk.us` | [mm6x](https://github.com/mm6x) |
| `z44d.pro` | [z44d](https://github.com/z44d) |
| `wael.fun` | [blockton](https://github.com/blockton) |
| `tawbah.site` | [HprideH](https://github.com/HprideH) |
| `kuruptd.ink` | [HprideH](https://github.com/HprideH) |
| `oxno1.space` | [oxno1](https://github.com/oxno1) |

### How to Donate a Domain

If you have an unused domain and would like to contribute, you can donate it by following these steps:

1.  **Create a Pull Request**: Add your domain and owner information to the `config/domains.ts` file in the `src` directory.
2.  **Nameserver Provisioning**: After your pull request, we will provide you with the nameservers to update for your domain.

---

## Community

Here are some projects built by the community using or integrating with Temp Mail Worker:

*   **Rust Library**: [doomed-neko/tmapi](https://github.com/doomed-neko/tmapi/)
*   **Go Library**: [blockton/barid](https://github.com/blockton/barid)
*   **Python Library**: [superhexa/barid-client](https://github.com/superhexa/barid-client)
*   **CLI App**: [doomed-neko/tmcli](https://github.com/doomed-neko/tmcli)

---

## Setup Guide

### Prerequisites

Before you begin, ensure you have the following:

*   **Bun**: Installed on your system.
*   **Cloudflare Account**: With access to Workers, Email Routing, and D1.

### Project Setup

1.  **Install Dependencies**: Install the necessary JavaScript dependencies.
    ```bash
    bun install
    ```

2.  **Login to Cloudflare**: You need to log in to your Cloudflare account via Wrangler. This will open a browser for authentication.
    ```bash
    bun wrangler login
    ```

### Cloudflare Configuration

#### D1 Database Setup

1.  **Create the D1 database**:
    ```bash
    bun run db:create
    ```
2.  **Copy the `database_id`**: From the output of the above command.
3.  **Update `wrangler.jsonc`**: Open `wrangler.jsonc` and replace `database_id` with the `database_id` you just copied.
4.  **Apply Database Schema**:
    ```bash
    bun run db:tables
    ```
5.  **Apply Database Indexes**:
    ```bash
    bun run db:indexes
    ```

#### KV Namespace Setup

1.  **Create the KV Namespace**:
    ```bash
    bun run kv:create
    ```
2.  **Copy the `id`**: From the output of the above command.
3.  **Update `wrangler.jsonc`**: Open `wrangler.jsonc` and replace `id` and `preview_id` with the `id` you just copied.

#### R2 Bucket Setup

1.  **Create the R2 Bucket**:
    ```bash
    bun run r2:create
    ```
2.  **Create Preview Bucket** (for development):
    ```bash
    bun run r2:create-preview
    ```

#### Email Routing Setup

1.  **Go to your Cloudflare Dashboard**: Select your domain (`example.com`).
2.  **Navigate to "Email" -> "Email Routing"**.
3.  **Enable Email Routing** if it's not already enabled.
4.  **Create a Catch-all Rule**:
    *   For "Action", choose "Send to Worker".
    *   Select your Worker (e.g., `temp-mail`).
    *   Click "Save".

## Running the Worker

### Cloudflare Information Script (Optional)

To check your Cloudflare Workers, D1 databases, KV namespaces, and domain information directly from your terminal, you can use the `cf-info` script.

1.  **Configure API Credentials**: Add your Cloudflare Account ID and an API Token with appropriate permissions (e.g., `Zone:Read`, `Worker Scripts:Read`, `D1:Read`, `KV Storage:Read`, `Zone:Email:Read`) to your `.dev.vars` file.

    Example `.dev.vars` additions:
    ```
    CLOUDFLARE_ACCOUNT_ID="YOUR_CLOUDFLARE_ACCOUNT_ID"
    CLOUDFLARE_API_TOKEN="YOUR_CLOUDFLARE_API_TOKEN"
    ```

2.  **Run the Script**:
    ```bash
    bun run cf-info
    ```

### Telegram Logging (Optional)

If you wish to enable Telegram logging for your worker, follow these steps:

1.  **Enable Logging in `wrangler.jsonc`**: Ensure `TELEGRAM_LOG_ENABLE` is set to `true` in your `wrangler.jsonc` file under the `vars` section.

2.  **Local Development (`.dev.vars`)**: For local development, create a `.dev.vars` file in your project root with your Telegram bot token and chat ID. This file is used by `bun dev`.

    Example `.dev.vars`:
    ```
    TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
    TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"
    ```

3.  **Production Deployment (Secrets)**: For production, you must set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as secrets using `wrangler`. This securely stores your sensitive information with Cloudflare.

    Run the following commands in your terminal and enter the respective values when prompted:
    ```bash
    bun wrangler secret put TELEGRAM_BOT_TOKEN
    bun wrangler secret put TELEGRAM_CHAT_ID
    ```

### Local Development

To run the worker locally:

```bash
bun run dev
```

### Deployment

To deploy your worker to Cloudflare:

```bash
bun run deploy
```

## Available Scripts

### Development & Deployment
- `bun run dev` - Start local development server
- `bun run deploy` - Deploy to Cloudflare Workers
- `bun run tail` - View live logs from deployed worker

### Database Management
- `bun run db:create` - Create D1 database
- `bun run db:tables` - Apply database schema
- `bun run db:indexes` - Apply database indexes
- `bun run db:migrate-attachments` - Add attachment support to existing database

### Storage Setup
- `bun run kv:create` - Create KV namespace
- `bun run r2:create` - Create R2 bucket for attachments
- `bun run r2:create-preview` - Create R2 preview bucket

### Code Quality
- `bun run check` - Run all linting and formatting checks
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix ESLint issues
- `bun run format` - Format code with Prettier
- `bun run tsc` - Run TypeScript compiler

### Utilities
- `bun run cf-info` - Display Cloudflare account information
- `bun run cf-typegen` - Generate TypeScript types for Cloudflare bindings

## API Endpoints

### Email Endpoints

- `GET /emails/{emailAddress}` - Get emails for a specific address
- `GET /emails/count/{emailAddress}` - Get email count for a specific address
- `GET /inbox/{emailId}` - Get a specific email by ID
- `DELETE /emails/{emailAddress}` - Delete all emails for a specific address
- `DELETE /inbox/{emailId}` - Delete a specific email by ID
- `GET /domains` - Get list of supported domains

### Attachment Endpoints

- `GET /emails/{emailAddress}/attachments` - Get all attachments for emails sent to a specific address
- `GET /inbox/{emailId}/attachments` - Get attachments for a specific email
- `GET /attachments/{attachmentId}` - Download a specific attachment
- `DELETE /attachments/{attachmentId}` - Delete a specific attachment

### Attachment Features

- **File Size Limit**: Up to 50MB per attachment
- **File Count Limit**: Up to 10 attachments per email
- **Supported File Types**:
  - **Images**: JPEG, PNG, GIF, WebP, SVG
  - **Documents**: PDF, TXT, CSV, Word, Excel, PowerPoint
  - **Archives**: ZIP, RAR, 7Z
  - **Other**: JSON, XML

### Health Check

- `GET /health` - Service health status

For complete API documentation with examples, visit: [https://api.barid.site](https://api.barid.site)
