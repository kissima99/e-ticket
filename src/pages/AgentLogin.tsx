import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthApiError } from "@supabase/supabase-js";
import { Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TransportHeader from "@/components/TransportHeader";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhone } from "@/lib/booking";

function authMessage(error: unknown) {
  if (error instanceof AuthApiError) {
    if (["phone_provider_disabled", "sms_send_failed"].includes(error.code || "")) return "L’envoi des SMS est indisponible. La compagnie doit activer le fournisseur SMS dans Supabase avant la connexion agent.";
    if (error.code === "otp_expired") return "Code incorrect ou expiré. Demandez un nouveau code.";
    return error.message;
  }
  return error instanceof Error ? error.message : "Connexion indisponible. Réessayez.";
}

export default function AgentLogin() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => { if (!loading && session) navigate("/controle-tickets", { replace: true }); }, [loading, session, navigate]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function sendCode() {
    if (busy || cooldown) return;
    const destination = normalizePhone(sentTo || phone);
    if (!/^\+[1-9]\d{7,14}$/.test(destination)) { setError("Indiquez un numéro valide avec son indicatif."); return; }
    setBusy(true); setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: destination, options: { shouldCreateUser: true } });
      if (error) throw error;
      setSentTo(destination); setCode(""); setCooldown(60);
    } catch (err) { setError(authMessage(err)); }
    finally { setBusy(false); }
  }
  async function verifyCode() {
    if (busy) return;
    if (!/^\d{6}$/.test(code)) { setError("Saisissez les 6 chiffres du code reçu par SMS."); return; }
    setBusy(true); setError("");
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: sentTo, token: code, type: "sms" });
      if (error) throw error;
    } catch (err) { setError(authMessage(err)); }
    finally { setBusy(false); }
  }
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
      <TransportHeader back />
      <main className="mx-auto max-w-lg px-4 py-9 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ShieldCheck className="mb-4 h-10 w-10 text-orange-700" />
          <h1 className="text-2xl font-extrabold">Connexion agent</h1>
          <p className="mb-6 mt-3 text-base leading-relaxed text-slate-600">Le contrôle des tickets est réservé aux agents autorisés. Vérifiez votre téléphone avec un code SMS, sans compte Google.</p>
          {loading || session ? <p role="status" className="flex items-center gap-2"><Loader2 className="animate-spin" /> Vérification de la session…</p> : (
            <form onSubmit={event => { event.preventDefault(); void (sentTo ? verifyCode() : sendCode()); }} className="space-y-5">
              {sentTo ? <><p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">Code envoyé au <strong>{sentTo}</strong>.</p><div className="space-y-2"><Label htmlFor="agent-code">Code SMS</Label><Input id="agent-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required disabled={busy} className="h-14 rounded-xl text-center text-2xl font-bold tracking-[0.25em]" /></div></> : <div className="space-y-2"><Label htmlFor="agent-phone">Téléphone agent</Label><Input id="agent-phone" type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} maxLength={25} placeholder="+221 78 …" required disabled={busy} className="h-14 rounded-xl text-lg" /></div>}
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
              <Button disabled={busy} className="h-14 w-full rounded-xl bg-brand-orange text-base font-bold text-brand-navy hover:bg-orange-500">{busy ? <Loader2 className="animate-spin" /> : <Smartphone />}{sentTo ? "Vérifier le code" : "Recevoir mon code SMS"}</Button>
              {sentTo && <div className="flex flex-wrap justify-between gap-3"><Button type="button" variant="ghost" disabled={busy} onClick={() => { setSentTo(""); setCode(""); setError(""); setCooldown(0); }} className="rounded-xl">Changer de numéro</Button><Button type="button" variant="outline" disabled={busy || cooldown > 0} onClick={() => void sendCode()} className="rounded-xl">{cooldown ? `Renvoyer dans ${cooldown}s` : "Renvoyer le code"}</Button></div>}
            </form>
          )}
          <p className="mt-6 text-sm leading-relaxed text-slate-500">Un téléphone vérifié ne suffit pas : l’autorisation agent est également contrôlée côté serveur. Si aucun SMS n’arrive, contactez la compagnie ; aucun code de test ne donne accès aux paiements.</p>
        </section>
        <Link to="/" className="mt-6 inline-block font-semibold text-orange-800 underline">Retour à l’accueil</Link>
      </main>
    </div>
  );
}
