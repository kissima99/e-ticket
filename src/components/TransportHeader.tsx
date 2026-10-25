import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TransportHeader({ back = false }: { back?: boolean }) {
  return (
    <header className="relative overflow-hidden bg-brand-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-6 md:px-8 md:py-8">
        <Link to="/" aria-label="Accueil Ballou Service Express" className="flex min-w-0 items-center gap-3 sm:gap-4">
          {back && <ArrowLeft className="hidden h-5 w-5 shrink-0 sm:block" />}
          <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 sm:h-20 sm:w-32 sm:rounded-2xl">
            <img src="/assets/bus-ballou-service-express.jpeg" alt="Bus Ballou Service Express" className="h-full w-full object-contain" />
          </span>
          <span>
            <span className="block text-2xl font-black tracking-wide sm:text-4xl">BALLOU</span>
            <span className="mt-1 block text-[11px] font-bold tracking-[0.1em] text-brand-orange sm:text-sm">SERVICE EXPRESS</span>
          </span>
        </Link>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11 w-11 shrink-0 rounded-full border-white/30 bg-transparent p-0 text-white hover:bg-white/10 hover:text-white sm:w-auto sm:gap-2 sm:px-5 sm:text-base">
              <MessageCircle className="h-5 w-5" /><span className="sr-only sm:not-sr-only">Contact</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl text-brand-navy">
            <DialogHeader><DialogTitle>Contacter DABO TRANSPORT</DialogTitle></DialogHeader>
            <p className="text-sm leading-relaxed text-slate-600">Pour une question concernant votre voyage, adressez-vous au guichet de la compagnie à votre point de montée. Conservez votre numéro de ticket pour faciliter le suivi.</p>
            <p className="rounded-xl bg-orange-50 p-4 text-sm text-orange-900">Aucun numéro de contact ou WhatsApp officiel n’a encore été renseigné sur cette application.</p>
          </DialogContent>
        </Dialog>
      </div>
      <svg className="block h-7 w-full md:h-10" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 5 C400 0 750 100 1440 10 L1440 60 L0 60Z" fill="#FF6B00" />
        <path d="M0 20 C450 15 800 95 1440 15 L1440 60 L0 60Z" fill="#FAFBFD" />
      </svg>
    </header>
  );
}
