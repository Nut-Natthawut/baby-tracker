import { Hono } from "hono";
import { cors } from "hono/cors";
import babies from "./routes/babies";
import logs from "./routes/logs";
import auth from "./routes/auth";
import invitations from "./routes/invitations";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for frontend
app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "Baby Tracker API" });
});

// Mount routes
app.route("/api/babies", babies);
app.route("/api/logs", logs);
app.route("/api/auth", auth);
app.route("/api/invitations", invitations);

export default app;
