import { Copy, Gift, Phone, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RewardRequest } from "@/lib/ticket-control";

export default function LoyaltyRewardRequests({ requests, onCopy }: { requests: RewardRequest[]; onCopy: (reference: string) => void }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
    <h2 className="mb-4 text-lg font-extrabold">Mes récompenses délivrées par l’admin</h2>
    {requests.length ? <ul className="space-y-3">{requests.map(request => {
      const voucher = request.reward_type === "GIFT_CARD";
      const Icon = voucher ? Gift : request.reward_type === "AIRTIME" ? Phone : Signal;
      return <li key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="flex items-start gap-3"><span className="rounded-full bg-orange-100 p-2 text-orange-800"><Icon className="h-5 w-5" /></span><div><p className="font-bold">{voucher ? "Bon d’achat" : request.reward_type === "AIRTIME" ? "Crédit téléphonique" : "Pass internet"}{request.amount_fcfa !== null && ` • ${request.amount_fcfa.toLocaleString("fr-FR")} FCFA`}</p><p className="mt-1 text-slate-600">{request.phone}{!voucher && ` • ${request.operator}`}</p></div></div>
        <p className={`mt-3 font-semibold ${request.status === "Délivré" ? "text-green-800" : "text-orange-800"}`}>{request.status === "En attente" ? "En attente de traitement par l’admin" : request.status}</p>
        {request.amount_fcfa === null && <p className="mt-2 text-xs text-slate-600">Ancienne demande : montant à confirmer auprès de la compagnie.</p>}
        {request.fulfillment_reference && <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3"><p className="text-xs font-bold text-green-900">{voucher ? "Référence unique de votre bon" : "Référence de la recharge"}</p><p className="mt-2 break-all font-mono text-xs font-bold text-green-900">{request.fulfillment_reference}</p><Button variant="outline" size="sm" onClick={() => onCopy(request.fulfillment_reference!)} className="mt-3 rounded-lg border-green-300 text-green-900 hover:bg-green-100"><Copy /> Copier</Button>{request.fulfilled_at && <p className="mt-2 text-xs text-green-800">Délivré le {new Date(request.fulfilled_at).toLocaleString("fr-FR")}</p>}</div>}
        {voucher && <p className="mt-3 text-xs leading-relaxed text-slate-600">Après délivrance, présentez la référence du bon à la compagnie. Ce bon n’est pas un code promo pour la réservation en ligne.</p>}
      </li>;
    })}</ul> : <p className="text-sm leading-relaxed text-slate-600">Vos demandes de bons, crédit téléphonique et pass internet de 2 000 FCFA apparaîtront ici. Elles seront délivrées manuellement par l’admin.</p>}
  </section>;
}
