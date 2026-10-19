import "server-only";
import { headers } from "next/headers";

/**
 * Calls the optional FastAPI service (python-api/) on behalf of the signed-in user.
 * The browser's Better Auth cookie is forwarded; FastAPI validates it by asking this Next.js
 * app (/api/auth/get-session) and then enforces the role itself.
 */
export async function pythonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.PYTHON_API_URL ?? "http://localhost:8000";
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await fetch(`${base}${path}`, { ...init, headers: { ...init?.headers, cookie }, cache: "no-store" });
  if (!res.ok) throw new Error(`Python API ${res.status}`);
  return res.json() as Promise<T>;
}
