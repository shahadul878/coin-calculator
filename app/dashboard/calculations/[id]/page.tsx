import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions";
import { getCalculation } from "@/lib/services/calculation.service";
import { PageHeader } from "@/components/dashboard/page-header";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function CalculationDetailPage({
  params,
  searchParams,
}: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { edit } = await searchParams;
  const calculation = await getCalculation(id, user.id);

  if (!calculation) notFound();

  if (edit === "true") {
    return (
      <div>
        <PageHeader title="Edit Calculation" />
        <CalculatorForm initialData={calculation} mode="edit" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Calculation Details" />
      <Card className="max-w-lg">
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Coin Quantity</span>
            <span>{calculation.coin_quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Price Per Coin</span>
            <span>{formatCurrency(calculation.price_per_coin)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span>{formatCurrency(calculation.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Discount</span>
            <span>{formatCurrency(calculation.discount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Additional Charge</span>
            <span>{formatCurrency(calculation.additional_charge)}</span>
          </div>
          <div className="flex justify-between border-t pt-4">
            <span className="font-semibold">Grand Total</span>
            <span className="text-lg font-bold">
              {formatCurrency(calculation.grand_total)}
            </span>
          </div>
          {calculation.notes && (
            <div>
              <span className="text-slate-500">Notes</span>
              <p className="mt-1">{calculation.notes}</p>
            </div>
          )}
          <div className="text-sm text-slate-400">
            Created {formatDate(calculation.created_at)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
