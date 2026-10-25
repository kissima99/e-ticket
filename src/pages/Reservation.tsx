import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bus, Calendar, MapPin, User, Phone, CreditCard, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CITIES = [
  "Dakar", "Ballou", "Touba", "Dara Djolof", "Ouroussogui", 
  "Sèmè", "Tamba", "Kaolack", "Goudiry", "Kidira", "Bakel", "Bema", "Gabou", "Sarré"
];

const DEPARTURE_DAYS = {
  "Dakar": ["Mardi", "Samedi"],
  "Ballou": ["Lundi", "Jeudi"],
};

const SEATS = Array.from({ length: 45 }, (_, i) => (i + 1).toString());

export default function Reservation() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    departure_city: "",
    arrival_city: "",
    travel_date: "",
    seat_number: "",
    passenger_count: 1,
    civility: "M.",
    full_name: "",
    phone: "",
    identity_document_type: "CNI",
    identity_document_number: "",
    emergency_contact: "",
    boarding_point: "",
    luggage_count: 0,
    payment_method: "Wave",
  });
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const getNextTravelDate = (departure: string) => {
    const days = DEPARTURE_DAYS[departure as keyof typeof DEPARTURE_DAYS] || [];
    const today = new Date();
    const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dayName = dayNames[checkDate.getDay()];
      if (days.includes(dayName)) {
        return checkDate.toISOString().split('T')[0];
      }
    }
    return "";
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.departure_city && formData.arrival_city && formData.travel_date && formData.seat_number;
    }
    if (step === 2) {
      return formData.civility && formData.full_name && formData.phone && 
             formData.identity_document_type && formData.identity_document_number &&
             formData.emergency_contact && formData.boarding_point;
    }
    if (step === 3) {
      return formData.payment_method;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const newTicketId = `BSE-${Date.now().toString().slice(-8)}`;
      
      const { error } = await supabase
        .from("reservations_dabo")
        .insert({
          ticket_id: newTicketId,
          departure_city: formData.departure_city,
          arrival_city: formData.arrival_city,
          travel_date: formData.travel_date,
          seat_number: formData.seat_number,
          passenger_count: formData.passenger_count,
          civility: formData.civility,
          full_name: formData.full_name,
          phone: formData.phone,
          identity_document_type: formData.identity_document_type,
          identity_document_number: formData.identity_document_number,
          emergency_contact: formData.emergency_contact,
          boarding_point: formData.boarding_point,
          luggage_count: formData.luggage_count,
          payment_method: formData.payment_method,
        });

      if (error) throw error;

      // Add loyalty points
      await addLoyaltyPoints(formData.phone, formData.full_name);

      setTicketId(newTicketId);
      setStep(4);
      toast.success("Réservation confirmée !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const addLoyaltyPoints = async (phone: string, name: string) => {
    try {
      // Check if profile exists
      const { data: profile } = await supabase
        .from("loyalty_profiles")
        .select("*")
        .eq("phone", phone)
        .single();

      if (profile) {
        // Update existing profile
        await supabase
          .from("loyalty_profiles")
          .update({
            points_balance: profile.points_balance + 1,
            total_lifetime_points: profile.total_lifetime_points + 1,
            full_name: name,
            updated_at: new Date().toISOString(),
          })
          .eq("phone", phone);

        await supabase
          .from("loyalty_transactions")
          .insert({
            phone,
            points_change: 1,
            type: "EARN_TICKET",
            description: "Achat ticket de voyage",
          });
      } else {
        // Create new profile
        await supabase
          .from("loyalty_profiles")
          .insert({
            phone,
            full_name: name,
            points_balance: 1,
            total_lifetime_points: 1,
          });

        await supabase
          .from("loyalty_transactions")
          .insert({
            phone,
            points_change: 1,
            type: "EARN_TICKET",
            description: "Achat ticket de voyage",
          });
      }
    } catch (error) {
      console.error("Error adding loyalty points:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      departure_city: "",
      arrival_city: "",
      travel_date: "",
      seat_number: "",
      passenger_count: 1,
      civility: "M.",
      full_name: "",
      phone: "",
      identity_document_type: "CNI",
      identity_document_number: "",
      emergency_contact: "",
      boarding_point: "",
      luggage_count: 0,
      payment_method: "Wave",
    });
    setStep(1);
    setTicketId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bus className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">BALLOU SERVICE EXPRESS</h1>
                <p className="text-sm opacity-90">DABO TRANSPORT</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-4">
              <span className="text-sm opacity-90">12 000 FCFA / pers.</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                s < step ? "bg-brand-yellow text-brand-blue" : 
                s === step ? "bg-brand-blue text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {s < step ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 4 && <div className={`w-16 h-1 mx-2 ${s < step ? "bg-brand-yellow" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2 text-sm text-gray-600">
          <span className={step === 1 ? "font-bold text-brand-blue" : ""}>Trajet</span>
          <span className="mx-4">{step === 2 ? "font-bold text-brand-blue" : ""}>Voyageur</span>
          <span className="mx-4">{step === 3 ? "font-bold text-brand-blue" : ""}>Paiement</span>
          <span className={step === 4 ? "font-bold text-brand-blue" : ""}>Confirmation</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-2xl">
        {step === 1 && (
          <Card className="card-transport">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-brand-blue" />
                <span>Étape 1 : Choisir votre trajet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure_city">Ville de départ *</Label>
                  <Select value={formData.departure_city} onValueChange={(v) => handleChange({ target: { name: "departure_city", value: v } } as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="arrival_city">Ville d'arrivée *</Label>
                  <Select value={formData.arrival_city} onValueChange={(v) => handleChange({ target: { name: "arrival_city", value: v } } as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.filter(c => c !== formData.departure_city).map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="travel_date">Date de voyage *</Label>
                <Input
                  id="travel_date"
                  type="date"
                  name="travel_date"
                  value={formData.travel_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formData.departure_city && (
                  <p className="text-sm text-gray-500 mt-1">
                    Prochain départ {formData.departure_city} : {getNextTravelDate(formData.departure_city)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="seat_number">Numéro de siège *</Label>
                <Select value={formData.seat_number} onValueChange={(v) => handleChange({ target: { name: "seat_number", value: v } } as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un siège" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEATS.map(seat => (
                      <SelectItem key={seat} value={seat}>Siège {seat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="passenger_count">Nombre de passagers</Label>
                <Select value={formData.passenger_count.toString()} onValueChange={(v) => handleChange({ target: { name: "passenger_count", value: v } } as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} passager{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!validateStep()}>
                  Suivant <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="card-transport">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-brand-blue" />
                <span>Étape 2 : Fiche de renseignements voyageur</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  Aucune connexion Gmail/Google requise. Identification via cette fiche uniquement.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Civilité *</Label>
                  <RadioGroup value={formData.civility} onValueChange={(v) => handleRadioChange("civility", v)}>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <RadioGroupItem value="M." />
                        <span>M.</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <RadioGroupItem value="Mme" />
                        <span>Mme</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <RadioGroupItem value="Mlle" />
                        <span>Mlle</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="full_name">Nom complet *</Label>
                  <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Nom et Prénom" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+221 7X XXX XX XX" />
                </div>
                <div>
                  <Label htmlFor="identity_document_type">Pièce d'identité *</Label>
                  <Select value={formData.identity_document_type} onValueChange={(v) => handleChange({ target: { name: "identity_document_type", value: v } } as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNI">CNI</SelectItem>
                      <SelectItem value="Passeport">Passeport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="identity_document_number">Numéro de la pièce *</Label>
                <Input id="identity_document_number" name="identity_document_number" value={formData.identity_document_number} onChange={handleChange} placeholder="Numéro CNI ou Passeport" />
              </div>

              <div>
                <Label htmlFor="emergency_contact">Contact d'urgence *</Label>
                <Input id="emergency_contact" name="emergency_contact" type="tel" value={formData.emergency_contact} onChange={handleChange} placeholder="+221 7X XXX XX XX" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boarding_point">Point de montée *</Label>
                  <Input id="boarding_point" name="boarding_point" value={formData.boarding_point} onChange={handleChange} placeholder="Ex: Gare routière Dakar" />
                </div>
                <div>
                  <Label htmlFor="luggage_count">Nombre de bagages</Label>
                  <Select value={formData.luggage_count.toString()} onValueChange={(v) => handleChange({ target: { name: "luggage_count", value: v } } as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3,4,5].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} bagage{n > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronRight className="mr-2 h-4 w-4 rotate-180" /> Précédent
                </Button>
                <Button onClick={() => setStep(3)} disabled={!validateStep()}>
                  Suivant <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="card-transport">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-brand-blue" />
                <span>Étape 3 : Paiement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Total à payer : <span className="text-brand-blue text-xl">{formData.passenger_count * 12000} FCFA</span></p>
                <p className="text-sm text-gray-600">{formData.passenger_count} passager(s) × 12 000 FCFA</p>
              </div>

              <Label>Mode de paiement *</Label>
              <RadioGroup value={formData.payment_method} onValueChange={(v) => handleRadioChange("payment_method", v)}>
                <div className="space-y-3">
                  {["Wave", "Orange Money", "Espèces (Cash)"].map(method => (
                    <label key={method} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value={method} />
                      <span className="font-medium">{method}</span>
                    </label>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronRight className="mr-2 h-4 w-4 rotate-180" /> Précédent
                </Button>
                <Button onClick={handleSubmit} disabled={loading || !validateStep()}>
                  {loading ? "Traitement..." : "Confirmer et payer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && ticketId && (
          <Card className="card-transport">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Réservation confirmée !</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-800">{ticketId}</p>
                <p className="text-green-700">Votre ticket a été généré avec succès</p>
              </div>

              <div className="grid gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-brand-blue mb-2">Détails du voyage</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Trajet :</strong> {formData.departure_city} → {formData.arrival_city}</p>
                    <p><strong>Date :</strong> {formData.travel_date}</p>
                    <p><strong>Siège :</strong> {formData.seat_number}</p>
                    <p><strong>Passagers :</strong> {formData.passenger_count}</p>
                    <p><strong>Paiement :</strong> {formData.payment_method}</p>
                    <p><strong>Total :</strong> {formData.passenger_count * 12000} FCFA</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-brand-blue mb-2">Informations voyageur</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Nom :</strong> {formData.civility} {formData.full_name}</p>
                    <p><strong>Téléphone :</strong> {formData.phone}</p>
                    <p><strong>Pièce :</strong> {formData.identity_document_type} {formData.identity_document_number}</p>
                    <p><strong>Urgence :</strong> {formData.emergency_contact}</p>
                    <p><strong>Montée :</strong> {formData.boarding_point}</p>
                    <p><strong>Bagages :</strong> {formData.luggage_count}</p>
                  </div>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-yellow-800">
                  <strong>Important :</strong> Présentez-vous au point de montée 30 min avant le départ avec votre pièce d'identité et ce numéro de ticket : <strong>{ticketId}</strong>
                </AlertDescription>
              </Alert>

              <div className="flex space-x-4">
                <Button onClick={resetForm} className="flex-1">
                  Nouvelle réservation
                </Button>
                <Button variant="outline" onClick={() => window.print()} className="flex-1">
                  Imprimer le ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-brand-blue text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm opacity-80">
          BALLOU SERVICE EXPRESS - DABO TRANSPORT © 2024
        </div>
      </footer>
    </div>
  );
}