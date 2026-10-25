import { normalizePhone } from "@/lib/booking";

export type LoyaltyAccess = { phone: string; ticket_id: string };
const storageKey = "ballou-loyalty-access";
type SavedAccess = { active_phone: string; accounts: LoyaltyAccess[] };

export function isValidLoyaltyAccess(value: unknown): value is LoyaltyAccess {
  if (!value || typeof value !== "object") return false;
  const access = value as Partial<LoyaltyAccess>;
  return typeof access.phone === "string" && /^\+[1-9]\d{7,14}$/.test(access.phone) && typeof access.ticket_id === "string" && /^BSE-[A-F0-9]{32}$/.test(access.ticket_id);
}
function readSavedAccess(): SavedAccess {
  try {
    const data = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    if (data && typeof data.active_phone === "string" && Array.isArray(data.accounts)) return { active_phone: data.active_phone, accounts: data.accounts.filter(isValidLoyaltyAccess) };
  } catch { /* Le stockage peut être indisponible dans un aperçu intégré. */ }
  return { active_phone: "", accounts: [] };
}
export function rememberedLoyaltyAccess(phone?: string): LoyaltyAccess | null {
  const saved = readSavedAccess();
  const destination = phone === undefined ? saved.active_phone : normalizePhone(phone);
  return saved.accounts.find(access => access.phone === destination) || null;
}
export function rememberLoyaltyAccess(access: LoyaltyAccess): boolean {
  if (!isValidLoyaltyAccess(access)) return false;
  try {
    const saved = readSavedAccess();
    const accounts = [...saved.accounts.filter(item => item.phone !== access.phone), access];
    window.localStorage.setItem(storageKey, JSON.stringify({ active_phone: access.phone, accounts }));
    return true;
  } catch { return false; }
}
export function forgetLoyaltyAccess(phone: string) {
  try {
    const saved = readSavedAccess();
    const accounts = saved.accounts.filter(access => access.phone !== normalizePhone(phone));
    if (!accounts.length) window.localStorage.removeItem(storageKey);
    else window.localStorage.setItem(storageKey, JSON.stringify({ active_phone: saved.active_phone === normalizePhone(phone) ? accounts[accounts.length - 1].phone : saved.active_phone, accounts }));
  } catch { /* L’accès reste utilisable manuellement si le stockage est bloqué. */ }
}
