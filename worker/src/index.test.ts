import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Globals mock (antes do import do worker) ──────────────────────────────────

const mockCacheStore = new Map<string, Response>();
const mockCache = {
  match: vi.fn(async (req: Request) => {
    const res = mockCacheStore.get(req.url);
    return res ? res.clone() : undefined;
  }),
  put: vi.fn(async (req: Request, res: Response) => {
    mockCacheStore.set(req.url, res.clone());
  }),
  delete: vi.fn(),
};

vi.stubGlobal("caches", { default: mockCache });

// ── Import do worker (após globals) ──────────────────────────────────────────

import worker from "./index";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ENV = {
  ALBION_API_BASE_URL:
    "https://west.albion-online-data.com/api/v2/stats/prices",
};
const CTX = {
  waitUntil: vi.fn(),
  passThroughOnException: vi.fn(),
};

const SAMPLE_DATA = [
  {
    item_id: "T4_BAG",
    city: "Caerleon",
    sell_price_min: 1000,
    buy_price_max: 900,
    quality: 1,
  },
];

function makeReq(
  path: string,
  options: RequestInit = {},
  ip = "1.2.3.4",
): Request {
  const headers = new Headers((options.headers as HeadersInit | undefined) ?? {});
  headers.set("CF-Connecting-IP", ip);
  return new Request(`http://worker${path}`, { ...options, headers });
}

function albionOk(): Response {
  return new Response(JSON.stringify(SAMPLE_DATA), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function resetCacheMocks() {
  mockCacheStore.clear();
  vi.clearAllMocks();
  mockCache.match.mockImplementation(async (req: Request) => {
    const res = mockCacheStore.get(req.url);
    return res ? res.clone() : undefined;
  });
  mockCache.put.mockImplementation(async (req: Request, res: Response) => {
    mockCacheStore.set(req.url, res.clone());
  });
}

// ── AC-1 — Worker serve dados de preço com CORS ───────────────────────────────

describe("AC-1 — Worker serve dados de preço com CORS", () => {
  beforeEach(resetCacheMocks);

  it("deve retornar 200 com array JSON para GET /api/market/prices com parâmetros válidos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(albionOk()));

    const res = await worker.fetch(
      makeReq("/api/market/prices?items=T4_BAG&locations=Caerleon&qualities=1"),
      ENV,
      CTX,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ item_id: "T4_BAG", city: "Caerleon" });
  });

  it("deve incluir Access-Control-Allow-Origin: * na resposta", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(albionOk()));

    const res = await worker.fetch(
      makeReq("/api/market/prices?items=T4_BAG&locations=Caerleon"),
      ENV,
      CTX,
    );

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("deve incluir X-Cache: MISS na primeira requisição (cache vazio)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(albionOk()));

    const res = await worker.fetch(
      makeReq("/api/market/prices?items=T4_BAG&locations=Caerleon"),
      ENV,
      CTX,
    );

    expect(res.headers.get("X-Cache")).toBe("MISS");
  });

  it("deve retornar 200 com headers CORS para OPTIONS /api/market/prices (preflight)", async () => {
    const res = await worker.fetch(
      makeReq("/api/market/prices", { method: "OPTIONS" }),
      ENV,
      CTX,
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBeTruthy();
    expect(res.headers.get("Access-Control-Allow-Headers")).toBeTruthy();
  });

  it("deve chamar a API Albion com os parâmetros recebidos", async () => {
    const mockFetch = vi.fn().mockResolvedValue(albionOk());
    vi.stubGlobal("fetch", mockFetch);

    await worker.fetch(
      makeReq(
        "/api/market/prices?items=T4_BAG,T5_BAG&locations=Caerleon,Bridgewatch&qualities=1",
      ),
      ENV,
      CTX,
    );

    expect(mockFetch).toHaveBeenCalledOnce();
    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("T4_BAG");
    expect(calledUrl).toContain("Caerleon");
  });
});

// ── AC-2 — Cache compartilhado com TTL de 5 minutos ──────────────────────────

