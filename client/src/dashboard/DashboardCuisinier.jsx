import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from "socket.io-client";
import { Clock, LogOut, Bell, History, X, ChefHat } from 'lucide-react';
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

  // Charger les commandes
  const fetchCommandes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/commandes');
      setCommandes(res.data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  // Charger les notifications depuis localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(saved);
  }, []);

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Initialiser socket
  useEffect(() => {
    fetchCommandes();
    if (!cuisinierId) return;

    const socket = io("http://localhost:3000", { query: { userId: cuisinierId } });

    console.log("👨‍🍳 Socket connecté (Cuisinier)", cuisinierId);

    socket.on("notification", (notif) => {
      toast(`🍽️ ${notif}`);
      console.log("🔔 Notification reçue:", notif);
      if (notif.type === "new_commande" && notif.message && notif.message.trim()) {
        const newNotif = {
          id: Date.now(),
          message: notif.message,
          plats: notif.plats || "",
          date: notif.date || new Date().toISOString(),
          isRead: false,
        };
        setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
        toast.info(`🍽️ ${notif}`);
        fetchCommandes();
      }else {
      console.warn("🔇 Notification ignorée (contenu vide) :", notif);
    }
    });

    socket.on("commandeUpdate", fetchCommandes);

    if (Notification.permission === "default") Notification.requestPermission();

    return () => socket.disconnect();
  }, [cuisinierId]);

  // Fermer menu notif quand clic dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleStartPreparation = async (commandeId, platId) => {
    try {
      setLoadingPlatId(platId);
      await axios.patch(`http://localhost:3000/commandes/${commandeId}/plats/${platId}/preparation`, {
        etatPreparation: "PREPARE",
      });
      await fetchCommandes();
    } catch (err) {
      console.error("Erreur mise à jour plat:", err);
      toast.error("Erreur lors de la mise à jour du plat !");
    } finally {
      setLoadingPlatId(null);
    }
  };

  const handleClickNotif = () => {
    const cleared = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(cleared);
    setShowNotifMenu(prev => !prev);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Commandes à préparer
  const commandesFiltrees = commandes
    .map(cmd => ({ ...cmd, plats: cmd.plats.filter(p => p.etatPreparation === "COMMANDE") }))
    .filter(cmd => cmd.plats.length > 0);

  // Historique plats préparés
  const commandesPreparees = commandes
    .map(cmd => ({ ...cmd, plats: cmd.plats.filter(p => p.etatPreparation === "PREPARE") }))
    .filter(cmd => cmd.plats.length > 0);

  const totalPages = Math.ceil(commandesPreparees.length / itemsPerPage);
  const currentItems = commandesPreparees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ToastContainer position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ChefHat className="text-orange-500" /> Tableau du Cuisinier
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {commandesFiltrees.length} commande(s) en attente
            </p>
          </div>

          <div className="flex items-center gap-4 relative" ref={notifRef}>
            {/* 🔔 Notifications */}
            <button className="relative" onClick={handleClickNotif}>
              <Bell className="text-orange-500" size={26} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

           {/* MENU Notifications */}
{showNotifMenu && (
  <div className="absolute top-10 right-0 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50">
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 text-white font-semibold text-lg">
      Notifications Récentes
    </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm text-center p-4">Aucune notification reçue</p>
      ) : (
        <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {notifications
            .filter((n) => n.message && n.message.trim() !== "")
            .map((n, i) => (
              <li
                key={i}
                className={`p-3 text-sm hover:bg-orange-50 transition ${
                  n.isRead ? "bg-white" : "bg-orange-50"
                }`}
              >
                <p className="font-medium text-gray-800">{n.message}</p>
                {n.plats && (
                  <p className="text-xs text-gray-600 mt-1">
                    Plat(s) : {n.plats}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1 italic">
                  {new Date(n.date).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
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



            {/* 🕓 Historique */}
            <button onClick={() => setShowHistoryModal(true)}>
              <History className="text-gray-600 hover:text-orange-500" size={26} />
            </button>

            {/* 🚪 Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition"
            >
              <LogOut className="mr-2" size={18} /> Déconnexion
            </button>
          </div>
        </div>

        {/* Commandes à préparer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commandesFiltrees.map((commande) => (
            <div
              key={commande.id}
              className="bg-white border-l-4 border-orange-500 p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">Table {commande.table?.numero}</h4>
                  <p className="text-xs text-gray-500">Serveur : {commande.serveur?.nom || "N/A"}</p>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock size={14} className="mr-1" />
                  {new Date(commande.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {commande.plats.map((plat) => (
                <div key={plat.id} className="bg-orange-50 p-3 rounded-lg border border-orange-200 mb-2">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-800">{plat.produit.nom}</p>
                    <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded">
                      x{plat.quantite}
                    </span>
                  </div>
                  <button
                    onClick={() => handleStartPreparation(commande.id, plat.id)}
                    disabled={loadingPlatId === plat.id}
                    className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {loadingPlatId === plat.id ? "Chargement..." : "✓ Marquer comme Préparé"}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Aucun plat */}
        {commandesFiltrees.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-600 text-xl">Aucune commande en attente</p>
            <p className="text-gray-400 text-sm mt-2">Les nouvelles commandes apparaîtront automatiquement</p>
          </div>
        )}
      </div>

      {/* 🧾 MODALE Historique */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] md:w-[70%] lg:w-[50%] rounded-2xl p-6 shadow-xl relative">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X size={22} />
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-orange-600 flex items-center gap-2">
              <History /> Historique des plats préparés
            </h2>

            {currentItems.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Aucun plat préparé récemment</p>
            ) : (
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full border border-gray-200 text-sm rounded-xl overflow-hidden">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="p-2 border">Serveur</th>
                      <th className="p-2 border">Table</th>
                      <th className="p-2 border">Plat</th>
                      <th className="p-2 border">Quantité</th>
                      <th className="p-2 border">Heure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((cmd) =>
                      cmd.plats.map((plat, i) => (
                        <tr key={i} className="hover:bg-gray-50 text-center">
                          <td className="border p-2">{cmd.serveur?.nom || "N/A"}</td>
                          <td className="border p-2">{cmd.table?.numero}</td>
                          <td className="border p-2">{plat.produit.nom}</td>
                          <td className="border p-2">{plat.quantite}</td>
                          <td className="border p-2">
                            {new Date(cmd.createdAt).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
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
