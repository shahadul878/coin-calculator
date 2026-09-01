import { z } from "zod";
import { REQUEST_ID_LENGTH } from "@/lib/utils/request-id";

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
    .regex(
      new RegExp(`^\\d{1,${REQUEST_ID_LENGTH}}$`),
      `Request ID must be up to ${REQUEST_ID_LENGTH} digits`
    )
    .optional(),
  who_requested: z.string().max(255).optional(),
});

export type CoinRequestReportQuery = z.infer<typeof coinRequestReportQuerySchema>;
