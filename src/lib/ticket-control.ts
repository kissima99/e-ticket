import { supabase } from "@/integrations/supabase/client";

export type ControlledTicket = {
  id: string;
  ticket_id: string;
  created_at: string;
  full_name: string;
  departure_city: string;
  arrival_city: string;
  travel_date: string;
  seat_number: string;
  passenger_count: number;
  payment_status: string;
  payment_method: string;
  total_amount: number | null;
  verification_token: string;
};
export type TicketFilters = { status: "ALL" | "PAID" | "PENDING"; date: string; departure: "ALL" | "Dakar" | "Ballou" };

export type AgentSession = { token: string; expires_at: string };
export class AgentSessionExpiredError extends Error {}

type Request = { action: "login"; code: string } | { action: "access" | "logout" } | ({ action: "list"; page: number } & TicketFilters) | { action: "confirm"; reservation_id: string };
export async function ticketControlRequest<T>(request: Request, token?: string): Promise<T> {
  const { data, error } = await supabase.functions.invoke("dabo-ticket-control", { body: request, headers: token ? { "x-agent-session": token } : {} });
  if (error) {
    let message = "Impossible de joindre le contrôle des tickets. Vérifiez votre connexion.";
    let code = "";
    if (error.context instanceof Response) {
      try { const body = await error.context.json(); if (typeof body.error === "string") message = body.error; if (typeof body.code === "string") code = body.code; } catch { /* Une réponse réseau peut ne pas contenir de JSON. */ }
    }
    if (code === "SESSION_EXPIRED") throw new AgentSessionExpiredError(message);
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}
