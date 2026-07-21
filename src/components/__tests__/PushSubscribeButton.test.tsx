import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PushSubscribeButton from "../PushSubscribeButton";

// ─── Mock globals using vi.stubGlobal (reliable in jsdom) ──────
const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();
const mockGetSubscription = vi.fn();
const mockFetch = vi.fn();

beforeAll(() => {
  // navigator.serviceWorker.ready must be a Promise (not a function)
  vi.stubGlobal("navigator", {
    serviceWorker: {
      ready: Promise.resolve({
        pushManager: {
          subscribe: mockSubscribe,
          getSubscription: mockGetSubscription,
        },
      }),
    },
  });

  // PushManager is checked via `"PushManager" in window` in the component
  vi.stubGlobal("PushManager", {});

  // Mock fetch globally
  vi.stubGlobal("fetch", mockFetch);

  // Mock atob for urlBase64ToUint8Array
  vi.stubGlobal("atob", (str: string) => str);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("PushSubscribeButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...process.env, NEXT_PUBLIC_VAPID_PUBLIC_KEY: "test-vapid-key" };
    mockGetSubscription.mockResolvedValue(null);
  });

  it("renders the subscribe button by default", async () => {
    render(<PushSubscribeButton />);
    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
    expect(screen.getByText("Activar Notificaciones")).toBeInTheDocument();
  });

  it("shows 'Notificaciones Activadas' when already subscribed", async () => {
    mockGetSubscription.mockResolvedValue({
      endpoint: "https://example.com/push",
      getKey: () => new Uint8Array([1, 2, 3]),
      unsubscribe: mockUnsubscribe,
    });

    render(<PushSubscribeButton />);

    await waitFor(() => {
      expect(screen.getByText("Notificaciones Activadas")).toBeInTheDocument();
    });
  });

  it("returns null when serviceWorker is not available", async () => {
    // Stub navigator without serviceWorker — vi.stubGlobal replaces the
    // entire object, so `"serviceWorker" in navigator` correctly returns false.
    const origNavigator = globalThis.navigator;
    vi.stubGlobal("navigator", {});

    const { container } = render(<PushSubscribeButton />);
    await waitFor(() => expect(container.innerHTML).toBe(""));

    // Restore for other tests
    vi.stubGlobal("navigator", origNavigator);
  });

  it("calls pushManager.subscribe and POST to API on click", async () => {
    mockSubscribe.mockResolvedValue({
      endpoint: "https://example.com/push",
      getKey: () => new Uint8Array([1, 2, 3]),
    });
    mockFetch.mockResolvedValueOnce({ ok: true });

    render(<PushSubscribeButton />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      });
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: expect.any(String),
    });
  });

  it("shows subscribed state after successful subscription", async () => {
    mockSubscribe.mockResolvedValue({
      endpoint: "https://example.com/push",
      getKey: () => new Uint8Array([1, 2, 3]),
    });
    mockFetch.mockResolvedValueOnce({ ok: true });

    render(<PushSubscribeButton />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Notificaciones Activadas")).toBeInTheDocument();
    });
  });

  it("unsubscribes and calls DELETE API when already subscribed", async () => {
    mockGetSubscription.mockResolvedValue({
      endpoint: "https://example.com/push",
      getKey: () => new Uint8Array([1, 2, 3]),
      unsubscribe: mockUnsubscribe,
    });
    mockFetch.mockResolvedValueOnce({ ok: true });

    render(<PushSubscribeButton />);

    await waitFor(() => {
      expect(screen.getByText("Notificaciones Activadas")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: expect.any(String),
    });
  });

  it("shows loading spinner while subscribing", async () => {
    let resolveSubscribe!: (value: unknown) => void;
    mockSubscribe.mockReturnValue(
      new Promise((resolve) => {
        resolveSubscribe = resolve;
      })
    );
    // Set up the fetch mock for the API call after subscribe resolves
    mockFetch.mockResolvedValueOnce({ ok: true });

    render(<PushSubscribeButton />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));

    // Should show spinner (button disabled)
    expect(screen.getByRole("button")).toBeDisabled();

    resolveSubscribe({
      endpoint: "https://example.com/push",
      getKey: () => new Uint8Array([1, 2, 3]),
    });

    await waitFor(() => {
      expect(screen.getByText("Notificaciones Activadas")).toBeInTheDocument();
    });
  });

  it("shows warning when VAPID key is not configured", async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "";
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<PushSubscribeButton />);

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledWith("VAPID public key not configured");
    });

    // Button should still say "Activar Notificaciones" (no change since subscribe aborted)
    expect(screen.getByText("Activar Notificaciones")).toBeInTheDocument();

    consoleWarn.mockRestore();
  });
});
