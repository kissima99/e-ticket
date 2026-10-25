import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-agent-session", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("login"), code: z.string().regex(/^\d{4}$/) }),
  z.object({ action: z.literal("access") }),
  z.object({ action: z.literal("logout") }),
  z.object({ action: z.literal("list"), page: z.number().int().min(0).max(100000), status: z.enum(["ALL", "PAID", "PENDING"]), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")), departure: z.enum(["ALL", "Dakar", "Ballou"]) }),
  z.object({ action: z.literal("confirm"), reservation_id: z.string().uuid() }),
  z.object({ action: z.literal("rewards"), page: z.number().int().min(0).max(100000), status: z.enum(["ALL", "PENDING", "FULFILLED"]) }),
  z.object({ action: z.literal("fulfill_reward"), reward_id: z.string().uuid(), reference: z.string().trim().max(120).optional(), confirmed: z.literal(true) }),
]);
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Méthode non autorisée." }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 2000) return reply({ error: "Requête trop volumineuse." }, 413);
    let input;
    try { input = schema.safeParse(JSON.parse(raw)); } catch { return reply({ error: "Requête invalide." }, 400); }
    if (!input.success) return reply({ error: "Paramètres invalides." }, 400);
    const request = input.data;
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
    if (request.action === "login") {
      const { data, error } = await client.rpc("create_dabo_agent_session", { p_code: request.code });
      if (error) throw error;
      if (data.error) return reply(data, data.code === "RATE_LIMITED" ? 429 : 401);
      return reply(data);
    }

    // L’accès agent utilise un jeton opaque vérifié en base, pas le JWT Supabase du navigateur.
    const token = req.headers.get("x-agent-session");
    if (!token || !/^[0-9a-f]{64}$/.test(token)) return reply({ error: "Connexion agent requise.", code: "SESSION_EXPIRED" }, 401);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const hash = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
    const { data: session, error: sessionError } = await client.from("ticket_agent_sessions").select("id,expires_at").eq("token_hash", hash).eq("revoked", false).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (sessionError) throw sessionError;
    if (!session) return reply({ error: "Votre session a expiré. Connectez-vous à nouveau.", code: "SESSION_EXPIRED" }, 401);
    if (request.action === "access") return reply({ allowed: true, label: "Agent — code partagé", expires_at: session.expires_at });
    if (request.action === "logout") {
      const { error } = await client.from("ticket_agent_sessions").update({ revoked: true }).eq("id", session.id);
      if (error) throw error;
      return reply({ signed_out: true });
    }
    if (request.action === "rewards") {
      let query = client.from("reward_requests").select("id,account_phone,phone,operator,reward_type,status,amount_fcfa,fulfillment_reference,fulfilled_at,created_at", { count: "exact" });
      if (request.status !== "ALL") query = query.eq("status", request.status === "PENDING" ? "En attente" : "Délivré");
      const { data, count, error } = await query.order("created_at", { ascending: false }).order("id", { ascending: false }).range(request.page * 25, request.page * 25 + 24);
      if (error) throw error;
      return reply({ rewards: data, total: count });
    }
    if (request.action === "fulfill_reward") {
      const { data, error } = await client.rpc("fulfill_dabo_reward", { p_reward: request.reward_id, p_agent_session: session.id, p_reference: request.reference || null });
      if (error) {
        if (error.message.includes("AGENT_ACCESS_DENIED")) return reply({ error: "Session agent invalide.", code: "SESSION_EXPIRED" }, 401);
        if (error.message.includes("REWARD_NOT_FOUND")) return reply({ error: "Récompense introuvable." }, 404);
        if (error.message.includes("INVALID_REWARD_STATUS")) return reply({ error: "Cette demande ne relève pas des nouvelles récompenses de 2 000 FCFA ou n’est plus en attente." }, 409);
        if (error.message.includes("INVALID_REFERENCE")) return reply({ error: "Renseignez une référence de recharge de 3 à 120 caractères." }, 400);
        throw error;
      }
      console.info("[dabo-ticket-control] Reward fulfillment recorded", { reward_id: request.reward_id, agent_session_id: session.id, already_fulfilled: data.already_fulfilled });
      return reply(data);
    }
    if (request.action === "confirm") {
      const { data, error } = await client.rpc("confirm_dabo_ticket_payment", { p_reservation: request.reservation_id, p_agent_session: session.id });
      if (error) {
        if (error.message.includes("AGENT_ACCESS_DENIED")) return reply({ error: "Session agent invalide.", code: "SESSION_EXPIRED" }, 401);
        if (error.message.includes("TICKET_NOT_FOUND")) return reply({ error: "Ticket introuvable." }, 404);
        if (error.message.includes("INVALID_PAYMENT_STATUS")) return reply({ error: "Ce statut de paiement ne peut pas être confirmé." }, 409);
        throw error;
      }
      console.info("[dabo-ticket-control] Payment confirmation recorded", { reservation_id: request.reservation_id, agent_session_id: session.id, already_paid: data.already_paid });
      return reply(data);
    }
    let query = client.from("reservations_dabo").select("id,ticket_id,created_at,full_name,departure_city,arrival_city,travel_date,seat_number,passenger_count,payment_status,payment_method,total_amount,verification_token", { count: "exact" });
    if (request.status !== "ALL") query = query.eq("payment_status", request.status === "PAID" ? "Payé" : "En attente");
    if (request.date) query = query.eq("travel_date", request.date);
    if (request.departure !== "ALL") query = query.eq("departure_city", request.departure);
    const { data, count, error } = await query.order("created_at", { ascending: false }).order("id", { ascending: false }).range(request.page * 25, request.page * 25 + 24);
    if (error) throw error;
    return reply({ tickets: data, total: count, page_size: 25 });
  } catch (error) {
    console.error("[dabo-ticket-control] Request failed", { message: error instanceof Error ? error.message : "Database error" });
    return reply({ error: "Service de contrôle indisponible. Réessayez." }, 500);
  }
});
