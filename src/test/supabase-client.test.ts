import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

import { createSupabaseClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

describe("createSupabaseClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve configurar flowType: pkce para suportar exchangeCodeForSession", () => {
    const url = "https://test.supabase.co";
    const anonKey = "test-anon-key";

    createSupabaseClient(url, anonKey);

    expect(createClient).toHaveBeenCalledWith(
      url,
      anonKey,
      expect.objectContaining({
        auth: expect.objectContaining({
          flowType: "pkce",
        }),
      }),
    );
  });

  it("deve configurar detectSessionInUrl: true para detectar sessao apos redirect OAuth", () => {
    const url = "https://test.supabase.co";
    const anonKey = "test-anon-key";

    createSupabaseClient(url, anonKey);

    expect(createClient).toHaveBeenCalledWith(
      url,
      anonKey,
      expect.objectContaining({
        auth: expect.objectContaining({
          detectSessionInUrl: true,
        }),
      }),
    );
  });
});
