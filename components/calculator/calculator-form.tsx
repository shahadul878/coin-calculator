"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { calculationSchema, type CalculationInput } from "@/lib/validations";
import { calculateTotals } from "@/lib/utils/calculations";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Calculation } from "@/types";

interface CalculatorFormProps {
  initialData?: Calculation;
  mode?: "create" | "edit";
}

export function CalculatorForm({ initialData, mode = "create" }: CalculatorFormProps) {
  const router = useRouter();
  const [result, setResult] = useState<{ subtotal: number; grand_total: number } | null>(
    initialData
      ? { subtotal: initialData.subtotal, grand_total: initialData.grand_total }
      : null
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CalculationInput>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      coin_quantity: initialData?.coin_quantity ?? 0,
      price_per_coin: initialData?.price_per_coin ?? 0,
      discount: initialData?.discount ?? 0,
      additional_charge: initialData?.additional_charge ?? 0,
      notes: initialData?.notes ?? "",
    },
  });

  const values = watch();

  function handleCalculate() {
    const totals = calculateTotals(
      Number(values.coin_quantity) || 0,
      Number(values.price_per_coin) || 0,
      Number(values.discount) || 0,
      Number(values.additional_charge) || 0
    );
    setResult(totals);
  }

  function handleClear() {
    reset({
      coin_quantity: 0,
      price_per_coin: 0,
      discount: 0,
      additional_charge: 0,
      notes: "",
    });
    setResult(null);
  }

  async function onSave(data: CalculationInput) {
    try {
      const url =
        mode === "edit" && initialData
          ? `/api/calculations/${initialData.id}`
          : "/api/calculations";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? "Save failed");
        return;
      }

      toast.success(mode === "edit" ? "Calculation updated" : "Calculation saved");
      router.push("/dashboard/calculations");
      router.refresh();
    } catch {
      toast.error("Failed to save calculation");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coin_quantity">Coin Quantity</Label>
                <Input
                  id="coin_quantity"
                  type="number"
                  step="0.0001"
                  min="0"
                  {...register("coin_quantity")}
                />
                {errors.coin_quantity && (
                  <p className="text-sm text-red-600">{errors.coin_quantity.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_per_coin">Price Per Coin</Label>
                <Input
                  id="price_per_coin"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price_per_coin")}
                />
                {errors.price_per_coin && (
                  <p className="text-sm text-red-600">{errors.price_per_coin.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("discount")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_charge">Additional Charge</Label>
                <Input
                  id="additional_charge"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("additional_charge")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleCalculate}>
                Calculate
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSubmit(onSave)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(result.subtotal)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Discount</span>
                <span>{formatCurrency(Number(values.discount) || 0)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Additional Charge</span>
                <span>{formatCurrency(Number(values.additional_charge) || 0)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-lg font-semibold">Grand Total</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(result.grand_total)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Enter values and click Calculate to see results.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
