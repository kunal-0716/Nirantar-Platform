import { createInsertSchema } from "drizzle-zod";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const nirantarStateTable = pgTable("nirantar_state", {
  id: text("id").primaryKey(),
  payload: jsonb("payload").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertNirantarStateSchema = createInsertSchema(nirantarStateTable).omit({
  updatedAt: true,
});
export type InsertNirantarState = z.infer<typeof insertNirantarStateSchema>;
export type NirantarState = typeof nirantarStateTable.$inferSelect;