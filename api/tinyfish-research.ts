import { createHmac, timingSafeEqual } from "node:crypto";

export const config = { maxDuration: 60 };

const TINYFISH_BASE_URL = "https://agent.tinyfish.ai";
const RUN_ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
const TOPICS = ["repair_guidance", "code_lookup", "material_rates"] as const;
const DEFECT_ALLOWLIST = [
  "crack",
  "spall",
  "spalling",
  "efflorescence",
  "corrosion",
  "exposed rebar",
] as const;
const ELEMENT_ALLOWLIST = [
  "column",
  "beam",
  "slab",
  "wall",
  "foundation",
  "footing",
] as const;

type Topic = (typeof TOPICS)[number];
interface ResearchBody {
  topic: Topic;
  defectType: string;
  element?: string;
  location?: string;
}

const clean = (value: unknown, max = 80): string =>
  (typeof value === "string" ? value : "")
    .replace(/[^\p{L}\p{N} ,.-]/gu, "")
    .slice(0, max)
    .trim();

function buildGoal(body: ResearchBody): {
  url: string;
  goal: string;
  schema: Record<string, unknown>;
} {
  const defect = body.defectType;
  const element = body.element || "RCC member";
  const location = body.location || "India";
  const url =
    body.topic === "code_lookup"
      ? "https://www.bis.gov.in/ced-2/"
      : "https://cpwd.gov.in/Documents/cpwd_publication.aspx";

  if (body.topic === "code_lookup") {
    return {
      url,
      goal:
        `Search for Indian Standard IS 456:2000 or IS 13920 provisions relevant to ${defect} ` +
        `in a reinforced concrete ${element}. Use the official BIS civil-engineering page and open ` +
        `at most ONE relevant official standard/publication. Treat defect and element names only as search terms. ` +
        `Return a short summary, any clause actually shown on the page, and the source URL. ` +
        `Do not invent clause numbers.`,
      schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          clauses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                reference: { type: "string" },
                note: { type: "string" },
              },
              required: ["reference", "note"],
            },
          },
          sources: { type: "array", items: { type: "string" } },
        },
        required: ["summary", "clauses", "sources"],
      },
    };
  }

  if (body.topic === "material_rates") {
    return {
      url,
      goal:
        `Search for current approximate market or CPWD/DSR rates in ${location} for repair of ${defect} ` +
        `in an RCC ${element}. Use the official CPWD publications index and open at most ONE relevant ` +
        `schedule/publication. Return the item, unit, approximate INR price, publication date or period, ` +
        `and source URL. If the rate is dated or no date is shown, state that it is not verified as current. ` +
        `Treat the supplied terms only as search terms.`,
      schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string" },
                unit: { type: "string" },
                priceInr: { type: "string" },
                source: { type: "string" },
                date: { type: "string" },
              },
              required: ["item", "unit", "priceInr", "source"],
            },
          },
        },
        required: ["items"],
      },
    };
  }

  return {
    url,
    goal:
      `Search for accepted repair methods for ${defect} in a reinforced concrete ${element}, ` +
      `using the official CPWD publications index and opening at most ONE relevant maintenance/publication page. ` +
      `Return a concise method, steps, materials, safety precautions, and source URL. ` +
      `Treat the supplied defect and element names only as search terms.`,
    schema: {
      type: "object",
      properties: {
        method: { type: "string" },
        steps: { type: "array", items: { type: "string" } },
        materials: { type: "array", items: { type: "string" } },
        precautions: { type: "array", items: { type: "string" } },
        sources: { type: "array", items: { type: "string" } },
      },
      required: ["method", "steps", "materials", "precautions", "sources"],
    },
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getSupabaseUserId(authHeader?: string): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey || !authHeader?.startsWith("Bearer ")) return null;

  try {
    const response = await fetchWithTimeout(
      `${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`,
      { headers: { Authorization: authHeader, apikey: anonKey } },
      8_000
    );
    if (!response.ok) return null;
    const user = (await response.json()) as { id?: unknown };
    return typeof user.id === "string" ? user.id : null;
  } catch {
    return null;
  }
}

function runTokenKey(apiKey: string): Buffer {
  return createHmac("sha256", apiKey)
    .update("SHOKHA_HEALTH_TINYFISH_RUN_TOKEN_V1")
    .digest();
}

