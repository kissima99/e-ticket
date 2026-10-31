export type TravelRouteId = "ouro_sogui" | "tamba_kidira";
export const travelRoutes: Record<TravelRouteId, { label: string; stops: string[]; Dakar: { meeting: string; departure: string }; Ballou: { meeting: string; departure: string } }> = {
  ouro_sogui: { label: "Via Ouro Sogui", stops: ["Dakar", "Ouro Sogui", "Touba", "Dara Djolof", "Ranérou", "Sèmè", "Hamédi Hounaré", "Bondji", "Bakel", "Béma", "Gabou", "Saré", "Ballou"], Dakar: { meeting: "12:00", departure: "14:00" }, Ballou: { meeting: "06:00", departure: "08:00" } },
  tamba_kidira: { label: "Via Tamba – Kidira", stops: ["Dakar", "Kaolack", "Fatick", "Tamba", "Goudiry", "Kidira", "Wour Thierna", "Ballou"], Dakar: { meeting: "05:00", departure: "06:00" }, Ballou: { meeting: "07:00", departure: "08:00" } },
};
export const cities = [...new Set(Object.values(travelRoutes).flatMap(route => route.stops))];
export const departureDays = [1, 2, 4, 6];
export const departureDaysLabel = "Lundi, mardi, jeudi et samedi";
export function routeStops(route: TravelRouteId, departure: string): readonly string[] {
  const stops: string[] = [...travelRoutes[route].stops];
  return departure === "Ballou" ? stops.reverse() : stops;
}
export const routeSchedule = (route: TravelRouteId, departure: string) => travelRoutes[route][departure === "Ballou" ? "Ballou" : "Dakar"];
export const formatTime = (time: string) => time.slice(0, 5).replace(":", "h");
export type TicketSchedule = { route_id?: TravelRouteId | null; rendezvous_time?: string | null; departure_time?: string | null };
export function ticketScheduleText(ticket: TicketSchedule) {
  if (!ticket.departure_time) return "Horaire à confirmer auprès de la compagnie";
  return `${ticket.route_id ? `${travelRoutes[ticket.route_id].label} • ` : ""}${ticket.rendezvous_time ? `Rendez-vous ${formatTime(ticket.rendezvous_time)} • ` : ""}Départ ${formatTime(ticket.departure_time)}`;
}
export function isTravelDateAvailable(date: string, route: TravelRouteId, departure: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T${routeSchedule(route, departure).departure}:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === date && d.getTime() > Date.now() && departureDays.includes(d.getUTCDay());
}
