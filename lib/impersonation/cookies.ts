import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import {
  IMPERSONATION_MAX_AGE_SECONDS,
  IMPERSONATION_META_COOKIE,
  IMPERSONATION_SESSION_COOKIE,
} from "./constants";

export interface AdminSessionBackup {
  access_token: string;
  refresh_token: string;
  admin_id: string;
}

export interface ImpersonationMeta {
  admin_id: string;
  admin_email: string;
  target_id: string;
  target_email: string;
}

function cookieOptions(maxAge = IMPERSONATION_MAX_AGE_SECONDS): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export function getAdminSessionBackup(
  cookieStore: Pick<ReadonlyRequestCookies, "get">
): AdminSessionBackup | null {
  const raw = cookieStore.get(IMPERSONATION_SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminSessionBackup;
    if (
      typeof parsed.access_token === "string" &&
      typeof parsed.refresh_token === "string" &&
      typeof parsed.admin_id === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function getImpersonationMeta(
  cookieStore: Pick<ReadonlyRequestCookies, "get">
): ImpersonationMeta | null {
  const raw = cookieStore.get(IMPERSONATION_META_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ImpersonationMeta;
    if (
      typeof parsed.admin_id === "string" &&
      typeof parsed.admin_email === "string" &&
      typeof parsed.target_id === "string" &&
      typeof parsed.target_email === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function isImpersonating(
  cookieStore: Pick<ReadonlyRequestCookies, "get">
): boolean {
  return getImpersonationMeta(cookieStore) !== null;
}

export function setImpersonationCookies(
  cookieStore: Pick<ReadonlyRequestCookies, "set">,
  backup: AdminSessionBackup,
  meta: ImpersonationMeta
): void {
  cookieStore.set(
    IMPERSONATION_SESSION_COOKIE,
    JSON.stringify(backup),
    cookieOptions()
  );
  cookieStore.set(IMPERSONATION_META_COOKIE, JSON.stringify(meta), cookieOptions());
}

export function clearImpersonationCookies(
  cookieStore: Pick<ReadonlyRequestCookies, "delete">
): void {
  cookieStore.delete(IMPERSONATION_SESSION_COOKIE);
  cookieStore.delete(IMPERSONATION_META_COOKIE);
}
