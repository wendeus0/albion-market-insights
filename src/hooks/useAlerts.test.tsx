import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAlerts, useSaveAlert, useDeleteAlert, getAlertsQueryKey } from "./useAlerts";
import { marketService } from "@/services";
import type { Alert } from "@/data/types";

vi.mock("@/services", () => ({
  marketService: {
    getAlerts: vi.fn(),
    saveAlert: vi.fn(),
    deleteAlert: vi.fn(),
  },
}));

vi.mock("@/contexts/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: null })),
}));

import { useAuth } from "@/contexts/useAuth";

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
    vi.mocked(useAuth).mockReturnValue({ user: null } as never);
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe("useAlerts hook", () => {
    it("deve usar query key isolada por usuario anonimo", async () => {
      vi.mocked(marketService.getAlerts).mockResolvedValue([]);

      renderHook(() => useAlerts(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(queryClient.getQueryState(getAlertsQueryKey(null))).toBeDefined();
      });
    });

    it("deve retornar lista vazia quando não há alertas", async () => {
      vi.mocked(marketService.getAlerts).mockResolvedValue([]);

      const { result } = renderHook(() => useAlerts(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(false);
        expect(result.current.data).toEqual([]);
      });
    });

    it("deve retornar alertas do serviço", async () => {
      vi.mocked(useAuth).mockReturnValue({ user: { id: "user-123" } } as never);
      const mockAlerts: Alert[] = [
        {
          id: "1",
          itemId: "T4_BAG",
          itemName: "Bag",
          quality: "Normal",
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
      expect(queryClient.getQueryData(getAlertsQueryKey("user-123"))).toEqual(mockAlerts);
    });

    it("deve indicar loading durante fetch", () => {
      vi.mocked(marketService.getAlerts).mockImplementation(
        () => new Promise(() => {}),
      );

      const { result } = renderHook(() => useAlerts(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("deve retornar erro quando fetch falha", async () => {
      vi.mocked(marketService.getAlerts).mockRejectedValue(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useAlerts(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe("useSaveAlert hook", () => {
    const mockAlert: Alert = {
      id: "1",
      itemId: "T4_BAG",
      itemName: "Bag",
      quality: "Normal",
      city: "Caerleon",
      condition: "below",
      threshold: 1000,
      isActive: true,
      createdAt: "2026-03-18T00:00:00Z",
      notifications: { inApp: true, email: false },
    };

    it("deve salvar alerta com sucesso", async () => {
      vi.mocked(marketService.saveAlert).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSaveAlert(), {
        wrapper: createWrapper(queryClient),
      });

      await result.current.mutateAsync(mockAlert);
      expect(marketService.saveAlert).toHaveBeenCalledWith(mockAlert);
    });

    it("deve retornar erro quando salvamento falha", async () => {
      vi.mocked(marketService.saveAlert).mockRejectedValue(
        new Error("Save failed"),
      );

      const { result } = renderHook(() => useSaveAlert(), {
        wrapper: createWrapper(queryClient),
      });

      await expect(result.current.mutateAsync(mockAlert)).rejects.toThrow(
        "Save failed",
      );
    });

    it("deve atualizar cache local imediatamente ao salvar", async () => {
      const updatedAlert: Alert = { ...mockAlert, isActive: false };
      let resolveMutation!: () => void;
      vi.mocked(marketService.saveAlert).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveMutation = resolve;
          }),
      );
      queryClient.setQueryData(["alerts"], [mockAlert]);
      queryClient.setQueryData(getAlertsQueryKey(null), [mockAlert]);

      const { result } = renderHook(() => useSaveAlert(), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        result.current.mutate(updatedAlert);
      });

      await waitFor(() => {
        expect(queryClient.getQueryData(getAlertsQueryKey(null))).toEqual([updatedAlert]);
      });

      act(() => {
        resolveMutation();
      });
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

    it("deve retornar erro quando deleção falha", async () => {
      vi.mocked(marketService.deleteAlert).mockRejectedValue(
        new Error("Delete failed"),
      );

      const { result } = renderHook(() => useDeleteAlert(), {
        wrapper: createWrapper(queryClient),
      });

      await expect(result.current.mutateAsync("alert-id-123")).rejects.toThrow(
        "Delete failed",
      );
    });

    it("deve remover alerta do cache local imediatamente ao deletar", async () => {
      const existingAlert: Alert = {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        quality: "Normal",
        city: "Caerleon",
        condition: "below",
        threshold: 1000,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      };
      let resolveMutation!: () => void;
      vi.mocked(marketService.deleteAlert).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveMutation = resolve;
          }),
      );
      queryClient.setQueryData(["alerts"], [existingAlert]);
      queryClient.setQueryData(getAlertsQueryKey(null), [existingAlert]);

      const { result } = renderHook(() => useDeleteAlert(), {
        wrapper: createWrapper(queryClient),
      });

      act(() => {
        result.current.mutate("1");
      });

      await waitFor(() => {
        expect(queryClient.getQueryData(getAlertsQueryKey(null))).toEqual([]);
      });

      act(() => {
        resolveMutation();
      });
    });
  });
});
