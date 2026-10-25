import { Link } from "react-router-dom";
import { Bus, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TransportHeader({ back = false }: { back?: boolean }) {
  return (
    <header className="relative overflow-hidden bg-brand-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6 md:px-8 md:py-8">
        <Link to="/" aria-label="Accueil Ballou Service Express" className="flex items-center gap-3">
          {back && <ArrowLeft className="hidden h-5 w-5 sm:block" />}
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 sm:h-16 sm:w-16">
            <Bus className="h-8 w-8 text-white sm:h-10 sm:w-10" />
            <span className="absolute -bottom-1 left-2 h-1.5 w-8 rounded-full bg-brand-orange" />
          </span>
          <span>
            <span className="block text-2xl font-black tracking-wide sm:text-4xl">BALLOU</span>
            <span className="block text-[10px] font-bold tracking-[0.18em] text-brand-orange sm:text-xs">SERVICE EXPRESS</span>
          </span>
        </Link>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-full border-white/30 bg-transparent px-3 text-white hover:bg-white/10 hover:text-white sm:px-5">
              <MessageCircle className="mr-2 h-4 w-4" /> Contact
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
