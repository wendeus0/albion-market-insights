import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  dataSourceManager,
  isDevEnvironment,
  shouldUseMockFallback,
  type DataSourceStatus,
} from "@/services/dataSource.manager";

describe("dataSource.manager", () => {
  beforeEach(() => {
    // Reset to mock state before each test
    dataSourceManager.setMock();
  });

  describe("getStatus", () => {
    it("should return mock state by default", () => {
      const status = dataSourceManager.getStatus();
      expect(status.state).toBe("mock");
      expect(status.lastError).toBeUndefined();
      expect(status.lastSuccessfulFetch).toBeUndefined();
    });

    it("should return real state after setReal", () => {
      dataSourceManager.setReal();
      const status = dataSourceManager.getStatus();
      expect(status.state).toBe("real");
      expect(status.lastSuccessfulFetch).toBeInstanceOf(Date);
    });

    it("should return degraded state after setDegraded", () => {
      dataSourceManager.setDegraded("API timeout");
      const status = dataSourceManager.getStatus();
      expect(status.state).toBe("degraded");
      expect(status.lastError).toBe("API timeout");
    });

    it("should return independent copies of status", () => {
      const status1 = dataSourceManager.getStatus();
      dataSourceManager.setReal();
      const status2 = dataSourceManager.getStatus();
      expect(status1.state).toBe("mock");
      expect(status2.state).toBe("real");
    });
  });

  describe("subscribe", () => {
    it("should notify subscribers when state changes", () => {
      const listener = vi.fn();
      dataSourceManager.subscribe(listener);

      dataSourceManager.setReal();
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          state: "real",
          lastSuccessfulFetch: expect.any(Date),
        }),
      );
    });

    it("should allow unsubscribing", () => {
      const listener = vi.fn();
      const unsubscribe = dataSourceManager.subscribe(listener);

      unsubscribe();
      dataSourceManager.setReal();
      expect(listener).not.toHaveBeenCalled();
    });

    it("should support multiple subscribers", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      dataSourceManager.subscribe(listener1);
      dataSourceManager.subscribe(listener2);

      dataSourceManager.setDegraded("Error");

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe("state transitions", () => {
    it("should transition from mock to real", () => {
      expect(dataSourceManager.getStatus().state).toBe("mock");
      dataSourceManager.setReal();
      expect(dataSourceManager.getStatus().state).toBe("real");
    });

    it("should transition from real to degraded", () => {
      dataSourceManager.setReal();
      expect(dataSourceManager.getStatus().state).toBe("real");

      dataSourceManager.setDegraded("Connection lost");
      const status = dataSourceManager.getStatus();
      expect(status.state).toBe("degraded");
      expect(status.lastError).toBe("Connection lost");
      expect(status.lastSuccessfulFetch).toBeUndefined();
    });

    it("should transition from degraded to real", () => {
      dataSourceManager.setDegraded("Error");
      expect(dataSourceManager.getStatus().state).toBe("degraded");

      dataSourceManager.setReal();
      const status = dataSourceManager.getStatus();
      expect(status.state).toBe("real");
      expect(status.lastError).toBeUndefined();
    });

    it("should update lastSuccessfulFetch on setReal", () => {
      const before = new Date();
      dataSourceManager.setReal();
      const after = new Date();

      const status = dataSourceManager.getStatus();
      expect(status.lastSuccessfulFetch!.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(status.lastSuccessfulFetch!.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });
  });
});

describe("isDevEnvironment", () => {
  it("should detect test environment correctly", () => {
    // In test environment (Vitest), MODE is 'test'
    expect(isDevEnvironment()).toBe(true);
  });

  it("should detect dev environment when DEV is true", () => {
    const originalDev = import.meta.env.DEV;
    vi.stubEnv("DEV", true);
    vi.stubEnv("MODE", "development");

    expect(isDevEnvironment()).toBe(true);

    vi.unstubAllEnvs();
  });
});

describe("shouldUseMockFallback", () => {
  it("should return true in test environment", () => {
    // In test environment, should return true
    expect(shouldUseMockFallback()).toBe(true);
  });
});
