import { OpenAPIHono } from "@hono/zod-openapi";
import { ERR, OK } from "@/utils/http";
import { logError } from "@/utils/logger";

const healthRoutes = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

// --- Routes ---
// TODO: add it to the openapi docs
// GET /health
healthRoutes.get("/health", async (c) => {
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

export default healthRoutes;
