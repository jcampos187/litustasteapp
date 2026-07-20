import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeleteMealButton from "../DeleteMealButton";

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

describe("DeleteMealButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the delete button", () => {
    render(<DeleteMealButton mealId="meal-123" />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("opens the confirmation modal when clicked", () => {
    render(<DeleteMealButton mealId="meal-123" />);

    // Click the delete button
    fireEvent.click(screen.getByRole("button"));

    // Modal should appear
    expect(screen.getByText("Eliminar Platillo")).toBeInTheDocument();
    expect(
      screen.getByText(
        "¿Estás seguro de eliminar este platillo? Esta acción no se puede deshacer."
      )
    ).toBeInTheDocument();
  });

  it("closes the modal when cancel is clicked", () => {
    render(<DeleteMealButton mealId="meal-123" />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Eliminar Platillo")).toBeInTheDocument();

    // Click cancel
    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByText("Eliminar Platillo")).not.toBeInTheDocument();
  });

  it("calls the delete API and refreshes on confirm", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<DeleteMealButton mealId="meal-123" />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));

    // Click delete
    fireEvent.click(screen.getByText("Eliminar"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/meals/meal-123", {
        method: "DELETE",
      });
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("closes the modal after successful delete", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    render(<DeleteMealButton mealId="meal-123" />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Eliminar Platillo")).toBeInTheDocument();

    // Click delete
    fireEvent.click(screen.getByText("Eliminar"));

    await waitFor(() => {
      expect(screen.queryByText("Eliminar Platillo")).not.toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    // Suppress console.error for the expected error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<DeleteMealButton mealId="meal-123" />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));

    // Click delete
    fireEvent.click(screen.getByText("Eliminar"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Modal should still close
    expect(screen.queryByText("Eliminar Platillo")).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("closes modal when overlay is clicked", () => {
    render(<DeleteMealButton mealId="meal-123" />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Eliminar Platillo")).toBeInTheDocument();

    // Click overlay
    const overlay = document.querySelector('[class*="fixed inset-0 z-50 bg-black/40"]');
    if (overlay) {
      fireEvent.click(overlay);
      expect(screen.queryByText("Eliminar Platillo")).not.toBeInTheDocument();
    }
  });

  it('shows "Eliminando..." while deleting', async () => {
    // Create a promise that won't resolve immediately
    let resolvePromise!: (value: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<DeleteMealButton mealId="meal-123" />);

    // Open modal
    fireEvent.click(screen.getByRole("button"));

    // Click delete
    fireEvent.click(screen.getByText("Eliminar"));

    // Should show loading text
    expect(screen.getByText("Eliminando...")).toBeInTheDocument();

    // Resolve the promise
    resolvePromise({ ok: true });

    await waitFor(() => {
      expect(screen.queryByText("Eliminando...")).not.toBeInTheDocument();
    });
  });
});
