import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isSuperAdmin } from "@/lib/permissions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const superAdmin = isSuperAdmin(user.profile);

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
              {superAdmin ? "Super Admin" : user.profile?.role ?? "user"}
            </span>
          </div>
          {superAdmin && (
            <div className="border-t border-slate-100 pt-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/admin/users">Login as another user</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
