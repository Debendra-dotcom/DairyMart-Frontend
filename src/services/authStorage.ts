import type { Profile } from "../types/profile";

export const ACCESS_TOKEN_KEY = "sr_access_token";
export const REFRESH_TOKEN_KEY = "sr_refresh_token";

const TAB_ACCESS_TOKEN_KEY = `${ACCESS_TOKEN_KEY}:tab`;
const TAB_REFRESH_TOKEN_KEY = `${REFRESH_TOKEN_KEY}:tab`;
const REMEMBERED_USER_ID_KEY = "sr_auth_user_id";
const TAB_USER_ID_KEY = `${REMEMBERED_USER_ID_KEY}:tab`;
const TAB_LOGGED_OUT_KEY = "sr_auth_logged_out:tab";

export function debugAuthState(event: string, details?: Record<string, unknown>) {
  if (!import.meta.env.DEV) return;
  console.debug("[SR auth]", event, details || {});
}

export function seedTabAuthFromRememberedSession() {
  if (sessionStorage.getItem(TAB_LOGGED_OUT_KEY) === "true") return;
  if (sessionStorage.getItem(TAB_ACCESS_TOKEN_KEY)) return;

  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userId = localStorage.getItem(REMEMBERED_USER_ID_KEY);

  if (access) sessionStorage.setItem(TAB_ACCESS_TOKEN_KEY, access);
  if (refresh) sessionStorage.setItem(TAB_REFRESH_TOKEN_KEY, refresh);
  if (userId) sessionStorage.setItem(TAB_USER_ID_KEY, userId);
  if (access) debugAuthState("seed-tab-session", { userId });
}

export function getAccessToken() {
  return sessionStorage.getItem(TAB_ACCESS_TOKEN_KEY);
}

export function getCurrentAuthUserId() {
  return sessionStorage.getItem(TAB_USER_ID_KEY);
}

export function hasCurrentTabAuth() {
  return Boolean(sessionStorage.getItem(TAB_ACCESS_TOKEN_KEY));
}

export function storeAuthSession(access: string, refresh: string, profile: Profile) {
  const userId = String(profile.id);

  sessionStorage.setItem(TAB_ACCESS_TOKEN_KEY, access);
  sessionStorage.setItem(TAB_REFRESH_TOKEN_KEY, refresh);
  sessionStorage.setItem(TAB_USER_ID_KEY, userId);
  sessionStorage.removeItem(TAB_LOGGED_OUT_KEY);

  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  localStorage.setItem(REMEMBERED_USER_ID_KEY, userId);

  debugAuthState("store-session", { userId, email: profile.email });
}

export function bindProfileToCurrentSession(profile: Profile) {
  const userId = String(profile.id);
  sessionStorage.setItem(TAB_USER_ID_KEY, userId);
  localStorage.setItem(REMEMBERED_USER_ID_KEY, userId);
  debugAuthState("bind-profile-session", { userId, email: profile.email });
}

export function clearCurrentAuthSession() {
  const tabUserId = sessionStorage.getItem(TAB_USER_ID_KEY);
  const rememberedUserId = localStorage.getItem(REMEMBERED_USER_ID_KEY);

  sessionStorage.removeItem(TAB_ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(TAB_REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(TAB_USER_ID_KEY);
  sessionStorage.setItem(TAB_LOGGED_OUT_KEY, "true");

  if (!rememberedUserId || rememberedUserId === tabUserId) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBERED_USER_ID_KEY);
    localStorage.removeItem("sr_user");
  }

  debugAuthState("clear-current-session", { tabUserId, rememberedUserId });
}
