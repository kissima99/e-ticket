import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ScanLine, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import TransportHeader from "@/components/TransportHeader";
import HomeModules from "@/components/HomeModules";
import TravelInformation from "@/components/TravelInformation";
import TravelDatePicker from "@/components/TravelDatePicker";
import TravelRouteSelector from "@/components/TravelRouteSelector";
import { formatPrice, formatTravelDate } from "@/lib/booking";
import { getTravelFare, isTravelDateAvailable, routeSchedule, ticketScheduleText, type TravelRouteId } from "@/lib/travel-routes";

type Selection = { route_id: TravelRouteId; departure_city: string; arrival_city: string };
export default function Index() {
  const [selection, setSelection] = useState<Selection>({ route_id: "ouro_sogui", departure_city: "Dakar", arrival_city: "Ballou" });
  const [date, setDate] = useState("");
  const [result, setResult] = useState<(Selection & { date: string; available: boolean }) | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({ ...selection, date, available: isTravelDateAvailable(date, selection.route_id, selection.departure_city) });
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }
  const schedule = routeSchedule(selection.route_id, selection.departure_city);
  return <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
    <TransportHeader>
      <div className="mx-auto grid max-w-4xl items-center gap-5 px-5 pb-7 pt-1 sm:grid-cols-2 sm:gap-8 sm:px-8 sm:pb-10">
        <div><h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">Rechercher<br />un trajet</h1><p className="mt-4 text-base font-medium text-slate-200">Dakar ↔ Ballou • DABO TRANSPORT</p></div>
        <div className="mx-auto w-full max-w-[240px] rounded-3xl bg-white p-2 sm:max-w-none sm:p-3"><img src="/assets/bus-dabo-transport.png" alt="Autocar DABO TRANSPORT, blanc, bleu et orange" width={1024} height={610} className="aspect-[1024/610] w-full object-contain" /></div>
      </div>
    </TransportHeader>
    <main className="mx-auto max-w-2xl px-4 pb-10 pt-5 sm:px-6 sm:pt-7">
      <HomeModules />
      <form onSubmit={search}>
        <Card className="rounded-[28px] border-slate-100 bg-white p-4 shadow-[0_12px_36px_-18px_rgba(0,34,68,0.25)] sm:rounded-[32px] sm:p-7">
          <h2 className="sr-only">Critères de recherche du trajet</h2>
          <TravelRouteSelector home value={selection} onChange={value => { setSelection(value); setResult(null); }} />
          <div className="mt-7 sm:mt-8"><TravelDatePicker id="date" value={date} departure={selection.departure_city} routeId={selection.route_id} onChange={value => { setDate(value); setResult(null); }} /></div>
        </Card>
        <Button type="submit" className="mt-5 h-16 w-full rounded-2xl bg-brand-orange text-xl font-extrabold text-brand-navy shadow-sm hover:bg-orange-500 sm:h-20 sm:rounded-3xl sm:text-2xl"><Search className="mr-3 h-7 w-7" /> Rechercher</Button>
        <p className="mt-4 text-center text-sm leading-relaxed text-slate-600"><strong data-testid="home-fare" className="font-bold text-brand-navy">{getTravelFare(selection.departure_city, selection.arrival_city) === undefined ? "Prix à définir par l’agent de la compagnie" : `${formatPrice(getTravelFare(selection.departure_city, selection.arrival_city))} par personne`}</strong> • {ticketScheduleText({ route_id: selection.route_id, rendezvous_time: schedule.meeting, departure_time: schedule.departure })}</p>
      </form>
      {result && <div ref={resultRef} aria-live="polite" className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        {result.available ? <div>
          <p className="mb-2 text-sm font-bold text-orange-700">Départ programmé • DABO TRANSPORT</p>
          <h2 className="text-2xl font-extrabold">{result.departure_city} <span className="text-orange-600">→</span> {result.arrival_city}</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">{formatTravelDate(result.date)}</p>
          <p className="mt-2 text-sm text-slate-600">{ticketScheduleText({ route_id: result.route_id, rendezvous_time: routeSchedule(result.route_id, result.departure_city).meeting, departure_time: routeSchedule(result.route_id, result.departure_city).departure })}</p>
          <p className="mt-2 text-sm text-slate-600">{formatAmount(getTravelFare(result.departure_city, result.arrival_city))} par personne. Choisissez un siège disponible à l’étape suivante.</p>
          <Button asChild className="mt-5 h-12 w-full rounded-xl bg-brand-navy text-base font-bold text-white hover:bg-brand-navy/90"><Link to={`/reservation?${new URLSearchParams({ route: result.route_id, departure: result.departure_city, arrival: result.arrival_city, date: result.date }).toString()}`}>Continuer la réservation <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </div> : <div><h2 className="text-xl font-extrabold">Aucun départ régulier à cette date</h2><p className="mt-3 text-base leading-relaxed text-slate-600">Choisissez un départ futur le lundi, mardi, jeudi ou samedi, selon l’horaire du trajet.</p></div>}
      </div>}
      <Accordion type="single" collapsible className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white"><AccordionItem value="informations" className="border-0"><AccordionTrigger className="px-5 py-5 text-left text-base font-bold text-brand-navy hover:no-underline">Horaires, tarifs et informations utiles</AccordionTrigger><AccordionContent className="pb-0 [&_section]:mt-0 [&_section]:rounded-none [&_section]:border-0"><TravelInformation /></AccordionContent></AccordionItem></Accordion>
      <Link to="/controle-tickets" aria-label="Contrôle du ticket — Espace agent" className="group mt-6 flex min-h-24 items-center gap-4 rounded-3xl border-2 border-brand-navy bg-brand-navy p-5 text-white shadow-[0_10px_24px_-12px_rgba(0,34,68,0.5)] transition-colors hover:border-orange-500 hover:bg-[#07365E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-orange/50 sm:p-6">
        <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-brand-navy"><ScanLine className="h-8 w-8" /></span>
        <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-300"><ShieldCheck aria-hidden="true" className="h-4 w-4" /> Espace agent</span><span className="mt-1 block text-xl font-extrabold sm:text-2xl">Contrôle du ticket</span><span className="mt-1 block text-sm text-slate-200">Accéder au contrôle et aux paiements</span></span>
        <ArrowRight aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-orange transition-transform group-hover:translate-x-1" />
      </Link>
    </main>
    <footer className="border-t border-slate-200 text-center text-sm text-slate-600"><p className="px-5 py-5">Ballou Service Express • DABO TRANSPORT • © {new Date().getFullYear()}</p><figure className="mx-auto max-w-2xl px-4 pb-6 sm:px-6 sm:pb-8"><img src="/assets/affiche-reservez-payez-voyagez.png" alt="Réservez. Payez. Voyagez. — Ballou Service Express : un billet numérique sur téléphone et un autocar au coucher du soleil." width={1440} height={2437} loading="lazy" decoding="async" className="h-auto w-full rounded-3xl shadow-sm" /></figure></footer>
  </div>;
}
