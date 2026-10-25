import { jsPDF } from "jspdf";
import { formatTravelDate, type BookingTicket } from "@/lib/booking";

export function createTicketPdf(ticket: BookingTicket) {
  const doc = new jsPDF();
  const navy = "#002244";
  const orange = "#FF6B00";
  doc.setFillColor(navy); doc.rect(0, 0, 210, 46, "F");
  doc.setFont("helvetica", "bold"); doc.setTextColor("#FFFFFF"); doc.setFontSize(24); doc.text("BALLOU", 18, 23);
  doc.setTextColor(orange); doc.setFontSize(12); doc.text("SERVICE EXPRESS", 18, 33);
  doc.setTextColor("#FFFFFF"); doc.setFontSize(10); doc.text("DABO TRANSPORT", 190, 24, { align: "right" });
  doc.setFillColor(orange); doc.rect(0, 46, 210, 2, "F");
  doc.setTextColor(navy); doc.setFontSize(17); doc.text("CONFIRMATION DE RESERVATION", 18, 64);
  doc.setFontSize(10); doc.text(`Ticket : ${ticket.ticket_id}`, 18, 75);
  doc.setFillColor("#FFF0E5"); doc.roundedRect(18, 83, 174, 20, 3, 3, "F");
  doc.setTextColor("#793200"); doc.text(`Paiement : ${ticket.payment_status} - ${ticket.payment_method}`, 24, 92);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text("Ce document ne constitue pas une preuve de paiement.", 24, 98);
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
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.text("TOTAL A REGLER", 18, y);
  doc.text(`${ticket.total_amount.toLocaleString("en-US").replace(/,/g, " ")} FCFA`, 192, y, { align: "right" });
  y += 14;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text(doc.splitTextToSize("Presentez-vous au point de montee 30 minutes avant le depart. Chaque passager doit presenter sa piece d'identite. Le reglement est a effectuer aupres de DABO TRANSPORT avant l'embarquement.", 174), 18, y);
  doc.setTextColor("#64748B"); doc.setFontSize(8); doc.text("Vos numeros de piece d'identite et de contact d'urgence ne figurent pas sur ce document.", 18, 285);
  return doc;
}
