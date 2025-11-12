import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import notificationSound  from '../sounds/notification-aero-432436.mp3';


import { 
  Coffee, 
  ClipboardList, 
  Plus, 
  Trash2, 
  DollarSign, 
  CheckCircle,
  AlertTriangle,
  Search,
  Receipt,
  Menu as MenuIcon,
  Square,
  LogOut
} from 'lucide-react';
import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:3000';

const DashboardServeur = () => {
  const serveurId = localStorage.getItem("userId");
  console.log('Serveur ID:', serveurId);
  const navigate = useNavigate();
  
  // États principaux
  const [activeTab, setActiveTab] = useState('commandes');
  const [commandes, setCommandes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [carres, setCarres] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // États pour les modales
  const [showNewCommandeModal, setShowNewCommandeModal] = useState(false);
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [selectedCommandeForAdd, setSelectedCommandeForAdd] = useState(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');




  const playNotification = () => {
    const audio = new Audio(notificationSound);
    audio.play();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Charger les commandes
  const fetchCommandes = async () => {  
    try {
      const commandesResponse = await axios.get(`${API_BASE_URL}/commandes/serveur/${serveurId}`);
      setCommandes(commandesResponse.data);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    }
  };

  // Charger les données initiales
  const fetchData = async () => {
    try {
      setLoading(true);  
      const menusResponse = await axios.get(`${API_BASE_URL}/menus`);
      setMenus(menusResponse.data);
      
      const tablesResponse = await axios.get(`${API_BASE_URL}/carres/${serveurId}`);
      setTables(tablesResponse.data.tables);
      
      const carresResponse = await axios.get(`${API_BASE_URL}/carres/${serveurId}`);
      setCarres(carresResponse.data);
      
      // Charger aussi les commandes
      await fetchCommandes();
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const socket = io(API_BASE_URL, {
      query: { userId: serveurId },
    });
    console.log('Socket.IO connecté pour serveur ID:', serveurId);

    socket.on("notification", (notif) => {
      console.log('Nouvelle notification reçue:', notif);
      setNotifications((prev) => [notif, ...prev]);
      toast.info(notif);
      playNotification();
      fetchCommandes();
    });

    // Demander la permission pour les notifications navigateur
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => socket.disconnect();
  }, [serveurId]);

  // Calculer les statistiques
  const stats = {
    commandesEnCours: commandes.filter(c => !c.facture).length,
    commandesTerminees: commandes.filter(c => c.facture).length,
    chiffreAffaires: commandes.reduce((total, c) => {
      if (c.facture) return total + c.facture.montant;
      return total + c.plats.reduce((sum, p) => sum + (p.produit.prix * p.quantite), 0);
    }, 0),
    tablesActives: new Set(commandes.filter(c => !c.facture).map(c => c.table.numero)).size
  };

  // Filtrer les commandes
  const filteredCommandes = commandes.filter(commande => {
    const matchesSearch = commande.table.numero.toString().includes(searchTerm) ||
                         commande.table.carre.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'en-cours') return matchesSearch && !commande.facture;
    if (filterStatus === 'terminees') return matchesSearch && commande.facture;
    
    return matchesSearch;
  });

  // Créer une nouvelle commande
  const handleCreateCommande = async (tableId, plats) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/commandes`, {
        tableId,
        serveurId,
        plats: plats.map(plat => ({
          produitId: plat.id,
          quantite: plat.quantite
        }))
      });
      
      setCommandes([response.data, ...commandes]);
      setShowNewCommandeModal(false);
      toast.success('Commande créée avec succès!');
      return true;
    } catch (err) {
      console.error('Erreur lors de la création de la commande:', err);
      toast.error('Erreur lors de la création de la commande');
      return false;
    }
  };

  // Créer une facture
  const handleCreateFacture = async (commandeId, total) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/factures`, {
        commandeId,
        total
      });
      
      setCommandes(commandes.map(c => 
        c.id === commandeId ? { ...c, facture: response.data } : c
      ));
      
      setShowFactureModal(false);
      toast.success('Facture créée avec succès!');
      return true;
    } catch (err) {
      console.error('Erreur lors de la création de la facture:', err);
      toast.error('Erreur lors de la création de la facture');
      return false;
    }
  };

  // Ajouter un plat à une commande existante
  const addplatToCommande = async (commandeId, platId, quantite) => {
    try {
      const _id = Number(commandeId);
      const response = await axios.post(`${API_BASE_URL}/commandes/${_id}/plats`, [
        {
          produitId: platId,
          quantite: quantite
        }
      ]);

      setCommandes(commandes.map(c =>
        c.id === _id ? { ...c, plats: response.data.plats } : c
      ));

      return true;
    } catch (err) {
      console.error("Erreur lors de l'ajout du plat à la commande:", err);
      return false;
    }
  };

  // Modale pour nouvelle commande
  const NewCommandeModal = () => {
    const [selectedTable, setSelectedTable] = useState('');
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [selectedPlats, setSelectedPlats] = useState([]);
    const [quantities, setQuantities] = useState({});

    const handleAddPlat = (produit) => {
      if (!selectedPlats.find(p => p.id === produit.id)) {
        setSelectedPlats([...selectedPlats, produit]);
        setQuantities({ ...quantities, [produit.id]: 1 });
      }
    };

    const handleSubmit = async () => {
      if (!selectedTable || selectedPlats.length === 0) return;

      const success = await handleCreateCommande(
        parseInt(selectedTable),
        selectedPlats.map(produit => ({
          id: produit.id,
          quantite: quantities[produit.id] || 1
        }))
      );

      if (success) {
        setSelectedTable('');
        setSelectedMenu(null);
        setSelectedPlats([]);
        setQuantities({});
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Nouvelle Commande</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Table</label>
            <select 
              className="w-full border rounded-lg px-3 py-2"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              <option value="">Sélectionner une table</option>
              {carres.map(carre => (
                <optgroup key={carre.id} label={carre.nom}>
                  {carre.tables.map(table => (
                    <option key={table.id} value={table.id}>
                      Table {table.numero}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Menu</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {menus.map(menu => (
                <button
                  key={menu.id}
                  onClick={() => setSelectedMenu(menu.id === selectedMenu ? null : menu.id)}
                  className={`p-3 border rounded-lg text-center ${
                    selectedMenu === menu.id 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium">{menu.nom}</h4>
                </button>
              ))}
            </div>
          </div>

          {selectedMenu && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Produits du menu: {menus.find(m => m.id === selectedMenu)?.nom}
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {menus
                  .find(menu => menu.id === selectedMenu)
                  ?.produits.map(({ produit }) => (
                    <div key={produit.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{produit.nom} - {produit.prix}€</span>
                      <button
                        onClick={() => handleAddPlat(produit)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                        disabled={selectedPlats.find(p => p.id === produit.id)}
                      >
                        {selectedPlats.find(p => p.id === produit.id) ? 'Ajouté' : 'Ajouter'}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {selectedPlats.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Plats sélectionnés</label>
              {selectedPlats.map(produit => (
                <div key={produit.id} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                  <span>{produit.nom}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={quantities[produit.id] || 1}
                      onChange={(e) => setQuantities({
                        ...quantities,
                        [produit.id]: parseInt(e.target.value) || 1
                      })}
                      className="w-16 border rounded px-2 py-1"
                    />
                    <button
                      onClick={() => {
                        setSelectedPlats(selectedPlats.filter(p => p.id !== produit.id));
                        const newQuantities = { ...quantities };
                        delete newQuantities[produit.id];
                        setQuantities(newQuantities);
                      }}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowNewCommandeModal(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              disabled={!selectedTable || selectedPlats.length === 0}
            >
              Créer la commande
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modale pour créer une facture
  const FactureModal = () => {
    const total = selectedCommande?.plats.reduce((sum, plat) => 
      sum + (plat.produit.prix * plat.quantite), 0
    ) || 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Créer une facture</h3>
          
          <div className="mb-4">
            <p><strong>Table:</strong> {selectedCommande?.table.numero} - {selectedCommande?.table.carre.nom}</p>
            <p><strong>Date:</strong> {new Date(selectedCommande?.createdAt).toLocaleString()}</p>
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Détail des plats:</h4>
            {selectedCommande?.plats.map(plat => (
              <div key={plat.id} className="flex justify-between text-sm">
                <span>{plat.produit.nom} x{plat.quantite}</span>
                <span>{(plat.produit.prix * plat.quantite).toFixed(2)}TND</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>{total.toFixed(2)}TND</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowFactureModal(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={() => handleCreateFacture(selectedCommande.id, total)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Créer la facture
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modale pour ajouter des articles
  const AddArticleModal = () => {
    const [selectedPlats, setSelectedPlats] = useState([]);
    const [quantities, setQuantities] = useState({});

    const handleAddPlat = (produit) => {
      if (!selectedPlats.find(p => p.id === produit.id)) {
        setSelectedPlats([...selectedPlats, produit]);
        setQuantities({ ...quantities, [produit.id]: 1 });
      }
    };

    const handleSubmit = async () => {
      if (selectedPlats.length === 0) return;

      const success = await Promise.all(
        selectedPlats.map(produit => 
          addplatToCommande(
            selectedCommandeForAdd.id,
            produit.id,
            quantities[produit.id] || 1
          )
        )
      );

      if (success.every(Boolean)) {
        setSelectedPlats([]);
        setQuantities({});
        setShowAddArticleModal(false);
        toast.success('Articles ajoutés avec succès!');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Ajouter des articles à la commande</h3>
          
          <div className="mb-4">
            <p className="font-medium">Table: {selectedCommandeForAdd?.table.numero} - {selectedCommandeForAdd?.table.carre.nom}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Produits disponibles</label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {menus.flatMap(menu => menu.produits).map(({ produit }) => (
                <div key={produit.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{produit.nom} - {produit.prix}€</span>
                  <button
                    onClick={() => handleAddPlat(produit)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    disabled={selectedPlats.find(p => p.id === produit.id)}
                  >
                    {selectedPlats.find(p => p.id === produit.id) ? 'Ajouté' : 'Ajouter'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {selectedPlats.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Plats sélectionnés</label>
              {selectedPlats.map(produit => (
                <div key={produit.id} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                  <span>{produit.nom}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={quantities[produit.id] || 1}
                      onChange={(e) => setQuantities({
                        ...quantities,
                        [produit.id]: parseInt(e.target.value) || 1
                      })}
                      className="w-16 border rounded px-2 py-1"
                    />
                    <button
                      onClick={() => {
                        setSelectedPlats(selectedPlats.filter(p => p.id !== produit.id));
                        const newQuantities = { ...quantities };
                        delete newQuantities[produit.id];
                        setQuantities(newQuantities);
                      }}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowAddArticleModal(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              disabled={selectedPlats.length === 0}
            >
              Ajouter les articles
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <AlertTriangle className="h-12 w-12 mx-auto" />
          <p className="mt-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Coffee className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Serveur</h1>
            </div>
            <div className="text-sm text-gray-600">
              Serveur: {localStorage.getItem('nom') || 'Inconnu'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              <LogOut className="mr-2" size={18} /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commandes en cours</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.commandesEnCours}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commandes terminées</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.commandesTerminees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.chiffreAffaires.toFixed(2)}€</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Square className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tables actives</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.tablesActives}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'commandes', label: 'Commandes', icon: ClipboardList },
                { id: 'menus', label: 'Menus', icon: MenuIcon },
                { id: 'tables', label: 'Tables', icon: Square }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'commandes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher par table..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Toutes les commandes</option>
                      <option value="en-cours">En cours</option>
                      <option value="terminees">Terminées</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowNewCommandeModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600"
                  >
                    <Plus size={16} />
                    <span>Nouvelle commande</span>
                  </button>
                </div>

                <div className="grid gap-4">
                  {filteredCommandes.map(commande => {
                    const total = commande.plats.reduce((sum, plat) => 
                      sum + (plat.produit.prix * plat.quantite), 0
                    );
                    
                    return (
                      <div key={commande.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">
                              Table {commande.table.numero} - {commande.table.carre.nom}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(commande.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              commande.facture 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {commande.facture ? 'Facturée' : 'En cours'}
                            </span>
                            <span className="text-lg font-semibold">{total.toFixed(2)}€</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          {commande.plats.map(plat => (
                            <div key={plat.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center space-x-3">
                                <span>{plat.produit.nom} x{plat.quantite}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  plat.etatPreparation === 'PREPARE' 
                                    ? 'bg-green-100 text-green-700'
                                    : plat.etatPreparation === 'EN_PREPARATION'
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {plat.etatPreparation === 'PREPARE' ? 'Prêt' : 
                                   plat.etatPreparation === 'EN_PREPARATION' ? 'En préparation' : 'Commandé'}
                                </span>
                              </div>
                              <span>{(plat.produit.prix * plat.quantite).toFixed(2)}€</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end space-x-2">
                          {!commande.facture && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedCommandeForAdd(commande);
                                  setShowAddArticleModal(true);
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center space-x-1"
                              >
                                <Plus size={14} />
                                <span>Ajouter article</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCommande(commande);
                                  setShowFactureModal(true);
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center space-x-1"
                              >
                                <Receipt size={14} />
                                <span>Facturer</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'menus' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Menus disponibles</h2>
                <div className="grid gap-6">
                  {menus.map(menu => (
                    <div key={menu.id} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">{menu.nom}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {menu.produits?.map(({ produit }) => (
                          <div key={produit.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{produit.nom}</h4>
                                <p className="text-sm text-gray-600">{produit.categorie}</p>
                              </div>
                              <span className="text-lg font-semibold text-blue-600">
                                {produit.prix}€
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tables' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Organisation des tables</h2>
                <div className="grid gap-6">
                  {carres.map(carre => (
                    <div key={carre.id} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">{carre.nom}</h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {carre.tables.map(table => {
                          const isOccupied = commandes.some(c => 
                            c.table.numero === table.numero && !c.facture
                          );
                          return (
                            <div
                              key={table.id}
                              className={`p-4 rounded-lg text-center border-2 ${
                                isOccupied
                                  ? 'border-red-300 bg-red-50 text-red-700'
                                  : 'border-green-300 bg-green-50 text-green-700'
                              }`}
                            >
                              <Square className="w-6 h-6 mx-auto mb-2" />
                              <p className="font-medium">Table {table.numero}</p>
                              <p className="text-xs">
                                {isOccupied ? 'Occupée' : 'Libre'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewCommandeModal && <NewCommandeModal />}
      {showFactureModal && <FactureModal />}
      {showAddArticleModal && <AddArticleModal />}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default DashboardServeur;