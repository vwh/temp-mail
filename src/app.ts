import { Hono } from "hono";
import emailRoutes from "@/routes/emailRoutes";
import { logError } from "@/utils/logger";
import { corsMiddleware } from "./middlewares/cors";
import { ERR, OK } from "./utils/http";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Middlewaresa
app.use(corsMiddleware);

// Centralized Error Handling
app.onError((err, c) => {
	logError(`Unhandled error: ${err.message}`, err);
	return c.json(ERR(err.name, err.message), 500);
});

// Routes
app.route("/", emailRoutes);

// Health Check Endpoint
app.get("/health", async (c) => {
	try {
		// Check D1 connectivity
		await c.env.D1.prepare("SELECT 1").run();

		// Check KV connectivity
		await c.env.KV.list({ limit: 1 });

		return c.json(OK({ worker: "connected", database: "connected", kv: "connected" }));
	} catch (error) {
		logError("Health check failed", error as Error);
		return c.json(ERR((error as Error).message), 503);
	}
});

export default app;
