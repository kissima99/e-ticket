import { Banknote } from "lucide-react";

export default function PaymentLogo({ method }: { method: "Cash" | "Wave" | "OM" }) {
  const circle = "relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full sm:h-28 sm:w-28";
  if (method === "Cash") return <span role="img" aria-label="Cash — espèces" className={`${circle} bg-orange-50 text-orange-600`}><Banknote className="absolute h-11 w-11 -translate-y-2 rotate-[-16deg] sm:h-16 sm:w-16" aria-hidden="true" /><Banknote className="relative h-11 w-11 translate-y-1 fill-orange-100 stroke-[2] sm:h-16 sm:w-16" aria-hidden="true" /></span>;
  return <span className={`${circle} overflow-hidden bg-white`}><img src={method === "Wave" ? "/assets/logo-wave.png" : "/assets/logo-orange-money.png"} alt={method === "Wave" ? "Logo Wave" : "Logo Orange Money"} width={112} height={112} className="h-full w-full object-contain" /></span>;
}
