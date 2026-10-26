import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import TransportHeader from "@/components/TransportHeader";
import HomeModules from "@/components/HomeModules";
import TravelInformation from "@/components/TravelInformation";
import TravelDatePicker from "@/components/TravelDatePicker";
import { cities } from "@/lib/booking";

export default function Index() {
  const [departure, setDeparture] = useState("Dakar");
  const [arrival, setArrival] = useState("Ballou");
  const [date, setDate] = useState("");
  const [result, setResult] = useState<{ departure: string; arrival: string; date: string; available: boolean } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const day = new Date(`${date}T12:00:00`).getDay();
    const available = (departure === "Dakar" ? [2, 6] : [1, 4]).includes(day);
    setResult({ departure, arrival, date, available });
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  const field = "h-20 rounded-2xl border-2 border-slate-200 bg-white pl-20 pr-5 text-2xl font-bold text-brand-navy focus:ring-brand-orange sm:h-24 sm:pl-24 sm:text-3xl [&>svg]:h-6 [&>svg]:w-6 [&>svg]:opacity-100";
  const labelClass = "block pl-20 text-lg font-bold text-brand-navy sm:pl-24 sm:text-xl";
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
      <TransportHeader>
        <div className="mx-auto grid max-w-4xl items-center gap-5 px-5 pb-7 pt-1 sm:grid-cols-2 sm:gap-8 sm:px-8 sm:pb-10">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">Rechercher<br />un trajet</h1>
            <p className="mt-4 text-base font-medium text-slate-200">Dakar ↔ Ballou • DABO TRANSPORT</p>
          </div>
          <div className="mx-auto w-full max-w-[240px] rounded-3xl bg-white p-2 sm:max-w-none sm:p-3">
            <img src="/assets/bus-dabo-transport.png" alt="Autocar DABO TRANSPORT, blanc, bleu et orange" width={1024} height={610} className="aspect-[1024/610] w-full object-contain" />
          </div>
        </div>
      </TransportHeader>

      <main className="mx-auto max-w-2xl px-4 pb-10 pt-5 sm:px-6 sm:pt-7">
        <HomeModules />
        <form onSubmit={search}>
          <Card className="rounded-[28px] border-slate-100 bg-white p-4 shadow-[0_12px_36px_-18px_rgba(0,34,68,0.25)] sm:rounded-[32px] sm:p-7">
            <h2 className="sr-only">Critères de recherche du trajet</h2>
            <div>
              <Label htmlFor="departure" className={labelClass}>Départ</Label>
              <div className="relative mt-3">
                <Select value={departure} onValueChange={value => { setDeparture(value); if (value === arrival) setArrival(value === "Dakar" ? "Ballou" : "Dakar"); setResult(null); }}>
                  <SelectTrigger id="departure" className={field}><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 bg-white text-brand-navy">{["Dakar", "Ballou"].map(city => <SelectItem key={city} value={city} className="rounded-lg py-3 text-lg">{city}</SelectItem>)}</SelectContent>
                </Select>
                <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl bg-brand-navy text-white sm:left-5 sm:h-14 sm:w-14"><MapPin className="h-7 w-7 sm:h-8 sm:w-8" /></span>
              </div>
            </div>

            <div aria-hidden="true" className="relative ml-10 h-10 border-l-2 border-dashed border-brand-navy/50 sm:ml-12"><span className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-brand-navy" /><span className="absolute -bottom-1 -left-[5px] h-2 w-2 rounded-full bg-brand-orange" /></div>

            <div>
              <Label htmlFor="arrival" className={labelClass}>Destination</Label>
              <div className="relative mt-3">
                <Select value={arrival} onValueChange={value => { setArrival(value); setResult(null); }}>
                  <SelectTrigger id="arrival" className={field}><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 bg-white text-brand-navy">{cities.filter(city => city !== departure).map(city => <SelectItem key={city} value={city} className="rounded-lg py-3 text-lg">{city}</SelectItem>)}</SelectContent>
                </Select>
                <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl bg-brand-orange text-brand-navy sm:left-5 sm:h-14 sm:w-14"><MapPin className="h-7 w-7 sm:h-8 sm:w-8" /></span>
              </div>
            </div>

            <div className="mt-7 sm:mt-8">
              <TravelDatePicker id="date" value={date} departure={departure} onChange={value => { setDate(value); setResult(null); }} />
            </div>
          </Card>
          <Button type="submit" className="mt-5 h-16 w-full rounded-2xl bg-brand-orange text-xl font-extrabold text-brand-navy shadow-sm hover:bg-orange-500 sm:h-20 sm:rounded-3xl sm:text-2xl"><Search className="mr-3 h-7 w-7" /> Rechercher</Button>
          <p className="mt-4 text-center text-sm leading-relaxed text-slate-600">12 000 FCFA par personne • Départ à 15h00</p>
        </form>

        {result && (
          <div ref={resultRef} aria-live="polite" className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            {result.available ? (
              <div>
                <p className="mb-2 text-sm font-bold text-orange-700">Départ programmé • DABO TRANSPORT</p>
                <h2 className="text-2xl font-extrabold">{result.departure} <span className="text-orange-600">→</span> {result.arrival}</h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">{new Date(`${result.date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • 15h00</p>
                <p className="mt-2 text-sm text-slate-600">12 000 FCFA par personne. Choisissez un siège disponible à l’étape suivante.</p>
                <Button asChild className="mt-5 h-12 w-full rounded-xl bg-brand-navy text-base font-bold text-white hover:bg-brand-navy/90"><Link to={`/reservation?${new URLSearchParams({ departure: result.departure, arrival: result.arrival, date: result.date }).toString()}`}>Continuer la réservation <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
              </div>
            ) : (
              <div><h2 className="text-xl font-extrabold">Aucun départ régulier à cette date</h2><p className="mt-3 text-base leading-relaxed text-slate-600">Depuis {result.departure}, choisissez {result.departure === "Dakar" ? "un mardi ou un samedi" : "un lundi ou un jeudi"}. Départ à 15h00.</p></div>
            )}
          </div>
        )}

        <Accordion type="single" collapsible className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <AccordionItem value="informations" className="border-0">
            <AccordionTrigger className="px-5 py-5 text-left text-base font-bold text-brand-navy hover:no-underline">Horaires, tarifs et informations utiles</AccordionTrigger>
            <AccordionContent className="pb-0 [&_section]:mt-0 [&_section]:rounded-none [&_section]:border-0"><TravelInformation /></AccordionContent>
          </AccordionItem>
        </Accordion>
        <Link to="/controle-tickets" className="mt-6 block rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-brand-navy hover:border-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Contrôle du ticket — Espace agent</Link>
      </main>
      <footer className="border-t border-slate-200 text-center text-sm text-slate-600">
        <p className="px-5 py-5">Ballou Service Express • DABO TRANSPORT • © {new Date().getFullYear()}</p>
        <figure className="mx-auto max-w-2xl px-4 pb-6 sm:px-6 sm:pb-8">
          <img src="/assets/affiche-reservez-payez-voyagez.png" alt="Réservez. Payez. Voyagez. — Ballou Service Express : un billet numérique sur téléphone et un autocar au coucher du soleil." width={1440} height={2437} loading="lazy" decoding="async" className="h-auto w-full rounded-3xl shadow-sm" />
        </figure>
      </footer>
    </div>
  );
}
