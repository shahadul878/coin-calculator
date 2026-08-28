import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Export and reporting" />
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          Reports coming soon. Use the dashboard and coin request list for now.
        </CardContent>
      </Card>
    </div>
  );
}
