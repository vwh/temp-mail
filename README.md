# Temp Mail Worker

Cloudflare Worker that acts as a temporary email inbox. It uses Hono for routing, and Cloudflare D1 for storing emails.

## API Documentation

Simple API documentation is hosted at [https://api.barid.site](https://api.barid.site).

## Table of Contents

*   [Features](#features)
*   [Supporters](#supporters)
*   [Setup Guide](#setup-guide)
    *   [Prerequisites](#prerequisites)
    *   [Project Setup](#project-setup)
    *   [Cloudflare Configuration](#cloudflare-configuration)
        *   [D1 Database Setup](#d1-database-setup)
        *   [KV Namespace Setup](#kv-namespace-setup)
        *   [Email Routing Setup](#email-routing-setup)
*   [Running the Worker](#running-the-worker)
    *   [Local Development](#local-development)
    *   [Deployment](#deployment)

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
| `wael.fun` | [blockton](https://github.com/blockton) |
| `tawbah.site` | [HprideH](https://github.com/HprideH) |
| `kuruptd.ink` | [HprideH](https://github.com/HprideH) |
| `hexworld.cc` | [superhexa](https://github.com/superhexa) |

### How to Donate a Domain

If you have an unused domain and would like to contribute, you can donate it by following these steps:

1.  **Create a Pull Request**: Add your domain and owner information to the `domains.ts` file in the `src` directory.
2.  **Nameserver Provisioning**: After your pull request, we will provide you with the nameservers to update for your domain.

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

#### b. KV Namespace Setup

1.  **Create the KV Namespace**:
    ```bash
    bun run kv:create
    ```
2.  **Copy the `id`**: From the output of the above command.
3.  **Update `wrangler.jsonc`**: Open `wrangler.jsonc` and add the `id` to the `kv_namespaces` binding for `EMAIL_STATS_KV`.

#### c. Email Routing Setup

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
