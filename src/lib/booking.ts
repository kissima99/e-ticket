import { z } from "zod";
import { getTravelFare, isTravelDateAvailable, routeStops, travelRoutes, type TicketSchedule } from "@/lib/travel-routes";

export const cities = [...new Set(Object.values(travelRoutes).flatMap(route => route.stops))];
export const normalizePhone = (value: string) => {
  let phone = value.replace(/[\s().-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (/^\d{9}$/.test(phone)) phone = `+221${phone}`;
  if (/^221\d{9}$/.test(phone)) phone = `+${phone}`;
  return phone;
};
const phone = z.string().transform(normalizePhone).pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Saisissez un numéro valide, par exemple 77 123 45 67."));
export const routeSchema = z.object({
  route_id: z.enum(["ouro_sogui", "tamba_kidira"]),
  departure_city: z.enum(["Dakar", "Ballou"], { errorMap: () => ({ message: "Choisissez Dakar ou Ballou." }) }),
  arrival_city: z.string().refine(value => cities.includes(value), "Choisissez une ville d’arrivée."),
  travel_date: z.string(),
  seats: z.array(z.string().regex(/^([1-9]|[1-6][0-9]|70)$/, "Choisissez un siège entre 1 et 70." )).min(1).max(5).refine(value => new Set(value).size === value.length, "Chaque passager doit avoir un siège différent."),
});
export const passengerSchema = z.object({
  civility: z.enum(["M.", "Mme", "Mlle"]),
  full_name: z.string().trim().min(2, "Indiquez le nom complet.").max(100),
  phone,
  identity_document_type: z.enum(["CNI", "Passeport"]),
  identity_document_number: z.string().trim().min(3, "Indiquez le numéro de la pièce d’identité.").max(50),
  emergency_contact: phone,
  boarding_point: z.string().trim().min(3, "Indiquez votre point de montée.").max(150),
  luggage_count: z.number().int().min(0).max(5),
});
export const paymentSchema = z.object({ payment_method: z.enum(["Cash", "Wave", "OM"], { errorMap: () => ({ message: "Choisissez Cash, Wave ou OM." }) }), promo_code: z.string().trim().toUpperCase().max(50).optional() });
export const bookingSchema = routeSchema.merge(passengerSchema).merge(paymentSchema).superRefine((data, context) => {
  if (!routeStops(data.route_id, data.departure_city).slice(1).includes(data.arrival_city)) context.addIssue({ code: "custom", path: ["arrival_city"], message: "Choisissez un arrêt de descente sur ce trajet." });
  if (!isTravelDateAvailable(data.travel_date, data.route_id, data.departure_city)) context.addIssue({ code: "custom", path: ["travel_date"], message: "Choisissez un départ futur : lundi, mardi, jeudi ou samedi, selon l’horaire du trajet." });
  if (getTravelFare(data.departure_city, data.arrival_city) === undefined && !data.promo_code) context.addIssue({ code: "custom", path: ["arrival_city"], message: "Le tarif de cet arrêt sera fixé par l’agent avant la confirmation du paiement." });
});
export type BookingForm = z.input<typeof bookingSchema>;
export interface BookingTicket extends TicketSchedule {
  ticket_id: string;
  departure_city: string;
  arrival_city: string;
  travel_date: string;
  seat_number: string;
  passenger_count: number;
  full_name: string;
  phone: string;
  boarding_point: string;
  luggage_count: number;
  payment_method: "Cash" | "Wave" | "OM";
  payment_status: string;
  total_amount: number | null;
  verification_token: string | null;
}
export const formatTravelDate = (date: string) => new Date(`${date}T15:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const formatAmount = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;
export const formatPrice = (amount: number | null | undefined) => amount === null || amount === undefined ? "Prix à définir par l’agent" : formatAmount(amount);
