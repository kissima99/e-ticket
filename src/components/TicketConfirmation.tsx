import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Download, MessageCircle, Share2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { formatAmount, formatTravelDate, type BookingTicket } from "@/lib/booking";
import { createTicketPdf } from "@/lib/ticket-pdf";

export default function TicketConfirmation({ ticket, onNewBooking }: { ticket: BookingTicket; onNewBooking: () => void }) {
  const [sharing, setSharing] = useState(false);
  const filename = `${ticket.ticket_id}.pdf`;
  const message = `BALLOU SERVICE EXPRESS - DABO TRANSPORT\nConfirmation de réservation\nTicket : ${ticket.ticket_id}\n${ticket.departure_city} → ${ticket.arrival_city}\n${formatTravelDate(ticket.travel_date)} à 15h00\nVoyageur : ${ticket.full_name}\nSiège(s) : ${ticket.seat_number}\nPassagers : ${ticket.passenger_count}\nMontée : ${ticket.boarding_point}\nTotal : ${formatAmount(ticket.total_amount)}\nMode : ${ticket.payment_method}\nPaiement : ${ticket.payment_status}\nPrésentez-vous 30 minutes avant le départ avec votre pièce d’identité. Ce ticket ne constitue pas une preuve de paiement.`;
  function download() {
    try { createTicketPdf(ticket).save(filename); toast.success("Téléchargement du ticket PDF lancé."); }
    catch { toast.error("Le PDF n’a pas pu être généré. Réessayez."); }
  }
  async function sharePdf() {
    setSharing(true);
    try {
      const file = new File([createTicketPdf(ticket).output("blob")], filename, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: "Mon ticket Ballou Service Express" });
      } else {
        createTicketPdf(ticket).save(filename);
        toast.info("PDF téléchargé. Joignez-le à votre conversation WhatsApp.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) toast.error("Partage indisponible. Téléchargez le PDF puis joignez-le dans WhatsApp.");
    } finally { setSharing(false); }
  }

  return (
    <div>
      <div className="mb-6 text-center" role="status"><CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-700" /><h1 className="text-2xl font-extrabold text-brand-navy sm:text-3xl">Votre ticket est prêt !</h1><p className="mt-2 text-sm text-slate-600">La réservation a été enregistrée auprès de DABO TRANSPORT.</p></div>
      <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
        <div className="bg-brand-navy p-6 text-white"><div className="mb-4 flex items-center justify-between"><p className="text-xs font-bold tracking-[0.16em]">BALLOU <span className="text-brand-orange">SERVICE EXPRESS</span></p><Ticket className="h-6 w-6 text-brand-orange" /></div><h2 className="text-2xl font-bold">{ticket.departure_city} <span className="text-brand-orange">→</span> {ticket.arrival_city}</h2><p className="mt-2 text-sm text-slate-200">{formatTravelDate(ticket.travel_date)} • 15h00</p></div>
        <CardContent className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-wider text-slate-500">Numéro de ticket</p><p className="mb-6 mt-1 break-all font-mono text-sm font-bold text-brand-navy sm:text-base">{ticket.ticket_id}</p>
          <dl className="grid gap-5 text-sm sm:grid-cols-2">{[["Voyageur principal", ticket.full_name], ["Téléphone", ticket.phone], ["Siège(s)", ticket.seat_number], ["Passagers", String(ticket.passenger_count)], ["Point de montée", ticket.boarding_point], ["Bagages", String(ticket.luggage_count)]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-brand-navy">{value}</dd></div>)}</dl>
          <div className="my-6 flex flex-wrap items-center justify-between gap-3 border-y border-dashed border-slate-300 py-5"><div><p className="text-xs text-slate-500">Total à régler • {ticket.payment_method}</p><p className="mt-1 text-2xl font-extrabold text-brand-navy">{formatAmount(ticket.total_amount)}</p></div><span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-900">Paiement {ticket.payment_status.toLowerCase()}</span></div>
          <p className="mb-6 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">Conservez votre PDF. Présentez-vous <strong>30 minutes avant le départ</strong>, avec une pièce d’identité pour chaque passager. Le paiement doit être réglé auprès de la compagnie avant l’embarquement.</p>
          <div className="grid gap-3 sm:grid-cols-2"><Button onClick={download} className="h-12 rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500"><Download /> Télécharger le PDF</Button><Button asChild className="h-12 rounded-xl bg-green-700 font-bold text-white hover:bg-green-800"><a href={`https://wa.me/${ticket.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> Envoyer via WhatsApp</a></Button></div>
          <Button variant="outline" disabled={sharing} onClick={sharePdf} className="mt-3 h-12 w-full rounded-xl border-slate-300 text-brand-navy"><Share2 /> {sharing ? "Ouverture du partage…" : "Partager le fichier PDF"}</Button>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">WhatsApp ouvre un message destiné au numéro voyageur, à envoyer vous-même. Pour joindre le PDF, utilisez le partage de fichier sur mobile ou attachez le PDF téléchargé. Aucun envoi automatique n’est effectué.</p>
          <Button asChild variant="outline" className="mt-5 h-12 w-full rounded-xl border-orange-200 text-brand-navy hover:bg-orange-50"><Link to="/fidelite" state={{ phone: ticket.phone, ticketId: ticket.ticket_id }}>Consulter ma carte cadeau & fidélité</Link></Button>
          <p className="mt-2 text-xs text-slate-500">Conservez le numéro de votre tout premier ticket privé : il sert de clé d’accès à votre carte avec votre téléphone. Les tickets suivants ne remplacent pas cette clé.</p>
          <Button variant="ghost" onClick={onNewBooking} className="mt-6 w-full rounded-xl text-brand-navy hover:bg-orange-50">Faire une nouvelle réservation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
