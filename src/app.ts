import { Hono } from "hono";
import { corsMiddleware } from "./middlewares/cors";

import emailRoutes from "@/routes/emailRoutes";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(corsMiddleware);

app.route("/", emailRoutes);

export default app;
