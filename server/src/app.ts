import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoute from "./routes/auth.js";
import complaintsRoute from "./routes/complaints.js";
import noticesRoute from "./routes/notices.js";
import dashboardRoute from "./routes/dashboard.js";

const app = new Hono();

if (process.env.NODE_ENV !== "test") {
  app.use("*", logger());
}
app.use(
  "*",
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.use("/uploads/*", serveStatic({ root: "./" }));

app.get("/api/health", (c) => c.json({ success: true, data: { status: "ok" } }));

app.route("/api/auth", authRoute);
app.route("/api/complaints", complaintsRoute);
app.route("/api/notices", noticesRoute);
app.route("/api/dashboard", dashboardRoute);

app.notFound((c) => c.json({ success: false, message: "Route not found" }, 404));
app.onError(errorHandler);

export default app;
