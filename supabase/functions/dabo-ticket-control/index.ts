import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("access") }),
  z.object({ action: z.literal("list"), page: z.number().int().min(0).max(100000), status: z.enum(["ALL", "PAID", "PENDING"]), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")), departure: z.enum(["ALL", "Dakar", "Ballou"]) }),
  z.object({ action: z.literal("confirm"), reservation_id: z.string().uuid() }),
]);
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Méthode non autorisée." }, 405);
  try {
    const header = req.headers.get("Authorization");
    const token = header?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return reply({ error: "Connexion agent requise." }, 401);
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: auth, error: authError } = await client.auth.getUser(token);
    if (authError || !auth.user?.phone || !auth.user.phone_confirmed_at) return reply({ error: "Connectez-vous avec un téléphone vérifié par SMS." }, 401);
    const phone = `+${auth.user.phone.replace(/^\+/, "")}`;
    const { data: agent, error: agentError } = await client.from("ticket_agents").select("phone").eq("phone", phone).eq("active", true).maybeSingle();
    if (agentError) throw agentError;
    if (!agent) return reply({ error: "Ce numéro n’est pas autorisé à contrôler les tickets." }, 403);

    const raw = await req.text();
    if (raw.length > 2000) return reply({ error: "Requête trop volumineuse." }, 413);
    let input;
    try { input = schema.safeParse(JSON.parse(raw)); } catch { return reply({ error: "Requête invalide." }, 400); }
    if (!input.success) return reply({ error: "Paramètres invalides." }, 400);
    const request = input.data;
    if (request.action === "access") return reply({ allowed: true, phone });
    if (request.action === "confirm") {
      const { data, error } = await client.rpc("confirm_dabo_ticket_payment", { p_reservation: request.reservation_id, p_actor: auth.user.id, p_phone: phone });
      if (error) {
        if (error.message.includes("AGENT_ACCESS_DENIED")) return reply({ error: "Accès agent refusé." }, 403);
        if (error.message.includes("TICKET_NOT_FOUND")) return reply({ error: "Ticket introuvable." }, 404);
        if (error.message.includes("INVALID_PAYMENT_STATUS")) return reply({ error: "Ce statut de paiement ne peut pas être confirmé." }, 409);
        throw error;
      }
      console.info("[dabo-ticket-control] Payment confirmation recorded", { reservation_id: request.reservation_id, actor_id: auth.user.id, already_paid: data.already_paid });
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
