import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatTime, routeSchedule, routeStops, travelRoutes, type TravelRouteId } from "@/lib/travel-routes";

type Selection = { route_id: TravelRouteId; departure_city: string; arrival_city: string };
export default function TravelRouteSelector({ value, onChange }: { value: Selection; onChange: (value: Selection) => void }) {
  const stops = routeStops(value.route_id, value.departure_city);
  const schedule = routeSchedule(value.route_id, value.departure_city);
  const fieldClass = "h-12 rounded-xl border-slate-200 bg-white font-semibold text-brand-navy focus:ring-brand-orange";
  function change(next: Selection) {
    if (!routeStops(next.route_id, next.departure_city).slice(1).includes(next.arrival_city)) next.arrival_city = next.departure_city === "Dakar" ? "Ballou" : "Dakar";
    onChange(next);
  }
  return <section aria-label="Trajet et arrêt de descente" className="space-y-5">
    <div className="space-y-2"><Label htmlFor="route_id">Trajet *</Label><Select value={value.route_id} onValueChange={route => change({ ...value, route_id: route as TravelRouteId })}><SelectTrigger id="route_id" className={fieldClass}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(travelRoutes).map(([id, route]) => <SelectItem key={id} value={id}>{route.label}</SelectItem>)}</SelectContent></Select></div>
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="departure_city">Départ *</Label><Select value={value.departure_city} onValueChange={departure => change({ ...value, departure_city: departure })}><SelectTrigger id="departure_city" className={fieldClass}><SelectValue /></SelectTrigger><SelectContent>{["Dakar", "Ballou"].map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="arrival_city">Ville de descente *</Label><Select value={value.arrival_city} onValueChange={arrival => change({ ...value, arrival_city: arrival })}><SelectTrigger id="arrival_city" className={fieldClass}><SelectValue /></SelectTrigger><SelectContent>{stops.slice(1).map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select></div>
    </div>
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
      <ol aria-label="Arrêts du trajet" className="flex flex-wrap items-center gap-2 text-sm font-semibold">{stops.map((city, index) => <li key={city} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true" className="text-orange-700">→</span>}<span className={`rounded-full px-3 py-2 ${city === value.arrival_city ? "bg-brand-navy text-white" : "bg-white text-brand-navy"}`}>{city}</span></li>)}</ol>
      <p className="mt-3 text-sm font-bold text-orange-900" data-testid="route-schedule">Rendez-vous {formatTime(schedule.meeting)} • Départ {formatTime(schedule.departure)}</p>
    </div>
  </section>;
}
