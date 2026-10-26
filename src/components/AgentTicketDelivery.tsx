import { useEffect, useState } from "react";
import { Download, Loader2, MessageCircle, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import TicketQr from "@/components/TicketQr";
import { useAgentSession } from "@/contexts/AgentSessionContext";
import { formatTravelDate, normalizePhone, type BookingTicket } from "@/lib/booking";
import { AgentSessionExpiredError, ticketControlRequest } from "@/lib/ticket-control";
import { createTicketPdf } from "@/lib/ticket-pdf";
import { hasPaidQr, paidTicketMessage } from "@/lib/ticket-qr";

type PreparedTicket = { ticket: BookingTicket; pdf: Awaited<ReturnType<typeof createTicketPdf>>; file: File };

export default function AgentTicketDelivery({ reservationId, onClose }: { reservationId: string; onClose: () => void }) {
  const { session, clearSession } = useAgentSession();
  const [prepared, setPrepared] = useState<PreparedTicket | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!session) return;
    let active = true;
    setPrepared(null); setError("");
    ticketControlRequest<{ ticket: BookingTicket }>({ action: "paid_ticket", reservation_id: reservationId }, session.token).then(async ({ ticket }) => {
      if (!hasPaidQr(ticket) || typeof ticket.total_amount !== "number") throw new Error("Ce ticket ne dispose pas d’un paiement validé et d’un QR final. Actualisez la liste.");
      const pdf = await createTicketPdf(ticket);
      const file = new File([pdf.output("blob")], `${ticket.ticket_id}.pdf`, { type: "application/pdf" });
      if (active) setPrepared({ ticket, pdf, file });
    }).catch(err => {
      if (!active) return;
      if (err instanceof AgentSessionExpiredError) clearSession();
      setError(err instanceof Error ? err.message : "Impossible de préparer le ticket final.");
    });
    return () => { active = false; };
  }, [reservationId, session?.token, retry]);

  function download() {
    if (!prepared) return;
    prepared.pdf.save(prepared.file.name);
    toast.success("PDF final avec QR téléchargé. Vous pouvez le joindre à WhatsApp.");
  }
  async function share() {
    if (!prepared || sharing) return;
    if (!navigator.share || !navigator.canShare?.({ files: [prepared.file] })) {
      download();
      toast.info("Partage de fichier non disponible ici : ouvrez WhatsApp du client puis joignez le PDF téléchargé.");
      return;
    }
    setSharing(true);
    try {
      // The file is prepared before the click so native sharing retains user activation.
      await navigator.share({ files: [prepared.file], title: "Ticket final DABO TRANSPORT", text: paidTicketMessage });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        download();
        toast.info("Partage indisponible. Joignez le PDF téléchargé dans WhatsApp.");
      }
    } finally { setSharing(false); }
  }
  const phone = prepared ? normalizePhone(prepared.ticket.phone) : "";
  const validPhone = /^\+[1-9]\d{7,14}$/.test(phone);
  const message = prepared ? `Bonjour ${prepared.ticket.full_name}, voici votre ticket final DABO TRANSPORT.\n${prepared.ticket.departure_city} → ${prepared.ticket.arrival_city}\n${formatTravelDate(prepared.ticket.travel_date)} à 15h00\nSiège(s) : ${prepared.ticket.seat_number}\nVotre paiement a été validé par la compagnie. Le PDF joint contient votre QR final à présenter avant l’embarquement.\n${paidTicketMessage}` : "";

  return (
    <Dialog open onOpenChange={open => { if (!open && !sharing) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl text-brand-navy sm:max-w-xl">
        <DialogHeader><DialogTitle className="text-xl font-extrabold">Télécharger et envoyer le ticket final</DialogTitle><DialogDescription>PDF avec QR réservé aux tickets dont le paiement a été validé par la compagnie.</DialogDescription></DialogHeader>
        {!prepared && !error && <p role="status" className="flex items-center gap-3 rounded-2xl bg-slate-50 p-5 text-sm"><Loader2 className="h-5 w-5 animate-spin" /> Vérification du paiement et préparation du PDF…</p>}
        {error && <div className="rounded-2xl bg-red-50 p-4 text-red-800"><p role="alert" className="text-sm">{error}</p><Button variant="outline" onClick={() => setRetry(value => value + 1)} className="mt-3 rounded-xl"><RefreshCw /> Réessayer</Button></div>}
        {prepared && <>
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"><p className="font-bold">Client : {prepared.ticket.full_name}</p><p className="mt-1">Téléphone : {prepared.ticket.phone}</p><p className="mt-2 break-all font-mono text-xs">{prepared.file.name}</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><Button disabled={sharing} onClick={download} className="h-12 rounded-xl bg-brand-orange font-bold text-brand-navy hover:bg-orange-500"><Download /> Télécharger le PDF final</Button><Button disabled={sharing} onClick={() => void share()} className="h-12 rounded-xl bg-green-700 font-bold text-white hover:bg-green-800">{sharing ? <Loader2 className="animate-spin" /> : <Share2 />} Partager le PDF via WhatsApp</Button></div>
          {validPhone ? <Button asChild variant="outline" className="h-12 rounded-xl border-green-300 text-green-800 hover:bg-green-50"><a href={`https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> Ouvrir WhatsApp du client</a></Button> : <p className="text-sm text-orange-900">Numéro WhatsApp non reconnu. Utilisez le partage du PDF et choisissez le client dans WhatsApp.</p>}
          <p className="text-xs leading-relaxed text-slate-600">Sur mobile, « Partager le PDF » ouvre le partage de fichier : choisissez WhatsApp puis le client. Sinon, téléchargez le PDF, ouvrez WhatsApp du client et joignez-le comme document. Le lien WhatsApp prépare seulement le message : il n’ajoute pas automatiquement le PDF et aucun envoi n’est automatique.</p>
          <TicketQr ticket={prepared.ticket} />
        </>}
      </DialogContent>
    </Dialog>
  );
}
