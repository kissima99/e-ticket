import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createTicketQr } from "@/lib/ticket-qr";

export default function TicketQr({ token }: { token: string }) {
  const [image, setImage] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    setImage(""); setFailed(false);
    createTicketQr(token).then(value => { if (active) setImage(value); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [token]);
  return (
    <section className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row">
      <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-xl bg-white">{image ? <img src={image} alt="QR de vérification du ticket avant embarquement" width={160} height={160} /> : <p role="status" className="p-3 text-center text-xs text-slate-600">{failed ? "QR indisponible. Téléchargez à nouveau le PDF ou ouvrez le contrôle." : "Génération du QR…"}</p>}</div>
      <div className="text-center sm:text-left"><h3 className="font-bold text-brand-navy">Votre QR de contrôle</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">Présentez ce QR à l’agent avant de monter. Il consulte le voyage et l’état du paiement enregistrés par la compagnie.</p><Link to={`/verification/${token}`} className="mt-3 inline-block text-sm font-semibold text-orange-800 underline underline-offset-4">Ouvrir la page de vérification</Link><p className="mt-2 text-xs text-slate-500">Contrôle en ligne, en lecture seule. Ce QR ne valide pas l’embarquement.</p></div>
    </section>
  );
}
