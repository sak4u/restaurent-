import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Menu = () => {
  const [menus, setMenus] = useState([]);
  const [produits, setProduits] = useState([]);
  const [nomMenu, setNomMenu] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedProduitIds, setSelectedProduitIds] = useState([]);

  const [produitForm, setProduitForm] = useState({
    nom: '',
    prix: '',
    type: 'PLAT',
    photoUrl: '',
  });

  useEffect(() => {
    fetchMenus();
    fetchProduits();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await axios.get('http://localhost:3000/menus');
      setMenus(res.data);
    } catch (error) {
      console.error('Erreur récupération menus:', error);
    }
  };

  const fetchProduits = async () => {
    try {
      const res = await axios.get('http://localhost:3000/produits');
      setProduits(res.data);
    } catch (error) {
      console.error('Erreur récupération produits:', error);
    }
  };

  const handleCreateMenu = async () => {
    if (!nomMenu) return alert('Veuillez entrer un nom de menu');
    try {
      await axios.post('http://localhost:3000/menus', { nom: nomMenu });
      setNomMenu('');
      fetchMenus();
    } catch (error) {
      console.error('Erreur création menu:', error);
    }
  };

  const handleAddProduitsToMenu = async () => {
    if (!selectedMenuId || selectedProduitIds.length === 0)
      return alert('Sélectionnez un menu et au moins un produit');
    try {
      await axios.post(`http://localhost:3000/menus/${selectedMenuId}/produits`, {
        produitIds: selectedProduitIds.map(Number),
      });
      setSelectedProduitIds([]);
      setSelectedMenuId(null);
      fetchMenus();
    } catch (error) {
      console.error('Erreur ajout produits au menu:', error);
    }
  };

  const handleProduitChange = (e) => {
    const { name, value } = e.target;
    setProduitForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProduit = async () => {
    const { nom, prix, type } = produitForm;
    if (!nom || !prix || !type) return alert('Tous les champs sont requis');
    try {
      await axios.post('http://localhost:3000/produits', {
        ...produitForm,
        prix: Number(prix),
      });
      setProduitForm({ nom: '', prix: '', type: 'PLAT', photoUrl: '' });
      fetchProduits();
    } catch (error) {
      console.error('Erreur création produit:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gestion des Menus & Produits</h2>

      {/* Création d'un produit */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold mb-2">Créer un nouveau produit</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="nom"
            value={produitForm.nom}
            onChange={handleProduitChange}
            placeholder="Nom du produit"
            className="border px-2 py-1 rounded"
          />
          <input
            type="number"
            name="prix"
            value={produitForm.prix}
            onChange={handleProduitChange}
            placeholder="Prix"
            className="border px-2 py-1 rounded"
          />
          <select
            name="type"
            value={produitForm.type}
            onChange={handleProduitChange}
            className="border px-2 py-1 rounded"
          >
            <option value="PLAT">PLAT</option>
            <option value="FORMULE">FORMULE</option>
            <option value="EXTRA">EXTRA</option>
          </select>
          <input
            type="text"
            name="photoUrl"
            value={produitForm.photoUrl}
            onChange={handleProduitChange}
            placeholder="URL de la photo (optionnel)"
            className="border px-2 py-1 rounded"
          />
        </div>
        <button
          onClick={handleCreateProduit}
          className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
        >
          Créer Produit
        </button>
      </div>

      {/* Création d'un menu */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold mb-2">Créer un nouveau menu</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={nomMenu}
            onChange={(e) => setNomMenu(e.target.value)}
            placeholder="Nom du menu"
            className="border px-2 py-1 rounded w-full"
          />
          <button
            onClick={handleCreateMenu}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            Créer
          </button>
        </div>
      </div>

      {/* Ajouter produits à un menu */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold mb-2">Ajouter des produits à un menu</h3>
        <select
          className="w-full mb-2 border px-2 py-1 rounded"
          value={selectedMenuId || ''}
          onChange={(e) => setSelectedMenuId(e.target.value)}
        >
          <option value="">-- Sélectionner un menu --</option>
          {menus.map((menu) => (
            <option key={menu.id} value={menu.id}>
              {menu.nom}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border p-2 rounded">
          {produits.map((prod) => (
            <label key={prod.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={prod.id}
                checked={selectedProduitIds.includes(prod.id)}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedProduitIds((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                  );
                }}
              />
              {prod.nom} ({prod.type}) - {prod.prix} TND
            </label>
          ))}
        </div>
        <button
          onClick={handleAddProduitsToMenu}
          className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded"
        >
          Ajouter Produits
        </button>
      </div>

      {/* Liste des menus */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold mb-2">Menus existants</h3>
        {menus.map((menu) => (
          <div key={menu.id} className="border p-3 rounded mb-3 bg-gray-50">
            <p className="font-semibold">{menu.nom}</p>
            <ul className="list-disc pl-5 text-sm mt-1">
              {menu.produits.map((mp) => (
                <li key={mp.id}>
                  {mp.produit.nom} ({mp.produit.type}) - {mp.produit.prix} TND
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
