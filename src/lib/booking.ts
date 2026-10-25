import { z } from "zod";

export const cities = ["Dakar", "Ballou", "Touba", "Dara Djolof", "Ouroussogui", "Sèmè", "Tamba", "Kaolack", "Goudiry", "Kidira", "Bakel", "Bema", "Gabou", "Sarré"];
export const normalizePhone = (value: string) => {
  let phone = value.replace(/[\s().-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (/^\d{9}$/.test(phone)) phone = `+221${phone}`;
  if (/^221\d{9}$/.test(phone)) phone = `+${phone}`;
  return phone;
};
const phone = z.string().transform(normalizePhone).pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Saisissez un numéro valide, par exemple 77 123 45 67."));
export const routeSchema = z.object({
  departure_city: z.enum(["Dakar", "Ballou"], { errorMap: () => ({ message: "Choisissez Dakar ou Ballou." }) }),
  arrival_city: z.string().refine(value => cities.includes(value), "Choisissez une ville d’arrivée."),
  travel_date: z.string().refine(value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const d = new Date(`${value}T15:00:00Z`);
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value && d.getTime() > Date.now();
  }, "Choisissez une date de départ future."),
  seats: z.array(z.string().regex(/^([1-9]|[1-3][0-9]|4[0-5])$/, "Choisissez un siège." )).min(1).max(5).refine(value => new Set(value).size === value.length, "Chaque passager doit avoir un siège différent."),
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
  if (data.departure_city === data.arrival_city) context.addIssue({ code: "custom", path: ["arrival_city"], message: "Le départ et l’arrivée doivent être différents." });
  const d = new Date(`${data.travel_date}T15:00:00Z`);
  if (!(data.departure_city === "Dakar" ? [2, 6] : [1, 4]).includes(d.getUTCDay())) context.addIssue({ code: "custom", path: ["travel_date"], message: data.departure_city === "Dakar" ? "Départs le mardi et le samedi à 15h00." : "Départs le lundi et le jeudi à 15h00." });
});
export type BookingForm = z.input<typeof bookingSchema>;
export interface BookingTicket {
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
  total_amount: number;
}
export const formatTravelDate = (date: string) => new Date(`${date}T15:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const formatAmount = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;
