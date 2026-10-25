import { CalendarDays, Clock3, Wallet } from "lucide-react";
import PaymentLogo from "@/components/PaymentLogo";
import { cities } from "@/lib/booking";

export default function TravelInformation() {
  return (
    <section className="mt-9 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="travel-info-title">
      <h2 id="travel-info-title" className="mb-5 text-xl font-extrabold text-brand-navy">Les informations pour votre voyage</h2>
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4"><CalendarDays className="mb-3 h-6 w-6 text-orange-700" /><h3 className="font-bold">Depuis Dakar</h3><p className="mt-2 text-sm text-slate-600">Mardi & samedi</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold"><Clock3 className="h-4 w-4" /> Départ à 15h00</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><CalendarDays className="mb-3 h-6 w-6 text-orange-700" /><h3 className="font-bold">Depuis Ballou</h3><p className="mt-2 text-sm text-slate-600">Lundi & jeudi</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold"><Clock3 className="h-4 w-4" /> Départ à 15h00</p></div>
        <div><h3 className="mb-3 flex items-center gap-2 font-bold"><Wallet className="h-5 w-5 text-orange-700" /> Modes de paiement</h3><div className="flex flex-wrap gap-3">{(["Cash", "Wave", "OM"] as const).map(method => <div key={method} className="text-center"><PaymentLogo method={method} /><p className="mt-1 text-xs font-semibold">{method}</p></div>)}</div><p className="mt-3 text-xs leading-relaxed text-slate-600">Règlement auprès de la compagnie. Aucun débit automatique dans l’application.</p></div>
      </div>
      <div className="mt-5 border-t border-slate-100 pt-5 text-sm"><p className="font-semibold">12 000 FCFA par personne • DABO TRANSPORT</p><p className="mt-2 leading-relaxed text-slate-600"><strong className="text-brand-navy">Villes proposées :</strong> {cities.join(" • ")}</p><p className="mt-3 rounded-xl bg-orange-50 p-3 text-orange-900">Arrivez 30 minutes avant le départ avec votre ticket QR et une pièce d’identité pour chaque passager.</p></div>
    </section>
  );
}
