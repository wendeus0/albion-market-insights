export interface Env {
  ALBION_API_BASE_URL: string;
}

const ALLOWED_ORIGINS = new Set([
  "https://albion-market-insights.pages.dev",
]);

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://albion-market-insights.pages.dev";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

// Rate limit: 30 req/min por IP
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

// Deduplicação de requests concorrentes
const pendingMap = new Map<string, Promise<string>>();

// Backup stale: último dado conhecido por chave (sobrevive à expiração do cache TTL)
const staleBackup = new Map<string, string>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

async function fetchUpstream(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

function jsonResponse(
  body: string,
  status: number,
  corsHeaders: Record<string, string>,
  extra: Record<string, string> = {},
): Response {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...extra,
    },
  });
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = getCorsHeaders(origin);

    if (url.pathname !== "/api/market/prices") {
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    }

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Rate limit por IP
    const ip =
      request.headers.get("CF-Connecting-IP") ??
      request.headers.get("X-Forwarded-For") ??
      "0.0.0.0";
    if (isRateLimited(ip)) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain",
          "Retry-After": "60",
        },
      });
    }

    // Normaliza a chave com apenas params conhecidos (evita crescimento ilimitado de Maps)
    const items = url.searchParams.get("items") ?? "";
    const normalizedParams = new URLSearchParams();
    for (const p of ["locations", "qualities"] as const) {
      const v = url.searchParams.get(p);
      if (v) normalizedParams.set(p, v);
    }
    const normalizedUrl = `${url.origin}${url.pathname}?items=${items}&${normalizedParams.toString()}`;
    // Albion API usa path-based format: /ITEM1,ITEM2.json?locations=...
    const albionUrl = `${env.ALBION_API_BASE_URL}/${items}.json?${normalizedParams.toString()}`;
    const key = normalizedUrl;

    // Verificação de cache (TTL 5 min) — usa URL normalizada como chave
    const cacheKey = new Request(normalizedUrl, { method: "GET" });
    const cached = await caches.default.match(cacheKey);
    if (cached) {
      const body = await cached.text();
      return jsonResponse(body, 200, corsHeaders, { "X-Cache": "HIT" });
    }

    // Deduplicação: reusa Promise em voo para a mesma chave
    let bodyPromise = pendingMap.get(key);

    if (!bodyPromise) {
      bodyPromise = fetchUpstream(albionUrl).then((body) => {
        staleBackup.set(key, body);
        const cacheResponse = new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "max-age=300",
          },
        });
        ctx.waitUntil(caches.default.put(cacheKey, cacheResponse));
        return body;
      });

      pendingMap.set(key, bodyPromise);
      bodyPromise.finally(() => pendingMap.delete(key)).catch(() => {});
    }

    try {
      const body = await bodyPromise;
      return jsonResponse(body, 200, corsHeaders, { "X-Cache": "MISS" });
    } catch {
      // Fallback: dado stale em memória
      const staleBody = staleBackup.get(key);
      if (staleBody) {
        try {
          const staleData: unknown = JSON.parse(staleBody);
          return jsonResponse(
            JSON.stringify({ data: staleData, stale: true }),
            200,
            corsHeaders,
          );
        } catch {
          // staleBody corrompido — cai no 503 abaixo
        }
      }
      return jsonResponse(
        JSON.stringify({ error: "service_unavailable" }),
        503,
        corsHeaders,
      );
    }
  },
};
