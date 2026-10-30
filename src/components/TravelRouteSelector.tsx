import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatTime, routeSchedule, routeStops, travelRoutes, type TravelRouteId } from "@/lib/travel-routes";

type Selection = { route_id: TravelRouteId; departure_city: string; arrival_city: string };
export default function TravelRouteSelector({ value, onChange, home = false }: { value: Selection; onChange: (value: Selection) => void; home?: boolean }) {
  const stops = routeStops(value.route_id, value.departure_city);
  const schedule = routeSchedule(value.route_id, value.departure_city);
  const fieldClass = "h-12 rounded-xl border-slate-200 bg-white font-semibold text-brand-navy focus:ring-brand-orange";
  const homeFieldClass = "h-20 rounded-2xl border-2 border-slate-200 bg-white pl-20 pr-5 text-2xl font-bold text-brand-navy focus:ring-brand-orange sm:h-24 sm:pl-24 sm:text-3xl [&>svg]:h-6 [&>svg]:w-6 [&>svg]:opacity-100";
  function change(next: Selection) {
    if (!routeStops(next.route_id, next.departure_city).slice(1).includes(next.arrival_city)) next.arrival_city = next.departure_city === "Dakar" ? "Ballou" : "Dakar";
    onChange(next);
  }
  const routeField = <div className="space-y-2"><Label htmlFor="route_id" className={home ? "text-sm font-bold text-brand-navy" : ""}>Trajet *</Label><Select value={value.route_id} onValueChange={route => change({ ...value, route_id: route as TravelRouteId })}><SelectTrigger id="route_id" className={fieldClass}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(travelRoutes).map(([id, route]) => <SelectItem key={id} value={id}>{route.label}</SelectItem>)}</SelectContent></Select></div>;
  return <section aria-label="Trajet et arrêt de descente" className="space-y-5">
    {!home && routeField}
    <div className={home ? "" : "grid gap-5 sm:grid-cols-2"}>
      {(["departure_city", "arrival_city"] as const).map((key, index) => <div key={key}>
        {home && index === 1 && <div aria-hidden="true" className="relative ml-10 h-10 border-l-2 border-dashed border-brand-navy/50 sm:ml-12"><span className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-brand-navy" /><span className="absolute -bottom-1 -left-[5px] h-2 w-2 rounded-full bg-brand-orange" /></div>}
        <Label htmlFor={key} className={home ? "block pl-20 text-lg font-bold text-brand-navy sm:pl-24 sm:text-xl" : ""}>{index === 0 ? "Départ *" : home ? <>Destination<span className="sr-only"> — Ville de descente *</span></> : "Ville de descente *"}</Label>
        <div className={home ? "relative mt-3" : "mt-2"}>
          <Select key={index === 0 ? key : `${value.route_id}-${value.departure_city}`} value={value[key]} onValueChange={city => change({ ...value, [key]: city })}><SelectTrigger id={key} className={home ? homeFieldClass : fieldClass}><SelectValue /></SelectTrigger><SelectContent className="rounded-2xl border-slate-200 bg-white text-brand-navy">{(index === 0 ? ["Dakar", "Ballou"] : stops.slice(1)).map(city => <SelectItem key={city} value={city} className={home ? "rounded-lg py-3 text-lg" : ""}>{city}</SelectItem>)}</SelectContent></Select>
          {home && <span aria-hidden="true" className={`pointer-events-none absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl sm:left-5 sm:h-14 sm:w-14 ${index === 0 ? "bg-brand-navy text-white" : "bg-brand-orange text-brand-navy"}`}><MapPin className="h-7 w-7 sm:h-8 sm:w-8" /></span>}
        </div>
      </div>)}
    </div>
    {home && routeField}
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
      <ol aria-label="Arrêts du trajet" className="flex flex-wrap items-center gap-2 text-sm font-semibold">{stops.map((city, index) => <li key={city} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true" className="text-orange-700">→</span>}<span className={`rounded-full px-3 py-2 ${city === value.arrival_city ? "bg-brand-navy text-white" : "bg-white text-brand-navy"}`}>{city}</span></li>)}</ol>
      <p className="mt-3 text-sm font-bold text-orange-900" data-testid="route-schedule">Rendez-vous {formatTime(schedule.meeting)} • Départ {formatTime(schedule.departure)}</p>
    </div>
  </section>;
}
