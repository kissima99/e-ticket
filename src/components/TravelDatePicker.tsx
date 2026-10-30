import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { departureDaysLabel, formatTime, isTravelDateAvailable, routeSchedule, type TravelRouteId } from "@/lib/travel-routes";

const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const shiftDate = (value: string, days: number) => {
  const date = new Date(`${value}T15:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKey(date);
};
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(`${value}T15:00:00Z`).getTime()) && dateKey(new Date(`${value}T15:00:00Z`)) === value;

export default function TravelDatePicker({ id, value, departure, routeId, onChange, invalid = false }: { id: string; value: string; departure: string; routeId: TravelRouteId; onChange: (value: string) => void; invalid?: boolean }) {
  const today = dateKey(new Date());
  const [start, setStart] = useState(() => validDate(value) && value >= today ? value : today);
  useEffect(() => {
    if (validDate(value)) setStart(previous => value < previous || value > shiftDate(previous, 4) ? value < today ? today : value : previous);
  }, [value, today]);
  const schedule = routeSchedule(routeId, departure);
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_28px_-14px_rgba(0,34,68,0.22)] sm:p-6" aria-label="Choisir la date">
      <h3 className="mb-5 flex items-center gap-3 text-lg font-extrabold text-brand-navy sm:text-2xl"><CalendarDays className="h-7 w-7 text-brand-orange" aria-hidden="true" /> Sélectionner la date</h3>
      <div className="flex items-center gap-2 sm:gap-3">
        <Button type="button" variant="outline" size="icon" aria-label="Dates précédentes" disabled={start <= today} onClick={() => setStart(shiftDate(start, -5) < today ? today : shiftDate(start, -5))} className="h-9 w-9 shrink-0 rounded-full border-slate-100 text-brand-navy shadow-sm sm:h-11 sm:w-11"><ChevronLeft /></Button>
        <div className="grid min-w-0 flex-1 grid-cols-5 gap-1.5 sm:gap-3">
          {Array.from({ length: 5 }, (_, index) => {
            const key = shiftDate(start, index);
            const date = new Date(`${key}T12:00:00Z`);
            const available = isTravelDateAvailable(key, routeId, departure);
            const selected = key === value;
            return <button key={key} type="button" disabled={!available} onClick={() => onChange(key)} aria-pressed={selected} aria-label={date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })} className={`flex min-h-24 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 disabled:cursor-not-allowed sm:min-h-32 sm:rounded-2xl ${selected && available ? "border-orange-600 bg-orange-600 text-white shadow-md" : available ? "border-slate-200 bg-white text-brand-navy hover:border-brand-orange hover:bg-orange-50" : "border-slate-100 bg-slate-50 text-slate-500"}`}><span className="text-[10px] font-semibold capitalize sm:text-sm">{date.toLocaleDateString("fr-FR", { weekday: "short", timeZone: "UTC" }).replace(".", "")}</span><span className="text-2xl font-extrabold sm:text-4xl">{date.getUTCDate()}</span><span className="text-[10px] font-semibold capitalize sm:text-sm">{date.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" }).replace(".", "")}</span></button>;
          })}
        </div>
        <Button type="button" variant="outline" size="icon" aria-label="Dates suivantes" onClick={() => setStart(shiftDate(start, 5))} className="h-9 w-9 shrink-0 rounded-full border-slate-100 text-brand-navy shadow-sm sm:h-11 sm:w-11"><ChevronRight /></Button>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-600">{departureDaysLabel} • Départ {formatTime(schedule.departure)} • Les jours sans départ sont grisés.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4"><Label htmlFor={id} className="text-sm font-semibold text-brand-navy">Choisir une autre date</Label><Input id={id} type="date" required min={today} value={value} onChange={event => onChange(event.target.value)} aria-invalid={invalid} className="h-11 w-full min-w-0 rounded-xl border-slate-200 text-brand-navy focus-visible:ring-brand-orange sm:w-auto" /></div>
    </section>
  );
}
