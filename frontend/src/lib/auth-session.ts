const AUTH_STORAGE_KEY = "rentup:is-authenticated";
const AUTH_CHANGE_EVENT = "rentup-auth-changed";
const PROFILE_STORAGE_KEY = "rentup:profile";
const USERS_STORAGE_KEY = "rentup:users";

export type AccountType = "private" | "rental_company";
export type UserRole = "user" | "admin";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type CompanyBusinessType = "events" | "construction" | "photo_video" | "sound_lighting" | "furniture" | "other";

export interface UserProfile {
  userId: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  accountType: AccountType;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyBrandName?: string;
  companyAddress?: string;
  companyContactName?: string;
  companyBusinessType?: CompanyBusinessType;
}

export function markUserAuthenticated(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthentication(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function isUserAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function getAuthChangeEventName(): string {
  return AUTH_CHANGE_EVENT;
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  upsertUser(profile);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return {
      userId: String(parsed.userId ?? ""),
      role: parsed.role === "admin" ? "admin" : "user",
      verificationStatus:
        parsed.verificationStatus === "approved" || parsed.verificationStatus === "rejected"
          ? parsed.verificationStatus
          : "pending",
      accountType: parsed.accountType === "rental_company" ? "rental_company" : "private",
      firstName: String(parsed.firstName ?? ""),
      lastName: String(parsed.lastName ?? ""),
      phone: String(parsed.phone ?? ""),
      email: String(parsed.email ?? ""),
      companyBrandName: parsed.companyBrandName ? String(parsed.companyBrandName) : undefined,
      companyAddress: parsed.companyAddress ? String(parsed.companyAddress) : undefined,
      companyContactName: parsed.companyContactName ? String(parsed.companyContactName) : undefined,
      companyBusinessType:
        parsed.companyBusinessType === "events" ||
        parsed.companyBusinessType === "construction" ||
        parsed.companyBusinessType === "photo_video" ||
        parsed.companyBusinessType === "sound_lighting" ||
        parsed.companyBusinessType === "furniture" ||
        parsed.companyBusinessType === "other"
          ? parsed.companyBusinessType
          : undefined,
    };
  } catch {
    return null;
  }
}

export function listUsers(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item): UserProfile => {
        const role: UserRole = item.role === "admin" ? "admin" : "user";
        const verificationStatus: VerificationStatus =
          item.verificationStatus === "approved" || item.verificationStatus === "rejected" ? item.verificationStatus : "pending";
        const accountType: AccountType = item.accountType === "rental_company" ? "rental_company" : "private";
        const companyBusinessType: CompanyBusinessType | undefined =
          item.companyBusinessType === "events" ||
          item.companyBusinessType === "construction" ||
          item.companyBusinessType === "photo_video" ||
          item.companyBusinessType === "sound_lighting" ||
          item.companyBusinessType === "furniture" ||
          item.companyBusinessType === "other"
            ? item.companyBusinessType
            : undefined;

        return {
          userId: String(item.userId ?? ""),
          role,
          verificationStatus,
          accountType,
          firstName: String(item.firstName ?? ""),
          lastName: String(item.lastName ?? ""),
          phone: String(item.phone ?? ""),
          email: String(item.email ?? ""),
          companyBrandName: item.companyBrandName ? String(item.companyBrandName) : undefined,
          companyAddress: item.companyAddress ? String(item.companyAddress) : undefined,
          companyContactName: item.companyContactName ? String(item.companyContactName) : undefined,
          companyBusinessType,
        };
      })
      .filter((item) => item.userId.length > 0);
  } catch {
    return [];
  }
}

export function upsertUser(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  const current = listUsers();
  const next = [...current.filter((item) => item.userId !== profile.userId), profile];
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
}

export function deleteUser(userId: string): void {
  if (typeof window === "undefined") return;
  const next = listUsers().filter((item) => item.userId !== userId);
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));
  const current = getUserProfile();
  if (current?.userId === userId) {
    clearAuthentication();
    return;
  }
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function updateUserVerification(userId: string, status: VerificationStatus): void {
  if (typeof window === "undefined") return;
  const users = listUsers();
  const target = users.find((item) => item.userId === userId);
  if (!target) return;
  const updated: UserProfile = { ...target, verificationStatus: status };
  upsertUser(updated);

  const current = getUserProfile();
  if (current?.userId === userId) {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
  }
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
