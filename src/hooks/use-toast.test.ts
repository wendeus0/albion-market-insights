import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { reducer, toast, useToast, _resetToastState } from "./use-toast";
import type { ToastProps } from "@/components/ui/toast";

interface TestToast extends ToastProps {
  id: string;
  title?: string;
  open: boolean;
}

describe("use-toast", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Reset memory state between tests
    _resetToastState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("reducer", () => {
    it("deve adicionar toast ao estado vazio", () => {
      const initialState = { toasts: [] };
      const newToast: TestToast = {
        id: "1",
        title: "Test Toast",
        open: true,
      };

      const result = reducer(initialState, {
        type: "ADD_TOAST",
        toast: newToast,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0]).toEqual(newToast);
    });

    it("deve respeitar TOAST_LIMIT de 1 item", () => {
      const initialState = {
        toasts: [{ id: "1", title: "First", open: true }],
      };
      const newToast: TestToast = {
        id: "2",
        title: "Second",
        open: true,
      };

      const result = reducer(initialState, {
        type: "ADD_TOAST",
        toast: newToast,
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("2");
    });

    it("deve atualizar toast existente", () => {
      const initialState = {
        toasts: [{ id: "1", title: "Old Title", open: true }],
      };

      const result = reducer(initialState, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "New Title" },
      });

      expect(result.toasts[0].title).toBe("New Title");
      expect(result.toasts).toHaveLength(1);
    });

    it("deve manter outros toasts inalterados ao atualizar", () => {
      const initialState = {
        toasts: [
          { id: "1", title: "First", open: true },
          { id: "2", title: "Second", open: true },
        ],
      };

      const result = reducer(initialState, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "Updated First" },
      });

      expect(result.toasts[0].title).toBe("Updated First");
      expect(result.toasts[1].title).toBe("Second");
    });

    it("deve marcar toast específico como fechado em DISMISS_TOAST", () => {
      const initialState = {
        toasts: [{ id: "1", title: "Test", open: true }],
      };

      const result = reducer(initialState, {
        type: "DISMISS_TOAST",
        toastId: "1",
      });

      expect(result.toasts[0].open).toBe(false);
    });

    it("deve marcar todos toasts como fechados quando toastId não fornecido", () => {
      const initialState = {
        toasts: [
          { id: "1", title: "First", open: true },
          { id: "2", title: "Second", open: true },
        ],
      };

      const result = reducer(initialState, {
        type: "DISMISS_TOAST",
      });

      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[1].open).toBe(false);
    });

    it("deve remover toast específico", () => {
      const initialState = {
        toasts: [
          { id: "1", title: "First", open: false },
          { id: "2", title: "Second", open: false },
        ],
      };

      const result = reducer(initialState, {
        type: "REMOVE_TOAST",
        toastId: "1",
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("2");
    });

    it("deve remover todos toasts quando toastId não fornecido", () => {
      const initialState = {
        toasts: [
          { id: "1", title: "First", open: false },
          { id: "2", title: "Second", open: false },
        ],
      };

      const result = reducer(initialState, {
        type: "REMOVE_TOAST",
      });

      expect(result.toasts).toHaveLength(0);
    });
  });

  describe("toast function", () => {
    it("deve criar toast com id gerado", () => {
      const result = toast({ title: "Test Toast" });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
    });

    it("deve retornar funções dismiss e update", () => {
      const result = toast({ title: "Test Toast" });

      expect(result.dismiss).toBeInstanceOf(Function);
      expect(result.update).toBeInstanceOf(Function);
    });

    it("deve permitir atualizar toast criado", () => {
      const { id, update } = toast({ title: "Original" });

      act(() => {
        update({ id, title: "Updated" });
      });

      // Toast foi atualizado no estado global
      const { result } = renderHook(() => useToast());
      expect(result.current.toasts[0]?.title).toBe("Updated");
    });

    it("deve permitir dismiss de toast criado", () => {
      const { id, dismiss } = toast({ title: "Test" });

      act(() => {
        dismiss();
      });

      const { result } = renderHook(() => useToast());
      expect(result.current.toasts[0]?.open).toBe(false);
    });
  });

  describe("useToast hook", () => {
    it("deve retornar estado inicial vazio", () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });

    it("deve retornar função toast", () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toast).toBeInstanceOf(Function);
    });

    it("deve retornar função dismiss", () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.dismiss).toBeInstanceOf(Function);
    });

    it("deve atualizar estado quando toast é adicionado", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: "New Toast" });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe("New Toast");
    });

    it("deve remover listener ao desmontar", () => {
      const { unmount } = renderHook(() => useToast());

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });

    it("deve dismiss toast específico via hook", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: "Test" });
      });

      const toastId = result.current.toasts[0].id;

      act(() => {
        result.current.dismiss(toastId);
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it("deve dismiss todos toasts quando id não fornecido", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: "First" });
        // Wait a tick to get different id
        vi.advanceTimersByTime(1);
        result.current.toast({ title: "Second" });
      });

      act(() => {
        result.current.dismiss();
      });

      result.current.toasts.forEach((t) => {
        expect(t.open).toBe(false);
      });
    });
  });
});
