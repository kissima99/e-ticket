import QRCode from "qrcode";

export type TicketPayment = { payment_status: string; verification_token: string | null };
export const paidTicketMessage = "Payé, DABO TRANSPORT vous souhaite un très bon voyage !!!!!!!!";
export const hasPaidQr = (ticket: TicketPayment): ticket is { payment_status: string; verification_token: string } => ticket.payment_status === "Payé" && typeof ticket.verification_token === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticket.verification_token);
export const ticketVerificationUrl = (token: string) => new URL(`/verification/${encodeURIComponent(token)}`, window.location.origin).href;
export async function createTicketQr(ticket: TicketPayment) {
  if (!hasPaidQr(ticket)) throw new Error("Le QR est disponible uniquement après validation du paiement par la compagnie.");
  return QRCode.toDataURL(ticketVerificationUrl(ticket.verification_token), { width: 512, margin: 4, errorCorrectionLevel: "M", color: { dark: "#002244", light: "#FFFFFF" } });
}
