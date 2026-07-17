import { twMerge } from "tailwind-merge";

/**
 * Merges class names, filtering out falsy values.
 */
export function cn(...inputs: (string | boolean | null | undefined)[]): string {
  return twMerge(inputs.filter(Boolean).join(" "));
}

/**
 * Format a number as Costa Rican colones (CRC).
 * Example: 5000 → "₡5.000"
 */
export function formatCRC(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a random token for invite links.
 */
export function generateToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get the status label in Spanish.
 */
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    recibido: "Recibido",
    completed: "Completado",
    cancelled: "Cancelado",
  };
  return labels[status] || status;
}

/**
 * Get the status color class.
 */
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    recibido: "bg-blue-100 text-blue-800",
    completed: "bg-lt-green/10 text-lt-green-deep",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
