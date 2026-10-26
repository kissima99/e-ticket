import { Banknote, Landmark, Smartphone, Waves } from "lucide-react";

export default function PaymentLogo({ method }: { method: "Cash" | "Wave" | "OM" }) {
  const circle = "relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full sm:h-28 sm:w-28";
  if (method === "Cash") return <span role="img" aria-label="Cash — espèces" className={`${circle} bg-orange-50 text-orange-600`}><Banknote className="absolute h-11 w-11 -translate-y-2 rotate-[-16deg] sm:h-16 sm:w-16" aria-hidden="true" /><Banknote className="relative h-11 w-11 translate-y-1 fill-orange-100 stroke-[2] sm:h-16 sm:w-16" aria-hidden="true" /></span>;
  if (method === "OM") return <span role="img" aria-label="Orange Money" className={`${circle} bg-green-50 text-green-700`}><Landmark className="h-12 w-12 fill-green-100 stroke-[1.8] sm:h-16 sm:w-16" aria-hidden="true" /></span>;
  return <span role="img" aria-label="Wave — paiement mobile" className={`${circle} bg-sky-50 text-brand-navy`}><Smartphone className="h-14 w-14 fill-sky-500 stroke-[1.7] sm:h-20 sm:w-20" aria-hidden="true" /><Waves className="absolute h-6 w-6 text-white sm:h-8 sm:w-8" aria-hidden="true" /></span>;
}
