import { CalendarDays, Clock3, Wallet } from "lucide-react";
import PaymentLogo from "@/components/PaymentLogo";
import { departureDaysLabel, formatTime, routeStops, travelRoutes, type TravelRouteId } from "@/lib/travel-routes";

export default function TravelInformation() {
  return <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="travel-info-title">
    <h2 id="travel-info-title" className="mb-6 text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">Tout savoir avant votre départ</h2>
    <p className="mb-5 flex items-start gap-3 rounded-2xl bg-orange-50 p-4 font-semibold text-orange-900"><CalendarDays className="h-6 w-6 shrink-0" />{departureDaysLabel}, dans les deux sens.</p>
    <div className="grid gap-4 sm:grid-cols-2">{Object.entries(travelRoutes).flatMap(([id, route]) => (["Dakar", "Ballou"] as const).map(departure => <div key={`${id}-${departure}`} className="rounded-2xl bg-slate-50 p-5">
      <h3 className="text-lg font-bold">{routeStops(id as TravelRouteId, departure).join(" → ")}</h3>
      <p className="mt-4 flex items-center gap-2 text-sm font-semibold"><Clock3 className="h-5 w-5 text-orange-700" /> Rendez-vous {formatTime(route[departure].meeting)}</p>
      <p className="mt-2 text-lg font-bold text-brand-navy">Départ {formatTime(route[departure].departure)}</p>
    </div>))}</div>
    <div className="mt-6 border-t border-slate-100 pt-6">
      <p className="text-xl font-extrabold">12 000 FCFA <span className="text-base font-medium text-slate-600">par personne</span></p>
      <p className="mt-3 text-sm text-slate-700">Choisissez votre ville de descente parmi les arrêts du trajet sélectionné.</p>
      <h3 className="mb-4 mt-6 flex items-center gap-2 text-xl font-bold"><Wallet className="h-6 w-6 text-orange-700" /> Modes de paiement</h3>
      <div className="flex flex-wrap gap-3">{(["Cash", "Wave", "OM"] as const).map(method => <div key={method} className="text-center"><PaymentLogo method={method} /><p className="mt-2 text-base font-semibold">{method}</p></div>)}</div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">Règlement auprès de la compagnie. Aucun débit automatique dans l’application.</p>
      <p className="mt-6 rounded-2xl bg-orange-50 p-4 text-base leading-relaxed text-orange-900"><strong>Avant l’embarquement :</strong> respectez l’heure de rendez-vous de votre trajet et présentez votre ticket QR payé ainsi qu’une pièce d’identité pour chaque passager.</p>
    </div>
  </section>;
}
