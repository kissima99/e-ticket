import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TransportHeader from "@/components/TransportHeader";
import { useAgentSession } from "@/contexts/AgentSessionContext";

export default function AgentLogin() {
  const { session, login } = useAgentSession();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    if (busy) return;
    if (!/^\d{4}$/.test(code)) { setError("Saisissez votre code agent à 4 chiffres."); return; }
    setBusy(true); setError("");
    try { await login(code); setCode(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Connexion indisponible. Réessayez."); }
    finally { setBusy(false); }
  }

  if (session) return <Navigate to="/controle-tickets" replace />;
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
      <TransportHeader back />
      <main className="mx-auto max-w-lg px-4 py-9 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ShieldCheck className="mb-4 h-10 w-10 text-orange-700" />
          <h1 className="text-2xl font-extrabold">Connexion agent</h1>
          <p className="mb-6 mt-3 text-base leading-relaxed text-slate-600">Entrez le code d’accès de la compagnie pour contrôler les tickets. Aucun téléphone ni SMS n’est nécessaire.</p>
          <form onSubmit={event => { event.preventDefault(); void connect(); }} className="space-y-5">
            <div className="space-y-3"><Label htmlFor="agent-code" className="text-base font-bold">Code agent</Label><Input id="agent-code" type="password" inputMode="numeric" autoComplete="current-password" value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, "")); setError(""); }} minLength={4} maxLength={4} required disabled={busy} className="h-16 rounded-2xl border-slate-200 text-center text-3xl font-bold tracking-[0.4em] focus-visible:ring-brand-orange" /></div>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
            <Button disabled={busy} className="h-14 w-full rounded-xl bg-brand-orange text-base font-bold text-brand-navy hover:bg-orange-500">{busy ? <Loader2 className="animate-spin" /> : <KeyRound />}{busy ? "Connexion…" : "Se connecter"}</Button>
          </form>
          <p className="mt-6 text-sm leading-relaxed text-slate-500">Le code est vérifié côté serveur. La session expire après 8 heures et les essais incorrects sont limités. Gardez le code confidentiel : cet accès partagé permet aussi de confirmer les paiements.</p>
        </section>
        <Link to="/" className="mt-6 inline-block font-semibold text-orange-800 underline">Retour à l’accueil</Link>
      </main>
    </div>
  );
}
