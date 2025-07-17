import { Hono } from "hono";

import emailRoutes from './routes/emailRoutes';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.route('/', emailRoutes);

export default app;