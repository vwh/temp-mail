import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import emailRoutes from "@/routes/emailRoutes";
import { logError } from "@/utils/logger";
import { DOMAINS_SET } from "./config/domains";
import corsMiddleware from "./middlewares/cors";
import { ERR, OK } from "./utils/http";

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

// --- Middlewares ---
app.use(corsMiddleware);

// --- Error handling ---
app.onError((err, c) => {
	logError(`Unhandled error: ${err.message}`, err);
	return c.json(ERR(err.name, err.message), 500);
});

// --- Routes ---
// Email Routes
app.route("/", emailRoutes);

// Health Check
app.get("/health", async (c) => {
	try {
		await c.env.D1.prepare("SELECT 1").run();
		await c.env.KV.list({ limit: 1 });

		return c.json(
			OK({
				worker: "connected",
				database: "connected",
				kv: "connected",
			}),
		);
	} catch (error) {
		logError("Health check failed", error as Error);
		return c.json(ERR((error as Error).message), 503);
	}
});

// --- OpenAPI Documentation ---
// OpenAPI Documentation
app.doc("/openapi.json", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "Temp Mail API",
		description: `
# Temporary Email Service API

A simple and fast temporary email service that allows you to receive emails without registration.

## Features
- Receive emails on temporary addresses
- Multiple supported domains
- Real-time email retrieval
- No registration required
- Automatic cleanup

## Response Format
- **Success responses** include \`status: true\` and a \`result\` field
- **Error responses** include \`status: false\` and an \`error\` object
- **Validation errors** include \`success: false\` and detailed error information

## Supported Domains
This API currently supports the following email domains:
${`\n${Array.from(DOMAINS_SET).map(domain => `- ${domain}`).join("\n")}`}

**Repository**: [github.com/vwh/temp-mail](https://github.com/vwh/temp-mail)  
**Issues**: [Report bugs or request features](https://github.com/vwh/temp-mail/issues)
`,
		contact: {
			name: "API Support",
			url: "https://github.com/vwh/temp-mail",
		},
		license: {
			name: "MIT",
			url: "https://github.com/vwh/temp-mail/blob/main/LICENSE",
		},
	},
	servers: [
		{
			url: "https://api.barid.site",
			description: "Production server",
		},
	],
	tags: [
		{
			name: "Emails",
			description: "Operations for managing emails by email address",
		},
		{
			name: "Inbox",
			description: "Operations for individual email messages",
		},
		{
			name: "Domains",
			description: "Get information about supported email domains",
		},
	],
	"x-repository": "https://github.com/vwh/temp-mail",
	"x-issues": "https://github.com/vwh/temp-mail/issues",
});

// Swagger UI - Traditional documentation
app.get("/swagger", swaggerUI({ url: "/openapi.json" }));

// Scalar - Modern documentation
app.get(
	"/",
	Scalar({
		url: "/openapi.json",
		theme: "purple",
	}),
);

export default app;
