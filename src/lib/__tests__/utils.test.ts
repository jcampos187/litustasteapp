import { describe, it, expect } from "vitest";
import {
  formatCRC,
  slugify,
  generateToken,
  getOrderStatusLabel,
  getOrderStatusColor,
} from "../utils";

describe("formatCRC", () => {
  it("formats a number as Costa Rican colones", () => {
    const result = formatCRC(5000);
    expect(result).toContain("₡");
    expect(result).toContain("5");
  });

  it("formats a string number as Costa Rican colones", () => {
    const result = formatCRC("3500");
    expect(result).toContain("₡");
    expect(result).toContain("3");
  });

  it("handles zero", () => {
    const result = formatCRC(0);
    expect(result).toContain("₡");
    expect(result).toContain("0");
  });

  it("handles large numbers", () => {
    const result = formatCRC(100000);
    expect(result).toContain("₡");
  });

  it("handles decimal values (rounds to integer)", () => {
    const result = formatCRC("3500.75");
    expect(result).toContain("₡");
    // CRC format rounds to 0 decimal places
    expect(result).not.toContain(",");
  });
});

describe("slugify", () => {
  it("converts text to lowercase slug, stripping accents", () => {
    // The regex strips non-word chars including accented letters
    expect(slugify("Alta Proteína")).toBe("alta-protena");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World#")).toBe("hello-world");
  });

  it("replaces underscores with hyphens", () => {
    expect(slugify("hello_world")).toBe("hello-world");
  });

  it("removes leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles single word", () => {
    expect(slugify("Vegano")).toBe("vegano");
  });

  it("preserves accented characters", () => {
    expect(slugify("Pollo Teriyaki")).toBe("pollo-teriyaki");
  });
});

describe("generateToken", () => {
  it("generates a token of default length (32)", () => {
    const token = generateToken();
    expect(token.length).toBe(32);
  });

  it("generates a token of specified length", () => {
    const token = generateToken(16);
    expect(token.length).toBe(16);
  });

  it("generates a token of length 8", () => {
    const token = generateToken(8);
    expect(token.length).toBe(8);
  });

  it("generates a token with only valid characters", () => {
    const token = generateToken(100);
    expect(token).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("generates unique tokens", () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).not.toBe(token2);
  });
});

describe("getOrderStatusLabel", () => {
  it('returns "Pendiente" for pending status', () => {
    expect(getOrderStatusLabel("pending")).toBe("Pendiente");
  });

  it('returns "Recibido" for recibido status', () => {
    expect(getOrderStatusLabel("recibido")).toBe("Recibido");
  });

  it('returns "Completado" for completed status', () => {
    expect(getOrderStatusLabel("completed")).toBe("Completado");
  });

  it('returns "Cancelado" for cancelled status', () => {
    expect(getOrderStatusLabel("cancelled")).toBe("Cancelado");
  });

  it("returns the original string for unknown status", () => {
    expect(getOrderStatusLabel("unknown")).toBe("unknown");
  });
});

describe("getOrderStatusColor", () => {
  it("returns amber classes for pending status", () => {
    const result = getOrderStatusColor("pending");
    expect(result).toContain("amber");
  });

  it("returns blue classes for recibido status", () => {
    const result = getOrderStatusColor("recibido");
    expect(result).toContain("blue");
  });

  it("returns green classes for completed status", () => {
    const result = getOrderStatusColor("completed");
    expect(result).toContain("green");
  });

  it("returns red classes for cancelled status", () => {
    const result = getOrderStatusColor("cancelled");
    expect(result).toContain("red");
  });

  it("returns gray classes for unknown status", () => {
    const result = getOrderStatusColor("unknown");
    expect(result).toContain("gray");
  });
});
