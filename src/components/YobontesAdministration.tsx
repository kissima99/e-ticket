import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAgentSession } from "@/contexts/AgentSessionContext";
import { AgentSessionExpiredError, ticketControlRequest } from "@/lib/ticket-control";

type Shipment = { id: string; sender_name: string; sender_phone: string; sender_residence: string; receiver_name: string; receiver_phone: string; receiver_address: string; package_type: string; amount_fcfa: number; status: string; payment_status: string; created_at: string };
const money = (amount: number) => `${amount.toLocaleString("fr-FR")} FCFA`;

export default function YobontesAdministration() {
  const { session, clearSession } = useAgentSession();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [amount, setAmount] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function load() {
    if (!session) return;
    setLoading(true); setError("");
    try { const data = await ticketControlRequest<{ shipments: Shipment[] }>({ action: "list_yobontes" }, session.token); setShipments(data.shipments || []); }
    catch (err) { if (err instanceof AgentSessionExpiredError) clearSession(); setError(err instanceof Error ? err.message : "Chargement des colis impossible."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [session?.token]);

  async function confirmPayment() {
    if (!session || !selected || confirming) return;
    const numericAmount = Number(amount);
    if (!Number.isInteger(numericAmount) || numericAmount <= 0) return;
    setConfirming(true);
    try { await ticketControlRequest({ action: "confirm_yobontes_payment", shipment_id: selected.id, amount: numericAmount }, session.token); toast.success("Paiement confirmé : le colis est pris en charge."); setSelected(null); await load(); }
    catch (err) { if (err instanceof AgentSessionExpiredError) clearSession(); setError(err instanceof Error ? err.message : "Confirmation impossible."); }
    finally { setConfirming(false); }
  }

  return <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-800"><Package /></span><div><h2 className="text-xl font-extrabold">YOBONTÉS — demandes de colis</h2><p className="text-sm text-slate-600">Prenez en charge les colis après paiement et confirmation.</p></div></div>{error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}{loading ? <p role="status" className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="animate-spin" /> Chargement des demandes…</p> : shipments.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Aucune demande de colis.</p> : <div className="space-y-3">{shipments.map(shipment => <article key={shipment.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-extrabold">{shipment.package_type} • {money(shipment.amount_fcfa)}</p><p className="mt-1 text-sm text-slate-600">Expéditeur : <strong>{shipment.sender_name}</strong> — {shipment.sender_residence}</p><a href={`tel:${shipment.sender_phone}`} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-orange-800 underline"><Phone className="h-4 w-4" /> {shipment.sender_phone}</a><p className="mt-2 text-sm text-slate-600">Receveur : <strong>{shipment.receiver_name}</strong> — {shipment.receiver_address}</p><a href={`tel:${shipment.receiver_phone}`} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-orange-800 underline"><Phone className="h-4 w-4" /> {shipment.receiver_phone}</a></div><div className="text-right"><span className={`rounded-full px-3 py-1 text-xs font-bold ${shipment.payment_status === "Payé" ? "bg-green-100 text-green-900" : "bg-orange-100 text-orange-900"}`}>{shipment.payment_status}</span><p className="mt-2 text-xs text-slate-500">{shipment.status}</p></div></div>{shipment.payment_status !== "Payé" && shipment.status !== "Annulé" && <Button onClick={() => { setSelected(shipment); setAmount(String(shipment.amount_fcfa)); }} className="mt-4 rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500"><CheckCircle2 /> Confirmer le paiement et prendre en charge</Button>}</article>)}</div>}
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open && !confirming) setSelected(null); }}><DialogContent className="rounded-3xl text-brand-navy"><DialogHeader><DialogTitle>Confirmer la prise en charge</DialogTitle><DialogDescription>Le colis sera marqué comme payé et pris en charge par la compagnie.</DialogDescription></DialogHeader>{selected && <div className="rounded-2xl bg-slate-50 p-4 text-sm"><p className="font-bold">{selected.package_type} — {selected.sender_name}</p><p className="mt-1">Vers {selected.receiver_name}, {selected.receiver_address}</p></div>}<div className="space-y-2"><Label htmlFor="yobontes-payment-amount">Montant reçu (FCFA)</Label><Input id="yobontes-payment-amount" type="number" min="1" max="1000000" value={amount} onChange={event => setAmount(event.target.value)} disabled={confirming} className="h-12 rounded-xl" /></div><div className="grid grid-cols-2 gap-3"><Button variant="outline" disabled={confirming} onClick={() => setSelected(null)} className="h-12 rounded-xl">Annuler</Button><Button disabled={confirming || !amount} onClick={() => void confirmPayment()} className="h-12 rounded-xl bg-green-700 font-bold text-white hover:bg-green-800">{confirming && <Loader2 className="animate-spin" />} Confirmer payé</Button></div></DialogContent></Dialog>
  </section>;
}
