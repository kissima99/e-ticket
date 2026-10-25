import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AgentSessionExpiredError, ticketControlRequest, type AgentSession } from "@/lib/ticket-control";

const storageKey = "ballou-agent-session";
const AgentSessionContext = createContext<{ session: AgentSession | null; login: (code: string) => Promise<void>; logout: () => Promise<void>; clearSession: () => void } | null>(null);

function storedSession(): AgentSession | null {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data.token === "string" && /^[0-9a-f]{64}$/.test(data.token) && typeof data.expires_at === "string" && Date.parse(data.expires_at) > Date.now()) return { token: data.token, expires_at: data.expires_at };
    window.sessionStorage.removeItem(storageKey);
  } catch { /* Une session en mémoire suffit si le navigateur bloque le stockage. */ }
  return null;
}

export function AgentSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AgentSession | null>(storedSession);
  function clearSession() {
    setSession(null);
    try { window.sessionStorage.removeItem(storageKey); } catch { /* Le stockage peut être indisponible dans un aperçu intégré. */ }
  }
  async function login(code: string) {
    const next = await ticketControlRequest<AgentSession>({ action: "login", code });
    if (!/^[0-9a-f]{64}$/.test(next.token) || !(Date.parse(next.expires_at) > Date.now())) throw new Error("Session non reçue. Réessayez.");
    try { window.sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* La session reste disponible en mémoire. */ }
    setSession(next);
  }
  async function logout() {
    if (session) {
      try { await ticketControlRequest({ action: "logout" }, session.token); }
      catch (error) { if (!(error instanceof AgentSessionExpiredError)) throw error; }
    }
    clearSession();
  }
  useEffect(() => {
    if (!session) return;
    const remaining = Date.parse(session.expires_at) - Date.now();
    if (remaining <= 0) { clearSession(); return; }
    const timeout = window.setTimeout(clearSession, remaining);
    return () => window.clearTimeout(timeout);
  }, [session]);
  return <AgentSessionContext.Provider value={{ session, login, logout, clearSession }}>{children}</AgentSessionContext.Provider>;
}

export function useAgentSession() {
  const context = useContext(AgentSessionContext);
  if (!context) throw new Error("AgentSessionProvider manquant.");
  return context;
}
