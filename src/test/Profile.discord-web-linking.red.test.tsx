import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MockedFunction } from "vitest";

vi.mock("@/contexts/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/hooks/useProfile", () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
}));

vi.mock("@/hooks/useDiscordLink", () => ({
  useDiscordLink: vi.fn(),
}));

vi.mock("@/components/ui/sonnerToast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

import Profile from "@/pages/Profile";
import { useAuth } from "@/contexts/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useDiscordLink } from "@/hooks/useDiscordLink";

const mockedUseAuth = useAuth as MockedFunction<typeof useAuth>;
const mockedUseProfile = useProfile as MockedFunction<typeof useProfile>;
const mockedUseUpdateProfile = useUpdateProfile as MockedFunction<
  typeof useUpdateProfile
>;
const mockedUseDiscordLink = useDiscordLink as MockedFunction<
  typeof useDiscordLink
>;

function makeLinkedProfile(overrides?: Partial<ReturnType<typeof useProfile>>) {
  return {
    profile: {
      id: "user-123",
      discordId: "718633605345050734",
      discordUsername: "wendeus__#0",
      discordDmEnabled: true,
      discordWebhookUrl: "https://discord.com/api/webhooks/fallback",
      updatedAt: "2026-03-30T00:00:00.000Z",
    },
    isLoading: false,
    error: null,
    isError: false,
    ...overrides,
  };
}

function makeUnlinkedProfile(overrides?: Partial<ReturnType<typeof useProfile>>) {
  return {
    profile: {
      id: "user-123",
      discordId: null,
      discordUsername: null,
      discordDmEnabled: false,
      discordWebhookUrl: "https://discord.com/api/webhooks/fallback",
      updatedAt: "2026-03-30T00:00:00.000Z",
    },
    isLoading: false,
    error: null,
    isError: false,
    ...overrides,
  };
}

describe("Profile — discord-web-linking RED", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-123",
        email: "discord@example.com",
        app_metadata: { provider: "discord", providers: ["discord"] },
        user_metadata: {
          provider_id: "718633605345050734",
          sub: "718633605345050734",
          name: "wendeus__#0",
        },
      } as never,
      loading: false,
      isAuthenticated: true,
      signInWithDiscord: vi.fn(),
      signOut: vi.fn(),
    });

    mockedUseUpdateProfile.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    mockedUseDiscordLink.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      data: null,
    } as never);
  });

  it("should show a controlled pending message when discord session metadata is insufficient", () => {
    // RED: falha até discord-web-linking ser implementada
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-123",
        email: "discord@example.com",
        app_metadata: { provider: "discord", providers: ["discord"] },
        user_metadata: {},
      } as never,
      loading: false,
      isAuthenticated: true,
      signInWithDiscord: vi.fn(),
      signOut: vi.fn(),
    });
    mockedUseProfile.mockReturnValue(makeUnlinkedProfile() as never);

    render(<Profile />);

    expect(
      screen.getByText(/a vinculação não pôde ser concluída automaticamente/i),
    ).toBeInTheDocument();
  });

  it("should keep relogged users in a consistent linked state when the same discord account returns", () => {
    // RED: falha até discord-web-linking ser implementada
    mockedUseProfile.mockReturnValue(makeLinkedProfile() as never);

    render(<Profile />);

    expect(
      screen.getByText(/vinculado pelo login com discord/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/notificações por dm estão habilitadas/i),
    ).toBeInTheDocument();
  });

  it("should show friendly sync feedback and preserve webhook fallback when web linking reflection fails", () => {
    // RED: falha até discord-web-linking ser implementada
    mockedUseProfile.mockReturnValue(
      makeUnlinkedProfile({
        error: new Error("sync failed"),
        isError: true,
      }) as never,
    );

    render(<Profile />);

    expect(
      screen.getByText(/não foi possível concluir a vinculação agora/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/o webhook continua disponível como fallback/i),
    ).toBeInTheDocument();
  });

  it("should explain that discord linking now happens through app login instead of token copy flow", () => {
    // RED: falha até discord-web-linking ser implementada
    mockedUseProfile.mockReturnValue(makeUnlinkedProfile() as never);

    render(<Profile />);

    expect(
      screen.getByText(/a vinculação acontece pelo login no app/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/gere um token temporario/i),
    ).not.toBeInTheDocument();
  });

  it("should ask for confirmation before replacing an existing discord link with a different account", () => {
    // RED: falha até discord-web-linking ser implementada
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-123",
        email: "discord@example.com",
        app_metadata: { provider: "discord", providers: ["discord"] },
        user_metadata: {
          provider_id: "999999999999999999",
          sub: "999999999999999999",
          name: "other-account#0",
        },
      } as never,
      loading: false,
      isAuthenticated: true,
      signInWithDiscord: vi.fn(),
      signOut: vi.fn(),
    });
    mockedUseProfile.mockReturnValue(makeLinkedProfile() as never);

    render(<Profile />);

    expect(screen.getByText(/troca pendente/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirmar troca/i }),
    ).toBeInTheDocument();
  });

  it("should keep the profile unlinked and dms disabled when discord metadata is missing", () => {
    // RED: falha até discord-web-linking ser implementada
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-123",
        email: "discord@example.com",
        app_metadata: { provider: "discord", providers: ["discord"] },
        user_metadata: {},
      } as never,
      loading: false,
      isAuthenticated: true,
      signInWithDiscord: vi.fn(),
      signOut: vi.fn(),
    });
    mockedUseProfile.mockReturnValue(makeUnlinkedProfile() as never);

    render(<Profile />);

    expect(screen.getByText(/dm não habilitada/i)).toBeInTheDocument();
    expect(screen.getByText(/vinculação pendente/i)).toBeInTheDocument();
  });

  it("should show a safe next step when the authenticated user is not using discord as provider", () => {
    // RED: falha até discord-web-linking ser implementada
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-123",
        email: "email@example.com",
        app_metadata: { provider: "email", providers: ["email"] },
        user_metadata: {},
      } as never,
      loading: false,
      isAuthenticated: true,
      signInWithDiscord: vi.fn(),
      signOut: vi.fn(),
    });
    mockedUseProfile.mockReturnValue(makeUnlinkedProfile() as never);

    render(<Profile />);

    expect(
      screen.getByText(/faça login com discord para concluir a vinculação/i),
    ).toBeInTheDocument();
  });

  it("should enter a pending replacement state without silently swapping the saved link when accounts diverge", () => {
    // RED: falha até discord-web-linking ser implementada
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-123",
        email: "discord@example.com",
        app_metadata: { provider: "discord", providers: ["discord"] },
        user_metadata: {
          provider_id: "999999999999999999",
          sub: "999999999999999999",
          name: "other-account#0",
        },
      } as never,
      loading: false,
      isAuthenticated: true,
      signInWithDiscord: vi.fn(),
      signOut: vi.fn(),
    });
    mockedUseProfile.mockReturnValue(makeLinkedProfile() as never);

    render(<Profile />);

    expect(
      screen.getByText(/a conta atual será trocada somente após sua confirmação/i),
    ).toBeInTheDocument();
  });
});
