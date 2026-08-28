import { redirect } from "next/navigation";
import { getCurrentUser, isSuperAdmin } from "@/lib/permissions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <PageHeader title="Profile" description="Your account information" />
      <Card className="max-w-lg">
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span>{user.profile?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Name</span>
            <span>{user.profile?.full_name || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span>
              {isSuperAdmin(user.profile) ? "Super Admin" : user.profile?.role ?? "user"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
