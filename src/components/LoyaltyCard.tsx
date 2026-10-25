import { CreditCard, Gift, Hourglass, LockKeyhole, Phone, Signal, Sparkles, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export const rewards = [
  { type: "DISCOUNT", title: "1. Réduction de 15 % sur mon billet", text: "Un code personnel pour votre prochaine réservation.", icon: Ticket },
  { type: "GIFT_CARD", title: "2. Générer un bon d’achat / carte cadeau", text: "Un code de 15 % à offrir à un proche.", icon: Gift },
  { type: "AIRTIME", title: "3. Recharger du crédit téléphonique", text: "Une demande de recharge auprès de la compagnie.", icon: Phone },
  { type: "DATA", title: "4. Recharger un pass internet", text: "Une demande de pass pour votre numéro et opérateur.", icon: Signal },
] as const;
export type RewardType = typeof rewards[number]["type"];

export default function LoyaltyCard({ points, totalEarned, name, paused, busy, onChoose, onPause, onResume }: { points: number | null; totalEarned: number | null; name?: string; paused: boolean; busy: boolean; onChoose: (type: RewardType) => void; onPause: () => void; onResume: () => void }) {
  const balance = points || 0;
  const available = Math.floor(balance / 10);
  const progress = balance % 10;
  const remaining = 10 - progress;
  const firstReward = (totalEarned || 0) < 10;
  const unlocked = points !== null && balance >= 10;
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-brand-navy p-6 text-white sm:p-8">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[28px] border-white/5" />
        <div className="relative">
          <div className="mb-6 flex items-start justify-between gap-4"><h1 className="max-w-sm text-xl font-extrabold leading-snug sm:text-2xl">Ma carte cadeau & fidélité <span className="block text-brand-orange">Ballou Express</span></h1><CreditCard className="h-8 w-8 shrink-0 text-brand-orange" /></div>
          <p className="text-sm font-semibold text-slate-200">Solde disponible {name ? `• ${name}` : ""}</p>
          <p className="my-3 text-5xl font-black">{points === null ? "—" : balance} <span className="text-lg font-medium text-slate-200">points</span></p>
          <p className="text-sm text-slate-200">Depuis le premier ticket : <strong className="text-white">{totalEarned === null ? "—" : totalEarned} points gagnés</strong></p>
          {unlocked && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-3 text-sm font-bold text-brand-navy"><Gift className="h-5 w-5 shrink-0" />{available} récompense{available > 1 ? "s" : ""} disponible{available > 1 ? "s" : ""} • 10 points chacune</p>}
          <div className="mt-6 flex items-center justify-between gap-3 text-sm"><span>{available ? "Vers une récompense supplémentaire" : firstReward ? "Vers votre première récompense" : "Vers votre prochaine récompense"}</span><span className="shrink-0 font-bold">{points === null ? "—" : progress} / 10</span></div>
          <div role="progressbar" aria-label="Points vers la prochaine récompense" aria-valuemin={0} aria-valuemax={10} aria-valuenow={points === null ? undefined : progress} aria-valuetext={points === null ? "Solde non consulté" : `${progress} points vers la prochaine récompense, ${available} récompenses déjà disponibles`} className="mt-3 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-brand-orange transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress * 10}%` }} /></div>
          <div aria-hidden="true" className="mt-4 grid grid-cols-10 gap-1.5">{Array.from({ length: 10 }, (_, index) => <span key={index} className={`flex aspect-square items-center justify-center rounded-full border text-xs font-bold sm:text-sm ${points !== null && index < progress ? "border-brand-orange bg-brand-orange text-brand-navy" : "border-white/20 bg-white/10 text-white"}`}>{index + 1}</span>)}</div>
          <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed" role="status"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />{points === null ? "Activez votre carte avec votre premier ticket et votre téléphone." : `Encore ${remaining} ticket${remaining > 1 ? "s" : ""} payé${remaining > 1 ? "s" : ""} pour ${available ? "une récompense supplémentaire" : firstReward ? "débloquer votre première récompense" : "votre prochaine récompense"}.`}</p>
        </div>
      </div>
      <div className="p-5 sm:p-8">
        {paused ? <div className="rounded-2xl bg-orange-50 p-5"><Hourglass className="mb-3 h-7 w-7 text-orange-700" /><h2 className="font-bold text-brand-navy">Vos points sont conservés.</h2><p className="my-3 text-sm text-slate-600">Aucun point n’a été débité. Les tickets payés au même téléphone continuent de créditer votre carte, même au-delà de 10 points.</p><Button onClick={onResume} className="rounded-xl bg-brand-navy text-white hover:bg-brand-navy/90">Choisir une récompense</Button></div> : <><h2 className="mb-5 font-bold text-brand-navy">Choisissez votre récompense contre 10 points :</h2><div className="space-y-3">{rewards.map(({ type, title, text, icon: Icon }) => <button key={type} type="button" disabled={!unlocked || busy} onClick={() => onChoose(type)} className="flex w-full items-center gap-4 rounded-2xl border border-orange-200 bg-white p-4 text-left transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 sm:p-5"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${unlocked ? "bg-orange-50 text-orange-700" : "bg-slate-200 text-slate-600"}`}><Icon className="h-6 w-6" /></span><span className="flex-1"><span className="block text-sm font-bold text-brand-navy sm:text-base">{title}</span><span className="mt-1 block text-xs leading-relaxed text-slate-600">{text}</span></span>{unlocked ? <span className="text-xs font-bold text-orange-800">10 pts</span> : <LockKeyhole className="h-4 w-4 text-slate-500" />}</button>)}</div><Button onClick={onPause} disabled={points === null || busy} variant="outline" className="mt-5 h-auto min-h-12 w-full whitespace-normal rounded-xl border-slate-300 py-3 text-brand-navy hover:bg-orange-50"><Hourglass className="shrink-0" /> Laisser cumuler mes points pour plus tard</Button></>}
        <p className="mt-5 text-sm leading-relaxed text-slate-600">Le premier ticket crée votre carte. Son paiement rapporte le premier point ; chaque nouveau ticket au même téléphone ajoute automatiquement +1 point après validation du règlement. Les réservations impayées ne créditent aucun point.</p>
      </div>
    </section>
  );
}
