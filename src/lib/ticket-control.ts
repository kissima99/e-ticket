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
  verification_token: string | null;
};
export type TicketFilters = { status: "ALL" | "PAID" | "PENDING"; date: string; departure: "ALL" | "Dakar" | "Ballou" };

export type AgentSession = { token: string; expires_at: string };
export class AgentSessionExpiredError extends Error {}

export type RewardRequest = { id: string; account_phone: string; phone: string; operator: string; reward_type: string; status: string; amount_fcfa: number | null; fulfillment_reference: string | null; fulfilled_at: string | null; created_at: string };
type Request = { action: "login"; code: string } | { action: "access" | "logout" } | ({ action: "list"; page: number } & TicketFilters) | { action: "confirm"; reservation_id: string } | { action: "rewards"; page: number; status: "ALL" | "PENDING" | "FULFILLED" } | { action: "fulfill_reward"; reward_id: string; reference?: string; confirmed: true };
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
