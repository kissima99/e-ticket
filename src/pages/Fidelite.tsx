import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Copy, Gift, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhone } from "@/lib/booking";
import TransportHeader from "@/components/TransportHeader";
import LoyaltyCard, { rewards, type RewardType } from "@/components/LoyaltyCard";

type Credentials = { phone: string; ticket_id: string };
type Snapshot = { full_name: string; phone: string; points_balance: number; total_lifetime_points: number; transactions: { id: string; points_change: number; description: string; created_at: string }[]; cards: { id: string; code: string; discount_percent: number; reward_type: RewardType; is_used: boolean }[]; requests: { id: string; phone: string; operator: string; reward_type: string; status: string }[] };
const inputClass = "h-12 rounded-xl border-slate-200 focus-visible:ring-brand-orange";

export default function Fidelite() {
  const location = useLocation();
  const passed = location.state as { phone?: string; ticketId?: string } | null;
  const [phone, setPhone] = useState(typeof passed?.phone === "string" ? passed.phone : "");
  const [ticketId, setTicketId] = useState(typeof passed?.ticketId === "string" ? passed.ticketId : "");
  const [access, setAccess] = useState<Credentials | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<RewardType | null>(null);
  const [recipient, setRecipient] = useState("");
  const [operator, setOperator] = useState("Orange");
  const [paused, setPaused] = useState(false);
  const requestId = useRef(crypto.randomUUID());
  const reward = rewards.find(value => value.type === selected);

  async function load(credentials: Credentials) {
    if (!/^\+[1-9]\d{7,14}$/.test(credentials.phone) || !/^BSE-[A-F0-9]{32}$/.test(credentials.ticket_id)) { setError("Indiquez un téléphone valide et le numéro complet de votre premier ticket (BSE-…)."); return; }
    setBusy(true); setError("");
    try {
      const { data, error } = await supabase.functions.invoke("dabo-loyalty", { body: { action: "balance", ...credentials } });
      if (error) throw new Error("Service indisponible. Réessayez dans quelques instants.");
      if (data?.error) throw new Error(data.error);
      if (!data?.snapshot) throw new Error("Solde non reçu. Réessayez.");
      setAccess(credentials); setSnapshot(data.snapshot); setRecipient(credentials.phone);
    } catch (err) { setError(err instanceof Error ? err.message : "Impossible de consulter votre carte."); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    if (typeof passed?.phone === "string" && typeof passed?.ticketId === "string") void load({ phone: normalizePhone(passed.phone), ticket_id: passed.ticketId.trim().toUpperCase() });
  }, []);
  function choose(type: RewardType) { requestId.current = crypto.randomUUID(); setSelected(type); setRecipient(access?.phone || ""); setOperator("Orange"); setError(""); }
  async function redeem() {
    if (!access || !selected || redeeming) return;
    const destination = normalizePhone(recipient);
    if (["AIRTIME", "DATA"].includes(selected) && !/^\+[1-9]\d{7,14}$/.test(destination)) { toast.error("Indiquez un numéro bénéficiaire valide."); return; }
    setRedeeming(true); setError("");
    try {
      const { data, error } = await supabase.functions.invoke("dabo-loyalty", { body: { action: "redeem", ...access, request_id: requestId.current, reward_type: selected, ...(["AIRTIME", "DATA"].includes(selected) ? { recipient_phone: destination, operator } : {}) } });
      if (error) throw new Error("Échange non confirmé. Réessayez sans fermer cette fenêtre : la demande ne sera débitée qu’une fois.");
      if (data?.error) throw new Error(data.error);
      if (!data?.snapshot || !data?.reward) throw new Error("Confirmation non reçue. Veuillez réessayer.");
      setSnapshot(data.snapshot); setSelected(null);
      toast.success(data.reward.code ? "Votre code est prêt ! 10 points ont été échangés." : "Demande enregistrée. 10 points ont été échangés.");
    } catch (err) { setError(err instanceof Error ? err.message : "L’échange n’a pas pu être confirmé."); }
    finally { setRedeeming(false); }
  }
  async function copy(code: string) { try { await navigator.clipboard.writeText(code); toast.success("Code copié."); } catch { toast.error("Copie indisponible. Sélectionnez et copiez le code affiché."); } }
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
      <TransportHeader back />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {!access ? <form onSubmit={event => { event.preventDefault(); void load({ phone: normalizePhone(phone), ticket_id: ticketId.trim().toUpperCase() }); }} className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7"><div className="mb-5 flex items-start gap-3"><ShieldCheck className="h-6 w-6 shrink-0 text-orange-700" /><div><h2 className="font-bold">Retrouvez votre carte personnelle</h2><p className="mt-1 text-sm text-slate-600">Votre téléphone et le numéro de votre premier ticket servent de clé d’accès. Conservez ce numéro privé ; une nouvelle réservation au même téléphone ne donne pas accès à une carte existante.</p></div></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="loyalty-phone">Téléphone voyageur</Label><Input id="loyalty-phone" type="tel" autoComplete="tel" maxLength={25} value={phone} onChange={event => setPhone(event.target.value)} placeholder="77 123 45 67" className={inputClass} required /></div><div className="space-y-2"><Label htmlFor="loyalty-ticket">Numéro du premier ticket</Label><Input id="loyalty-ticket" autoComplete="off" maxLength={40} value={ticketId} onChange={event => setTicketId(event.target.value.toUpperCase())} placeholder="BSE-… (voir votre PDF)" className={inputClass} required /></div></div><Button disabled={busy} className="mt-5 h-12 w-full rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500">{busy ? <Loader2 className="animate-spin" /> : <Gift />} Consulter ma carte</Button></form> : <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm"><span>Carte de <strong>{snapshot?.full_name}</strong> • {access.phone}</span><div className="flex gap-2"><Button onClick={() => void load(access)} disabled={busy || redeeming} variant="outline" className="rounded-xl"><RefreshCw className={busy ? "animate-spin" : ""} /> Actualiser</Button><Button variant="ghost" onClick={() => { setAccess(null); setSnapshot(null); setPhone(""); setTicketId(""); setPaused(false); setError(""); }} disabled={busy || redeeming} className="rounded-xl">Quitter la carte</Button></div></div>}
        {error && !selected && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
          <LoyaltyCard points={snapshot?.points_balance ?? null} name={snapshot?.full_name} paused={paused} busy={busy || redeeming} onChoose={choose} onPause={() => { setPaused(true); toast.success("Vos points restent inchangés."); }} onResume={() => setPaused(false)} />
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="mb-4 text-lg font-extrabold">Mes codes & cartes cadeaux</h2>{snapshot?.cards.length ? <div className="space-y-4">{snapshot.cards.map(card => <div key={card.id} className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4"><div className="mb-2 flex items-center justify-between gap-2"><span className="text-sm font-bold">{card.reward_type === "DISCOUNT" ? "Ma réduction" : "Carte cadeau"} • −{card.discount_percent} %</span><span className="text-xs text-slate-600">{card.is_used ? "Utilisé" : "Disponible"}</span></div><p className="break-all font-mono text-xs font-bold">{card.code}</p>{!card.is_used && <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => void copy(card.code)} className="rounded-lg"><Copy /> Copier</Button>{card.reward_type === "GIFT_CARD" && <Button size="sm" asChild className="rounded-lg bg-green-700 text-white hover:bg-green-800"><a href={`https://wa.me/?text=${encodeURIComponent(`Je t’offre une carte cadeau BALLOU SERVICE EXPRESS : -15 % sur une réservation DABO TRANSPORT. Code : ${card.code}. À saisir à l’étape paiement sur ${new URL("/", window.location.origin).href}`)}`} target="_blank" rel="noopener noreferrer">Offrir via WhatsApp</a></Button>}</div>}</div>)}</div> : <p className="text-sm leading-relaxed text-slate-600">Vos codes apparaîtront ici après validation d’une récompense. Ils se saisissent à l’étape paiement d’une nouvelle réservation.</p>}</section>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="mb-4 text-lg font-extrabold">Mes demandes de recharge</h2>{snapshot?.requests.length ? <ul className="space-y-3">{snapshot.requests.map(request => <li key={request.id} className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-bold">{request.reward_type === "AIRTIME" ? "Crédit téléphonique" : "Pass internet"} • {request.operator}</p><p className="mt-1 text-slate-600">{request.phone}</p><p className="mt-2 text-xs font-semibold text-orange-800">{request.status}</p></li>)}</ul> : <p className="text-sm text-slate-600">Aucune demande pour le moment. Les recharges sont traitées manuellement par la compagnie.</p>}</section>
          </div>
        </div>
        {snapshot && <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7"><div className="mb-4 flex flex-wrap justify-between gap-3"><h2 className="font-extrabold">Historique des points</h2><span className="text-sm text-slate-600">Total gagné : {snapshot.total_lifetime_points} points</span></div>{snapshot.transactions.length ? <ul className="divide-y divide-slate-100">{snapshot.transactions.map(transaction => <li key={transaction.id} className="flex items-center justify-between gap-4 py-4 text-sm"><div><p className="font-semibold">{transaction.description}</p><p className="mt-1 text-xs text-slate-500">{new Date(transaction.created_at).toLocaleDateString("fr-FR")}</p></div><span className={`shrink-0 font-bold ${transaction.points_change > 0 ? "text-green-700" : "text-orange-800"}`}>{transaction.points_change > 0 ? "+" : ""}{transaction.points_change} pts</span></li>)}</ul> : <p className="text-sm text-slate-600">Aucun mouvement. Les points seront crédités après validation du paiement de vos tickets.</p>}</section>}
      </main>
      <Dialog open={selected !== null} onOpenChange={open => { if (!open && !redeeming) { setSelected(null); setError(""); } }}><DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl text-brand-navy"><DialogHeader><DialogTitle>{reward?.title}</DialogTitle><DialogDescription>Validez cet échange contre 10 points. Votre solde passera de {snapshot?.points_balance} à {Math.max((snapshot?.points_balance || 0)-10,0)} points.</DialogDescription></DialogHeader>{selected && ["AIRTIME", "DATA"].includes(selected) ? <div className="space-y-4"><div className="space-y-2"><Label htmlFor="recipient">Téléphone à recharger</Label><Input id="recipient" type="tel" maxLength={25} value={recipient} onChange={event => setRecipient(event.target.value)} className={inputClass} disabled={redeeming} /></div><div className="space-y-2"><Label htmlFor="operator">Opérateur</Label><Select value={operator} onValueChange={setOperator} disabled={redeeming}><SelectTrigger id="operator" className={inputClass}><SelectValue /></SelectTrigger><SelectContent>{["Orange", "Free", "Expresso", "Wave"].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><p className="text-xs text-slate-600">Cette validation enregistre une demande. La recharge, son montant ou le volume de data restent à confirmer par DABO TRANSPORT.</p></div> : <p className="rounded-xl bg-orange-50 p-4 text-sm text-orange-900">{selected === "DISCOUNT" ? "Votre code personnel de 15 % sera utilisable une seule fois avec votre téléphone voyageur." : "Votre code cadeau de 15 % pourra être transmis à un proche et utilisé une seule fois."}</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<div className="mt-2 grid grid-cols-2 gap-3"><Button variant="outline" disabled={redeeming} onClick={() => { setSelected(null); setError(""); }} className="h-12 rounded-xl">Annuler</Button><Button disabled={redeeming} onClick={() => void redeem()} className="h-12 rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500">{redeeming && <Loader2 className="animate-spin" />} Valider • 10 pts</Button></div></DialogContent></Dialog>
    </div>
  );
}
