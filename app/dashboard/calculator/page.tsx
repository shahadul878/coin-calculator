import { PageHeader } from "@/components/dashboard/page-header";
import { CalculatorForm } from "@/components/calculator/calculator-form";

export default function CalculatorPage() {
  return (
    <div>
      <PageHeader
        title="Calculator"
        description="Calculate coin totals with discount and additional charges"
      />
      <CalculatorForm />
    </div>
  );
}
