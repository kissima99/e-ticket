import QRCode from "qrcode";

export const ticketVerificationUrl = (token: string) => new URL(`/verification/${encodeURIComponent(token)}`, window.location.origin).href;
export const createTicketQr = (token: string) => QRCode.toDataURL(ticketVerificationUrl(token), { width: 512, margin: 4, errorCorrectionLevel: "M", color: { dark: "#002244", light: "#FFFFFF" } });
