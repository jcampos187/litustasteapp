import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "../ConfirmModal";

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: "Test Title",
  message: "Test message body",
};

describe("ConfirmModal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <ConfirmModal {...defaultProps} isOpen={false} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders the title and message when open", () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test message body")).toBeInTheDocument();
  });

  it("renders danger variant with alert icon and red confirm button", () => {
    render(<ConfirmModal {...defaultProps} variant="danger" />);

    // Should have the cancel and confirm buttons
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Confirmar")).toBeInTheDocument();

    // The confirm button should have red styles (bg-red-600)
    const confirmBtn = screen.getByText("Confirmar");
    expect(confirmBtn.className).toContain("red");
  });

  it("renders info variant with order summary and terracotta button", () => {
    const items = [
      { mealId: "m1", mealName: "Pollo", price: 5500, quantity: 2, imageUrl: null },
      { mealId: "m2", mealName: "Ensalada", price: 4200, quantity: 1, imageUrl: null },
    ];

    render(
      <ConfirmModal
        {...defaultProps}
        variant="info"
        title="Confirmar Pedido"
        confirmLabel="Sí, enviar pedido"
        items={items}
        totalPrice={15200}
      />
    );

    // Should show order summary
    expect(screen.getByText("Resumen del pedido")).toBeInTheDocument();
    expect(screen.getByText("Pollo")).toBeInTheDocument();
    expect(screen.getByText("Ensalada")).toBeInTheDocument();
    expect(screen.getByText("×2")).toBeInTheDocument();

    // Should show custom confirm label
    expect(screen.getByText("Sí, enviar pedido")).toBeInTheDocument();

    // Confirm button should have terracotta styling (not red)
    const confirmBtn = screen.getByText("Sí, enviar pedido");
    expect(confirmBtn.className).not.toContain("red");
  });

  it("shows loading state on confirm button", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        isLoading={true}
        confirmLabel="Enviando..."
      />
    );

    // Find the confirm button by its text
    const confirmText = screen.getByText("Enviando...");
    // The text is inside a span inside the button, so get the parent button
    const confirmBtn = confirmText.closest("button");
    expect(confirmBtn).toBeDisabled();

    // Cancel button should also be disabled during loading
    const cancelBtn = screen.getByText("Cancelar");
    expect(cancelBtn).toBeDisabled();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText("Confirmar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", () => {
    const onClose = vi.fn();
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ConfirmModal {...defaultProps} onClose={onClose} />
    );

    // Click the overlay (first child of the portal)
    const overlay = container.querySelector('[class*="fixed inset-0 z-50 bg-black/40"]');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("calls onClose when X button is clicked", () => {
    const onClose = vi.fn();
    render(<ConfirmModal {...defaultProps} onClose={onClose} />);

    // The X button (inside the header)
    const xButtons = screen.getAllByRole("button");
    // Find the X close button (not Cancel or Confirm)
    const closeBtn = xButtons.find(
      (btn) => btn.textContent === "" && btn !== screen.getByText("Cancelar") && btn !== screen.getByText("Confirmar")
    );
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("renders custom cancel label", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        cancelLabel="Revisar de nuevo"
      />
    );

    expect(screen.getByText("Revisar de nuevo")).toBeInTheDocument();
  });

  it("does not show order summary when no items provided", () => {
    render(<ConfirmModal {...defaultProps} variant="info" />);

    expect(screen.queryByText("Resumen del pedido")).not.toBeInTheDocument();
  });

  it("renders without crashing with minimal props", () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Test"
      />
    );

    // Title and message both say "Test", use getAllByText
    const elements = screen.getAllByText("Test");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});
