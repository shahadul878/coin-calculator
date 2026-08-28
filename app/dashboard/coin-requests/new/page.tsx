import { PageHeader } from "@/components/dashboard/page-header";
import { CoinRequestForm } from "@/components/coin-requests/coin-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCoinRequestPage() {
  return (
    <div>
      <PageHeader title="New Coin Request" description="Create a new coin request" />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CoinRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
