"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { coinRequestSchema, type CoinRequestFormInput, type CoinRequestInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CoinRequest } from "@/types";
import { formatCoinAmount } from "@/lib/utils/coin-amount";

interface CoinRequestFormProps {
  initialData?: CoinRequest;
  mode?: "create" | "edit";
}

export function CoinRequestForm({ initialData, mode = "create" }: CoinRequestFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CoinRequestFormInput, unknown, CoinRequestInput>({
    resolver: zodResolver(coinRequestSchema),
    defaultValues: {
      request_id: initialData?.request_id ?? "",
      who_requested: initialData?.who_requested ?? "",
      price: initialData?.price ?? 0,
      coin_amount: initialData?.coin_amount
        ? formatCoinAmount(initialData.coin_amount)
        : "",
      payment_status: initialData?.payment_status ?? "due",
      send_status: initialData?.send_status ?? "pending",
      payment_method: initialData?.payment_method ?? null,
      payment_method_other: initialData?.payment_method_other ?? null,
      txn_id: initialData?.txn_id ?? null,
      notes: initialData?.notes ?? "",
    },
  });

  const paymentStatus = watch("payment_status");
  const sendStatus = watch("send_status");
  const paymentMethod = watch("payment_method");
  const requiresPayment = paymentStatus === "paid" || paymentStatus === "partial";

  async function onSubmit(data: CoinRequestInput) {
    try {
      const url =
        mode === "edit" && initialData
          ? `/api/coin-requests/${initialData.id}`
          : "/api/coin-requests";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.error ?? "Something went wrong");
        return;
      }

      toast.success(mode === "edit" ? "Request updated" : "Request created");
      router.push("/dashboard/coin-requests");
      router.refresh();
    } catch {
      toast.error("Failed to save request");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="request_id">ID</Label>
          <Input
            id="request_id"
            placeholder="000001"
            maxLength={6}
            {...register("request_id")}
          />
          {errors.request_id && (
            <p className="text-sm text-red-600">{errors.request_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="who_requested">Who Requested</Label>
          <Input id="who_requested" {...register("who_requested")} />
          {errors.who_requested && (
            <p className="text-sm text-red-600">{errors.who_requested.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" step="0.01" min="0" {...register("price")} />
          {errors.price && (
            <p className="text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="coin_amount">How Much Coin</Label>
          <Input
            id="coin_amount"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 1000, 1K, 1lac, 1M"
            {...register("coin_amount")}
          />
          <p className="text-xs text-slate-500">
            Supports shorthand: 1K (thousand), 1lac (lakh), 1M (million)
          </p>
          {errors.coin_amount && (
            <p className="text-sm text-red-600">{errors.coin_amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Coin Send Status</Label>
          <Select
            value={sendStatus}
            onValueChange={(val) =>
              setValue("send_status", val as CoinRequestInput["send_status"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select send status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
          {errors.send_status && (
            <p className="text-sm text-red-600">{errors.send_status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Select
            value={paymentStatus}
            onValueChange={(val) =>
              setValue("payment_status", val as CoinRequestInput["payment_status"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due">Due</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
          {errors.payment_status && (
            <p className="text-sm text-red-600">{errors.payment_status.message}</p>
          )}
        </div>

        {requiresPayment && (
          <>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod ?? ""}
                onValueChange={(val) =>
                  setValue("payment_method", val as CoinRequestInput["payment_method"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bkash">Bkash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
              {errors.payment_method && (
                <p className="text-sm text-red-600">{errors.payment_method.message}</p>
              )}
            </div>

            {paymentMethod === "others" && (
              <div className="space-y-2">
                <Label htmlFor="payment_method_other">Payment Method Name</Label>
                <Input
                  id="payment_method_other"
                  placeholder="e.g. Rocket, Bank Transfer"
                  {...register("payment_method_other")}
                />
                {errors.payment_method_other && (
                  <p className="text-sm text-red-600">
                    {errors.payment_method_other.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="txn_id">Transaction ID</Label>
              <Input
                id="txn_id"
                placeholder="Payment transaction reference"
                {...register("txn_id")}
              />
              {errors.txn_id && (
                <p className="text-sm text-red-600">{errors.txn_id.message}</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...register("notes")} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "edit" ? "Update Request" : "Create Request"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/coin-requests")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
