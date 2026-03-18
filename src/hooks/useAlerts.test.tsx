import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAlerts, useSaveAlert, useDeleteAlert } from "./useAlerts";
import { marketService } from "@/services";
import type { Alert } from "@/data/types";

// Mock the market service
vi.mock("@/services", () => ({
  marketService: {
    getAlerts: vi.fn(),
    saveAlert: vi.fn(),
    deleteAlert: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe("useAlerts", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe("useAlerts hook", () => {
    it("deve retornar lista vazia quando não há alertas", async () => {
      vi.mocked(marketService.getAlerts).mockResolvedValue([]);

      const { result } = renderHook(() => useAlerts(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it("deve retornar alertas do serviço", async () => {
      const mockAlerts: Alert[] = [
        {
          id: "1",
          itemId: "T4_BAG",
          itemName: "Bag",
          city: "Caerleon",
          condition: "below",
          threshold: 1000,
          isActive: true,
          createdAt: "2026-03-18T00:00:00Z",
          notifications: { inApp: true, email: false },
        },
      ];
      vi.mocked(marketService.getAlerts).mockResolvedValue(mockAlerts);

      const { result } = renderHook(() => useAlerts(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAlerts);
    });

    it("deve indicar loading durante fetch", async () => {
      vi.mocked(marketService.getAlerts).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useAlerts(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("deve retornar erro quando fetch falha", async () => {
      vi.mocked(marketService.getAlerts).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAlerts(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useSaveAlert hook", () => {
    it("deve salvar alerta com sucesso", async () => {
      const mockAlert: Alert = {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1000,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      };
      vi.mocked(marketService.saveAlert).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSaveAlert(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync(mockAlert);

      expect(marketService.saveAlert).toHaveBeenCalledWith(mockAlert);
    });

    it("deve chamar saveAlert com alerta correto", async () => {
      const mockAlert: Alert = {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1000,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      };
      vi.mocked(marketService.saveAlert).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSaveAlert(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync(mockAlert);

      // Verify the service was called with correct data
      expect(marketService.saveAlert).toHaveBeenCalledWith(mockAlert);
      expect(marketService.saveAlert).toHaveBeenCalledTimes(1);
    });

    it("deve retornar erro quando salvamento falha", async () => {
      const mockAlert: Alert = {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1000,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      };
      vi.mocked(marketService.saveAlert).mockRejectedValue(
        new Error("Save failed")
      );

      const { result } = renderHook(() => useSaveAlert(), {
        wrapper: createWrapper(queryClient),
      });

      await expect(result.current.mutateAsync(mockAlert)).rejects.toThrow(
        "Save failed"
      );
    });
  });

  describe("useDeleteAlert hook", () => {
    it("deve deletar alerta com sucesso", async () => {
      vi.mocked(marketService.deleteAlert).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteAlert(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync("alert-id-123");

      expect(marketService.deleteAlert).toHaveBeenCalledWith("alert-id-123");
    });

    it("deve chamar deleteAlert com id correto", async () => {
      vi.mocked(marketService.deleteAlert).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteAlert(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync("alert-id-123");

      // Verify the service was called with correct id
      expect(marketService.deleteAlert).toHaveBeenCalledWith("alert-id-123");
      expect(marketService.deleteAlert).toHaveBeenCalledTimes(1);
    });

    it("deve retornar erro quando deleção falha", async () => {
      vi.mocked(marketService.deleteAlert).mockRejectedValue(
        new Error("Delete failed")
      );

      const { result } = renderHook(() => useDeleteAlert(), {
        wrapper: createWrapper(queryClient),
      });

      await expect(result.current.mutateAsync("alert-id-123")).rejects.toThrow(
        "Delete failed"
      );
    });
  });
});
