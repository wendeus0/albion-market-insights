import { describe, expect, it } from "vitest";
import { toast } from "@/components/ui/sonnerToast";
import { toast as sonnerToast } from "sonner";

describe("ui/sonner contract", () => {
  it("reexporta toast do sonner para consumo interno padronizado", () => {
    expect(toast).toBeDefined();
    expect(toast).toBe(sonnerToast);
  });
});

