import { pgTable, text, serial, boolean, timestamp, integer, numeric, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const vetsTable = pgTable("vets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  specialization: text("specialization").notNull().default("Общая практика"),
  experienceYears: integer("experience_years").notNull().default(1),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("5.00"),
  reviewsCount: integer("reviews_count").notNull().default(0),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  totalCompletedOrders: integer("total_completed_orders").notNull().default(0),
  totalEarnings: numeric("total_earnings", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVetSchema = createInsertSchema(vetsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVet = z.infer<typeof insertVetSchema>;
export type Vet = typeof vetsTable.$inferSelect;
