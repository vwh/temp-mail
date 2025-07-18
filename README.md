# Temp Mail Worker

Cloudflare Worker that acts as a temporary email inbox. It uses Hono for routing, and Cloudflare D1 for storing emails.

**Note**: This project serves as a starting point. While functional, there's a lot more that can be built on top of it!

## Table of Contents

*   [API Endpoints](#api-endpoints)
*   [Features](#features)
*   [Supporters](#supporters)
*   [Setup Guide](#setup-guide)
    *   [Prerequisites](#prerequisites)
    *   [Project Setup](#project-setup)
    *   [Cloudflare Configuration](#cloudflare-configuration)
        *   [D1 Database Setup](#d1-database-setup)
        *   [Email Routing Setup](#email-routing-setup)
*   [Running the Worker](#running-the-worker)
    *   [Local Development](#local-development)
    *   [Deployment](#deployment)

## API Endpoints

You can interact with the Temp Mail Worker API via these HTTP endpoints.

*   **`GET /domains`**
    *   **Purpose**: Retrieve a list of supported email domains.
    *   **Example**: `https://api.barid.site/domains`
    *   **Returns**: An array of strings, each representing a supported domain (e.g., `["example.com", "test.org"]`).

*   **`GET /emails/:emailAddress`**
    *   **Purpose**: Retrieve a paginated list of email summaries for a specific recipient email address.
    *   **Parameters**:
        *   `:emailAddress` (path): The full email address to query (e.g., `user@example.com`).
        *   `limit` (query, optional): Maximum number of emails to return per page (default: 10).
        *   `offset` (query, optional): Number of emails to skip for pagination (default: 0).
    *   **Example**: `https://api.barid.site/emails/x@example.com?limit=5&offset=0`
    *   **Returns**: An array of email objects, each with `id`, `from_address`, `to_address`, `subject`, and `received_at`.

*   **`DELETE /emails/:emailAddress`**
    *   **Purpose**: Delete all emails associated with a specific recipient email address.
    *   **Parameters**:
        *   `:emailAddress` (path): The full email address whose emails are to be deleted.
    *   **Example**: `https://api.barid.site/emails/x@example.com`
    *   **Returns**: A success message indicating the deletion.

*   **`GET /inbox/:emailId`**
    *   **Purpose**: Retrieve the full content of a specific email by its unique ID.
    *   **Parameters**:
        *   `:emailId` (path): The unique identifier of the email.
    *   **Example**: `https://api.barid.site/inbox/some-email-id`
    *   **Returns**: An object containing the full `email` details, including `html_content` and `text_content`.

*   **`DELETE /inbox/:emailId`**
    *   **Purpose**: Delete a specific email by its unique ID.
    *   **Parameters**:
        *   `:emailId` (path): The unique identifier of the email to be deleted.
    *   **Example**: `https://api.barid.site/inbox/some-email-id`
    *   **Returns**: A success message indicating the deletion.

---

## Features

*   Receives emails via Cloudflare Email Routing.
*   Stores email data in a Cloudflare D1 database.
*   Provides API endpoints to the emails
*   Automatically cleans up old emails

## Supporters

A big thank you to the individuals who have donated domains to support this project. Your contributions help keep this service running.

| Domain | Donated by |
| --- | --- |
| `barid.site` | [vwh](https://github.com/vwh) |
| `vwh.sh` | [vwh](https://github.com/vwh) |
| `iusearch.lol` | [vwh](https://github.com/vwh) |
| `lifetalk.us` | [mm6x](https://github.com/mm6x) |
| `z44d.pro` | [z44d](https://github.com/z44d) |
| `wael.fun` | [z44d](https://github.com/blockton) |
| `tawbah.site` | [HprideH](https://github.com/HprideH) |
| `kuruptd.ink` | [HprideH](https://github.com/HprideH) |

### How to Donate a Domain

If you have an unused domain and would like to contribute, you can donate it by following these steps:

1.  **Update your domain's nameservers to:**
    *   `algin.ns.cloudflare.com`
    *   `marjory.ns.cloudflare.com`
2.  **Create a Pull Request**: Add your domain and owner information to the `domains.ts` file in the `src` directory.

---

## Setup Guide

### Prerequisites

Before you begin, ensure you have the following:

*   **Bun**: Installed on your system.
*   **Cloudflare Account**: With access to Workers, Email Routing, and D1.

### 1. Project Setup

1.  **Install Dependencies**: Install the necessary JavaScript dependencies.
    ```bash
    bun install
    ```

2.  **Login to Cloudflare**: You need to log in to your Cloudflare account via Wrangler. This will open a browser for authentication.
    ```bash
    bun wrangler login
    ```

### 2. Cloudflare Configuration

#### a. D1 Database Setup

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

#### b. Email Routing Setup

1.  **Go to your Cloudflare Dashboard**: Select your domain (`example.com`).
2.  **Navigate to "Email" -> "Email Routing"**.
3.  **Enable Email Routing** if it's not already enabled.
4.  **Create a Catch-all Rule**:
    *   For "Action", choose "Send to Worker".
    *   Select your Worker (e.g., `temp-mail`).
    *   Click "Save".

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