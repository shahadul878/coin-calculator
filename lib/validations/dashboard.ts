import { z } from "zod";

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
  .optional();

export const dashboardDateFilterSchema = z.object({
  date_from: dateField,
  date_to: dateField,
});

export type DashboardDateFilter = z.infer<typeof dashboardDateFilterSchema>;
