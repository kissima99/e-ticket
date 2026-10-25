import { CheckCircle2, Clock3, RefreshCw, Smartphone, Ticket } from "lucide-react";

export default function LoyaltyTracking({ phone, firstTicket, firstTicketPaid, paidTickets, pendingTickets, checkedAt, syncing }: { phone: string; firstTicket: string; firstTicketPaid: boolean; paidTickets: number; pendingTickets: number; checkedAt: string; syncing: boolean }) {
  return (
    <section className="mb-6 rounded-3xl border border-orange-200 bg-orange-50/40 p-5 sm:p-6" aria-label="Suivi automatique de votre carte">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-extrabold text-brand-navy">Une seule carte, tous vos prochains voyages</h2><span role="status" className="flex items-center gap-2 text-sm text-slate-600"><RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />{syncing ? "Actualisation…" : `Vérifiée à ${new Date(checkedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dakar" })}`}</span></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4"><Ticket className="mb-3 h-6 w-6 text-orange-700" /><h3 className="font-bold">1. Premier ticket reconnu</h3><p className="mt-2 font-mono text-sm text-slate-600">{firstTicket.slice(0, 8)}…{firstTicket.slice(-6)}</p><p className={`mt-2 flex items-center gap-2 text-sm font-semibold ${firstTicketPaid ? "text-green-800" : "text-orange-800"}`}>{firstTicketPaid ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}{firstTicketPaid ? "Premier point crédité" : "Point crédité après paiement"}</p></div>
        <div className="rounded-2xl bg-white p-4"><Smartphone className="mb-3 h-6 w-6 text-orange-700" /><h3 className="font-bold">2. Même téléphone</h3><p className="mt-2 text-base font-bold text-brand-navy">{phone}</p><p className="mt-2 text-sm leading-relaxed text-slate-600">Les tickets suivants restent liés à cette carte, sans remplacer la première clé.</p></div>
        <div className="rounded-2xl bg-white p-4"><RefreshCw className="mb-3 h-6 w-6 text-orange-700" /><h3 className="font-bold">3. Cumul automatique</h3><p className="mt-2 text-base font-bold text-green-800">{paidTickets} ticket{paidTickets > 1 ? "s" : ""} payé{paidTickets > 1 ? "s" : ""}</p><p className="mt-2 text-sm text-slate-600">{pendingTickets} paiement{pendingTickets > 1 ? "s" : ""} en attente</p><p className="mt-2 text-sm font-semibold text-brand-navy">+1 point par ticket payé</p></div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">Le solde est vérifié toutes les 30 secondes quand cette page est visible, et à votre retour sur la carte. Les points peuvent être dépensés sans modifier le total des tickets déjà payés.</p>
    </section>
  );
}
