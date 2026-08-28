import { describe, it, expect } from "vitest";

import {
  clearImpersonationCookies,
  getAdminSessionBackup,
  getImpersonationMeta,
  isImpersonating,
  setImpersonationCookies,
} from "@/lib/impersonation";
import { impersonateSchema, adminUsersQuerySchema } from "@/lib/validations/impersonation";

function createCookieStore() {
  const store = new Map<string, string>();
  return {
    get(name: string) {
      const value = store.get(name);
      return value ? { name, value } : undefined;
    },
    set(name: string, value: string) {
      store.set(name, value);
    },
    delete(name: string) {
      store.delete(name);
    },
  };
}

describe("impersonation cookies", () => {
  it("stores and reads admin session backup", () => {
    const store = createCookieStore();
    const backup = {
      access_token: "access",
      refresh_token: "refresh",
      admin_id: "admin-1",
    };
    const meta = {
      admin_id: "admin-1",
      admin_email: "admin@example.com",
      target_id: "user-1",
      target_email: "user@example.com",
    };

    setImpersonationCookies(store, backup, meta);

    expect(getAdminSessionBackup(store)).toEqual(backup);
    expect(getImpersonationMeta(store)).toEqual(meta);
    expect(isImpersonating(store)).toBe(true);

    clearImpersonationCookies(store);
    expect(isImpersonating(store)).toBe(false);
    expect(getAdminSessionBackup(store)).toBeNull();
  });
});

describe("impersonation validation", () => {
  it("requires userId or email", () => {
    expect(impersonateSchema.safeParse({}).success).toBe(false);
    expect(
      impersonateSchema.safeParse({ userId: "550e8400-e29b-41d4-a716-446655440000" })
        .success
    ).toBe(true);
    expect(impersonateSchema.safeParse({ email: "user@example.com" }).success).toBe(
      true
    );
  });

  it("parses admin user list query", () => {
    const parsed = adminUsersQuerySchema.parse({ page: "2", limit: "10", q: "test" });
    expect(parsed).toEqual({ page: 2, limit: 10, q: "test" });
  });
});
