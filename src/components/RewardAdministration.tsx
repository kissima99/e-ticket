import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Gift, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAgentSession } from "@/contexts/AgentSessionContext";
import { AgentSessionExpiredError, ticketControlRequest, type RewardRequest } from "@/lib/ticket-control";
import { toast } from "sonner";

const titles: Record<string, string> = { GIFT_CARD: "Bon d’achat", AIRTIME: "Crédit téléphonique", DATA: "Pass internet" };

export default function RewardAdministration() {
  const { session, clearSession } = useAgentSession();
  const [items, setItems] = useState<RewardRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<"ALL" | "PENDING" | "FULFILLED">("PENDING");
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<RewardRequest | null>(null);
  const [reference, setReference] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmationError, setConfirmationError] = useState("");

  useEffect(() => {
    if (!session) return;
    let active = true;
    setLoading(true); setError(""); setItems([]);
    ticketControlRequest<{ rewards: RewardRequest[]; total: number }>({ action: "rewards", page, status }, session.token).then(data => {
      if (!active) return;
      if (page > 0 && page * 25 >= data.total) { setPage(Math.max(0, Math.ceil(data.total / 25) - 1)); return; }
      setItems(data.rewards); setTotal(data.total);
    }).catch(err => {
      if (!active) return;
      if (err instanceof AgentSessionExpiredError) clearSession();
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session?.token, page, status, refresh]);

  async function fulfill() {
    if (!session || !selected || !accepted || busy) return;
    setBusy(true); setConfirmationError("");
    try {
      const data = await ticketControlRequest<{ fulfilled: boolean; already_fulfilled: boolean }>({ action: "fulfill_reward", reward_id: selected.id, confirmed: true, ...(selected.reward_type !== "GIFT_CARD" ? { reference: reference.trim() } : {}) }, session.token);
      if (!data.fulfilled) throw new Error("Confirmation non reçue. Réessayez sans fermer la fenêtre.");
      setSelected(null); setRefresh(value => value + 1); setStatus("FULFILLED"); setPage(0);
      toast.success(data.already_fulfilled ? "Cette récompense était déjà délivrée." : "Récompense délivrée. La référence est visible sur la carte du client.");
    } catch (err) {
      if (err instanceof AgentSessionExpiredError) clearSession();
      setConfirmationError(err instanceof Error ? err.message : "Délivrance impossible.");
    } finally { setBusy(false); }
  }

  return <section className="mb-8 rounded-3xl border border-orange-200 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><Gift className="h-7 w-7 text-orange-700" /><div><h2 className="text-xl font-extrabold">Récompenses • administration</h2><p className="mt-1 text-sm text-slate-600">Options 2, 3 et 4 : 2 000 FCFA contre 10 points.</p></div></div><Button variant="outline" disabled={loading || busy} onClick={() => setRefresh(value => value + 1)} className="rounded-xl"><RefreshCw /> Actualiser</Button></div>
    <p className="my-4 rounded-xl bg-orange-50 p-4 text-sm leading-relaxed text-orange-900">Le bon est généré ici pour une utilisation manuelle auprès de la compagnie, pas dans le champ promo de réservation. Effectuez les recharges auprès de l’opérateur avant de les confirmer : cette interface ne recharge pas automatiquement les téléphones.</p>
    <div className="mb-5 max-w-xs space-y-2"><Label htmlFor="reward-status">Demandes</Label><Select value={status} disabled={busy} onValueChange={value => { setStatus(value as typeof status); setPage(0); }}><SelectTrigger id="reward-status" className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PENDING">En attente</SelectItem><SelectItem value="FULFILLED">Délivrées</SelectItem><SelectItem value="ALL">Toutes</SelectItem></SelectContent></Select></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {loading ? <p role="status" className="flex items-center gap-2 p-4"><Loader2 className="animate-spin" /> Chargement des récompenses…</p> : !error && !items.length ? <p className="p-4 text-sm text-slate-600">Aucune demande pour ce statut.</p> : <div className="grid gap-4 md:grid-cols-2">{items.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{titles[item.reward_type] || item.reward_type}</h3><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "Délivré" ? "bg-green-100 text-green-900" : "bg-orange-100 text-orange-900"}`}>{item.status}</span></div>
      <p className="mt-3 text-xl font-extrabold">{item.amount_fcfa === null ? "Ancienne demande : montant à confirmer" : `${item.amount_fcfa.toLocaleString("fr-FR")} FCFA`}</p>
      <p className="mt-2 text-sm text-slate-600">Carte : {item.account_phone}<br />Bénéficiaire : {item.phone}{item.reward_type !== "GIFT_CARD" && ` • ${item.operator}`}</p>
      <p className="mt-2 text-xs text-slate-500">Demandé le {new Date(item.created_at).toLocaleString("fr-FR")}</p>
      {item.fulfillment_reference && <div className="mt-3 rounded-xl bg-green-50 p-3"><p className="text-xs font-semibold text-green-900">{item.reward_type === "GIFT_CARD" ? "Référence unique du bon" : "Référence de recharge"}</p><p className="mt-1 break-all font-mono text-sm text-green-900">{item.fulfillment_reference}</p>{item.fulfilled_at && <p className="mt-2 text-xs text-green-800">Délivré le {new Date(item.fulfilled_at).toLocaleString("fr-FR")}</p>}</div>}
      {item.status === "En attente" && item.amount_fcfa === 2000 && <Button disabled={busy} onClick={() => { setSelected(item); setAccepted(false); setReference(""); setConfirmationError(""); }} className="mt-4 rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500"><CheckCircle2 /> {item.reward_type === "GIFT_CARD" ? "Générer le bon" : "Confirmer la recharge"}</Button>}
    </article>)}</div>}
    {!loading && !error && total > 0 && <nav aria-label="Pages des récompenses" className="mt-5 flex items-center justify-between gap-2"><Button variant="outline" disabled={page === 0 || busy} onClick={() => setPage(value => value - 1)} className="rounded-xl"><ChevronLeft /> Précédent</Button><span className="text-xs">{page + 1} / {Math.ceil(total / 25)}</span><Button variant="outline" disabled={(page + 1) * 25 >= total || busy} onClick={() => setPage(value => value + 1)} className="rounded-xl">Suivant <ChevronRight /></Button></nav>}
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open && !busy) setSelected(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl text-brand-navy"><DialogHeader><DialogTitle>{selected?.reward_type === "GIFT_CARD" ? "Délivrer un bon unique de 2 000 FCFA" : "Confirmer une recharge de 2 000 FCFA"}</DialogTitle><DialogDescription>Les 10 points ont déjà été débités lors de la demande. Cette action ne les débite pas de nouveau.</DialogDescription></DialogHeader><p className="rounded-xl bg-orange-50 p-4 text-sm font-semibold">{selected && titles[selected.reward_type]} • {selected?.phone}{selected?.reward_type !== "GIFT_CARD" && ` • ${selected?.operator}`}</p>
      {selected?.reward_type !== "GIFT_CARD" && <div className="space-y-2"><Label htmlFor="fulfillment-reference">Référence de la recharge effectuée</Label><Input id="fulfillment-reference" value={reference} onChange={event => setReference(event.target.value)} disabled={busy} minLength={3} maxLength={120} placeholder="Référence fournie par l’opérateur" className="h-12 rounded-xl" /></div>}
      <label className="flex items-start gap-3 rounded-xl border border-orange-200 p-4 text-sm leading-relaxed"><Checkbox checked={accepted} onCheckedChange={value => setAccepted(value === true)} disabled={busy} className="mt-1 border-orange-700 data-[state=checked]:bg-brand-navy" /><span>{selected?.reward_type === "GIFT_CARD" ? "J’autorise ce bon de 2 000 FCFA, valable manuellement auprès de la compagnie, et sa mise à disposition du client." : "J’ai effectivement réalisé la recharge de 2 000 FCFA sur ce numéro auprès de cet opérateur."}</span></label>
      {confirmationError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{confirmationError}</p>}
      <div className="grid grid-cols-2 gap-3"><Button variant="outline" disabled={busy} onClick={() => setSelected(null)} className="h-12 rounded-xl">Annuler</Button><Button disabled={busy || !accepted || (selected?.reward_type !== "GIFT_CARD" && reference.trim().length < 3)} onClick={() => void fulfill()} className="h-12 rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500">{busy && <Loader2 className="animate-spin" />} Délivrer</Button></div>
    </DialogContent></Dialog>
  </section>;
}
