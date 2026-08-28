import { PageHeader } from "@/components/dashboard/page-header";
import { CoinRequestTable } from "@/components/coin-requests/coin-request-table";

export default function CoinRequestsPage() {
  return (
    <div>
      <PageHeader
        title="Coin Requests"
        description="Manage coin request records"
      />
      <CoinRequestTable />
    </div>
  );
}
