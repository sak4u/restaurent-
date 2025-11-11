import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from "socket.io-client";
import { Clock, LogOut, Bell, History, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CuisinierDashboard = () => {
  const [commandes, setCommandes] = useState([]);
  const [loadingPlatId, setLoadingPlatId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const cuisinierId = localStorage.getItem("userId");

  const itemsPerPage = 10;

  // 🔹 Charger les commandes
  const fetchCommandes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/commandes');
      setCommandes(res.data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  // 🔹 Charger notifications sauvegardées au montage
  useEffect(() => {
    const savedNotifs = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(savedNotifs);
  }, []);

  // 🔹 Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // 🔹 Initialiser Socket.IO
  useEffect(() => {
    fetchCommandes();
    if (!cuisinierId) return;

    const socket = io('http://localhost:3000', {
      query: { userId: cuisinierId },
    });

    console.log('✅ Socket connecté pour le cuisinier ID:', cuisinierId);

    socket.on('notification', (notif) => {
      console.log('📩 Nouvelle notification:', notif);
      const newNotif = {
        message: notif.message,
        plats: notif.plats,
        date: notif.date || new Date().toISOString(),
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev].slice(0, 10);
        return updated;
      });

      toast.info(`${notif.message}${notif.plats ? ` (${notif.plats})` : ''}`);
      fetchCommandes();
    });

    socket.on('commandeUpdate', fetchCommandes);

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => socket.disconnect();
  }, [cuisinierId]);

  // 🔹 Fermer le menu des notifications quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('notifications');
    navigate('/');
  };

  // 🔹 Marquer un plat comme préparé
  const handleStartPreparation = async (commandeId, platId) => {
    try {
      setLoadingPlatId(platId);
      await axios.patch(`http://localhost:3000/commandes/${commandeId}/plats/${platId}/preparation`, {
        etatPreparation: 'PREPARE'
      });
      await fetchCommandes();
    } catch (err) {
      console.error('Erreur mise à jour plat:', err);
      alert('Erreur lors de la mise à jour du plat');
    } finally {
      setLoadingPlatId(null);
    }
  };
   const handleClick = () => {
    const cleared = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(cleared);
    setShowNotifMenu(prev => !prev);
  };
  // Nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 🔹 Filtrer les commandes à préparer
  const commandesFiltrees = commandes
    .map(cmd => ({
      ...cmd,
      plats: cmd.plats.filter(p => p.etatPreparation === 'COMMANDE')
    }))
    .filter(cmd => cmd.plats.length > 0)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // 🔹 Filtrer les commandes préparées (historique)
  const commandesPreparees = commandes
    .map(cmd => ({
      ...cmd,
      plats: cmd.plats.filter(p => p.etatPreparation === 'PREPARE')
    }))
    .filter(cmd => cmd.plats.length > 0)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // 🔹 Pagination
  const totalPages = Math.ceil(commandesPreparees.length / itemsPerPage);
  const currentItems = commandesPreparees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ✅ Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commandes à Préparer</h1>
            <p className="text-sm text-gray-500 mt-1">
              {commandesFiltrees.length} commande(s) en attente
            </p>
          </div>

          <div className="flex items-center gap-4 relative" ref={notifRef}>
            {/* 🔔 Icône Notifications */}
            <button
              className="relative"
              onClick={handleClick}
            >
              <Bell className="text-orange-500" size={26} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* ✅ Liste des notifications */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-10 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                <div className="p-3 border-b bg-orange-50 font-semibold text-gray-700">
                  Notifications
                </div>

                {notifications.length === 0 ? (
        <p className="text-sm text-gray-500 p-3 text-center">
          Aucune notification reçue
        </p>
      ) : (
        <ul className="max-h-64 overflow-y-auto">
          {notifications.map((notif, index) => (
            <li
              key={index}
              className={`px-3 py-2 text-sm border-b border-gray-100 ${
                notif.isRead ? "bg-gray-50" : "bg-orange-50"
              } hover:bg-gray-100`}
            >
              <p className="text-gray-800">{notif.message}</p>
              {notif.plats && (
                <p className="text-xs text-gray-600 mt-1">
                  Plat(s) concerné(s) : {notif.plats}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notif.date).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
              </div>
            )}

            {/* 🕓 Icône Historique (ouvre modale) */}
            <button
              className="relative"
              onClick={() => setShowHistoryModal(true)}
            >
              <History className="text-gray-600 hover:text-orange-500" size={26} />
            </button>

            {/* 🚪 Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              <LogOut className="mr-2" size={18} /> Déconnexion
            </button>
          </div>
        </div>

        {/* 🍽️ Cartes de commandes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commandesFiltrees.map((commande) => (
            <div 
              key={commande.id} 
              className="bg-white border-l-4 border-orange-500 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">Table {commande.table.numero}</h4>
                  <p className="text-xs text-gray-500">Carré: {commande.table.carre?.nom || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={14} className="mr-1" />
                    {new Date(commande.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Serveur: {commande.serveur?.nom || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {commande.plats.map((plat) => (
                  <div 
                    key={plat.id} 
                    className="p-3 bg-orange-50 rounded-lg shadow-sm border border-orange-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-800">{plat.produit.nom}</p>
                      <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded">
                        x{plat.quantite}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleStartPreparation(commande.id, plat.id)}
                      disabled={loadingPlatId === plat.id}
                      className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {loadingPlatId === plat.id ? 'Chargement...' : '✓ Marquer comme Préparé'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 🎉 Aucune commande */}
        {commandesFiltrees.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-500 text-xl">Aucune commande en attente !</p>
            <p className="text-gray-400 text-sm mt-2">Les nouvelles commandes apparaîtront automatiquement</p>
          </div>
        )}
      </div>

      {/* 🧾 Modale d’historique */}
      {showHistoryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-[80%] md:w-[60%] lg:w-[50%] rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setShowHistoryModal(false)}
            >
              <X size={22} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Historique des plats préparés</h2>

            {currentItems.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Aucun plat préparé</p>
            ) : (
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full border border-gray-200 text-sm">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="p-2 border">Table</th>
                      <th className="p-2 border">Plat</th>
                      <th className="p-2 border">Quantité</th>
                      <th className="p-2 border">Heure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((cmd) =>
                      cmd.plats.map((plat, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-2 border text-center">{cmd.table?.numero}</td>
                          <td className="p-2 border">{plat.produit.nom}</td>
                          <td className="p-2 border text-center">{plat.quantite}</td>
                          <td className="p-2 border text-center">
                             {new Date(cmd.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}

                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 🔁 Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CuisinierDashboard;
