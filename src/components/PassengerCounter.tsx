import { Minus, Plus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PassengerCounter({ count, onChange }: { count: number; onChange: (count: number) => void }) {
  return (
    <section aria-label="Nombre de passagers" className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_28px_-14px_rgba(0,34,68,0.22)] sm:p-6">
      <div className="flex items-start gap-3"><UsersRound className="mt-1 h-8 w-8 shrink-0 text-brand-orange" aria-hidden="true" /><div><h3 className="text-lg font-extrabold text-brand-navy sm:text-2xl">Nombre de passagers</h3><p className="mt-1 text-sm text-slate-600">Sélectionnez le nombre de passagers (1 à 5)</p></div></div>
      <div className="mt-5 flex items-center justify-center gap-8 sm:gap-14">
        <Button type="button" variant="outline" size="icon" aria-label="Retirer un passager" disabled={count <= 1} onClick={() => onChange(count - 1)} className="h-14 w-14 rounded-full border-slate-100 text-brand-navy shadow-md hover:bg-orange-50"><Minus className="h-7 w-7" /></Button>
        <div className="min-w-20 text-center" role="status" aria-live="polite"><span className="block text-5xl font-extrabold text-brand-navy">{count}</span><span className="mt-1 block text-sm font-medium text-brand-navy">Passager{count > 1 ? "s" : ""}</span></div>
        <Button type="button" variant="outline" size="icon" aria-label="Ajouter un passager" disabled={count >= 5} onClick={() => onChange(count + 1)} className="h-14 w-14 rounded-full border-slate-100 text-brand-navy shadow-md hover:bg-orange-50"><Plus className="h-7 w-7" /></Button>
      </div>
    </section>
  );
}
