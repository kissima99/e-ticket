import { ticketScheduleText } from "@/lib/travel-routes";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BusFront, Check, MapPin, Ticket } from "lucide-react";
import { createTicketQr, hasPaidQr, paidTicketMessage } from "@/lib/ticket-qr";
import { formatTravelDate, type BookingTicket } from "@/lib/booking";

type QrTicket = Pick<BookingTicket, "departure_city" | "arrival_city" | "travel_date" | "full_name" | "seat_number" | "payment_status" | "verification_token" | "route_id" | "rendezvous_time" | "departure_time">;

export default function TicketQr({ ticket }: { ticket: QrTicket }) {
  const [image, setImage] = useState<{ token: string; src: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const { verification_token: token, payment_status: paymentStatus } = ticket;
  useEffect(() => {
    let active = true;
    setImage(null); setFailed(false);
    if (hasPaidQr({ verification_token: token, payment_status: paymentStatus })) {
      createTicketQr({ verification_token: token, payment_status: paymentStatus }).then(src => { if (active && token) setImage({ token, src }); }).catch(() => { if (active) setFailed(true); });
    }
    return () => { active = false; };
  }, [token, paymentStatus]);
  if (!hasPaidQr(ticket)) return null;
  return (
    <section aria-label="E-ticket payé" className="mb-6 overflow-hidden rounded-3xl bg-brand-navy p-4 text-center text-white sm:p-7">
      <div className="mb-5"><p className="text-3xl font-black italic tracking-wider sm:text-4xl">BALLOU</p><p className="text-xs font-extrabold tracking-[0.2em] text-brand-orange">SERVICE EXPRESS</p><h3 className="mt-5 flex items-center justify-center gap-3 text-2xl font-extrabold"><Ticket className="h-8 w-8 text-brand-orange" /> Votre e-ticket</h3></div>
      <div className="relative overflow-hidden rounded-[28px] bg-white text-brand-navy">
        <div className="p-5 sm:p-7"><div aria-hidden="true" className="mx-auto mb-4 flex max-w-xs items-center gap-3"><MapPin className="h-8 w-8 shrink-0" /><span className="flex-1 border-t-2 border-dashed border-brand-navy/50" /><BusFront className="h-8 w-8 shrink-0" /><span className="flex-1 border-t-2 border-dashed border-brand-navy/50" /><MapPin className="h-8 w-8 shrink-0 text-brand-orange" /></div><p className="text-2xl font-extrabold sm:text-3xl">{ticket.departure_city} vers {ticket.arrival_city}</p><p className="mt-3 text-sm font-medium text-slate-600">{formatTravelDate(ticket.travel_date)} • {ticketScheduleText(ticket)}</p><div className="mt-5 flex items-center justify-center gap-3 border-t-2 border-orange-300 pt-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-white"><BusFront className="h-6 w-6" /></span><p className="text-xl font-bold">DABO TRANSPORT</p></div></div>
        <div className="relative border-y-[5px] border-dotted border-brand-navy/70 px-4 py-5"><span aria-hidden="true" className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-brand-navy" /><span aria-hidden="true" className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-brand-navy" /><div className="mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center">{image?.token === token ? <img src={image.src} alt="QR de vérification du ticket avant embarquement" width={260} height={260} className="h-auto w-full" /> : <p role="status" className="p-3 text-sm text-slate-600">{failed ? "QR indisponible. Actualisez le ticket ou ouvrez le contrôle." : "Génération du QR…"}</p>}</div><Link to={`/verification/${ticket.verification_token}`} className="mt-2 inline-block text-sm font-semibold text-orange-800 underline underline-offset-4">Ouvrir la page de vérification</Link></div>
        <div className="relative p-5 sm:p-7"><span aria-hidden="true" className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-brand-navy" /><span aria-hidden="true" className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-brand-navy" /><div className="flex items-center justify-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 text-white"><Check className="h-8 w-8 stroke-[3]" /></span><p className="text-3xl font-extrabold text-green-700">Confirmé</p></div><p className="mt-4 text-sm font-semibold">{ticket.full_name} • Siège(s) {ticket.seat_number}</p></div>
      </div>
      <p role="status" className="mt-5 text-base font-bold leading-relaxed">{paidTicketMessage}</p>
      <p className="mt-3 text-xs leading-relaxed text-slate-200">Paiement validé par la compagnie. Présentez ce QR et votre pièce d’identité à l’agent. Le contrôle en ligne ne valide pas l’embarquement.</p>
    </section>
  );
}
