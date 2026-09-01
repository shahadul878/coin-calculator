import { redirect } from "next/navigation";
import { getCurrentUser, hasAdminScope } from "@/lib/permissions";
import { getCoinRequest } from "@/lib/services/coin-request.service";
import { PageHeader } from "@/components/dashboard/page-header";
import { CoinRequestForm } from "@/components/coin-requests/coin-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CoinRequest } from "@/types";

interface PageProps {
  searchParams: Promise<{ duplicateFrom?: string }>;
}

export default async function NewCoinRequestPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { duplicateFrom } = await searchParams;
  let initialData: CoinRequest | undefined;

  if (duplicateFrom) {
    const adminScope = hasAdminScope(user.profile);
    const source = await getCoinRequest(duplicateFrom, user.id, { adminScope });
    if (source) {
      initialData = {
        ...source,
        payment_status: "due",
        send_status: "pending",
        payment_method: null,
        payment_method_other: null,
        txn_id: null,
      };
    }
  }

  return (
    <div>
      <PageHeader
        title={duplicateFrom ? "Duplicate Coin Request" : "New Coin Request"}
        description={
          duplicateFrom
            ? "Fields are copied from the original request — the same app user ID can be reused"
            : "Create a new coin request"
        }
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CoinRequestForm initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  );
}