describe("AC-2 — Cache compartilhado com TTL de 5 minutos", () => {
  beforeEach(resetCacheMocks);

  it("deve buscar a API Albion na primeira requisição (MISS)", async () => {
    const mockFetch = vi.fn().mockResolvedValue(albionOk());
    vi.stubGlobal("fetch", mockFetch);

    const res = await worker.fetch(
      makeReq("/api/market/prices?items=T4_BAG&locations=Caerleon"),
      ENV,
      CTX,
    );

    expect(mockFetch).toHaveBeenCalledOnce();
    expect(res.headers.get("X-Cache")).toBe("MISS");
  });

  it("deve retornar X-Cache: HIT e não chamar a API Albion na segunda requisição idêntica", async () => {
    const mockFetch = vi.fn().mockResolvedValue(albionOk());
    vi.stubGlobal("fetch", mockFetch);

    const path = "/api/market/prices?items=T4_BAG&locations=Caerleon";

    // Primeira requisição popula o cache
    const res1 = await worker.fetch(makeReq(path), ENV, CTX);
    expect(res1.headers.get("X-Cache")).toBe("MISS");

    // Segunda requisição deve vir do cache
    const res2 = await worker.fetch(makeReq(path), ENV, CTX);
    expect(res2.headers.get("X-Cache")).toBe("HIT");
    expect(mockFetch).toHaveBeenCalledOnce(); // somente 1 chamada upstream
  });

  it("deve persistir a resposta na Cache API com Cache-Control: max-age=300", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(albionOk()));

    await worker.fetch(
      makeReq("/api/market/prices?items=T4_BAG&locations=Caerleon"),
      ENV,
      CTX,
    );

    expect(mockCache.put).toHaveBeenCalledOnce();
    const [, cachedResponse] = mockCache.put.mock.calls[0] as [Request, Response];
    expect(cachedResponse.headers.get("Cache-Control")).toContain("max-age=300");
  });

  it("deve retornar 200 com o body correto mesmo em cache HIT", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(albionOk()));

    const path = "/api/market/prices?items=T4_BAG&locations=Caerleon";
    await worker.fetch(makeReq(path), ENV, CTX); // popula cache

    const res = await worker.fetch(makeReq(path), ENV, CTX);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

// ── AC-3 — Deduplicação de requests concorrentes ─────────────────────────────

describe("AC-3 — Deduplicação de requests concorrentes", () => {
  beforeEach(resetCacheMocks);

  it("deve chamar a API Albion apenas 1 vez quando N requisições chegam simultaneamente", async () => {
    let resolveUpstream!: (v: Response) => void;
    const upstreamPromise = new Promise<Response>(
      (r) => (resolveUpstream = r),
    );
    const mockFetch = vi.fn().mockReturnValue(upstreamPromise);
    vi.stubGlobal("fetch", mockFetch);

    const path = "/api/market/prices?items=T4_BAG&locations=Caerleon";
    const N = 5;

    // Lança N requisições simultaneamente (sem await)
    const pending = Array.from({ length: N }, () =>
      worker.fetch(makeReq(path, {}, "10.0.0.1"), ENV, CTX),
    );

    // Resolve o upstream
    resolveUpstream(albionOk());
    const results = await Promise.all(pending);

    // Somente 1 chamada upstream deve ter sido feita
    expect(mockFetch).toHaveBeenCalledOnce();

    // Todas as N respostas devem ser bem-sucedidas
    for (const res of results) {
      expect(res.status).toBe(200);
    }
  });

  it("deve limpar o Map de Promises após a resposta (sem vazamento entre ciclos)", async () => {
    const mockFetch = vi.fn().mockResolvedValue(albionOk());
    vi.stubGlobal("fetch", mockFetch);

    const path = "/api/market/prices?items=T4_BAG&locations=Caerleon&cycle=isolation";

    // Primeiro ciclo
    await worker.fetch(makeReq(path, {}, "10.0.0.2"), ENV, CTX);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Segundo ciclo: cache hit, mas o Map deve estar vazio
    // (se não estivesse limpo, não chamaria fetch novamente — mas o cache também previne)
    // Limpa o cache para forçar novo upstream
    mockCacheStore.clear();

    await worker.fetch(makeReq(path, {}, "10.0.0.2"), ENV, CTX);
    expect(mockFetch).toHaveBeenCalledTimes(2); // novo ciclo = novo fetch
  });
});

