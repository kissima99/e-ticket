import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

const REWARDS = [
  { id: 1, title: "Réduction 15% sur ticket", description: "Code promo unique -15% pour votre prochain achat", points: 10, unlocked: false, type: "discount" },
  { id: 2, title: "Carte Cadeau / Bon d'achat", description: "Code bon d'achat -15% partageable à un proche", points: 10, unlocked: false, type: "gift_card" },
  { id: 3, title: "Achat Crédit Téléphonique", description: "Demande de recharge à renseigner", points: 10, unlocked: false, type: "airtime" },
  { id: 4, title: "Achat Pass Internet", description: "Demande de pass internet à renseigner", points: 10, unlocked: false, type: "data" },
  { id: 5, title: "Laisser cumuler les points", description: "Continuer à accumuler au-delà de 10 points", points: 0, unlocked: false, type: "continue" },
];

export default function Fidelite() {
  const [phone, setPhone] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [totalLifetimePoints, setTotalLifetimePoints] = useState<number>(0);
  const [showRewardPanel, setShowRewardPanel] = useState<boolean>(false);
  const [selectedReward, setSelectedReward] = useState<number | null>(null);
  const [requestData, setRequestData] = useState({
    operator: "",
    phone_number: "",
  });
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Array<{type: string, description: string, points: number, date: string}>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { toast } = useToast();

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    const demoPhone = phone || "+221 7X XXX XX XX";
    
    setIsLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from("loyalty_profiles")
        .select("*")
        .eq("phone", demoPhone)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (profile) {
        setPointsBalance(profile.points_balance);
        setTotalLifetimePoints(profile.total_lifetime_points);
      } else {
        await supabase.from("loyalty_profiles").insert({
          phone: demoPhone,
          full_name: fullName || "Voyageur",
          points_balance: 0,
          total_lifetime_points: 0,
        });
        setPointsBalance(0);
        setTotalLifetimePoints(0);
      }

      const { data: tx, error: txError } = await supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("phone", demoPhone)
        .order("created_at", { ascending: false })
        .limit(10);

      if (txError) throw txError;
      setTransactions(tx || []);
    } catch (err) {
      console.error("Error fetching loyalty data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  };

  const updateRewardStatus = (rewardId: number) => {
    const reward = REWARDS.find(r => r.id === rewardId);
    if (!reward) return;

    if (pointsBalance >= 10) {
      REWARDS[rewardId - 1].unlocked = true;
      setPointsBalance(pointsBalance - 10);
      
      supabase.from("loyalty_transactions").insert({
        phone,
        points_change: -10,
        type: "REDEEM_DISCOUNT",
        description: reward.title + " - " + new Date().toLocaleDateString(),
      });

      if (reward.id === 1) {
        setTimeout(() => {
          toast.success("Félicitations ! Code réduction -15% généré : BALLOU" + Math.random().toString(36).slice(2, 8).toUpperCase());
        }, 500);
      } else if (reward.id === 2) {
        setTimeout(() => {
          toast.success("Félicitations ! Code carte cadeau généré : GC-BALLOU" + Math.random().toString(36).slice(2, 8).toUpperCase());
        }, 500);
      } else if (reward.id === 5) {
        setTimeout(() => {
          toast.success("Points conservés ! Vous pouvez continuer à accumuler.");
        }, 500);
      }

      setShowRewardPanel(false);
      setSelectedReward(null);
    } else {
      toast.error("Vous avez besoin de 10 points (actuel: " + pointsBalance + "/10)");
    }
  };

  const handleRewardRequest = () => {
    const { operator, phone_number } = requestData;
    if (!operator || !phone_number) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    supabase.from("reward_requests").insert({
      phone,
      operator,
      reward_type: requestData.rewardType || "AIRTIME",
      status: "En attente",
    });

    setShowRequestModal(false);
    setRequestData({ operator: "", phone_number: "", rewardType: "AIRTIME" });
    toast.success("Demande envoyée avec succès ! Elle sera traitée sous 24h.");
  };

  const getProgressColor = () => {
    if (pointsBalance >= 10) return "bg-brand-yellow";
    if (pointsBalance > 0) return "bg-brand-yellow";
    return "bg-gray-200";
  };

  const getProgressPercent = () => {
    return Math.min((pointsBalance / 10) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Chargement...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Mon Compte</h1>
                <p className="text-sm opacity-90">Fidélité & Récompenses</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-4">
              <span className="text-sm font-medium">Points: {pointsBalance}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="card-transport mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-brand-blue">{pointsBalance}</h2>
              <p className="text-gray-600">points actuels</p>
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={getProgressColor() + " h-full rounded-full transition-all duration-500 ease-out"}
                style={{ width: getProgressPercent() + "%" }}
              />
            </div>
            <p className="text-sm text-gray-500">
              {pointsBalance}/10 points
            </p>
          </div>

          {pointsBalance < 10 && (
            <p className="mt-3 text-sm text-gray-600">
              Continuez à réserver pour accumuler des points et débloquer des récompenses !
            </p>
          )}

          {pointsBalance >= 10 && (
            <p className="mt-3 text-sm text-green-600">
              Félicitations ! Vous avez atteint le palier de 10 points. Sélectionnez une récompense ci-dessous.
            </p>
          )}
        </div>

        <div className="card-transport mb-8 p-6">
          <h3 className="text-xl font-bold text-brand-blue mb-6">
            {pointsBalance >= 10 ? "Vos récompenses disponibles" : "Programme de fidélité"}
          </h3>

          {pointsBalance < 10 && (
            <div className="space-y-3">
              {REWARDS.slice(0, 4).map(reward => (
                <div key={reward.id} className="p-4 rounded-lg border-2 border-dashed border-gray-300 cursor-not-allowed hover:border-brand-yellow transition-colors">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{reward.id === 1 ? "🎫" : reward.id === 2 ? "🎁" : reward.id === 3 ? "📱" : "🌐"}</span>
                    <div>
                      <h4 className="font-medium text-brand-blue">{reward.title}</h4>
                      <p className="text-sm text-gray-500">{reward.description}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Coût : {reward.points} points
                  </p>
                  <p className="text-xs text-gray-400">
                    Points restants : {pointsBalance}/10
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Continuez à réserver pour atteindre 10 points
                </p>
              </div>
            </div>
          )}

          {pointsBalance >= 10 && (
            <div className="space-y-4">
              {REWARDS.map(reward => (
                <div key={reward.id} className={"p-4 rounded-lg border " + (reward.unlocked ? "border-green-500 bg-green-50" : "border-gray-300") + " transition-colors cursor-pointer " + (!reward.unlocked && pointsBalance < 10 ? "opacity-50 cursor-not-allowed" : "")}>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{reward.id === 1 ? "🎫" : reward.id === 2 ? "🎁" : reward.id === 3 ? "📱" : "🌐"}</span>
                    <div>
                      <h4 className="font-medium text-brand-blue">{reward.title}</h4>
                      <p className="text-sm text-gray-500">{reward.description}</p>
                    </div>
                  </div>
                  
                  {reward.unlocked && (
                    <div className="flex justify-between text-xs">
                      <span>{pointsBalance >= 10 ? "Débloqué" : "Besoin de " + (10 - pointsBalance) + " points"}</span>
                      <span className="text-green-600">{pointsBalance >= 10 ? "-10 pts" : ""}</span>
                    </div>
                  )}

                  {!reward.unlocked && pointsBalance >= 10 && (
                    <button
                      onClick={() => setSelectedReward(reward.id)}
                      className="text-brand-blue text-sm hover:underline"
                    >
                      Sélectionner
                    </button>
                  )}

                  {!reward.unlocked && pointsBalance < 10 && (
                    <span className="text-gray-400 text-sm">
                      {10 - pointsBalance} points manquant
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-transport p-6">
          <h3 className="text-xl font-bold text-brand-blue mb-6">
            Historique des transactions
          </h3>

          {transactions.length === 0 && (
            <p className="text-gray-500 text-sm">
              Aucune transaction pour le moment
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Description</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Points</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-sm font-medium">
                      {tx.type === "EARN_TICKET" ? "Points gagnés" : tx.type}
                    </td>
                    <td className="p-3 text-sm text-gray-600">{tx.description || "N/A"}</td>
                    <td className="p-3 text-sm font-medium">
                      {tx.points_change > 0 ? "+" + tx.points_change : tx.points_change < 0 ? tx.points_change.toString() : "0"}
                    </td>
                    <td className="p-3 text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showRewardPanel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl relative">
              <h3 className="text-2xl font-bold text-brand-blue mb-6">
                {pointsBalance >= 10 ? "Choisissez votre récompense" : "Prochain palier"}
              </h3>

              {pointsBalance < 10 && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-yellow-200">
                  <p className="text-yellow-800 font-medium">
                    Vous avez {pointsBalance} point(s). Il vous manque {10 - pointsBalance} point(s) pour atteindre 10.
                  </p>
                  <p className="text-yellow-600 text-sm mt-1">
                    Chaque réservation vous donne +1 point
                  </p>
                </div>
              )}

              {pointsBalance >= 10 && (
                <div className="space-y-4">
                  {REWARDS.map(reward => (
                    <div key={reward.id} className={"p-4 rounded-lg border " + (reward.unlocked ? "border-green-500 bg-green-50 opacity-80" : "border-gray-300") + " cursor-pointer hover:border-brand-yellow transition-colors"}>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{reward.id === 1 ? "🎫" : reward.id === 2 ? "🎁" : reward.id === 3 ? "📱" : "🌐"}</span>
                        <div>
                          <h4 className="font-medium text-brand-blue">{reward.title}</h4>
                          <p className="text-sm text-gray-500">{reward.description}</p>
                        </div>
                      </div>
                      
                      {reward.unlocked && (
                        <p className="text-green-600 text-sm">
                          Déjà sélectionné - {10 - pointsBalance === 0 ? "points utilisés" : ""}
                        </p>
                      )}

                      {!reward.unlocked && pointsBalance >= 10 && (
                        <button
                          onClick={() => setSelectedReward(reward.id)}
                          className="mt-2 text-brand-blue text-sm hover:underline flex items-center space-x-1"
                        >
                          <span>✓</span>
                          <span>Sélectionner</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedReward && (
                <div className="mt-6 p-4 bg-brand-blue text-white rounded-lg">
                  <h4 className="font-medium mb-2">Confirmation</h4>
                  <p className="text-white/90 mb-4">
                    Vous allez dépenser 10 points pour : {REWARDS.find(r => r.id === selectedReward)?.title || "récompense"}
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        updateRewardStatus(selectedReward!);
                        setSelectedReward(null);
                        setShowRewardPanel(false);
                      }}
                      className="flex-1 bg-white text-brand-blue px-4 py-2 rounded-lg hover:bg-brand-blue-800"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReward(null);
                        setShowRewardPanel(false);
                      }}
                      className="flex-1 bg-white border border-brand-blue px-4 py-2 rounded-lg hover:bg-brand-blue-800"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowRewardPanel(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-brand-blue text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm opacity-80">
          BALLOU SERVICE EXPRESS - DABO TRANSPORT © 2024
        </div>
      </footer>
    </div>
  );
}