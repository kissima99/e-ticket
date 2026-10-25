import { CreditCard, Gift, Hourglass, LockKeyhole, Phone, Signal, Sparkles, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export const rewards = [
  { type: "DISCOUNT", title: "1. Réduction de 15 % sur mon billet", text: "Un code personnel pour votre prochaine réservation.", icon: Ticket },
  { type: "GIFT_CARD", title: "2. Générer un bon d’achat / carte cadeau", text: "Un code de 15 % à offrir à un proche.", icon: Gift },
  { type: "AIRTIME", title: "3. Recharger du crédit téléphonique", text: "Une demande de recharge auprès de la compagnie.", icon: Phone },
  { type: "DATA", title: "4. Recharger un pass internet", text: "Une demande de pass pour votre numéro et opérateur.", icon: Signal },
] as const;
export type RewardType = typeof rewards[number]["type"];

export default function LoyaltyCard({ points, name, paused, busy, onChoose, onPause, onResume }: { points: number | null; name?: string; paused: boolean; busy: boolean; onChoose: (type: RewardType) => void; onPause: () => void; onResume: () => void }) {
  const balance = points || 0;
  const available = Math.floor(balance / 10);
  const unlocked = points !== null && balance >= 10;
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-brand-navy p-6 text-white sm:p-8">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[28px] border-white/5" />
        <div className="relative"><div className="mb-6 flex items-start justify-between gap-4"><h1 className="max-w-sm text-lg font-extrabold leading-snug sm:text-2xl">MA CARTE CADEAU & FIDÉLITÉ <span className="text-brand-orange">BALLOU EXPRESS</span></h1><CreditCard className="h-8 w-8 shrink-0 text-brand-orange" /></div><p className="text-xs uppercase tracking-[0.18em] text-slate-300">Solde actuel {name ? `• ${name}` : ""}</p><p className="my-3 text-5xl font-black">{points === null ? "—" : balance} <span className="text-base font-medium text-slate-200">Points</span></p><div className="mt-6 flex items-center justify-between text-sm"><span>Progression</span><span className="font-semibold">{points === null ? "—" : balance} / 10 pts</span></div><div role="progressbar" aria-label="Progression vers la prochaine récompense" aria-valuemin={0} aria-valuemax={10} aria-valuenow={Math.min(balance,10)} aria-valuetext={`${balance} points au total, palier de 10 points`} className="mt-3 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-brand-orange transition-[width] duration-300" style={{ width: `${Math.min(balance / 10 * 100,100)}%` }} /></div><p className="mt-4 flex items-center gap-2 text-sm text-white" role="status"><Sparkles className="h-4 w-4 text-brand-orange" />{points === null ? "Consultez votre solde pour débloquer vos récompenses." : available ? `Vous avez débloqué ${available} récompense${available > 1 ? "s" : ""} !` : `Encore ${10 - balance} point${10 - balance > 1 ? "s" : ""} pour votre récompense.`}</p></div>
      </div>
      <div className="p-5 sm:p-8">
        {paused ? <div className="rounded-2xl bg-orange-50 p-5"><Hourglass className="mb-3 h-7 w-7 text-orange-700" /><h2 className="font-bold text-brand-navy">Vos points sont conservés.</h2><p className="my-3 text-sm text-slate-600">Aucun point n’a été débité. Vous pouvez continuer à cumuler au-delà de 10 points.</p><Button onClick={onResume} className="rounded-xl bg-brand-navy text-white hover:bg-brand-navy/90">Choisir une récompense</Button></div> : <><h2 className="mb-5 font-bold text-brand-navy">Choisissez votre récompense contre 10 points :</h2><div className="space-y-3">{rewards.map(({ type, title, text, icon: Icon }) => <button key={type} type="button" disabled={!unlocked || busy} onClick={() => onChoose(type)} className="flex w-full items-center gap-4 rounded-2xl border border-orange-200 bg-white p-4 text-left transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 sm:p-5"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${unlocked ? "bg-orange-50 text-orange-700" : "bg-slate-200 text-slate-600"}`}><Icon className="h-6 w-6" /></span><span className="flex-1"><span className="block text-sm font-bold text-brand-navy sm:text-base">{title}</span><span className="mt-1 block text-xs leading-relaxed text-slate-600">{text}</span></span>{unlocked ? <span className="text-xs font-bold text-orange-800">10 pts</span> : <LockKeyhole className="h-4 w-4 text-slate-500" />}</button>)}</div><Button onClick={onPause} disabled={points === null || busy} variant="outline" className="mt-5 h-auto min-h-12 w-full whitespace-normal rounded-xl border-slate-300 py-3 text-brand-navy hover:bg-orange-50"><Hourglass className="shrink-0" /> Laisser cumuler mes points pour plus tard</Button></>}
        <p className="mt-5 text-xs leading-relaxed text-slate-500">Chaque ticket acheté en ligne rapporte +1 point lorsque son paiement est validé par DABO TRANSPORT. Une réservation en attente de paiement ne crédite pas encore de point.</p>
      </div>
    </section>
  );
}
