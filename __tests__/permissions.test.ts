import { describe, it, expect } from "vitest";
import {
  isAdmin,
  isSuperAdmin,
  hasAdminScope,
  canAccessResource,
} from "@/lib/permissions";
import type { Profile } from "@/types";

const adminProfile: Profile = {
  id: "admin-id",
  email: "admin@example.com",
  full_name: "Admin",
  role: "admin",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const userProfile: Profile = {
  ...adminProfile,
  id: "user-id",
  email: "user@example.com",
  role: "user",
};

describe("permissions", () => {
  it("treats admin role as super admin", () => {
    expect(isAdmin(adminProfile)).toBe(true);
    expect(isSuperAdmin(adminProfile)).toBe(true);
    expect(hasAdminScope(adminProfile)).toBe(true);
  });

  it("denies admin scope for regular users", () => {
    expect(isAdmin(userProfile)).toBe(false);
    expect(hasAdminScope(userProfile)).toBe(false);
  });

  it("allows admins to access any user's resources", () => {
    expect(canAccessResource("admin-id", "other-user-id", adminProfile)).toBe(true);
    expect(canAccessResource("user-id", "other-user-id", userProfile)).toBe(false);
    expect(canAccessResource("user-id", "user-id", userProfile)).toBe(true);
  });
});