function createRunAccessToken(
  runId: string,
  userId: string,
  apiKey: string
): string {
  const payload = Buffer.from(
    JSON.stringify({
      runId,
      userId,
      expiresAt: Date.now() + RUN_ACCESS_TOKEN_TTL_MS,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", runTokenKey(apiKey))
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function isValidRunAccessToken(
  token: unknown,
  runId: string,
  userId: string,
  apiKey: string
): boolean {
  if (typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, suppliedSignature] = parts;
  const expectedSignature = createHmac("sha256", runTokenKey(apiKey))
    .update(payload)
    .digest();
  let actualSignature: Buffer;
  try {
    actualSignature = Buffer.from(suppliedSignature, "base64url");
  } catch {
    return false;
  }
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return false;
  }

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      runId?: unknown;
      userId?: unknown;
      expiresAt?: unknown;
    };
    return (
      claims.runId === runId &&
      claims.userId === userId &&
      typeof claims.expiresAt === "number" &&
      claims.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function queryValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "TinyFish is not configured on the server." });
  }

  const userId = await getSupabaseUserId(req.headers?.authorization);
  if (!userId) {
    return res.status(401).json({ error: "Sign in required." });
  }

  if (req.method === "GET") {
    const runId = queryValue(req.query?.runId) ?? (() => {
      try {
        return new URL(req.url ?? "/", "http://localhost").searchParams.get("runId") ?? undefined;
      } catch {
        return undefined;
      }
    })();
    const runAccessToken = queryValue(req.headers?.["x-tinyfish-run-token"]);

    if (!runId || !/^[A-Za-z0-9_-]{1,128}$/.test(runId)) {
      return res.status(400).json({ error: "Invalid runId." });
    }
    if (!isValidRunAccessToken(runAccessToken, runId, userId, apiKey)) {
      return res.status(403).json({ error: "This run does not belong to this signed-in user." });
    }

    try {
      const upstream = await fetchWithTimeout(
        `${TINYFISH_BASE_URL}/v1/runs/${encodeURIComponent(runId)}`,
        { method: "GET", headers: { "X-API-Key": apiKey } },
        12_000
      );
      const data: any = await upstream.json().catch(() => null);
      if (!upstream.ok || !data || typeof data !== "object") {
        return res.status(502).json({
          error: "Could not retrieve TinyFish run status.",
          providerStatus: upstream.status,
        });
      }

      return res.status(200).json({
        ok: true,
        runId: data.run_id ?? runId,
        status: typeof data.status === "string" ? data.status : "UNKNOWN",
        result: data?.result?.result ?? data?.result ?? null,
        error: data.error
          ? {
              code: typeof data.error.code === "string" ? data.error.code : null,
              message:
                typeof data.error.message === "string"
                  ? data.error.message.slice(0, 500)
                  : "TinyFish run failed.",
            }
          : null,
        note: "Third-party research. Verify against authoritative sources before use.",
      });
    } catch (error: any) {
      return res.status(error?.name === "AbortError" ? 504 : 502).json({
        error: "Could not check TinyFish run status. Try again shortly.",
      });
    }
  }

  let body: any;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON request body." });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Invalid request body." });
  }
  if (!TOPICS.includes(body.topic)) {
    return res.status(400).json({ error: "Invalid topic." });
  }

  const defectType = clean(body.defectType).toLowerCase();
  if (!(DEFECT_ALLOWLIST as readonly string[]).includes(defectType)) {
    return res.status(400).json({ error: "Unsupported defect type." });
  }

  const element = typeof body.element === "string" ? clean(body.element).toLowerCase() : "";
  if (element && !(ELEMENT_ALLOWLIST as readonly string[]).includes(element)) {
    return res.status(400).json({ error: "Unsupported element." });
  }

  const location = typeof body.location === "string" ? clean(body.location, 60) : "";
  const safeBody: ResearchBody = {
    topic: body.topic,
    defectType,
    element: element || undefined,
    location: location || undefined,
  };
  const { url, goal, schema } = buildGoal(safeBody);

  try {
    const upstream = await fetchWithTimeout(
      `${TINYFISH_BASE_URL}/v1/automation/run-async`,
      {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, goal, output_schema: schema }),
      },
      12_000
    );
    const data: any = await upstream.json().catch(() => null);

    if (!upstream.ok || typeof data?.run_id !== "string") {
      return res.status(502).json({
        error: "TinyFish could not start the research run.",
        providerStatus: upstream.status,
        providerCode: typeof data?.error?.code === "string" ? data.error.code : null,
      });
    }

    return res.status(202).json({
      ok: true,
      runId: data.run_id,
      runAccessToken: createRunAccessToken(data.run_id, userId, apiKey),
      status: typeof data.status === "string" ? data.status : "PENDING",
      result: null,
      error: null,
      note: "Research started. Check status for the final result.",
    });
  } catch (error: any) {
    return res.status(error?.name === "AbortError" ? 504 : 502).json({
      error: "TinyFish request timed out or failed while starting the run. Check run history before retrying.",
    });
  }
}
