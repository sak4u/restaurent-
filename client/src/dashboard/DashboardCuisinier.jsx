import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Assure-toi que react-router-dom est installé

const CuisinierDashboard = () => {
  const [commandes, setCommandes] = useState([]);
  const [loadingPlatId, setLoadingPlatId] = useState(null);
  const navigate = useNavigate(); // hook pour redirection

  // Charger les commandes avec plats
  const fetchCommandes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/commandes');
      setCommandes(res.data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Action: commencer la préparation d’un plat
  const handleStartPreparation = async (commandeId, platId) => {
    try {
      setLoadingPlatId(platId);
      await axios.patch(`http://localhost:3000/commandes/${commandeId}/plats/${platId}/preparation`, {
        etatPreparation: 'PREPARE'
      });
      await fetchCommandes();
    } catch (err) {
      console.error('Erreur mise à jour plat:', err);
    } finally {
      setLoadingPlatId(null);
    }
  };

  // Trier par date/heure de création
  const commandesFiltrees = commandes
    .map(cmd => ({
      ...cmd,
      plats: cmd.plats.filter(p => p.etatPreparation === 'COMMANDE')
    }))
    .filter(cmd => cmd.plats.length > 0)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Commandes à Préparer</h1>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            <LogOut className="mr-2" size={18} /> Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commandesFiltrees.map((commande) => (
            <div key={commande.id} className="bg-white border-l-4 border-orange-500 p-4 rounded-lg shadow">
              <div className="flex justify-between mb-2">
                <h4 className="font-semibold">Table {commande.table.numero}</h4>
                <span className="text-sm text-gray-500">
                  {new Date(commande.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="space-y-3">
                {commande.plats.map((plat) => (
                  <div key={plat.id} className="p-3 bg-orange-50 rounded shadow-sm">
                    <p className="font-medium">{plat.produit.nom}</p>
                    <button
                      onClick={() => handleStartPreparation(commande.id, plat.id)}
                      disabled={loadingPlatId === plat.id}
                      className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-1 rounded disabled:opacity-50"
                    >
                      {loadingPlatId === plat.id ? '...' : 'Preparer'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {commandesFiltrees.length === 0 && (
          <div className="text-center text-gray-500 text-lg mt-10">
            🎉 Aucune commande en attente !
          </div>
        )}
      </div>
    </div>
  );
};

export default CuisinierDashboard;
