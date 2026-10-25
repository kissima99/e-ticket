import { CalendarDays, Clock3, Wallet } from "lucide-react";
import PaymentLogo from "@/components/PaymentLogo";
import { cities } from "@/lib/booking";

export default function TravelInformation() {
  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="travel-info-title">
      <h2 id="travel-info-title" className="mb-6 text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">Tout savoir avant votre départ</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-5">
          <CalendarDays className="mb-4 h-7 w-7 text-orange-700" />
          <h3 className="text-xl font-bold">Depuis Dakar</h3>
          <p className="mt-3 text-lg text-slate-600">Mardi et samedi</p>
          <p className="mt-3 flex items-center gap-2 text-base font-semibold"><Clock3 className="h-5 w-5" /> Départ à 15h00</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <CalendarDays className="mb-4 h-7 w-7 text-orange-700" />
          <h3 className="text-xl font-bold">Depuis Ballou</h3>
          <p className="mt-3 text-lg text-slate-600">Lundi et jeudi</p>
          <p className="mt-3 flex items-center gap-2 text-base font-semibold"><Clock3 className="h-5 w-5" /> Départ à 15h00</p>
        </div>
        <div className="py-1 sm:col-span-2 lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold"><Wallet className="h-6 w-6 text-orange-700" /> Modes de paiement</h3>
          <div className="flex flex-wrap gap-3">
            {(["Cash", "Wave", "OM"] as const).map(method => <div key={method} className="text-center"><PaymentLogo method={method} /><p className="mt-2 text-base font-semibold">{method}</p></div>)}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">Règlement auprès de la compagnie. Aucun débit automatique dans l’application.</p>
        </div>
      </div>
      <div className="mt-6 border-t border-slate-100 pt-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2"><p className="text-xl font-extrabold">12 000 FCFA <span className="text-base font-medium text-slate-600">par personne</span></p><p className="text-base font-semibold text-slate-600">DABO TRANSPORT</p></div>
        <h3 className="mb-3 mt-6 text-lg font-bold">Villes proposées</h3>
        <div className="flex flex-wrap gap-2">{cities.map(city => <span key={city} className="rounded-full bg-slate-50 px-3 py-2 text-base text-slate-700">{city}</span>)}</div>
        <p className="mt-6 rounded-2xl bg-orange-50 p-4 text-base leading-relaxed text-orange-900"><strong>Avant l’embarquement :</strong> arrivez 30 minutes avant le départ avec votre ticket QR et une pièce d’identité pour chaque passager.</p>
      </div>
    </section>
  );
}
