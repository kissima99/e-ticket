import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, MapPin, Clock, CreditCard, Gift, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-brand-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bus className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">BALLOU SERVICE EXPRESS</h1>
                <p className="text-sm opacity-90">DABO TRANSPORT</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/reservation" className="hover:text-yellow-300 transition-colors">Réserver</Link>
              <Link to="/fidelite" className="hover:text-yellow-300 transition-colors">Fidélité</Link>
              <Link to="/admin" className="hover:text-yellow-300 transition-colors">Admin</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-brand-blue">
            Votre trajet, notre engagement
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Réservez votre ticket de bus entre Dakar, Ballou et nos villes partenaires. 
            Service fiable, prix fixe à 12 000 FCFA par personne.
          </p>
          <Link to="/reservation">
            <Button size="lg" className="btn-transport-primary text-lg px-8 py-3">
              Réserver un ticket
            </Button>
          </Link>
        </div>
      </section>

      {/* Service Info */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="card-transport">
            <CardHeader className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-brand-blue mb-2" />
              <CardTitle>Villes desservies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Dakar • Ballou • Touba • Dara Djolof • Ouroussogui • Sèmè • Tamba • Kaolack • Goudiry • Kidira • Bakel • Bema • Gabou • Sarré
              </p>
            </CardContent>
          </Card>

          <Card className="card-transport">
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 mx-auto text-brand-blue mb-2" />
              <CardTitle>Horaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Dakar → Ballou</strong> : Mardi & Samedi à 15h00</p>
                <p><strong>Ballou → Dakar</strong> : Lundi & Jeudi à 15h00</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-transport">
            <CardHeader className="text-center">
              <CreditCard className="h-12 w-12 mx-auto text-brand-blue mb-2" />
              <CardTitle>Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>• Wave</p>
                <p>• Orange Money</p>
                <p>• Espèces (Cash)</p>
                <p className="text-lg font-bold text-brand-blue mt-2">12 000 FCFA / pers.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Loyalty Section */}
      <section className="bg-brand-yellow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-brand-blue">
              Programme de Fidélité
            </h2>
            <p className="text-lg mb-8">
              Gagnez des points à chaque réservation et cumulez pour des récompenses exclusives !
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/fidelite">
                <Button size="lg" className="w-full btn-transport-primary">
                  <Star className="mr-2 h-5 w-5" />
                  Voir mes points
                </Button>
              </Link>
              <Link to="/reservation">
                <Button size="lg" variant="outline" className="w-full border-brand-blue text-brand-blue hover:bg-white">
                  Réserver maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h3 className="text-2xl font-bold mb-4 text-brand-blue">
          Prêt à voyager ?
        </h3>
        <p className="text-gray-600 mb-6">
          Réservation rapide et sécurisée en quelques minutes
        </p>
        <Link to="/reservation">
          <Button size="lg" className="btn-transport-primary">
            Commencer la réservation
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-brand-blue text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            <strong>BALLOU SERVICE EXPRESS</strong> - DABO TRANSPORT
          </p>
          <p className="text-sm opacity-80">
            © 2024 Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}