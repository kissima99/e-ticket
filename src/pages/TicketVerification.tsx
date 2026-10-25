import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, Loader2, RefreshCw, ScanLine, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransportHeader from "@/components/TransportHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatAmount, formatTravelDate } from "@/lib/booking";

type State = "VALID_TODAY" | "UNPAID" | "FUTURE" | "EXPIRED";
type Verification = { found: boolean; state: State; checked_at: string; ticket: { full_name: string; departure_city: string; arrival_city: string; travel_date: string; seat_number: string; passenger_count: number; payment_method: string; payment_status: string; total_amount: number } };
const states = {
  VALID_TODAY: { icon: CheckCircle2, title: "Ticket payé • Voyage aujourd’hui", text: "La réservation est enregistrée et son paiement est validé. Comparez le voyage et le nom avec la pièce d’identité avant la montée.", style: "bg-green-50 border-green-200 text-green-900" },
  UNPAID: { icon: AlertTriangle, title: "Paiement non validé", text: "La réservation existe, mais le paiement n’est pas indiqué comme payé. Vérifiez le règlement auprès de la compagnie avant d’autoriser la montée.", style: "bg-orange-50 border-orange-200 text-orange-900" },
  FUTURE: { icon: Clock3, title: "Ticket payé • Départ à venir", text: "Le paiement est validé, mais ce ticket correspond à une autre date de départ. Il n’est pas prévu pour le voyage d’aujourd’hui.", style: "bg-blue-50 border-blue-200 text-blue-900" },
  EXPIRED: { icon: XCircle, title: "Date de voyage passée", text: "Ce ticket correspond à une date passée. Il ne doit pas être utilisé pour un nouveau départ.", style: "bg-red-50 border-red-200 text-red-900" },
};

export default function TicketVerification() {
  const { token } = useParams();
  const [result, setResult] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setResult(null); setError("");
    supabase.functions.invoke("dabo-ticket-check", { body: { token } }).then(({ data, error }) => {
      if (!active) return;
      if (error || data?.error) setError(data?.error || "Impossible de consulter le serveur. Vérifiez votre connexion et réessayez. Le ticket n’est pas validé.");
      else if (!data?.found) setError("QR inconnu ou invalide. Aucune réservation correspondante n’a été trouvée.");
      else if (!data.ticket || !Object.keys(states).includes(data.state)) setError("Réponse de contrôle invalide. Réessayez.");
      else setResult(data);
      setLoading(false);
    }).catch(() => { if (active) { setLoading(false); setError("Contrôle indisponible. Ne considérez pas le ticket comme valide sans réponse du serveur."); } });
    return () => { active = false; };
  }, [token, retry]);
  const status = result ? states[result.state] : null;
  const Icon = status?.icon || ScanLine;
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
      <TransportHeader back />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-orange-700" /><div><h1 className="text-2xl font-extrabold">Contrôle du ticket</h1><p className="mt-1 text-sm text-slate-600">DABO TRANSPORT • Consultation en lecture seule</p></div></div>
        {loading && <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-orange-700" /><p>Vérification auprès de la compagnie…</p></div>}
        {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"><XCircle className="mb-3 h-8 w-8" /><h2 className="text-lg font-bold">Ticket non vérifié</h2><p className="mt-2 text-sm leading-relaxed">{error}</p></div>}
        {result && status && <><section role="status" className={`mb-5 rounded-2xl border p-6 ${status.style}`}><Icon className="mb-3 h-9 w-9" /><h2 className="text-xl font-extrabold">{status.title}</h2><p className="mt-2 text-sm leading-relaxed">{status.text}</p></section><section className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="mb-5 text-lg font-extrabold">{result.ticket.departure_city} → {result.ticket.arrival_city}</h2><dl className="grid gap-5 text-sm sm:grid-cols-2">{[["Voyageur principal", result.ticket.full_name], ["Départ", `${formatTravelDate(result.ticket.travel_date)} • 15h00`], ["Siège(s)", result.ticket.seat_number], ["Passagers", String(result.ticket.passenger_count)], ["Paiement", `${result.ticket.payment_method} • ${result.ticket.payment_status}`], ["Montant", formatAmount(result.ticket.total_amount)]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl><p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-600">Consulté le {new Date(result.checked_at).toLocaleString("fr-FR", { timeZone: "Africa/Dakar" })} (heure du Sénégal).</p></section></>}
        <Button onClick={() => setRetry(value => value + 1)} disabled={loading} className="mt-5 h-12 w-full rounded-xl bg-brand-navy text-white hover:bg-brand-navy/90"><RefreshCw /> Actualiser le contrôle</Button>
        <p className="mt-5 text-xs leading-relaxed text-slate-500">Ce contrôle ne marque pas le ticket comme embarqué et ne bloque pas une deuxième présentation du même QR. Aucun changement de paiement n’est possible depuis cette page. Les numéros de pièce d’identité, le téléphone et l’accès fidélité ne sont pas accessibles par le QR.</p>
      </main>
    </div>
  );
}
