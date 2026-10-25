import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bus } from "lucide-react";

export default function Admin() {
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPin, setAdminPin] = useState<string>("");
  const [login, setLogin] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);

  const handleLogin = async () => {
    if (adminEmail !== "admin@dabotransport.sn" || adminPin !== "BALLOU2024") {
      toast.error("Identifiants incorrects");
      return;
    }
    setLogin(true);
  };

  const handleLogout = () => {
    setLogin(false);
    setAdminEmail("");
    setAdminPin("");
  };

  if (!login) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-blue to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
          <h1 className="text-3xl font-bold text-brand-blue mb-4">Espace Administration</h1>
          <p className="text-gray-600 mb-8">Identifiez-vous pour accéder aux outils de gestion</p>
          
          <div className="space-y-4">
            <Input
              placeholder="Email administrateur"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="PIN administrateur"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
            />
            <Button onClick={handleLogin} className="w-full">
              Se connecter
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Email: admin@dabotransport.sn<br />
            PIN: BALLOU2024
          </p>
        </div>
      </div>
    );
  }

  // User is logged in - show dashboard
  const [reclamations, setReclamations] = useState<Array<{id: string, client_name: string, phone: string, description: string, status: string, created_at: string}>>([]);
  const [reports, setReports] = useState<Array<{id: string, company: string, route: string, message: string, new_date: string, created_at: string}>>([]);
  const [newReclamation, setNewReclamation] = useState<string>("");
  const [newReport, setNewReport] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, [login]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch reclamations
      const { data: recs, error: recError } = await supabase
        .from("reclamations_dabo")
        .select("*")
        .order("created_at", { ascending: false });

      if (recError) throw recError;
      setReclamations(recs || []);

      // Fetch reports
      const { data: rpts, error: rptError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (rptError) throw rptError;
      setReports(rpts || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReclamation = async () => {
    if (!newReclamation.trim()) return;
    
    await supabase.from("reclamations_dabo").insert({
      client_name: "Client anonyme",
      phone: "",
      description: newReclamation,
      status: "En attente",
    });

    setNewReclamation("");
    toast.success("Réclamation enregistrée");
    fetchData();
  };

  const handleUpdateReclamationStatus = async (id: string, newStatus: string) => {
    await supabase
      .from("reclamations_dabo")
      .update({ status: newStatus })
      .eq("id", id);
    
    toast.success("Statut mis à jour");
    fetchData();
  };

  const handleCreateReport = async () => {
    if (!newReport.trim()) return;
    
    await supabase.from("reports").insert({
      company: "DABO TRANSPORT",
      route: "",
      message: newReport,
      new_date: new Date().toISOString().split('T')[0],
    });

    setNewReport("");
    toast.success("Rapport créé");
    fetchData();
  };

  const handleUpdateReportStatus = async (id: string, newStatus: string) => {
    await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", id);
    
    toast.success("Statut mis à jour");
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Chargement...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout */}
      <header className="bg-brand-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bus className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">BALLOU SERVICE EXPRESS</h1>
              <p className="text-sm opacity-90">Tableau de bord administration</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-transport p-4">
            <h3 className="text-sm font-medium text-gray-500">Réclamations</h3>
            <p className="text-2xl font-bold text-brand-blue">{reclamations.length}</p>
          </Card>
          <Card className="card-transport p-4">
            <h3 className="text-sm font-medium text-gray-500">Rapports</h3>
            <p className="text-2xl font-bold text-brand-blue">{reports.length}</p>
          </Card>
          <Card className="card-transport p-4">
            <h3 className="text-sm font-medium text-gray-500">Tickets réservés</h3>
            <p className="text-2xl font-bold text-brand-blue">0</p>
          </Card>
          <Card className="card-transport p-4">
            <h3 className="text-sm font-medium text-gray-500">Points fidélité</h3>
            <p className="text-2xl font-bold text-brand-blue">0</p>
          </Card>
        </div>

        {/* Reclamations Section */}
        <div className="card-transport mb-8 p-6">
          <h3 className="text-xl font-bold text-brand-blue mb-6">Gestion des réclamations</h3>

          <div className="grid grid-cols-1 gap-3 mb-4">
            <Input
              placeholder="Nouvelle réclamation..."
              value={newReclamation}
              onChange={(e) => setNewReclamation(e.target.value)}
            />
            <Button onClick={handleCreateReclamation} className="mt-0">
              Ajouter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Client</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Téléphone</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Description</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Statut</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reclamations.map((rec, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="p-3 text-sm">{rec.client_name}</td>
                    <td className="p-3 text-sm text-gray-500">{rec.phone}</td>
                    <td className="p-3 text-xs text-gray-600">{rec.description.substring(0, 50)}${rec.description.length > 50 ? "..." : ""}</td>
                    <td className="p-3 text-sm">
                      <span 
        className={`px-2 py-1 rounded text-xs ${rec.status === "En attente" ? "bg-yellow-100 text-yellow-800" : rec.status === "Traité" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
        {rec.status}
      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateReclamationStatus(rec.id, "Traité")}
                        className="text-green-600 text-xs mr-1"
                      >
                        Traité
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateReclamationStatus(rec.id, "En attente")}
                        className="text-brand-blue text-xs"
                      >
                        Réouvrir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports Section */}
        <div className="card-transport mb-8 p-6">
          <h3 className="text-xl font-bold text-brand-blue mb-6">Rapports et alertes</h3>

          <div className="grid grid-cols-1 gap-3 mb-4">
            <Input
              placeholder="Nouveau rapport..."
              value={newReport}
              onChange={(e) => setNewReport(e.target.value)}
            />
            <Button onClick={handleCreateReport} className="mt-0">
              Créer
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Route</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Message</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="p-3 text-sm text-brand-blue">{rep.route}</td>
                    <td className="p-3 text-xs text-gray-600">{rep.message.substring(0, 60)}${rep.message.length > 60 ? "..." : ""}</td>
                    <td className="p-3 text-sm text-gray-500">{new Date(rep.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateReportStatus(rep.id, "Traité")}
                        className="text-green-600 text-xs mr-1"
                      >
                        Marquer traité
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Abonnements Management */}
        <div className="card-transport p-6">
          <h3 className="text-xl font-bold text-brand-blue mb-6">Gestion des abonnements</h3>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <Input
              placeholder="Email admin"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="PIN admin"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
            />
            <Button onClick={handleLogin} className="mt-2">
              Se connecter
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Input
              placeholder="Nom de la compagnie"
              className="grid-col-span-full"
            />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="En pause">En pause</SelectItem>
                <SelectItem value="Expiré">Expiré</SelectItem>
              </SelectContent>
            </Select>
            <Button className="mt-2">Renouveler</Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-500">Dernier abonnement</h4>
            <p className="text-sm text-gray-600">Aucun abonnement actif</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-blue text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm opacity-80">
          BALLOU SERVICE EXPRESS - DABO TRANSPORT © 2024
        </div>
      </footer>
    </div>
  );
}