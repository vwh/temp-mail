import { OpenAPIHono } from "@hono/zod-openapi";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { OK } from "@/utils/http";
import { logError } from "@/utils/logger";

const healthRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

// --- Routes ---
// TODO: add it to the openapi docs
// GET /health
healthRoutes.get("/health", async (c) => {
	let d1Status = "disconnected";
	let kvStatus = "disconnected";
	let overallStatus: ContentfulStatusCode = 200;

	try {
		await c.env.D1.prepare("SELECT 1").run();
		d1Status = "connected";
	} catch (error) {
		logError("Health check D1 failed", error as Error);
		overallStatus = 503;
	}

	try {
		await c.env.KV.list({ limit: 1 });
		kvStatus = "connected";
	} catch (error) {
		logError("Health check KV failed", error as Error);
		overallStatus = 503;
	}

	return c.json(
		OK({
			worker: "connected",
			database: d1Status,
			kv: kvStatus,
		}),
		overallStatus,
	);
});

export default healthRoutes;
