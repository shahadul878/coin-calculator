import { PageHeader } from "@/components/dashboard/page-header";
import { CalculationsNotebook } from "@/components/calculator/calculations-notebook";

export default function CalculationsPage() {
  return (
    <div>
      <PageHeader
        title="Calculation Notebook"
        description="Your saved calculations"
      />
      <CalculationsNotebook />
    </div>
  );
}
