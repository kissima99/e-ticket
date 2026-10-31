import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, Loader2, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TransportHeader from "@/components/TransportHeader";
import TicketConfirmation from "@/components/TicketConfirmation";
import PaymentLogo from "@/components/PaymentLogo";
import TravelDatePicker from "@/components/TravelDatePicker";
import PassengerCounter from "@/components/PassengerCounter";
import TravelRouteSelector from "@/components/TravelRouteSelector";
import { getTravelFare, routeStops, routeSchedule, ticketScheduleText, type TravelRouteId } from "@/lib/travel-routes";
import { bookingSchema, formatAmount, formatTravelDate, type BookingForm, type BookingTicket } from "@/lib/booking";

type Draft = Omit<BookingForm, "departure_city" | "arrival_city" | "route_id"> & { departure_city: string; arrival_city: string; route_id: TravelRouteId };
const stepNames = ["Trajet", "Voyageur", "Paiement", "Ticket"];
const stepFields = [["route_id", "departure_city", "arrival_city", "travel_date", "seats"], ["civility", "full_name", "phone", "identity_document_type", "identity_document_number", "emergency_contact", "boarding_point", "luggage_count"], ["payment_method", "promo_code", "total_amount"]];
const inputClass = "h-12 rounded-xl border-slate-200 bg-white text-brand-navy focus-visible:ring-brand-orange";
const actionClass = "h-12 rounded-xl bg-brand-orange px-6 font-bold text-brand-navy hover:bg-orange-500";

