import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const phone = z.string().regex(/^\+[1-9]\d{7,14}$/);
const credentials = { phone, ticket_id: z.string().regex(/^BSE-[A-F0-9]{32}$/) };
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("balance"), ...credentials }),
  z.object({ action: z.literal("redeem"), ...credentials, request_id: z.string().uuid(), reward_type: z.enum(["DISCOUNT", "GIFT_CARD", "AIRTIME", "DATA"]), recipient_phone: phone.optional(), operator: z.enum(["Orange", "Free", "Expresso", "Wave"]).optional() }),
]);
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Méthode non autorisée." }, 405);
  try {
    const text = await req.text();
    if (text.length > 8000) return reply({ error: "Requête trop volumineuse." }, 413);
    let parsed;
    try { parsed = schema.safeParse(JSON.parse(text)); } catch { return reply({ error: "Requête invalide." }); }
    if (!parsed.success) return reply({ error: "Vérifiez le téléphone et le numéro de ticket BSE complet." });
    const input = parsed.data;
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    // The unguessable ticket identifier is a private access credential, verified against its phone.
    const { data: ticket, error: accessError } = await client.from("reservations_dabo").select("id,full_name").eq("ticket_id", input.ticket_id).eq("phone", input.phone).not("request_id", "is", null).maybeSingle();
    if (accessError) throw accessError;
    if (!ticket) return reply({ error: "Téléphone ou ticket incorrect. Utilisez le numéro complet de votre premier ticket.", code: "ACCESS_DENIED" });
    const { data: accessProfile, error: profileError } = await client.from("loyalty_profiles").select("access_ticket_id").eq("phone", input.phone).maybeSingle();
    if (profileError) throw profileError;
    if (accessProfile?.access_ticket_id !== input.ticket_id) return reply({ error: "Utilisez le numéro privé de votre tout premier ticket enregistré sur ce compte. Un nouveau ticket ne permet pas d’accéder à une carte existante.", code: "ACCESS_DENIED" });
    let reward = null;
    if (input.action === "redeem") {
      const { data, error } = await client.rpc("redeem_dabo_loyalty", { p_phone: input.phone, p_ticket: input.ticket_id, p_request: input.request_id, p_type: input.reward_type, p_recipient: input.recipient_phone || null, p_operator: input.operator || null });
      if (error) {
        if (error.message.includes("INSUFFICIENT_POINTS")) return reply({ error: "Votre solde doit atteindre 10 points pour choisir une récompense.", code: "INSUFFICIENT_POINTS" });
        if (error.message.includes("INVALID_RECIPIENT")) return reply({ error: "Indiquez le numéro bénéficiaire et l’opérateur." });
        if (error.message.includes("ACCESS_DENIED")) return reply({ error: "Accès refusé." });
        throw error;
      }
      reward = data;
      console.info("[dabo-loyalty] Reward validated", { type: input.reward_type });
    }
    const results = await Promise.all([
      client.from("loyalty_profiles").select("points_balance,total_lifetime_points").eq("phone", input.phone).maybeSingle(),
      client.from("loyalty_transactions").select("id,points_change,type,description,created_at").eq("phone", input.phone).order("created_at", { ascending: false }).limit(20),
      client.from("gift_cards").select("id,code,discount_percent,reward_type,is_used,created_at").eq("created_for_phone", input.phone).order("created_at", { ascending: false }).limit(20),
      client.from("reward_requests").select("id,phone,operator,reward_type,status,created_at").eq("account_phone", input.phone).order("created_at", { ascending: false }).limit(20),
    ]);
    for (const result of results) if (result.error) throw result.error;
    return reply({ snapshot: { full_name: ticket.full_name, phone: input.phone, points_balance: results[0].data?.points_balance || 0, total_lifetime_points: results[0].data?.total_lifetime_points || 0, transactions: results[1].data || [], cards: results[2].data || [], requests: results[3].data || [] }, reward });
  } catch {
    console.error("[dabo-loyalty] Loyalty operation failed");
    return reply({ error: "Service fidélité indisponible. Réessayez ; une même demande n’est débitée qu’une fois." }, 500);
  }
});
