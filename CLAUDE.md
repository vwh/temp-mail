# Temp Mail Worker - Claude Code Instructions

This repository is a **Cloudflare Workers-based temporary email service** that provides disposable email addresses with attachment support. The service receives emails via Cloudflare Email Routing, stores them in D1 database, and provides REST API endpoints for managing emails and attachments.

## Project Overview

- **Type**: Cloudflare Worker + Hono Framework
- **Purpose**: Temporary email service with attachment support
- **Live API**: https://api.barid.site
- **Web Client**: https://web.barid.site
- **Runtime**: Cloudflare Workers (Edge Computing)
- **Package Manager**: Bun

## Technology Stack

### Core Technologies
- **Runtime**: Cloudflare Workers (Edge Computing)
- **Framework**: Hono.js (Lightweight web framework)
- **Language**: TypeScript (ESNext target)
- **Package Manager**: Bun

### Key Dependencies
- **@hono/zod-openapi**: OpenAPI documentation generation
- **@hono/zod-validator**: Request validation with Zod
- **zod**: Schema validation
- **postal-mime**: Email parsing
- **html-to-text**: HTML content conversion
- **@paralleldrive/cuid2**: Unique ID generation

### Development Tools
- **Biome**: Code formatting and linting (configured with tabs, 100 char line width)
- **TypeScript**: Strict mode enabled
- **Wrangler**: Cloudflare Workers CLI
- **Knip**: Unused dependency detection

### Cloudflare Services
- **D1 Database**: SQLite database for email storage
- **KV Storage**: Key-value store for caching and rate limiting
- **R2 Storage**: Object storage for email attachments (up to 50MB)
- **Email Routing**: Email receiving service
- **Scheduled Functions**: Automated cleanup and reporting

## Directory Structure

```
src/
├── app.ts                     # Main Hono application setup
├── index.ts                   # Worker entry point (email, scheduled, fetch)
├── config/                    # Configuration files
│   ├── constants.ts           # Application constants (limits, types)
│   └── domains.ts             # Supported email domains configuration
├── database/                  # Database interaction modules
│   ├── d1.ts                  # D1 database operations
│   ├── kv.ts                  # KV storage operations
│   └── r2.ts                  # R2 storage operations
├── handlers/                  # Event handlers
│   ├── emailHandler.ts        # Email processing handler
│   └── scheduledHandler.ts   # Scheduled task handlers
├── middlewares/               # Route middlewares
│   ├── cors.ts                # CORS middleware
│   └── validateDomain.ts      # Domain validation middleware
├── routes/                    # API route definitions
│   ├── emailRoutes.ts         # Email-related endpoints
│   ├── attachmentRoutes.ts    # Attachment-related endpoints
│   └── healthRoutes.ts        # Health check endpoint
├── schemas/                   # Zod schemas for validation
│   ├── emails/                # Email-related schemas
│   └── attachments/           # Attachment-related schemas
└── utils/                     # Utility functions
    ├── docs.ts                # OpenAPI documentation setup
    ├── helpers.ts             # Helper functions
    ├── http.ts                # HTTP response utilities
    ├── logger.ts              # Logging utilities (including Telegram)
    ├── mail.ts                # Email processing utilities
    ├── performance.ts         # Performance monitoring
    └── telegram.ts            # Telegram logging integration

sql/                           # Database schema files
├── schema.sql                 # Database table definitions
└── indexes.sql                # Database indexes

cloudflare-info/               # Cloudflare information utility
└── index.ts                   # Account info script
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

### Storage Setup
- `bun run kv:create` - Create KV namespace
- `bun run r2:create` - Create R2 bucket for attachments
- `bun run r2:create-preview` - Create R2 preview bucket

### Code Quality
- `bun run check` - Run all linting and formatting checks
- `bun run lint` - Run Biome linter
- `bun run lint:fix` - Fix linting issues automatically
- `bun run format` - Format code with Biome
- `bun run tsc` - Run TypeScript compiler
- `bun run knip` - Check for unused dependencies

### Utilities
- `bun run cf-info` - Display Cloudflare account information
- `bun run cf-typegen` - Generate TypeScript types for Cloudflare bindings

## Key Features

### Email Service
- **Multiple Domains**: Supports 9+ donated domains (barid.site, vwh.sh, etc.)
- **Email Storage**: Stores emails in D1 database with full content
- **HTML Processing**: Converts HTML emails to text with size limits
- **Automatic Cleanup**: Scheduled deletion of old emails (3-hour retention)

### Attachment Support
- **File Size**: Up to 50MB per attachment
- **File Count**: Up to 10 attachments per email
- **Supported Types**: Images, documents, archives, databases, and more
- **Storage**: Cloudflare R2 for reliable object storage

### API Endpoints
- RESTful API with OpenAPI documentation
- Email management (list, get, delete)
- Attachment handling (upload, download, delete)
- Health check endpoint
- Domain listing endpoint

### Monitoring & Logging
- **Telegram Integration**: Optional Telegram bot logging
- **Performance Monitoring**: Built-in performance tracking
- **Error Handling**: Comprehensive error logging
- **Observability**: Cloudflare Workers observability enabled

## Architecture Patterns

### Modular Design
- **Separation of Concerns**: Clear separation between routes, handlers, database, and utilities
- **Dependency Injection**: Cloudflare bindings injected via environment
- **Schema-Driven**: Zod schemas for request/response validation

### Cloudflare-Native
- **Edge Computing**: Runs on Cloudflare's edge network
- **Serverless**: No server management required
- **Multi-Service Integration**: Uses D1, KV, R2, Email Routing, and Scheduled Functions

### Configuration Management
- **Environment-Based**: Different configs for dev/preview/production
- **Domain Configuration**: Centralized domain management
- **Constants**: Application-wide constants for limits and settings

## Development Setup

### Prerequisites
- Bun package manager
- Cloudflare account with Workers access
- Domain with Email Routing enabled

### Quick Start
```bash
# Install dependencies
bun install

