import { useEffect, useState } from "react";
import { AlertTriangle, BadgeAlert, BusFront, CalendarDays, FileText, Loader2, PhoneCall, Tags } from "lucide-react";
import TransportHeader from "@/components/TransportHeader";
import HomeModules from "@/components/HomeModules";
import { supabase } from "@/integrations/supabase/client";

type Announcement = { id: string; type: "PANNE" | "TARIF" | "NOTE"; title: string; message: string; effective_date: string | null; created_at: string };
const typeDetails = {
  PANNE: { label: "Panne ou perturbation", icon: BusFront, className: "border-red-200 bg-red-50 text-red-950", iconClassName: "bg-red-600 text-white" },
  TARIF: { label: "Tarifs", icon: Tags, className: "border-orange-200 bg-orange-50 text-orange-950", iconClassName: "bg-orange-600 text-white" },
  NOTE: { label: "Note de la compagnie", icon: FileText, className: "border-blue-200 bg-blue-50 text-blue-950", iconClassName: "bg-blue-700 text-white" },
};

export default function Info() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    supabase.from("announcements").select("id,type,title,message,effective_date,created_at").eq("is_active", true).order("created_at", { ascending: false }).then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError("Les informations sont temporairement indisponibles.");
      else setAnnouncements((data || []) as Announcement[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
    <TransportHeader />
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-5 sm:px-6 sm:pt-7">
      <HomeModules />
      <section className="mb-7 rounded-3xl bg-brand-navy p-6 text-white shadow-sm sm:p-8">
        <div className="flex items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-brand-navy"><BadgeAlert className="h-8 w-8" /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">DABO TRANSPORT</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">INFO</h1><p className="mt-3 text-sm leading-relaxed text-slate-200">Retrouvez ici les informations importantes sur les départs, les pannes de bus, les tarifs et les notes de la compagnie.</p></div></div>
      </section>
      {loading && <p role="status" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600"><Loader2 className="h-5 w-5 animate-spin" /> Chargement des informations…</p>}
      {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">{error}</p>}
      {!loading && !error && announcements.length === 0 && <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><AlertTriangle className="mx-auto h-10 w-10 text-orange-600" /><h2 className="mt-4 text-xl font-extrabold">Aucune nouvelle information</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">La compagnie n’a publié aucune alerte ou note pour le moment. Consultez régulièrement cette page avant votre départ.</p></section>}
      {!loading && announcements.length > 0 && <div className="space-y-4">{announcements.map(announcement => { const detail = typeDetails[announcement.type]; const Icon = detail.icon; return <article key={announcement.id} className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${detail.className}`}><div className="flex items-start gap-4"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${detail.iconClassName}`}><Icon className="h-6 w-6" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-extrabold uppercase tracking-wider">{detail.label}</span>{announcement.effective_date && <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold"><CalendarDays className="h-3.5 w-3.5" /> {announcement.effective_date}</span>}</div><h2 className="mt-2 text-xl font-extrabold">{announcement.title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{announcement.message}</p><p className="mt-4 text-xs font-semibold opacity-75">Publié le {new Date(announcement.created_at).toLocaleDateString("fr-FR")}</p></div></div></article>; })}</div>}
      <a href="tel:+221773025008" className="mt-7 flex items-center justify-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-center font-bold text-orange-950 transition-colors hover:bg-orange-100"><PhoneCall className="h-5 w-5" /> Une question ? Appelez DABO TRANSPORT au 77 302 50 08</a>
    </main>
  </div>;
}
