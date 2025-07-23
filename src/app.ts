import { Hono } from "hono";
import emailRoutes from "@/routes/emailRoutes";
import { logError } from "@/utils/logger";
import { corsMiddleware } from "./middlewares/cors";
import { ERR } from "./utils/http";

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

export default app;
