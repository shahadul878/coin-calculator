export {
  IMPERSONATION_MAX_AGE_SECONDS,
  IMPERSONATION_META_COOKIE,
  IMPERSONATION_SESSION_COOKIE,
} from "./constants";
export {
  clearImpersonationCookies,
  getAdminSessionBackup,
  getImpersonationMeta,
  isImpersonating,
  setImpersonationCookies,
  type AdminSessionBackup,
  type ImpersonationMeta,
} from "./cookies";
