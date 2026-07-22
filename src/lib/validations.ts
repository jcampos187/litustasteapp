import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────

/** Validates that a string is a parseable date. */
const dateString = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: "Fecha inválida" }
);

/** Optional date string that can be null or undefined. */
const nullableDateString = dateString.nullable().optional();

// ─── Business Settings ──────────────────────────────────────────

export const settingsSchema = z.object({
  businessName: z
    .string()
    .min(1, "El nombre del negocio es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .default("Litus Taste"),
  description: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .nullable()
    .optional(),
  contactEmail: z
    .string()
    .email("Correo electrónico inválido")
    .nullable()
    .optional(),
  contactPhone: z
    .string()
    .max(20, "Teléfono inválido")
    .nullable()
    .optional(),
  address: z
    .string()
    .max(300, "La dirección no puede exceder 300 caracteres")
    .nullable()
    .optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

// ─── Meals ───────────────────────────────────────────────────────

export const createMealSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .default(""),
  price: z.number().positive("El precio debe ser positivo"),
  portionSize: z
    .string()
    .max(50, "Tamaño de porción inválido")
    .nullable()
    .optional(),
  calories: z.number().int().positive().nullable().optional(),
  proteinG: z.number().int().min(0).nullable().optional(),
  carbsG: z.number().int().min(0).nullable().optional(),
  fatG: z.number().int().min(0).nullable().optional(),
  dietaryTags: z
    .array(z.string().max(50))
    .max(20, "Máximo 20 etiquetas")
    .optional(),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;

export const updateMealSchema = createMealSchema.extend({
  isActive: z.boolean().optional(),
});

export type UpdateMealInput = z.infer<typeof updateMealSchema>;

// ─── Weekly Menu ────────────────────────────────────────────────

export const createWeeklyMenuSchema = z.object({
  mealIds: z
    .array(z.string().uuid("ID de platillo inválido"))
    .min(1, "Selecciona al menos un platillo"),
  publish: z.boolean().optional(),
  label: z.string().max(200).optional(),
  weekStart: dateString.optional(),
  weekEnd: dateString.optional(),
  orderCutoff: nullableDateString,
  publishAt: nullableDateString,
});

export type CreateWeeklyMenuInput = z.infer<typeof createWeeklyMenuSchema>;

export const updateWeeklyMenuSchema = createWeeklyMenuSchema.extend({
  menuId: z.string().uuid("ID de menú inválido"),
});

export type UpdateWeeklyMenuInput = z.infer<typeof updateWeeklyMenuSchema>;

// ─── Orders ─────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  mealId: z.string().min(1, "ID del platillo requerido"),
  mealName: z.string().min(1, "Nombre del platillo requerido"),
  quantity: z
    .number()
    .int()
    .positive("La cantidad debe ser positiva")
    .default(1),
  unitPrice: z.number().positive("El precio unitario debe ser positivo"),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "El pedido debe tener al menos un artículo"),
  notes: z.string().max(500).nullable().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ─── Order Status ───────────────────────────────────────────────

export const validOrderStatuses = [
  "pending",
  "recibido",
  "completed",
  "cancelled",
] as const;

export const updateOrderStatusSchema = z.object({
  status: z.enum(validOrderStatuses, {
    errorMap: () => ({
      message:
        "Estado inválido. Opciones: pending, recibido, completed, cancelled",
    }),
  }),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// ─── Approve User ───────────────────────────────────────────────

export const approveUserSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
  action: z.enum(["approve", "decline"], {
    errorMap: () => ({ message: "Acción inválida. Use 'approve' o 'decline'" }),
  }),
  clerkId: z.string().min(1, "ID de Clerk requerido"),
});

export type ApproveUserInput = z.infer<typeof approveUserSchema>;

// ─── Customer Invite ────────────────────────────────────────────

export const createInviteSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;

// ─── Registration ───────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  lastName: z.string().min(1, "El apellido es requerido").max(100),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(1, "El teléfono es requerido").max(20),
  deliveryAddress: z.string().min(1, "La dirección es requerida").max(300),
  city: z.string().max(100).nullable().optional(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña no puede exceder 128 caracteres"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Profile Update ─────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  deliveryAddress: z.string().min(1).max(300).optional(),
  city: z.string().max(100).nullable().optional(),
  province: z.string().max(100).nullable().optional(),
  postalCode: z.string().max(20).nullable().optional(),
  dietaryNotes: z.string().max(500).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
