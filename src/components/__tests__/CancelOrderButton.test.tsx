import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CancelOrderButton from "../CancelOrderButton";

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const defaultProps = {
  orderId: "order-123",
  orderStatus: "pending",
};

describe("CancelOrderButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the cancel button when status is pending", () => {
    render(<CancelOrderButton {...defaultProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Cancelar Pedido")).toBeInTheDocument();
  });

  it("renders nothing when status is not pending", () => {
    const { container } = render(
      <CancelOrderButton orderId="order-123" orderStatus="recibido" />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when status is completed", () => {
    const { container } = render(
      <CancelOrderButton orderId="order-123" orderStatus="completed" />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when status is cancelled", () => {
    const { container } = render(
      <CancelOrderButton orderId="order-123" orderStatus="cancelled" />
    );
    expect(container.innerHTML).toBe("");
  });

  it("opens the confirmation modal when clicked", () => {
    render(<CancelOrderButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button"));

    // Unique modal elements (not duplicated on the button)
    expect(
      screen.getByText(
        "¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Sí, cancelar")).toBeInTheDocument();
    expect(screen.getByText("No, mantener")).toBeInTheDocument();
  });

  it("closes the modal when cancel is clicked", () => {
    render(<CancelOrderButton {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Sí, cancelar")).toBeInTheDocument();

    // Click "No, mantener"
    fireEvent.click(screen.getByText("No, mantener"));
    expect(screen.queryByText("Sí, cancelar")).not.toBeInTheDocument();
  });

  it("calls the cancel API and refreshes on confirm", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<CancelOrderButton {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));

    // Click "Sí, cancelar"
    fireEvent.click(screen.getByText("Sí, cancelar"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/orders/order-123/cancel", {
        method: "PATCH",
      });
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("closes the modal after successful cancellation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<CancelOrderButton {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Sí, cancelar")).toBeInTheDocument();

    // Confirm cancel
    fireEvent.click(screen.getByText("Sí, cancelar"));

    await waitFor(() => {
      expect(screen.queryByText("Sí, cancelar")).not.toBeInTheDocument();
    });
  });

  it("shows error message when API returns an error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "El pedido ya fue procesado" }),
    });

    render(<CancelOrderButton {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));

    // Confirm cancel
    fireEvent.click(screen.getByText("Sí, cancelar"));

    await waitFor(() => {
      expect(screen.getByText("El pedido ya fue procesado")).toBeInTheDocument();
    });
  });

  it("shows generic error when API returns error without message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<CancelOrderButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Sí, cancelar"));

    await waitFor(() => {
      expect(
        screen.getByText("Error al cancelar el pedido")
      ).toBeInTheDocument();
    });
  });

  it("shows connection error when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<CancelOrderButton {...defaultProps} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Sí, cancelar"));

    await waitFor(() => {
      expect(
        screen.getByText("Error de conexión al cancelar el pedido")
      ).toBeInTheDocument();
    });
  });

  it('shows "Cancelando..." while cancelling', async () => {
    let resolvePromise!: (value: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<CancelOrderButton {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));

    // Confirm cancel
    fireEvent.click(screen.getByText("Sí, cancelar"));

    // Should show loading text
    expect(screen.getByText("Cancelando...")).toBeInTheDocument();

    // Resolve the promise
    resolvePromise({ ok: true });

    await waitFor(() => {
      expect(screen.queryByText("Cancelando...")).not.toBeInTheDocument();
    });
  });

  it("renders with block variant when block prop is true", () => {
    render(<CancelOrderButton {...defaultProps} block={true} />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("w-full");
  });

  it("renders with inline variant by default", () => {
    render(<CancelOrderButton {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button.className).not.toContain("w-full");
  });
});