# Login to Cloudflare
bun wrangler login

# Set up database (update wrangler.jsonc with generated IDs)
bun run db:create
bun run db:tables
bun run db:indexes

# Set up storage
bun run kv:create
bun run r2:create
bun run r2:create-preview

# Run locally
bun run dev

# Deploy
bun run deploy
```

## Configuration Notes

### Environment Variables
- `TELEGRAM_LOG_ENABLE`: Enable/disable Telegram logging
- `HOURS_TO_DELETE_D1`: Email retention period (default: 3 hours)
- `TELEGRAM_BOT_TOKEN`: Telegram bot token (secret)
- `TELEGRAM_CHAT_ID`: Telegram chat ID for logging (secret)

### Cloudflare Bindings
- **D1**: Database binding for email storage
- **KV**: Key-value storage for caching
- **R2**: Object storage for attachments
- **Scheduled**: Cron job triggers for cleanup

### Development Tips
- Use `.dev.vars` for local development secrets
- Update `wrangler.jsonc` with your Cloudflare resource IDs
- Use Biome for consistent code formatting
- Leverage the extensive TypeScript types and schemas

## Code Style Guidelines

### Formatting (Biome)
- **Indentation**: Tabs, 2 spaces width
- **Line Width**: 100 characters maximum
- **Quotes**: Double quotes for strings
- **Semicolons**: Always used
- **Brackets**: K&R style (bracket on same line)

### TypeScript
- **Strict Mode**: Enabled
- **Module Resolution**: Bundler-style
- **Path Aliases**: `@/*` maps to `./src/*`
- **JSX**: Uses Hono JSX with React-jsx transform

### Best Practices
- Use Zod schemas for all input validation
- Leverage Cloudflare Workers' edge computing capabilities
- Implement proper error handling and logging
- Follow the established modular architecture
- Use TypeScript interfaces for type safety

This project follows modern Cloudflare Workers development patterns with a focus on performance, reliability, and maintainability.