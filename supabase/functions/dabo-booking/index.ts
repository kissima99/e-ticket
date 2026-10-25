import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const cities = ["Dakar", "Ballou", "Touba", "Dara Djolof", "Ouroussogui", "Sèmè", "Tamba", "Kaolack", "Goudiry", "Kidira", "Bakel", "Bema", "Gabou", "Sarré"];
const phone = z.string().trim().regex(/^\+[1-9]\d{7,14}$/);
const routeSchema = z.object({ departure_city: z.enum(["Dakar", "Ballou"]), travel_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => { const d = new Date(`${value}T15:00:00Z`); return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === value; }) });
const bookingSchema = routeSchema.extend({ arrival_city: z.string().refine(value => cities.includes(value)), seats: z.array(z.string().regex(/^([1-9]|[1-6][0-9]|70)$/)).min(1).max(5).refine(value => new Set(value).size === value.length), civility: z.enum(["M.", "Mme", "Mlle"]), full_name: z.string().trim().min(2).max(100), phone, identity_document_type: z.enum(["CNI", "Passeport"]), identity_document_number: z.string().trim().min(3).max(50), emergency_contact: phone, boarding_point: z.string().trim().min(3).max(150), luggage_count: z.number().int().min(0).max(5), payment_method: z.enum(["Cash", "Wave", "OM"]), promo_code: z.string().trim().toUpperCase().max(50).optional() });
const requestSchema = z.discriminatedUnion("action", [z.object({ action: z.literal("availability"), data: routeSchema }), z.object({ action: z.literal("book"), request_id: z.string().uuid(), data: bookingSchema })]);
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });

// Public booking endpoint: no account required. It never exposes a passenger lookup.
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Méthode non autorisée." }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 16000) return reply({ error: "Requête trop volumineuse." }, 413);
    let input;
    try { input = requestSchema.safeParse(JSON.parse(raw)); } catch { return reply({ error: "Requête invalide." }, 400); }
    if (!input.success) return reply({ error: "Veuillez vérifier les informations saisies." }, 400);
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
    const request = input.data;
    if (request.action === "availability") {
      const { data, error } = await client.from("reservations_dabo").select("seat_number").eq("departure_city", request.data.departure_city).eq("travel_date", request.data.travel_date);
      if (error) throw error;
      const taken = [...new Set((data || []).flatMap(row => row.seat_number.split(",").map((value: string) => value.trim())))];
      return reply({ taken });
    }
    const { data, error } = await client.rpc("create_dabo_booking", { p_request_id: request.request_id, p_data: request.data });
    if (error) {
      if (error.message.includes("SEAT_TAKEN")) return reply({ error: "Un siège sélectionné vient d’être réservé. Choisissez un autre siège.", code: "SEAT_TAKEN" });
      if (error.message.includes("INVALID_DATE")) return reply({ error: "Ce départ n’est pas disponible. Vérifiez la date et les jours de voyage.", code: "INVALID_DATE" });
      if (error.message.includes("INVALID_PROMO")) return reply({ error: "Code de réduction invalide, déjà utilisé ou réservé à un autre téléphone.", code: "INVALID_PROMO" });
      if (error.message.includes("INVALID_")) return reply({ error: "Les informations du trajet sont invalides." });
      throw error;
    }
    console.info("[dabo-booking] Booking recorded", { ticket_id: data.ticket_id });
    return reply({ ticket: data });
  } catch (error) {
    console.error("[dabo-booking] Request failed", { message: error instanceof Error ? error.message : "Database error" });
    return reply({ error: "Enregistrement indisponible. Réessayez dans quelques instants." }, 500);
  }
});