export default function Reservation() {
  const [params] = useSearchParams();
  const initial = (): Draft => {
    const route_id: TravelRouteId = params.get("route") === "tamba_kidira" ? "tamba_kidira" : "ouro_sogui";
    const departure_city = params.get("departure") === "Ballou" ? "Ballou" : "Dakar";
    const arrival_city = routeStops(route_id, departure_city).slice(1).includes(params.get("arrival") || "") ? params.get("arrival")! : departure_city === "Dakar" ? "Ballou" : "Dakar";
    const fare = getTravelFare(departure_city, arrival_city);
    return { route_id, departure_city, arrival_city, travel_date: /^\d{4}-\d{2}-\d{2}$/.test(params.get("date") || "") ? params.get("date")! : "", seats: [""], civility: "M.", full_name: "", phone: "", identity_document_type: "CNI", identity_document_number: "", emergency_contact: "", boarding_point: "", luggage_count: 0, payment_method: "Cash", total_amount: fare };
  };
  const [form, setForm] = useState<Draft>(initial);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ticket, setTicket] = useState<BookingTicket | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [taken, setTaken] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [serverError, setServerError] = useState("");
  const requestId = useRef(crypto.randomUUID());
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, [step]);
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.travel_date)) { setTaken([]); setChecking(false); setAvailabilityError(""); return; }
    let active = true;
    setChecking(true); setAvailabilityError("");
    supabase.functions.invoke("dabo-booking", { body: { action: "availability", data: { route_id: form.route_id, departure_city: form.departure_city, travel_date: form.travel_date } } }).then(({ data, error }) => {
      if (!active) return;
      if (error || data?.error || !Array.isArray(data?.taken)) { setAvailabilityError("Impossible de vérifier les sièges. Réessayez avant de continuer."); setTaken([]); }
      else setTaken(data.taken);
      setChecking(false);
    }).catch(() => { if (active) { setChecking(false); setAvailabilityError("Vérification des sièges indisponible."); } });
    return () => { active = false; };
  }, [form.route_id, form.departure_city, form.travel_date, refresh]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm(previous => ({ ...previous, [key]: value }));
    setErrors({}); setServerError(""); setAccepted(false);
  }
  function validate(upTo: number) {
    const result = bookingSchema.safeParse(form);
    const keys = stepFields.slice(0, upTo).flat();
    const messages: Record<string, string> = {};
    if (!result.success) for (const issue of result.error.issues) if (keys.includes(String(issue.path[0]))) messages[issue.path.join(".")] = issue.message;
    if (upTo >= 1 && form.seats.some(seat => taken.includes(seat))) messages.seats = "Un siège choisi est déjà réservé. Sélectionnez un siège disponible.";
    if (upTo >= 1 && (checking || availabilityError)) messages.seats = checking ? "Veuillez attendre la vérification des sièges." : availabilityError;
    setErrors(messages);
    if (Object.keys(messages).length) {
      const firstInvalidStep = stepFields.findIndex(fields => Object.keys(messages).some(key => fields.includes(key.split(".")[0])));
      if (firstInvalidStep >= 0) setStep(firstInvalidStep + 1);
      toast.error("Vérifiez les champs signalés avant de continuer.");
      return false;
    }
    return true;
  }
  function navigate(target: number) {
    if (ticket || saving) return;
    if (target === 4) { void confirm(); return; }
    if (target <= step || validate(target - 1)) { setStep(target); setErrors({}); }
  }
  async function confirm() {
    if (saving || ticket) return;
    if (!validate(3)) return;
    if (!accepted) { setStep(3); setErrors({ accepted: "Confirmez avoir vérifié les informations du ticket." }); return; }
    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) return;
    setSaving(true); setServerError("");
    try {
      const { data, error } = await supabase.functions.invoke("dabo-booking", { body: { action: "book", request_id: requestId.current, data: parsed.data } });
      if (error) throw new Error("La réservation n’a pas pu être confirmée. Réessayez ; votre demande ne sera pas enregistrée en double.");
      if (data?.error) {
        if (data.code === "SEAT_TAKEN" || data.code === "INVALID_DATE") { setStep(1); setRefresh(value => value + 1); }
        throw new Error(data.error);
      }
      if (!data?.ticket?.ticket_id) throw new Error("La confirmation n’a pas été reçue. Veuillez réessayer.");
      setTicket(data.ticket); setStep(4); toast.success("Votre réservation est enregistrée. Le ticket est prêt !");
    } catch (error) { const message = error instanceof Error ? error.message : "Une erreur est survenue. Réessayez."; setServerError(message); toast.error(message); }
    finally { setSaving(false); }
  }
  const fare = getTravelFare(form.departure_city, form.arrival_city);
    const total = (form.total_amount || fare) * form.seats.length;
    const fieldError = (key: string) => errors[key] ? <p id={`${key}-error`} className="mt-1 text-xs text-red-700" role="alert">{errors[key]}</p> : null;
  function textField(key: "full_name" | "phone" | "identity_document_number" | "emergency_contact" | "boarding_point", title: string, placeholder: string, type = "text", maxLength = 150) {
    return <div className="space-y-2"><Label htmlFor={key} className="text-sm text-slate-700">{title} <span className="text-orange-700">*</span></Label><Input id={key} value={form[key]} onChange={event => update(key, event.target.value)} type={type} maxLength={maxLength} placeholder={placeholder} autoComplete={key === "full_name" ? "name" : key === "phone" ? "tel" : "off"} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${key}-error` : undefined} className={inputClass} />{fieldError(key)}</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-brand-navy">
      <TransportHeader back />
      <main className="mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6">
        <nav aria-label="Étapes de réservation" className="mb-8 grid grid-cols-4 gap-2">
          {stepNames.map((name, index) => <button key={name} type="button" onClick={() => navigate(index + 1)} disabled={saving || (Boolean(ticket) && index !== 3)} aria-current={step === index + 1 ? "step" : undefined} className={`flex flex-col items-center gap-2 rounded-2xl px-1 py-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:cursor-default sm:flex-row sm:justify-center sm:text-sm ${step === index + 1 ? "bg-brand-navy text-white" : index + 1 < step ? "bg-orange-50 text-brand-navy" : "bg-slate-100 text-slate-600 hover:bg-orange-50"}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full ${step === index + 1 ? "bg-brand-orange text-brand-navy" : "bg-white text-brand-navy"}`}>{index + 1 < step ? <Check className="h-4 w-4" /> : index + 1}</span>{name}</button>)}
        </nav>
        {serverError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{serverError}</div>}
        {ticket ? <TicketConfirmation ticket={ticket} requestId={requestId.current} onNewBooking={() => { setTicket(null); setForm(initial()); setStep(1); setErrors({}); setAccepted(false); setServerError(""); requestId.current = crypto.randomUUID(); setRefresh(value => value + 1); }} /> : (
          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className={`p-6 pb-3 sm:p-8 sm:pb-4 ${step === 3 ? "text-center" : ""}`}><CardTitle ref={headingRef} tabIndex={-1} className={step === 3 ? "mx-auto max-w-md text-3xl font-extrabold leading-tight outline-none sm:text-4xl" : "flex items-center gap-3 text-xl font-extrabold outline-none sm:text-2xl"}>{step === 1 ? <MapPin className="text-orange-600" /> : step === 2 ? <UserRound className="text-orange-600" /> : null}{step === 1 ? "Choisissez votre trajet" : step === 2 ? "Fiche de renseignements voyageur" : "Choisissez votre moyen de paiement"}</CardTitle><p className="pt-2 text-sm text-slate-600">{step === 1 ? `DABO TRANSPORT • ${formatAmount(fare)} par personne` : step === 2 ? "Les champs marqués * sont obligatoires." : "Vérifiez votre voyage avant de générer le ticket."}</p></CardHeader>
            <CardContent className="p-6 pt-4 sm:p-8 sm:pt-4">
              <form noValidate onSubmit={event => { event.preventDefault(); if (step < 3) navigate(step + 1); else void confirm(); }}>
                {step === 1 && <div className="space-y-5">
                  <TravelRouteSelector value={form} onChange={selection => { const previousRoute = form.route_id; const previousDeparture = form.departure_city; const previousArrival = form.arrival_city; setForm(previous => { const next = { ...previous, ...selection, seats: previous.route_id !== selection.route_id || previous.departure_city !== selection.departure_city ? previous.seats.map(() => "") : previous.seats }; if (previousRoute !== selection.route_id || previousDeparture !== selection.departure_city || previousArrival !== selection.arrival_city) next.total_amount = getTravelFare(selection.departure_city, selection.arrival_city); return next; }); setErrors({}); setServerError(""); setAccepted(false); }} />
                  {fieldError("route_id")}{fieldError("departure_city")}{fieldError("arrival_city")}
                  <div className="flex items-center justify-center gap-3 py-3 text-center"><span className="h-0.5 w-6 rounded-full bg-brand-orange" /><h2 className="text-2xl font-extrabold sm:text-3xl">{form.departure_city} vers {form.arrival_city}</h2><span className="h-0.5 w-6 rounded-full bg-brand-orange" /></div>
                  <TravelDatePicker id="travel_date" value={form.travel_date} departure={form.departure_city} routeId={form.route_id} invalid={Boolean(errors.travel_date)} onChange={value => { update("travel_date", value); setForm(previous => ({ ...previous, seats: previous.seats.map(() => "") })); }} />
                  {fieldError("travel_date")}
                  <PassengerCounter count={form.seats.length} onChange={count => update("seats", Array.from({ length: count }, (_, index) => form.seats[index] || ""))} />
                  {checking && <p className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Vérification des sièges…</p>}
                  {availabilityError && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{availabilityError}<Button type="button" variant="link" onClick={() => setRefresh(value => value + 1)} className="text-red-800">Réessayer</Button></div>}
                  <div className="grid gap-4 sm:grid-cols-2">{form.seats.map((seat, index) => <div key={index} className="space-y-2"><Label htmlFor={`seat-${index}`}>Siège du passager {index + 1} *</Label><Select value={seat} disabled={!form.travel_date || checking || Boolean(availabilityError)} onValueChange={value => update("seats", form.seats.map((old, i) => i === index ? value : old))}><SelectTrigger id={`seat-${index}`} className={inputClass}><SelectValue placeholder="Choisir un siège" /></SelectTrigger><SelectContent>{Array.from({ length: 70 }, (_, i) => String(i + 1)).map(value => <SelectItem key={value} value={value} disabled={taken.includes(value) || form.seats.some((selected, i) => i !== index && selected === value)}>Siège {value}{taken.includes(value) ? " — réservé" : ""}</SelectItem>)}</SelectContent></Select>{fieldError(`seats.${index}`)}</div>)}</div>{fieldError("seats")}
                  <div className="rounded-xl bg-slate-50 p-4 text-sm">Total du voyage : <strong data-testid="booking-total" className="ml-2 text-lg">{formatAmount(total)}</strong><p className="mt-1 text-xs text-slate-500">Les sièges seront bloqués après confirmation.</p></div>
                </div>}
                {step === 2 && <div className="space-y-5">
                  {form.seats.length > 1 && <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">Renseignez le voyageur principal pour cette réservation de {form.seats.length} personnes. Chaque passager devra présenter sa pièce d’identité à l’embarquement.</p>}
                  <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="civility">Civilité *</Label><Select value={form.civility} onValueChange={value => update("civility", value as Draft["civility"])}><SelectTrigger id="civility" className={inputClass}><SelectValue /></SelectTrigger><SelectContent>{["M.", "Mme", "Mlle"].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>{textField("full_name", "Nom complet", "Nom et prénom", "text", 100)}{textField("phone", "Téléphone", "77 123 45 67", "tel", 25)}<div className="space-y-2"><Label htmlFor="identity_document_type">Pièce d’identité *</Label><Select value={form.identity_document_type} onValueChange={value => update("identity_document_type", value as Draft["identity_document_type"])}><SelectTrigger id="identity_document_type" className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CNI">CNI</SelectItem><SelectItem value="Passeport">Passeport</SelectItem></SelectContent></Select></div>{textField("identity_document_number", "Numéro CNI / passeport", "Numéro de votre pièce", "text", 50)}{textField("emergency_contact", "Téléphone du contact d’urgence", "77 123 45 67", "tel", 25)}{textField("boarding_point", "Point de montée", "Gare / point de rendez-vous")}<div className="space-y-2"><Label htmlFor="luggage_count">Nombre de bagages</Label><Select value={String(form.luggage_count)} onValueChange={value => update("luggage_count", Number(value))}><SelectTrigger id="luggage_count" className={inputClass}><SelectValue /></SelectTrigger><SelectContent>{[0,1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} bagage{n > 1 ? "s" : ""}</SelectItem>)}</SelectContent></Select></div></div>
                  <p className="text-xs leading-relaxed text-slate-500">La pièce d’identité et le contact d’urgence ne seront pas inclus dans le PDF ni dans le message WhatsApp.</p>
                </div>}
                {step === 3 && <div className="space-y-6">
                                  <RadioGroup aria-label="Mode de paiement" value={form.payment_method} onValueChange={value => update("payment_method", value as Draft["payment_method"])} className="gap-4 sm:gap-5">{[{ value: "Cash" as const, subtitle: "Espèces auprès de la compagnie" }, { value: "Wave" as const, subtitle: "Paiement mobile Wave" }, { value: "OM" as const, subtitle: "Orange Money" }].map(({ value, subtitle }) => <div key={value} className="relative"><RadioGroupItem id={`payment-${value}`} value={value} aria-label={value} className="peer sr-only" /><Label htmlFor={`payment-${value}`} className={`flex min-h-32 cursor-pointer items-center gap-4 rounded-3xl border bg-white p-4 shadow-[0_6px_22px_-12px_rgba(0,34,68,0.2)] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-orange-700 sm:min-h-40 sm:gap-7 sm:p-6 ${form.payment_method === value ? "border-brand-orange ring-2 ring-brand-orange" : "border-orange-200 hover:border-brand-orange"}`}><PaymentLogo method={value} /><span className="min-w-0 flex-1"><span className="block text-3xl font-extrabold text-brand-navy sm:text-4xl">{value}</span><span className="mt-2 block text-xs font-normal leading-relaxed text-slate-600 sm:text-sm">{subtitle}</span></span>{form.payment_method === value ? <CheckCircle2 className="h-7 w-7 shrink-0 text-orange-600 sm:h-9 sm:w-9" aria-hidden="true" /> : <ChevronRight className="h-7 w-7 shrink-0 text-brand-orange sm:h-9 sm:w-9" aria-hidden="true" />}</Label></div>)}</RadioGroup>
                                  <div className="rounded-2xl bg-slate-50 p-5"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Votre réservation</h3><Button variant="link" type="button" onClick={() => navigate(1)} className="h-auto p-0 text-orange-700">Modifier</Button></div><p className="font-semibold">{form.departure_city} → {form.arrival_city}</p><p className="mt-1 text-sm text-slate-600">{formatTravelDate(form.travel_date)} • {ticketScheduleText({ route_id: form.route_id, rendezvous_time: routeSchedule(form.route_id, form.departure_city).meeting, departure_time: routeSchedule(form.route_id, form.departure_city).departure })}</p><p className="mt-1 text-sm text-slate-600">{form.full_name} • Siège(s) {form.seats.join(", ")}</p><div className="mt-4 flex justify-between border-t border-slate-200 pt-3"><span>Total à régler</span><strong className="text-xl">{formatAmount(total)}</strong></div></div>
                                  <div className="space-y-2"><Label htmlFor="total_amount">Montant total (FCFA) <span className="text-orange-700">*</span></Label><Input id="total_amount" type="number" min="0" step="100" value={form.total_amount || ""} onChange={event => update("total_amount", event.target.value ? Number(event.target.value) : undefined)} className={inputClass} placeholder="Ex: 12000" /><p className="text-xs text-slate-600">Le montant calculé automatiquement est de {formatAmount(fare * form.seats.length)}. Vous pouvez le modifier si nécessaire.</p>{fieldError("total_amount")}</div>
                                  <div className="space-y-2"><Label htmlFor="promo_code">Code réduction / carte cadeau (facultatif)</Label><Input id="promo_code" maxLength={50} value={form.promo_code || ""} onChange={event => update("promo_code", event.target.value.toUpperCase())} className={inputClass} placeholder="RED-… ou CADEAU-…" /><p className="text-xs text-slate-600">Le total ci-dessus est affiché avant réduction. Un code valide applique 15 % lors de la confirmation ; le montant final figure sur le ticket.</p>{fieldError("promo_code")}</div>
                                  <p className="rounded-xl bg-orange-50 p-4 text-sm leading-relaxed text-orange-900">{form.payment_method === "Cash" ? "Le règlement en espèces est à effectuer auprès de DABO TRANSPORT avant l'embarquement." : `Le choix ${form.payment_method === "OM" ? "Orange Money" : "Wave"} sera enregistré. Aucun débit automatique n'est effectué ici : contactez la compagnie pour les instructions de règlement.`} Le ticket portera la mention « paiement en attente ».</p>
                                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"><Checkbox checked={accepted} onCheckedChange={value => { setAccepted(value === true); setErrors({}); }} className="mt-1 border-orange-500 data-[state=checked]:bg-brand-navy" /><span>J'ai vérifié les renseignements et je comprends que le paiement reste à effectuer.</span></label>{fieldError("accepted")}
                                </div>}
                <div className={`mt-8 flex gap-3 border-t border-slate-100 pt-5 ${step === 2 ? "items-center justify-between" : "flex-col-reverse"}`}>{step > 1 ? <Button type="button" variant="outline" disabled={saving} onClick={() => navigate(step - 1)} className="h-12 rounded-xl"><ArrowLeft /> Retour</Button> : <Button asChild variant="outline" className="h-12 rounded-xl"><Link to="/">Accueil</Link></Button>}<Button type="submit" disabled={saving || (step === 1 && checking)} className={step === 2 ? actionClass : "h-16 w-full rounded-2xl bg-orange-600 text-xl font-extrabold text-white shadow-sm hover:bg-orange-700 sm:h-20 sm:text-2xl"}>{saving ? <Loader2 className="animate-spin" /> : step === 3 ? <CheckCircle2 /> : <ArrowRight />}{saving ? "Enregistrement…" : step === 3 ? "Confirmer le ticket" : step === 1 ? "Réserver" : "Continuer"}</Button></div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
