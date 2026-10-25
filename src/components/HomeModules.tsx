import { Link } from "react-router-dom";
import { Gift, House, Ticket } from "lucide-react";

export default function HomeModules() {
  return (
    <nav aria-label="Navigation principale" className="mb-7 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:gap-3">
      {[{ title: "Accueil", icon: House, path: "/" }, { title: "Réserver", icon: Ticket, path: "/reservation" }, { title: "Carte cadeau", icon: Gift, path: "/fidelite" }].map(({ title, icon: Icon, path }) => (
        <Link key={path} to={path} aria-current={path === "/" ? "page" : undefined} className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 sm:flex-row sm:gap-2 sm:px-3 sm:text-base ${path === "/" ? "bg-brand-navy text-white" : "text-brand-navy hover:bg-orange-50"}`}>
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {title}
        </Link>
      ))}
    </nav>
  );
}
