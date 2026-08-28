import Link from "next/link";
import { redirect } from "next/navigation";

import { UserImpersonationPanel } from "@/components/admin/user-impersonation-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, isAdmin } from "@/lib/permissions";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user.profile)) redirect("/dashboard/profile");

  return (
    <div>
      <PageHeader
        title="User impersonation"
        description="Sign in as any user or admin without their password"
      />
      <Card>
        <CardHeader>
          <CardTitle>Login as user</CardTitle>
          <CardDescription>
            Impersonation is audited. Use the banner to return to your admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserImpersonationPanel currentUserId={user.id} />
        </CardContent>
      </Card>
      <div className="mt-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/profile">Back to profile</Link>
        </Button>
      </div>
    </div>
  );
}
