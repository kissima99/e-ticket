import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, Bus, CalendarDays, Check, ChevronRight, Clock3, MapPin, Search, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TransportHeader from "@/components/TransportHeader";
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

  const field = "h-14 rounded-xl border-slate-200 bg-white text-base font-semibold text-brand-navy focus:ring-brand-orange sm:text-lg";
  const labelClass = "flex items-center gap-2 text-base font-semibold text-brand-navy";
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
      <TransportHeader />
      <main className="mx-auto max-w-6xl px-5 pb-12 pt-8 md:px-8 md:pt-12">
        <HomeModules onAccueil={() => { setChosen(false); setResult(null); }} />
        <div className="mb-8 grid max-w-lg grid-cols-2 gap-3 text-sm font-semibold sm:text-base">
          <button type="button" onClick={() => setChosen(false)} className="flex items-center gap-3 rounded-xl bg-orange-50 px-3 py-3 text-left text-brand-navy hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-brand-navy">{chosen ? <Check className="h-5 w-5" /> : "1"}</span>
            Votre compagnie
          </button>
          <div className={`flex items-center gap-3 rounded-xl px-3 py-3 ${chosen ? "bg-orange-50 text-brand-navy" : "bg-slate-100 text-slate-600"}`}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${chosen ? "bg-brand-orange text-brand-navy" : "bg-slate-200 text-slate-600"}`}>2</span>
            Votre trajet
          </div>
        </div>

        {!chosen ? (
          <>
            <div className="mb-9 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-orange-700">Votre voyage commence ici</p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">Choisissez votre<br /><span className="text-orange-600">compagnie de transport.</span></h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">De Dakar à Ballou, préparez votre départ et retrouvez les informations utiles pour votre prochain voyage.</p>
            </div>
            <Card className="overflow-hidden rounded-[28px] border-orange-200 bg-white shadow-[0_14px_50px_-25px_rgba(0,34,68,0.3)]">
              <div className="grid items-center gap-7 p-6 sm:p-9 md:grid-cols-2">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800"><BadgeCheck className="h-5 w-5" /> Compagnie proposée</span>
                  <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">DABO TRANSPORT</h2>
                  <p className="mt-3 text-lg leading-relaxed text-slate-600">La liaison régulière entre Dakar et Ballou.</p>
                  <div className="my-6 flex flex-wrap gap-3 text-base font-semibold"><span className="rounded-xl bg-slate-50 px-4 py-3">Dakar ↔ Ballou</span><span className="rounded-xl bg-slate-50 px-4 py-3">Départ à 15h00</span></div>
                  <div className="mb-7"><p className="text-4xl font-extrabold tracking-tight">12 000 <span className="text-lg font-bold">FCFA</span></p><p className="mt-1 text-base text-slate-600">par personne</p></div>
                  <Button onClick={chooseCompany} className="h-auto min-h-14 w-full whitespace-normal rounded-xl bg-brand-orange px-5 py-3 text-base font-bold text-brand-navy hover:bg-orange-500 sm:w-auto sm:text-lg">Choisir DABO TRANSPORT <ChevronRight className="ml-2 h-5 w-5 shrink-0" /></Button>
                </div>
                <figure className="min-w-0 rounded-3xl border border-slate-100 bg-white p-3 sm:p-4">
                  <img src="/assets/bus-ballou-service-express.jpeg" alt="Autocar Ballou Service Express, blanc, bleu et orange" width={559} height={333} className="aspect-[559/333] w-full object-contain" />
                  <figcaption className="mt-4 border-t border-slate-100 pt-4 text-center text-base font-semibold text-brand-navy">Ballou Service Express</figcaption>
                </figure>
              </div>
            </Card>
          </>
        ) : (
          <>
            <button onClick={() => { setChosen(false); setResult(null); }} className="mb-6 inline-flex items-center gap-2 text-base font-semibold text-slate-600 hover:text-orange-700"><ArrowLeft className="h-5 w-5" /> Changer de compagnie</button>
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-orange-700">DABO TRANSPORT • Recherche de trajet</p>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Trouvez votre trajet.<br /><span className="text-orange-600">Préparez votre départ.</span></h1>
                <p className="mb-8 mt-5 text-lg leading-relaxed text-slate-600">Indiquez votre départ, votre destination et la date de votre voyage. Vous pourrez ensuite choisir votre siège.</p>
                <form onSubmit={search} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <h2 className="mb-6 text-xl font-extrabold sm:text-2xl">Rechercher un trajet</h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="departure" className={labelClass}><MapPin className="h-5 w-5 text-orange-700" /> Ville de départ</Label>
                      <Select value={departure} onValueChange={value => { setDeparture(value); if (value === arrival) setArrival(value === "Dakar" ? "Ballou" : "Dakar"); setResult(null); }}><SelectTrigger id="departure" className={field}><SelectValue /></SelectTrigger><SelectContent>{["Dakar", "Ballou"].map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="arrival" className={labelClass}><MapPin className="h-5 w-5 text-orange-700" /> Destination</Label>
                      <Select value={arrival} onValueChange={value => { setArrival(value); setResult(null); }}><SelectTrigger id="arrival" className={field}><SelectValue /></SelectTrigger><SelectContent>{cities.filter(city => city !== departure).map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="date" className={labelClass}><CalendarDays className="h-5 w-5 text-orange-700" /> Date de voyage</Label>
                      <Input id="date" type="date" required min={today()} value={date} onChange={e => { setDate(e.target.value); setResult(null); }} className={field} />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="company" className={labelClass}><Bus className="h-5 w-5 text-orange-700" /> Compagnie</Label>
                      <Select value="dabo"><SelectTrigger id="company" className={field}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dabo">DABO TRANSPORT</SelectItem></SelectContent></Select>
                    </div>
                  </div>
                  <Button type="submit" className="mt-7 h-auto min-h-14 w-full whitespace-normal rounded-xl bg-brand-orange px-4 py-4 text-base font-bold text-brand-navy hover:bg-orange-500 sm:text-lg"><Search className="mr-2 h-5 w-5 shrink-0" /> Rechercher mon trajet <ArrowRight className="ml-2 hidden h-5 w-5 sm:block" /></Button>
                  <p className="mt-4 text-center text-sm leading-relaxed text-slate-600">Sans compte Google • 12 000 FCFA par personne</p>
                </form>
              </section>
              <aside className="overflow-hidden rounded-3xl border border-orange-200 bg-white">
                <figure className="p-4 pb-5">
                  <img src="/assets/bus-ballou-service-express.jpeg" alt="Bus Ballou Service Express pour votre voyage avec DABO TRANSPORT" width={559} height={333} className="aspect-[559/333] w-full object-contain" />
                  <figcaption className="mt-3 text-center text-lg font-extrabold">Ballou Service Express</figcaption>
                </figure>
                <div className="border-t border-orange-100 bg-orange-50/60 p-6">
                  <h2 className="mb-5 text-xl font-extrabold">Nos départs réguliers</h2>
                  <div className="space-y-5 text-base leading-relaxed">
                    <div><p className="font-bold">Dakar → Ballou et arrêts</p><p className="mt-1 text-slate-600">Mardi et samedi</p><p className="mt-2 flex items-center gap-2 font-semibold"><Clock3 className="h-4 w-4 text-orange-700" /> Départ à 15h00</p></div>
                    <div className="h-px bg-orange-200" />
                    <div><p className="font-bold">Ballou → Dakar et arrêts</p><p className="mt-1 text-slate-600">Lundi et jeudi</p><p className="mt-2 flex items-center gap-2 font-semibold"><Clock3 className="h-4 w-4 text-orange-700" /> Départ à 15h00</p></div>
                  </div>
                </div>
              </aside>
            </div>
            {result && (
              <div ref={resultRef} aria-live="polite" className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
                {result.available ? (
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="mb-2 text-sm font-bold text-orange-700">Départ programmé • DABO TRANSPORT</p>
                      <h2 className="text-2xl font-extrabold">{result.departure} <span className="text-orange-600">→</span> {result.arrival}</h2>
                      <p className="mt-3 text-base leading-relaxed text-slate-600">{new Date(`${result.date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • 15h00 • 12 000 FCFA / personne</p>
                      <p className="mt-2 text-sm text-slate-600">Le choix du siège se fait à l’étape suivante.</p>
                    </div>
                    <Button asChild className="h-14 shrink-0 rounded-xl bg-brand-navy px-6 text-base font-bold text-white hover:bg-brand-navy/90"><Link to={`/reservation?${new URLSearchParams({ departure: result.departure, arrival: result.arrival, date: result.date }).toString()}`}>Continuer <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
                  </div>
                ) : (
                  <div><h2 className="text-xl font-extrabold">Aucun départ régulier à cette date</h2><p className="mt-3 text-base leading-relaxed text-slate-600">Depuis {result.departure}, choisissez {result.departure === "Dakar" ? "un mardi ou un samedi" : "un lundi ou un jeudi"}. Départ à 15h00.</p></div>
                )}
              </div>
            )}
          </>
        )}
        <TravelInformation />
        <section className="mt-12 border-t border-slate-200 pt-9">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">Pourquoi choisir Ballou Service Express ?</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[{ icon: Ticket, title: "Réservez depuis chez vous", text: "Préparez votre voyage sans vous déplacer en gare." }, { icon: Clock3, title: "Des horaires clairs", text: "Retrouvez facilement les jours et heures de départ." }, { icon: ShieldCheck, title: "Sans compte Google", text: "Une fiche voyageur suffit pour votre réservation." }].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6"><Icon className="mb-4 h-7 w-7 text-orange-700" /><h3 className="text-lg font-bold">{title}</h3><p className="mt-3 text-base leading-relaxed text-slate-600">{text}</p></div>
            ))}
          </div>
        </section>
        <section className="mt-8 flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-navy p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div><p className="mb-3 text-sm font-bold tracking-wide text-brand-orange">Carte cadeau & fidélité</p><h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">Vos voyages vous récompensent.</h2><p className="mt-3 max-w-lg text-base leading-relaxed text-slate-200">Cumulez des points et échangez-en 10 contre une réduction, une carte cadeau ou une demande de recharge.</p></div>
          <Button asChild className="h-14 w-full shrink-0 rounded-xl bg-brand-orange px-5 text-base font-bold text-brand-navy hover:bg-orange-500 sm:w-auto"><Link to="/fidelite">Ma carte cadeau <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </section>
      </main>
      <footer className="bg-brand-navy px-5 py-8 text-center text-base text-white"><p className="font-bold tracking-wider">BALLOU <span className="text-brand-orange">SERVICE EXPRESS</span></p><p className="mt-3 text-sm text-slate-300">Opéré par DABO TRANSPORT • © {new Date().getFullYear()}</p></footer>
    </div>
  );
}
