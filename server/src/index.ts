import { Hono } from "hono";
import { cors } from "hono/cors";
import babies from "./routes/babies";

type Bindings = {
  baby_tracker_db: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for frontend
app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type"],
  })
);

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "Baby Tracker API" });
});

// Mount routes
app.route("/api/babies", babies);

export default app;
