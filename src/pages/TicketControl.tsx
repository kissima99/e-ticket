import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, LogOut, QrCode, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import TransportHeader from "@/components/TransportHeader";
import TicketQr from "@/components/TicketQr";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, formatTravelDate } from "@/lib/booking";
import { ticketControlRequest, type ControlledTicket, type TicketFilters } from "@/lib/ticket-control";

export default function TicketControl() {
  const { session, loading: sessionLoading } = useSession();
  const [authorized, setAuthorized] = useState(false);
  const [authorizing, setAuthorizing] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [accessRetry, setAccessRetry] = useState(0);
  const [agentPhone, setAgentPhone] = useState("");
  const [tickets, setTickets] = useState<ControlledTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<TicketFilters>({ status: "ALL", date: "", departure: "ALL" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [qrTicket, setQrTicket] = useState<ControlledTicket | null>(null);
  const [paymentTicket, setPaymentTicket] = useState<ControlledTicket | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!session) return;
    let active = true;
    setAuthorized(false); setAuthorizing(true); setAccessError(""); setTickets([]); setQrTicket(null); setPaymentTicket(null);
    ticketControlRequest<{ allowed: boolean; phone: string }>({ action: "access" }).then(data => {
      if (!active) return;
      if (!data.allowed) throw new Error("Accès agent refusé.");
      setAgentPhone(data.phone); setAuthorized(true);
    }).catch(err => { if (active) setAccessError(err instanceof Error ? err.message : "Accès agent indisponible."); }).finally(() => { if (active) setAuthorizing(false); });
    return () => { active = false; };
  }, [session?.access_token, accessRetry]);

  useEffect(() => {
    if (!authorized) return;
    let active = true;
    setLoading(true); setError(""); setTickets([]);
    ticketControlRequest<{ tickets: ControlledTicket[]; total: number }>({ action: "list", page, ...filters }).then(data => {
      if (!active) return;
      if (!Array.isArray(data.tickets) || typeof data.total !== "number") throw new Error("Réponse du serveur invalide.");
      if (page > 0 && page * 25 >= data.total) { setPage(Math.max(0, Math.ceil(data.total / 25) - 1)); return; }
      setTickets(data.tickets); setTotal(data.total);
    }).catch(err => { if (active) { setTotal(0); setError(err instanceof Error ? err.message : "Chargement impossible."); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authorized, page, filters, refresh]);

  function updateFilters(next: Partial<TicketFilters>) { setFilters(previous => ({ ...previous, ...next })); setPage(0); }
  async function signOut() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Déconnexion impossible. Réessayez.");
    setSigningOut(false);
  }
  async function confirmPayment() {
    if (!paymentTicket || !accepted || confirming) return;
    setConfirming(true); setConfirmationError("");
    try {
      const data = await ticketControlRequest<{ confirmed: boolean; already_paid: boolean }>({ action: "confirm", reservation_id: paymentTicket.id });
      if (!data.confirmed) throw new Error("Confirmation non reçue. Réessayez : un même ticket ne sera confirmé qu’une fois.");
      setPaymentTicket(null); setAccepted(false); setRefresh(value => value + 1);
      toast.success(data.already_paid ? "Le paiement était déjà confirmé." : "Paiement confirmé et enregistré dans l’historique.");
    } catch (err) { setConfirmationError(err instanceof Error ? err.message : "Confirmation impossible."); }
    finally { setConfirming(false); }
  }

  if (sessionLoading) return <div role="status" className="flex min-h-screen items-center justify-center gap-3 text-brand-navy"><Loader2 className="animate-spin" /> Chargement de la session…</div>;
  if (!session) return <Navigate to="/agent/connexion" replace />;

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
      <TransportHeader back />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><ShieldCheck className="h-9 w-9 text-orange-700" /><div><h1 className="text-2xl font-extrabold sm:text-3xl">Contrôle du ticket</h1><p className="mt-1 text-sm text-slate-600">Espace agent sécurisé{authorized ? ` • ${agentPhone}` : ""}</p></div></div>
          <Button variant="outline" disabled={signingOut || confirming} onClick={() => void signOut()} className="h-11 rounded-xl"><LogOut /> Déconnexion</Button>
        </div>
        {authorizing ? <p role="status" className="flex items-center gap-3 rounded-2xl bg-white p-6"><Loader2 className="animate-spin" /> Vérification de votre autorisation…</p> : !authorized ? <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900"><h2 className="text-xl font-bold">Accès non autorisé ou indisponible</h2><p role="alert" className="mt-3">{accessError}</p><Button variant="outline" onClick={() => setAccessRetry(value => value + 1)} className="mt-5 rounded-xl"><RefreshCw /> Réessayer</Button></section> : <>
          <p className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">Tous les tickets enregistrés sont affichés, y compris ceux en attente de paiement. <strong>Seul le statut « Payé » indique un paiement confirmé par la compagnie.</strong> Le choix Wave, OM ou Cash ne constitue pas une preuve de règlement. Le contrôle du QR reste en lecture seule et ne valide pas l’embarquement.</p>
          <section aria-label="Filtres des tickets" className="mb-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2"><Label htmlFor="control-status">Paiement</Label><Select value={filters.status} onValueChange={value => updateFilters({ status: value as TicketFilters["status"] })} disabled={confirming}><SelectTrigger id="control-status" className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{[["ALL", "Tous les tickets"], ["PAID", "Payés"], ["PENDING", "En attente"]].map(([value, title]) => <SelectItem key={value} value={value}>{title}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="control-date">Date du voyage</Label><Input id="control-date" type="date" value={filters.date} onChange={event => updateFilters({ date: event.target.value })} disabled={confirming} className="h-12 rounded-xl" /></div>
            <div className="space-y-2"><Label htmlFor="control-departure">Départ</Label><Select value={filters.departure} onValueChange={value => updateFilters({ departure: value as TicketFilters["departure"] })} disabled={confirming}><SelectTrigger id="control-departure" className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{[["ALL", "Tous les départs"], ["Dakar", "Dakar"], ["Ballou", "Ballou"]].map(([value, title]) => <SelectItem key={value} value={value}>{title}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-end gap-2"><Button disabled={loading || confirming} onClick={() => setRefresh(value => value + 1)} className="h-12 flex-1 rounded-xl bg-brand-navy text-white hover:bg-brand-navy/90"><RefreshCw /> Actualiser</Button><Button variant="outline" disabled={confirming} onClick={() => updateFilters({ status: "ALL", date: "", departure: "ALL" })} className="h-12 rounded-xl">Effacer</Button></div>
          </section>
          {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Tickets enregistrés</h2><span aria-live="polite" className="text-sm text-slate-600">{loading ? "Chargement…" : `${total} ticket(s)`}</span></div>
          {loading ? <p role="status" className="flex items-center gap-3 rounded-2xl bg-white p-6"><Loader2 className="animate-spin" /> Chargement des tickets…</p> : !error && tickets.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Aucun ticket pour ces critères.</p> : (
            <div className="grid gap-4 md:grid-cols-2">
              {tickets.map(ticket => <article key={ticket.id} className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-extrabold">{ticket.departure_city} → {ticket.arrival_city}</h3><span className={`rounded-full px-3 py-1.5 text-sm font-bold ${ticket.payment_status === "Payé" ? "bg-green-100 text-green-900" : "bg-orange-100 text-orange-900"}`}>{ticket.payment_status}</span></div>
                <p className="mt-3 text-lg font-bold">{ticket.full_name}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{formatTravelDate(ticket.travel_date)} • 15h00</p>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-500">Siège(s)</dt><dd className="mt-1 font-bold">{ticket.seat_number}</dd></div><div><dt className="text-slate-500">Passagers</dt><dd className="mt-1 font-bold">{ticket.passenger_count}</dd></div><div><dt className="text-slate-500">Mode de paiement</dt><dd className="mt-1 font-bold">{ticket.payment_method}</dd></div><div><dt className="text-slate-500">Montant enregistré</dt><dd className="mt-1 font-bold">{ticket.total_amount === null ? "Non renseigné" : formatAmount(ticket.total_amount)}</dd></div></dl>
                <p className="mt-4 break-all rounded-xl bg-slate-50 p-3 font-mono text-xs">{ticket.ticket_id}</p>
                <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setQrTicket(ticket)} className="rounded-xl"><QrCode /> Afficher le QR</Button><Button asChild variant="outline" className="rounded-xl"><Link to={`/verification/${ticket.verification_token}`}>Vérifier le ticket</Link></Button>{ticket.payment_status === "En attente" && <Button disabled={confirming} onClick={() => { setPaymentTicket(ticket); setAccepted(false); setConfirmationError(""); }} className="rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500"><CheckCircle2 /> Confirmer le paiement</Button>}</div>
              </article>)}
            </div>
          )}
          {!loading && !error && total > 0 && <nav aria-label="Pages des tickets" className="mt-6 flex items-center justify-between gap-3"><Button variant="outline" disabled={page === 0 || confirming} onClick={() => setPage(value => value - 1)} className="rounded-xl"><ChevronLeft /> Précédent</Button><span className="text-sm">Page {page + 1} / {Math.ceil(total / 25)}</span><Button variant="outline" disabled={(page + 1) * 25 >= total || confirming} onClick={() => setPage(value => value + 1)} className="rounded-xl">Suivant <ChevronRight /></Button></nav>}
        </>}
      </main>
      <Dialog open={Boolean(qrTicket)} onOpenChange={open => { if (!open) setQrTicket(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl text-brand-navy"><DialogHeader><DialogTitle>QR du ticket enregistré</DialogTitle><DialogDescription>{qrTicket?.full_name} • {qrTicket?.departure_city} → {qrTicket?.arrival_city}</DialogDescription></DialogHeader>{qrTicket && <><p className="mb-3 text-sm font-semibold">Paiement enregistré : {qrTicket.payment_status}</p><TicketQr token={qrTicket.verification_token} /></>}</DialogContent></Dialog>
      <Dialog open={Boolean(paymentTicket)} onOpenChange={open => { if (!open && !confirming) { setPaymentTicket(null); setAccepted(false); setConfirmationError(""); } }}><DialogContent className="rounded-3xl text-brand-navy"><DialogHeader><DialogTitle>Confirmer le règlement réel</DialogTitle><DialogDescription>Cette action enregistre le ticket comme payé. Elle n’effectue aucun débit Wave ou Orange Money et ne valide pas l’embarquement.</DialogDescription></DialogHeader>{paymentTicket && <div className="rounded-2xl bg-slate-50 p-4 text-sm"><p className="font-bold">{paymentTicket.full_name}</p><p className="mt-2">{paymentTicket.departure_city} → {paymentTicket.arrival_city} • Siège(s) {paymentTicket.seat_number}</p><p className="mt-2 font-bold">{paymentTicket.total_amount === null ? "Montant non renseigné : vérifiez le règlement auprès de la compagnie." : formatAmount(paymentTicket.total_amount)} • {paymentTicket.payment_method}</p></div>}<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-relaxed"><Checkbox checked={accepted} onCheckedChange={value => setAccepted(value === true)} disabled={confirming} className="mt-1 border-orange-700 data-[state=checked]:bg-brand-navy" /><span>J’ai vérifié la réception réelle du paiement par la compagnie, pas seulement une capture d’écran ou le choix d’un mode de paiement.</span></label>{confirmationError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{confirmationError}</p>}<div className="grid grid-cols-2 gap-3"><Button variant="outline" disabled={confirming} onClick={() => setPaymentTicket(null)} className="h-12 rounded-xl">Annuler</Button><Button disabled={!accepted || confirming} onClick={() => void confirmPayment()} className="h-12 rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500">{confirming && <Loader2 className="animate-spin" />}Confirmer payé</Button></div></DialogContent></Dialog>
    </div>
  );
}
