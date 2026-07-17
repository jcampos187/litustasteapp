import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["admin", "customer"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "recibido",
  "completed",
  "cancelled",
]);

// ─── Users (synced from Clerk via webhooks) ──────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").default("customer").notNull(),
  phone: text("phone"),
  deliveryAddress: text("delivery_address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  dietaryNotes: text("dietary_notes"),
  profileComplete: boolean("profile_complete").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Meals / Products ────────────────────────────────────────────
export const meals = pgTable("meals", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("CRC").notNull(),
  portionSize: text("portion_size"),
  imageUrl: text("image_url"),
  calories: integer("calories"),
  proteinG: integer("protein_g"),
  carbsG: integer("carbs_g"),
  fatG: integer("fat_g"),
  isActive: boolean("is_active").default(true).notNull(),
  dietaryTags: text("dietary_tags"), // comma-separated tag slugs
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Dietary Tags ────────────────────────────────────────────────
export const dietaryTags = pgTable("dietary_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  emoji: text("emoji"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Weekly Menus ────────────────────────────────────────────────
export const weeklyMenus = pgTable("weekly_menus", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(), // e.g., "Semana del 21-27 Julio"
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  orderCutoff: timestamp("order_cutoff"),
  publishAt: timestamp("publish_at"), // schedule auto-publish (nullable)
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Weekly Menu Items (join table) ─────────────────────────────
export const weeklyMenuItems = pgTable("weekly_menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  weeklyMenuId: uuid("weekly_menu_id")
    .references(() => weeklyMenus.id, { onDelete: "cascade" })
    .notNull(),
  mealId: uuid("meal_id")
    .references(() => meals.id, { onDelete: "cascade" })
    .notNull(),
  displayOrder: integer("display_order").default(0),
});

// ─── Orders ──────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  weeklyMenuId: uuid("weekly_menu_id")
    .references(() => weeklyMenus.id, { onDelete: "set null" }),
  status: orderStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Order Items ─────────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  mealId: uuid("meal_id")
    .references(() => meals.id, { onDelete: "set null" }),
  mealName: text("meal_name").notNull(), // snapshot at order time
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

// ─── Customer Invites ────────────────────────────────────────────
export const customerInvites = pgTable("customer_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  inviteToken: text("invite_token").unique().notNull(),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Business Settings (single row for the business) ─────────────
export const businessSettings = pgTable("business_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: text("business_name").notNull().default("Litus Taste"),
  slug: text("slug").unique().notNull().default("litus-taste"),
  description: text("description"),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Type exports ────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
export type DietaryTag = typeof dietaryTags.$inferSelect;
export type NewDietaryTag = typeof dietaryTags.$inferInsert;
export type WeeklyMenu = typeof weeklyMenus.$inferSelect;
export type NewWeeklyMenu = typeof weeklyMenus.$inferInsert;
export type WeeklyMenuItem = typeof weeklyMenuItems.$inferSelect;
export type NewWeeklyMenuItem = typeof weeklyMenuItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type CustomerInvite = typeof customerInvites.$inferSelect;
export type NewCustomerInvite = typeof customerInvites.$inferInsert;
export type BusinessSetting = typeof businessSettings.$inferSelect;
export type NewBusinessSetting = typeof businessSettings.$inferInsert;
