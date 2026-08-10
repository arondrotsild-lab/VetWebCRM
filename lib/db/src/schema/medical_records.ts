import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { petsTable } from "./pets";
import { ordersTable } from "./orders";
import { vetsTable } from "./vets";

export const medicalRecordsTable = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => ordersTable.id),
  vetId: integer("vet_id").references(() => vetsTable.id),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment"),
  prescription: text("prescription"),
  nextVisit: timestamp("next_visit", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecordsTable).omit({ id: true, createdAt: true });
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecordsTable.$inferSelect;
