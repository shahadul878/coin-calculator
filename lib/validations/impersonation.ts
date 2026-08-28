import { z } from "zod";

export const impersonateSchema = z
  .object({
    userId: z.string().uuid().optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => data.userId || data.email, {
    message: "userId or email is required",
  });

export const adminUsersQuerySchema = z.object({
  q: z.string().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
