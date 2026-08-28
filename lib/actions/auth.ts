"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/services/audit.service";
import { clearImpersonationCookies, getImpersonationMeta } from "@/lib/impersonation";

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await logAudit(data.user.id, "LOGIN");
  }

  redirect("/dashboard/coin-requests");
}

export async function registerAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?registered=true");
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for a reset link." };
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?reset=true");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const impersonationMeta = getImpersonationMeta(cookieStore);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await logAudit(user.id, "LOGOUT");
  }

  if (impersonationMeta) {
    await logAudit(impersonationMeta.admin_id, "IMPERSONATE_END", undefined, impersonationMeta.target_id, {
      target_email: impersonationMeta.target_email,
      reason: "logout",
    });
    clearImpersonationCookies(cookieStore);
  }

  await supabase.auth.signOut();
  redirect("/login");
}
