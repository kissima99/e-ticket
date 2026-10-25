import { Link } from "react-router-dom";
import { ArrowUpRight, Gift, House, Ticket } from "lucide-react";

export default function HomeModules({ onAccueil }: { onAccueil: () => void }) {
  const modules = [
    { number: "01", title: "Accueil", text: "Compagnie, trajets, tarifs et horaires : toutes les informations pour préparer votre voyage.", icon: House, path: "/", style: "bg-blue-50 text-blue-800" },
    { number: "02", title: "Réserver", text: "Votre trajet, votre siège, vos renseignements et le paiement, jusqu’au ticket avec QR.", icon: Ticket, path: "/reservation", style: "bg-orange-50 text-orange-800" },
    { number: "03", title: "Ma Carte Cadeau", text: "Retrouvez votre carte fidélité, vos points, vos récompenses et vos codes cadeaux.", icon: Gift, path: "/fidelite", style: "bg-purple-50 text-purple-800" },
  ];
  return (
    <nav aria-label="Modules de l’application" className="mb-10">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold text-brand-navy">Votre espace voyage</h2><span className="text-xs font-semibold text-slate-500">3 modules</span></div>
      <div className="grid gap-3 md:grid-cols-3">{modules.map(({ number, title, text, icon: Icon, path, style }) => <Link key={title} to={path} onClick={path === "/" ? onAccueil : undefined} className="group rounded-3xl border border-slate-200 bg-white p-5 text-brand-navy shadow-sm transition-colors hover:border-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 sm:p-6"><div className="mb-4 flex items-center justify-between"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style}`}><Icon className="h-6 w-6" /></span><span className="text-xs font-bold tracking-widest text-slate-500">MODULE {number}</span></div><div className="flex items-center justify-between gap-2"><h3 className="text-xl font-extrabold">{title}</h3><ArrowUpRight className="h-5 w-5 text-orange-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" /></div><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p></Link>)}</div>
    </nav>
  );
}
