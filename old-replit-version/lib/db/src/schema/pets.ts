import { pgTable, text, serial, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const petsTable = pgTable("pets", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  species: text("species").notNull(), // Кошка, Собака, Кролик, etc.
  breed: text("breed"),
  age: integer("age"),
  weight: numeric("weight", { precision: 5, scale: 2 }),
  color: text("color"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPetSchema = createInsertSchema(petsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof petsTable.$inferSelect;
