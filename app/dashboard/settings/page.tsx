import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Application settings" />
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          Settings coming soon.
        </CardContent>
      </Card>
    </div>
  );
}
