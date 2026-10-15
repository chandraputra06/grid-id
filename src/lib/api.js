import { supabase } from "./supabase";

// GRID.ID backend base URL, provided via NEXT_PUBLIC_API_URL.
const BASE = process.env.NEXT_PUBLIC_API_URL || "";

// Fetch wrapper: attaches the Supabase JWT, unwraps the { ok, data } envelope, throws clean errors.
async function request(path, { method = "GET", body, auth = true, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };

  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  if (auth) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, opts);

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok || !json || json.ok === false) {
    const err = new Error(json?.error?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = json?.error?.code || "error";
    throw err;
  }

  return json.data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  request,
};