// ── AC-4 — Rate limit básico por IP ──────────────────────────────────────────

describe("AC-4 — Rate limit básico por IP", () => {
  beforeEach(resetCacheMocks);

  it("deve retornar 429 quando IP excede 30 requisições em 60 segundos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(albionOk()));

    const ip = "192.168.1.1";
    const path = "/api/market/prices?items=T4_BAG&locations=Caerleon";

    // 30 requisições dentro do limite
    for (let i = 0; i < 30; i++) {
      const res = await worker.fetch(makeReq(path, {}, ip), ENV, CTX);
      expect(res.status).not.toBe(429);
    }

    // 31ª requisição deve ser bloqueada
    const limited = await worker.fetch(makeReq(path, {}, ip), ENV, CTX);
    expect(limited.status).toBe(429);
  });

  it("deve incluir Retry-After: 60 na resposta 429", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(albionOk()));

    const ip = "192.168.1.2";
    const path = "/api/market/prices?items=T4_BAG&locations=Caerleon";

    for (let i = 0; i < 30; i++) {
      await worker.fetch(makeReq(path, {}, ip), ENV, CTX);
    }

    const limited = await worker.fetch(makeReq(path, {}, ip), ENV, CTX);
    expect(limited.headers.get("Retry-After")).toBe("60");
  });

  it("deve atender normalmente IPs diferentes sem degradação", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(albionOk()));

    const path = "/api/market/prices?items=T4_BAG&locations=Caerleon";

    const ipA = "10.1.1.1";
    const ipB = "10.1.1.2";

    for (let i = 0; i < 30; i++) {
      await worker.fetch(makeReq(path, {}, ipA), ENV, CTX);
    }

    // IP diferente não deve ser afetado pelo rate limit do IP anterior
    const res = await worker.fetch(makeReq(path, {}, ipB), ENV, CTX);
    expect(res.status).not.toBe(429);
  });
});

// ── AC-5 — Fallback controlado em erro da API ─────────────────────────────────

describe("AC-5 — Fallback controlado em erro da API", () => {
  beforeEach(resetCacheMocks);

  it("deve retornar 200 com stale:true quando API retorna 5xx e existe dado cacheado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(albionOk()));
    const path = "/api/market/prices?items=T4_BAG_STALE&locations=Caerleon";

    // Popula o cache (TTL e backup em memória)
    await worker.fetch(makeReq(path, {}, "20.0.0.1"), ENV, CTX);

    // Simula expiração do cache (TTL acabou) — backup em memória ainda existe
    mockCacheStore.clear();

    // Simula falha da API Albion
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Internal Server Error", { status: 500 }),
      ),
    );

    const res = await worker.fetch(makeReq(path, {}, "20.0.0.1"), ENV, CTX);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ stale: true });
  });

  it("deve retornar 503 com error:service_unavailable quando API retorna 5xx sem dado cacheado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Internal Server Error", { status: 500 }),
      ),
    );

    const res = await worker.fetch(
      makeReq("/api/market/prices?items=T4_BAG_MISS&locations=Caerleon"),
      ENV,
      CTX,
    );

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ error: "service_unavailable" });
  });

  it("deve retornar 503 quando API excede timeout de 15s e não há cache", async () => {
    // Simula timeout via AbortError
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("Timeout", "AbortError")),
    );

    const res = await worker.fetch(
      makeReq("/api/market/prices?items=T4_BAG_TIMEOUT&locations=Caerleon"),
      ENV,
      CTX,
    );

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ error: "service_unavailable" });
  });

  it("não deve propagar o status HTTP bruto da API Albion para o frontend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Bad Gateway", { status: 502 }),
      ),
    );

    const res = await worker.fetch(
      makeReq("/api/market/prices?items=T4_BAG_RAW&locations=Caerleon"),
      ENV,
      CTX,
    );

    // O Worker deve normalizar: 503 ou 200+stale, nunca 502
    expect([200, 503]).toContain(res.status);
    expect(res.status).not.toBe(502);
  });
});
