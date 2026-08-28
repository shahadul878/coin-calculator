import { PageHeader } from "@/components/dashboard/page-header";
import { CoinRequestReportPanel } from "@/components/reports/coin-request-report";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate coin request reports by date, ID, or who requested"
      />
      <CoinRequestReportPanel />
    </div>
  );
}
