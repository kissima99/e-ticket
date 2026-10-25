import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });

// Read-only public verification using an unguessable token. No boarding or payment mutation.
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Méthode non autorisée." }, 405);
  try {
    const text = await req.text();
    if (text.length > 1000) return reply({ error: "Requête invalide." }, 400);
    let body;
    try { body = JSON.parse(text); } catch { return reply({ found: false }); }
    if (typeof body?.token !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.token)) return reply({ found: false });
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data, error } = await client.from("reservations_dabo").select("departure_city,arrival_city,travel_date,seat_number,passenger_count,full_name,payment_method,payment_status,total_amount").eq("verification_token", body.token).maybeSingle();
    if (error) throw error;
    if (!data) return reply({ found: false });
    const checkedAt = new Date().toISOString();
    const today = checkedAt.slice(0,10);
    const state = data.travel_date < today ? "EXPIRED" : data.payment_status !== "Payé" ? "UNPAID" : data.travel_date > today ? "FUTURE" : "VALID_TODAY";
    return reply({ found: true, state, checked_at: checkedAt, ticket: data });
  } catch {
    console.error("[dabo-ticket-check] Verification unavailable");
    return reply({ error: "Vérification indisponible. Ne considérez pas ce ticket comme validé sans contrôle en ligne." }, 500);
  }
});
