import { useState } from "react";
import { Banknote } from "lucide-react";

export default function PaymentLogo({ method }: { method: "Cash" | "Wave" | "OM" }) {
  const [failed, setFailed] = useState(false);
  if (method === "Cash") return <span role="img" aria-label="Cash — espèces" className="flex h-16 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800"><Banknote className="h-7 w-7" aria-hidden="true" /><span className="mt-0.5 text-xs font-black tracking-wider">CASH</span></span>;
  const source = method === "Wave" ? "https://www.wave.com/img/terms/logo.png" : "https://www.logo.wine/a/logo/Orange_Money/Orange_Money-Logo.wine.svg";
  return <span className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1">{failed ? <span className={`text-center text-sm font-black ${method === "Wave" ? "text-sky-700" : "text-orange-700"}`}>{method === "Wave" ? "Wave" : "Orange Money"}</span> : <img src={source} alt={`Logo ${method === "Wave" ? "Wave" : "Orange Money"}`} width={80} height={64} referrerPolicy="no-referrer" className="h-full w-full object-contain" onError={() => setFailed(true)} />}</span>;
}
