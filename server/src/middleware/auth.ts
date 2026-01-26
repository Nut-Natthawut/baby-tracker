import type { MiddlewareHandler } from "hono";
import type { Bindings } from "../types";
import { verifyJwt, type AuthPayload } from "../lib/auth";

export type AuthVariables = {
  user: AuthPayload;
};

function extractToken(authHeader: string | undefined) {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

function getJwtSecret(c: { env: Bindings }) {
  if (!c.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return c.env.JWT_SECRET;
}

export const requireAuth: MiddlewareHandler<{ Bindings: Bindings; Variables: AuthVariables }> = async (
  c,
  next
) => {
  try {
    const token = extractToken(c.req.header("Authorization"));
    if (!token) return c.json({ success: false, message: "Unauthorized" }, 401);

    const payload = await verifyJwt(token, getJwtSecret(c));
    c.set("user", payload);
    await next();
  } catch (error) {
    console.error("Auth error:", error);
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
};

export async function tryGetAuthUser(c: { req: { header: (name: string) => string | undefined }; env: Bindings }) {
  const token = extractToken(c.req.header("Authorization"));
  if (!token) return null;

  try {
    return await verifyJwt(token, getJwtSecret(c));
  } catch (error) {
    console.warn("Optional auth failed:", error);
    return null;
  }
}
