import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, Bus, CalendarDays, Check, ChevronRight, Clock3, MapPin, Search, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TransportHeader from "@/components/TransportHeader";
import BusIllustration from "@/components/BusIllustration";
import HomeModules from "@/components/HomeModules";
import TravelInformation from "@/components/TravelInformation";

const cities = ["Dakar", "Ballou", "Touba", "Dara Djolof", "Ouroussogui", "Sèmè", "Tamba", "Kaolack", "Goudiry", "Kidira", "Bakel", "Bema", "Gabou", "Sarré"];
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

export default function Index() {
  const [chosen, setChosen] = useState(false);
  const [departure, setDeparture] = useState("Dakar");
  const [arrival, setArrival] = useState("Ballou");
  const [date, setDate] = useState("");
  const [result, setResult] = useState<{ departure: string; arrival: string; date: string; available: boolean } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const chooseCompany = () => { setChosen(true); setResult(null); window.scrollTo({ top: 0, behavior: "smooth" }); };

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const day = new Date(`${date}T12:00:00`).getDay();
    const available = (departure === "Dakar" ? [2, 6] : [1, 4]).includes(day);
    setResult({ departure, arrival, date, available });
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  const field = "h-12 rounded-xl border-slate-200 bg-white text-base font-semibold text-brand-navy focus:ring-brand-orange";
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
      <TransportHeader />
      <main className="mx-auto max-w-6xl px-5 pb-12 pt-8 md:px-8 md:pt-12">
        <HomeModules onAccueil={() => { setChosen(false); setResult(null); }} />
        <div className="mb-8 flex items-center gap-3 text-xs font-semibold sm:text-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-orange text-white">{chosen ? <Check className="h-4 w-4" /> : "1"}</span>
          <button type="button" onClick={() => setChosen(false)} className="text-brand-navy hover:underline">Votre compagnie</button>
          <span className="h-px w-8 bg-slate-300" />
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${chosen ? "bg-brand-orange text-white" : "bg-slate-200 text-slate-600"}`}>2</span>
          <span className={chosen ? "text-brand-navy" : "text-slate-500"}>Votre trajet</span>
        </div>

        {!chosen ? (
          <>
            <div className="mb-9 max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-orange-700">Votre voyage commence ici</p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">Choisissez votre<br /><span className="text-orange-600">compagnie de transport.</span></h1>
              <p className="mt-4 leading-relaxed text-slate-600">Dakar, Ballou et les villes d’arrêt. Retrouvez votre compagnie et préparez votre prochain départ.</p>
            </div>
            <Card className="overflow-hidden rounded-[28px] border-orange-200 bg-white shadow-[0_14px_50px_-25px_rgba(0,34,68,0.3)]">
              <div className="grid items-center gap-4 p-6 sm:p-9 md:grid-cols-2">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800"><BadgeCheck className="h-4 w-4" /> Compagnie proposée</span>
                  <h2 className="mt-5 text-3xl font-black sm:text-4xl">DABO TRANSPORT</h2>
                  <p className="mt-3 text-slate-600">La liaison régulière entre Dakar et Ballou.</p>
                  <div className="my-5 flex flex-wrap gap-3 text-sm"><span className="rounded-lg bg-slate-50 px-3 py-2">Dakar ↔ Ballou</span><span className="rounded-lg bg-slate-50 px-3 py-2">Départ à 15h00</span></div>
                  <p className="mb-6 text-3xl font-extrabold">12 000 <span className="text-sm font-medium text-slate-500">FCFA / personne</span></p>
                  <Button onClick={chooseCompany} className="h-12 w-full rounded-xl bg-brand-orange px-6 text-base font-bold text-brand-navy hover:bg-orange-500 sm:w-auto">Choisir DABO TRANSPORT <ChevronRight className="ml-3 h-5 w-5" /></Button>
                </div>
                <div className="rounded-3xl bg-slate-50 p-3"><BusIllustration /></div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <button onClick={() => { setChosen(false); setResult(null); }} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-700"><ArrowLeft className="h-4 w-4" /> Changer de compagnie</button>
            <div className="grid items-start gap-9 lg:grid-cols-[1fr_340px]">
              <section>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">DABO TRANSPORT • Réservation</p>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Voyagez au Sénégal,<br /><span className="text-orange-600">sans quitter votre canapé.</span></h1>
                <p className="mb-7 mt-4 text-slate-600">Recherchez votre trajet et réservez votre billet en quelques clics.</p>
                <form onSubmit={search} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="departure" className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4 text-orange-600" /> Départ</Label>
                      <Select value={departure} onValueChange={value => { setDeparture(value); if (value === arrival) setArrival(value === "Dakar" ? "Ballou" : "Dakar"); setResult(null); }}><SelectTrigger id="departure" className={field}><SelectValue /></SelectTrigger><SelectContent>{["Dakar", "Ballou"].map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-2"><Label htmlFor="arrival" className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4 text-orange-600" /> Arrivée</Label>
                      <Select value={arrival} onValueChange={value => { setArrival(value); setResult(null); }}><SelectTrigger id="arrival" className={field}><SelectValue /></SelectTrigger><SelectContent>{cities.filter(city => city !== departure).map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-2"><Label htmlFor="date" className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="h-4 w-4 text-orange-600" /> Date de voyage</Label><Input id="date" type="date" required min={today()} value={date} onChange={e => { setDate(e.target.value); setResult(null); }} className={field} /></div>
                    <div className="space-y-2"><Label htmlFor="company" className="flex items-center gap-2 text-sm text-slate-600"><Bus className="h-4 w-4 text-orange-600" /> Compagnie</Label><Select value="dabo"><SelectTrigger id="company" className={field}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dabo">DABO TRANSPORT</SelectItem></SelectContent></Select></div>
                  </div>
                  <Button type="submit" className="mt-6 h-auto min-h-14 w-full whitespace-normal rounded-xl bg-brand-orange px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"><Search className="mr-2 h-5 w-5 shrink-0" /> RECHERCHER MON BILLET & RÉSERVER <ArrowRight className="ml-2 hidden h-5 w-5 sm:block" /></Button>
                  <p className="mt-3 text-center text-xs text-slate-500">Aucun compte Google requis • Tarif unique : 12 000 FCFA</p>
                </form>
              </section>
              <aside className="rounded-3xl border border-orange-100 bg-orange-50/60 p-6">
                <BusIllustration />
                <h2 className="mb-4 text-lg font-bold">Nos départs réguliers</h2>
                <div className="space-y-4 text-sm"><p><strong>Dakar → Ballou et arrêts</strong><br /><span className="text-slate-600">Mardi & samedi • 15h00</span></p><div className="h-px bg-orange-200" /><p><strong>Ballou → Dakar et arrêts</strong><br /><span className="text-slate-600">Lundi & jeudi • 15h00</span></p></div>
              </aside>
            </div>
            {result && <div ref={resultRef} aria-live="polite" className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
              {result.available ? <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="mb-1 text-xs font-bold uppercase tracking-wider text-orange-700">Départ programmé • DABO TRANSPORT</p><h2 className="text-xl font-bold">{result.departure} <span className="text-orange-600">→</span> {result.arrival}</h2><p className="mt-2 text-sm text-slate-600">{new Date(`${result.date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • 15h00 • 12 000 FCFA / personne</p><p className="mt-1 text-xs text-slate-500">Le choix du siège se fait à l’étape suivante.</p></div><Button asChild className="h-12 rounded-xl bg-brand-navy px-6 text-white hover:bg-brand-navy/90"><Link to={`/reservation?${new URLSearchParams({ departure: result.departure, arrival: result.arrival, date: result.date }).toString()}`}>Continuer <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div> : <div><h2 className="font-bold">Aucun départ régulier à cette date</h2><p className="mt-2 text-sm text-slate-600">Depuis {result.departure}, choisissez {result.departure === "Dakar" ? "un mardi ou un samedi" : "un lundi ou un jeudi"}. Départ à 15h00.</p></div>}
            </div>}
          </>
        )}
        <TravelInformation />
        <section className="mt-12 border-t border-slate-200 pt-9">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">Pourquoi choisir Ballou Service Express ?</h2>
          <div className="grid gap-5 sm:grid-cols-3">{[{ icon: Ticket, title: "Réservez depuis chez vous", text: "Préparez votre voyage sans vous déplacer en gare." }, { icon: Clock3, title: "Des horaires clairs", text: "Retrouvez les jours de départ de DABO TRANSPORT." }, { icon: ShieldCheck, title: "Sans connexion Google", text: "Une fiche voyageur suffit pour votre réservation." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon className="mb-4 h-6 w-6 text-orange-600" /><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p></div>)}</div>
        </section>
        <section className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl bg-brand-navy p-6 text-white sm:flex-row sm:items-center sm:p-8"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-orange">Carte cadeau & fidélité</p><h2 className="text-2xl font-extrabold">Vos voyages vous récompensent.</h2><p className="mt-2 max-w-lg text-sm text-slate-200">Cumulez des points, échangez-en 10 contre une réduction, une carte cadeau ou une demande de recharge.</p></div><Button asChild className="h-12 shrink-0 rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500"><Link to="/fidelite">Ma carte fidélité <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></section>
      </main>
      <footer className="bg-brand-navy px-5 py-7 text-center text-sm text-white"><p className="font-bold tracking-wider">BALLOU <span className="text-brand-orange">SERVICE EXPRESS</span></p><p className="mt-2 text-xs text-slate-300">Opéré par DABO TRANSPORT • © {new Date().getFullYear()}</p></footer>
    </div>
  );
}
