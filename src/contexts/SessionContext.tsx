import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const SessionContext = createContext<{ session: Session | null; loading: boolean }>({ session: null, loading: true });

export function SessionContextProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, current) => { setSession(current); setLoading(false); });
    return () => data.subscription.unsubscribe();
  }, []);
  return <SessionContext.Provider value={{ session, loading }}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
