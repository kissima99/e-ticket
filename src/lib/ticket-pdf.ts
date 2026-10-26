import { jsPDF } from "jspdf";
import { formatTravelDate, type BookingTicket } from "@/lib/booking";
import { createTicketQr, hasPaidQr, paidTicketMessage, ticketVerificationUrl } from "@/lib/ticket-qr";

export async function createTicketPdf(ticket: BookingTicket) {
  const paid = hasPaidQr(ticket);
  const qrImage = paid ? await createTicketQr(ticket) : null;
  const doc = new jsPDF();
  const navy = "#002244";
  const orange = "#FF6B00";
  doc.setFillColor(navy); doc.rect(0, 0, 210, 46, "F");
  doc.setFont("helvetica", "bold"); doc.setTextColor("#FFFFFF"); doc.setFontSize(24); doc.text("BALLOU", 18, 23);
  doc.setTextColor(orange); doc.setFontSize(12); doc.text("SERVICE EXPRESS", 18, 33);
  doc.setTextColor("#FFFFFF"); doc.setFontSize(10); doc.text("DABO TRANSPORT", 190, 24, { align: "right" });
  doc.setFillColor(orange); doc.rect(0, 46, 210, 2, "F");
  doc.setTextColor(navy); doc.setFontSize(17); doc.text(paid ? "E-TICKET PAYÉ" : "CONFIRMATION DE RESERVATION", 18, 64);
  doc.setFontSize(10); doc.text(`Ticket : ${ticket.ticket_id}`, 18, 75);
  doc.setFillColor(paid ? "#F0FDF4" : "#FFF0E5"); doc.roundedRect(18, 83, 174, 20, 3, 3, "F");
  doc.setTextColor(paid ? "#166534" : "#793200"); doc.text(`Paiement : ${ticket.payment_status} - ${ticket.payment_method}`, 24, 92);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(paid ? "Paiement validé par DABO TRANSPORT." : "Sans QR : paiement à valider par la compagnie.", 24, 98);
  const rows = [
    ["Trajet", `${ticket.departure_city} - ${ticket.arrival_city}`],
    ["Date et heure", `${formatTravelDate(ticket.travel_date)} - 15h00`],
    ["Voyageur principal", ticket.full_name],
    ["Telephone", ticket.phone],
    ["Siege(s)", ticket.seat_number],
    ["Nombre de passagers", String(ticket.passenger_count)],
    ["Point de montee", ticket.boarding_point],
    ["Bagages", String(ticket.luggage_count)],
  ];
  let y = 115;
  doc.setTextColor(navy);
  for (const [label, value] of rows) {
    const lines = doc.splitTextToSize(value, 116) as string[];
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(label, 18, y);
    doc.setFont("helvetica", "normal"); doc.text(lines, 72, y);
    y += Math.max(13, lines.length * 5 + 6);
  }
  doc.setDrawColor("#CBD5E1"); doc.line(18, y, 192, y);
  y += 12;
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.text(paid ? "MONTANT PAYÉ" : "TOTAL A REGLER", 18, y);
  doc.text(`${ticket.total_amount.toLocaleString("en-US").replace(/,/g, " ")} FCFA`, 192, y, { align: "right" });
  y += 14;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text(doc.splitTextToSize(`Presentez-vous au point de montee 30 minutes avant le depart. Chaque passager doit presenter sa piece d'identite. ${paid ? "Votre paiement est validé par la compagnie." : "Le reglement est a effectuer et a faire valider par DABO TRANSPORT avant l'embarquement. Aucun QR n'est délivré avant cette validation."}`, 174), 18, y);
  doc.setTextColor("#64748B"); doc.setFontSize(8); doc.text("Vos numeros de piece d'identite et de contact d'urgence ne figurent pas sur ce document.", 18, 285);
  if (qrImage && hasPaidQr(ticket)) {
    doc.addPage();
    doc.setFillColor(navy); doc.rect(0, 0, 210, 297, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor("#FFFFFF"); doc.setFontSize(28); doc.text("BALLOU", 105, 21, { align: "center" });
    doc.setTextColor(orange); doc.setFontSize(12); doc.text("SERVICE EXPRESS", 105, 30, { align: "center" });
    doc.setTextColor("#FFFFFF"); doc.setFontSize(22); doc.text("Votre e-ticket", 105, 47, { align: "center" });
    doc.setFillColor("#FFFFFF"); doc.roundedRect(18, 57, 174, 212, 8, 8, "F");
    doc.setTextColor(navy); doc.setFontSize(22); doc.text(`${ticket.departure_city} vers ${ticket.arrival_city}`, 105, 77, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(`${formatTravelDate(ticket.travel_date)} - 15h00`, 105, 88, { align: "center" });
    doc.setDrawColor(orange); doc.setLineWidth(0.7); doc.line(33, 96, 177, 96);
    doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.text("DABO TRANSPORT", 105, 108, { align: "center" });
    doc.setDrawColor(navy); doc.setLineWidth(0.7); doc.setLineDashPattern([0.5, 2], 0); doc.line(18, 117, 192, 117); doc.line(18, 221, 192, 221); doc.setLineDashPattern([], 0);
    doc.setFillColor(navy); for (const cutY of [117, 221]) { doc.circle(18, cutY, 6, "F"); doc.circle(192, cutY, 6, "F"); }
    doc.addImage(qrImage, "PNG", 64, 123, 82, 82);
    doc.link(64, 123, 82, 82, { url: ticketVerificationUrl(ticket.verification_token) });
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(doc.splitTextToSize(ticket.full_name, 150), 105, 210, { align: "center" });
    doc.setTextColor("#15803D"); doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.text("Confirmé", 105, 239, { align: "center" });
    doc.setTextColor(navy); doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.text(`Siège(s) : ${ticket.seat_number} - ${ticket.payment_method}`, 105, 252, { align: "center" });
    doc.setTextColor("#FFFFFF"); doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text(doc.splitTextToSize(paidTicketMessage, 180), 105, 279, { align: "center" });
  }
  return doc;
}
