import { Hono } from "hono";
import emailRoutes from "@/routes/emailRoutes";
import { corsMiddleware } from "./middlewares/cors";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(corsMiddleware);

app.route("/", emailRoutes);

export default app;
