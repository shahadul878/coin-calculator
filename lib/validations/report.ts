import { z } from "zod";

export const coinRequestReportQuerySchema = z.object({
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
  request_id: z
    .string()
    .regex(/^\d{1,6}$/, "Request ID must be up to 6 digits")
    .optional(),
  who_requested: z.string().max(255).optional(),
});

export type CoinRequestReportQuery = z.infer<typeof coinRequestReportQuerySchema>;
