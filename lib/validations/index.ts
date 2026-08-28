import { z } from "zod";

export const paymentStatusSchema = z.enum(["paid", "due", "partial"]);
export const sendStatusSchema = z.enum(["done", "pending", "cancel"]);
export const paymentMethodSchema = z.enum(["bkash", "nagad", "others"]);

const coinRequestBaseSchema = z.object({
  request_id: z
    .string()
    .regex(/^\d{6}$/, "Request ID must be a 6-digit number (e.g. 000001)"),
  who_requested: z.string().min(1, "Who requested is required").max(255),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  coin_amount: z.coerce.number().positive("Coin amount must be > 0"),
  payment_status: paymentStatusSchema,
  send_status: sendStatusSchema,
  payment_method: paymentMethodSchema.nullable().optional(),
  payment_method_other: z.string().max(100).nullable().optional(),
  txn_id: z.string().max(100).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

function validatePaymentFields(
  data: z.infer<typeof coinRequestBaseSchema>,
  ctx: z.RefinementCtx
) {
  const requiresPayment =
    data.payment_status === "paid" || data.payment_status === "partial";

  if (requiresPayment) {
    if (!data.payment_method) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Payment method is required when status is Paid or Partial",
        path: ["payment_method"],
      });
    }
    if (!data.txn_id || data.txn_id.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transaction ID is required when status is Paid or Partial",
        path: ["txn_id"],
      });
    }
    if (data.payment_method === "others" && !data.payment_method_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Payment method name is required when Others is selected",
        path: ["payment_method_other"],
      });
    }
  }

  if (data.payment_status === "due") {
    if (data.payment_method || data.txn_id || data.payment_method_other) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Payment fields must be empty when status is Due",
        path: ["payment_status"],
      });
    }
  }

  if (
    data.payment_method &&
    data.payment_method !== "others" &&
    data.payment_method_other
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Payment method name should only be set for Others",
      path: ["payment_method_other"],
    });
  }
}

export const coinRequestSchema = coinRequestBaseSchema.superRefine(
  validatePaymentFields
);

export const coinRequestUpdateSchema = coinRequestBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (data.payment_status !== undefined) {
      validatePaymentFields(
        {
          request_id: data.request_id ?? "000000",
          who_requested: data.who_requested ?? "",
          price: data.price ?? 0,
          coin_amount: data.coin_amount ?? 1,
          payment_status: data.payment_status,
          send_status: data.send_status ?? "pending",
          payment_method: data.payment_method,
          payment_method_other: data.payment_method_other,
          txn_id: data.txn_id,
          notes: data.notes,
        },
        ctx
      );
    }
  });

export const calculationSchema = z.object({
  coin_quantity: z.coerce.number().positive("Coin quantity must be > 0"),
  price_per_coin: z.coerce.number().min(0, "Price per coin must be >= 0"),
  discount: z.coerce.number().min(0, "Discount must be >= 0"),
  additional_charge: z.coerce
    .number()
    .min(0, "Additional charge must be >= 0"),
  notes: z.string().max(1000).nullable().optional(),
});

export const calculationUpdateSchema = calculationSchema.partial();

export type CoinRequestInput = z.infer<typeof coinRequestSchema>;
export type CalculationInput = z.infer<typeof calculationSchema>;

export function normalizePaymentFields(
  data: Partial<CoinRequestInput>
): {
  payment_method: string | null;
  payment_method_other: string | null;
  txn_id: string | null;
} {
  if (data.payment_status === "due") {
    return {
      payment_method: null,
      payment_method_other: null,
      txn_id: null,
    };
  }

  const paymentMethod = data.payment_method ?? null;
  return {
    payment_method: paymentMethod,
    payment_method_other:
      paymentMethod === "others" ? data.payment_method_other ?? null : null,
    txn_id: data.txn_id?.trim() ?? null,
  };
}
