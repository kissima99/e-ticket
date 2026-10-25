import { Link } from "react-router-dom";
import { ArrowUpRight, Gift, House, Ticket } from "lucide-react";

export default function HomeModules({ onAccueil }: { onAccueil: () => void }) {
  const links = [
    { title: "Accueil", text: "Découvrez la compagnie, les tarifs et les horaires de départ.", icon: House, path: "/" },
    { title: "Réserver", text: "Choisissez votre trajet et votre siège, puis obtenez votre ticket QR.", icon: Ticket, path: "/reservation" },
    { title: "Carte cadeau", text: "Consultez vos points, vos récompenses et vos cartes cadeaux.", icon: Gift, path: "/fidelite" },
  ];
  return (
    <nav aria-label="Navigation principale" className="mb-10 sm:mb-12">
      <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">Votre espace voyage</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {links.map(({ title, text, icon: Icon, path }) => (
          <Link key={title} to={path} onClick={path === "/" ? onAccueil : undefined} aria-current={path === "/" ? "page" : undefined} className={`group flex h-full flex-col rounded-3xl border p-5 text-brand-navy shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 sm:p-6 ${path === "/" ? "border-orange-300 bg-orange-50/60" : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30"}`}>
            <div className="flex items-center gap-3">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${path === "/" ? "bg-brand-orange text-brand-navy" : "bg-slate-100 text-brand-navy"}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <h3 className="flex-1 text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h3>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-orange-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
            </div>
            <p className="mt-4 text-base leading-relaxed text-slate-600">{text}</p>
          </Link>
        ))}
      </div>
    </nav>
  );
}
