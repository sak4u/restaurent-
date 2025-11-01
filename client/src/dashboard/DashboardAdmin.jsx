import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  ChefHat,
  ShoppingCart,
  DollarSign,
  Menu as MenuIcon,
  LogOut,
  Edit,
  Trash  
} from 'lucide-react';
import Menu from '../component/menu'; // ton composant Menu importé

const AdminDashboard = () => {
  const [serveurs, setServeurs] = useState([]);
  const [carres, setCarres] = useState([]);
  const [cuisiniers, setCuisiniers] = useState([]); // état cuisiniers ajouté
  const [commandes, setCommandes] = useState([]);
  const [stats, setStats] = useState({ totalCommandes: 0, chiffreAffaires: 0 });
  const navigate =  useNavigate ();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const [showMenuModal, setShowMenuModal] = useState(false);

  const [activeTable, setActiveTable] = useState('');

  useEffect(() => {
    fetchServeurs();
    fetchCarres();
    fetchCommandes();
    fetchCuisiniers(); // appel de la récupération des cuisiniers
  }, []);

const handelLogout = ()=>{
  localStorage.removeItem('token');
  navigate('/');
}
// Ajoute ces fonctions dans ton composant :
const editServeur = async (id, updatedData) => {
  try {
    const _id= Number(id);
    if (!_id) {
      console.error('ID invalide pour le serveur:', id);
      return;
    }
    const res = await axios.put(`http://localhost:3000/serveur/${_id}`, updatedData);
    setServeurs((prev) =>
      prev.map((s) => (s.id === id ? res.data : s))
    );
  } catch (error) {
    console.error(error);
  }
};
 const deleteServeur = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce serveur ?')) {
      try {
        await axios.delete(`http://localhost:3000/serveur/${id}`);
        setServeurs((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du serveur:', error);
      }
    }
  };

const editCarre = async (id, updatedData) => {
  try {
    const _id = Number(id);
    if (!_id) {
      console.error('ID invalide pour le carré:', id);
      return;
    }
    const res = await axios.put(`http://localhost:3000/carres/${_id}`, updatedData);
    setCarres((prev) =>
      prev.map((c) => (c.id === id ? res.data : c))
    );
  } catch (error) {
    console.error(error);
  }
};

const editCuisinier = async (id, updatedData) => {
  try {
    const _id = Number(id);
    if (!_id) {
       console.error('ID invalide pour le cuisinier:', id);
      return;
    }
    const res = await axios.put(`http://localhost:3000/cuisinier/${_id}`, updatedData);
    setCuisiniers((prev) =>
      prev.map((c) => (c.id === id ? res.data : c))
    );
  } catch (error) {
    console.error(error);
  }
};
  const deleteCuisinier = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce cuisinier ?')) {
      try {
        await axios.delete(`http://localhost:3000/cuisinier/${id}`);
        setCuisiniers((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression du cuisinier:', error);
      }
    }
  };

const fetchServeurs = async () => {
  try {
    const serveursRes = await axios.get('http://localhost:3000/serveur');
    
    // Pour chaque serveur, récupérer ses commandes et calculer le CA
    const serveursWithStats = await Promise.all(serveursRes.data.map(async (serveur) => {
      try {
        const commandesRes = await axios.get(`http://localhost:3000/commandes/serveur/${serveur.id}`);
        const chiffreAffaires = commandesRes.data.reduce((total, commande) => {
          // Ajouter le montant de la facture si elle existe
          return total + (commande.facture?.montant || 0);
        }, 0);
        
        return {
          ...serveur,
          chiffreAffaires
        };
      } catch (error) {
        console.error(`Erreur lors du calcul du CA pour le serveur ${serveur.id}:`, error);
        return {
          ...serveur,
          chiffreAffaires: 0
        };
      }
    }));
    
    setServeurs(serveursWithStats);
  } catch (error) {
    console.error('Erreur lors de la récupération des serveurs:', error);
  }
};

  const fetchCuisiniers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/cuisinier');
      setCuisiniers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCarres = async () => {
    try {
      const res = await axios.get('http://localhost:3000/carres');
      setCarres(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCommandes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/commandes');
      setCommandes(res.data);
      setStats({
        totalCommandes: res.data.length,
        chiffreAffaires: res.data.reduce((sum, c) => sum + (c.facture?.montant || 0), 0),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createServeur = async () => {
    if (!formData.nom || !formData.email) {
      alert('Veuillez remplir tous les champs du serveur');
      return;
    }
    try {
      const res = await axios.post('http://localhost:3000/serveur', formData);
      setServeurs((prev) => [...prev, res.data]);
      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error(error);
    }
  };

  const createCuisinier = async () => {
    if (!formData.nom || !formData.email) {
      alert('Veuillez remplir tous les champs du cuisinier');
      return;
    }
    try {
      const res = await axios.post('http://localhost:3000/cuisinier', formData);
      setCuisiniers((prev) => [...prev, res.data]); // ajout dans la bonne liste
      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error(error);
    }
  };

  const createCarre = async () => {
    if (!formData.nom || !formData.serveurId || !formData.count) {
      alert('Veuillez remplir tous les champs du carré');
      return;
    }
    try {
      const res = await axios.post('http://localhost:3000/carres', {
        nom: formData.nom,
        serveurId: Number(formData.serveurId),
        count: Number(formData.count),
      });
      setCarres((prev) => [...prev, res.data]);
      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error(error);
    }
  };

const handleSubmit = (e) => {
  e.preventDefault();

  if (modalType === 'serveur') {
    if (formData.id) editServeur(formData.id, formData);
    else createServeur();
  } else if (modalType === 'carre') {
    if (formData.id) editCarre(formData.id, formData);
    else createCarre();
  } else if (modalType === 'cuisinier') {
    if (formData.id) editCuisinier(formData.id, formData);
    else createCuisinier();
  }

  setShowModal(false);
  setFormData({});
};

  const modalContent = {
    serveur: {
      title: 'Ajouter un Serveur',
      fields: [
        { label: 'Nom', name: 'nom', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
      ],
    },
    cuisinier: {
      title: 'Ajouter un Cuisinier',
      fields: [
        { label: 'Nom', name: 'nom', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
      ],
    },
    carre: {
      title: 'Créer un Carré',
      fields: [
        { label: 'Nom', name: 'nom', type: 'text' },
        {
          label: 'Serveur Assigné',
          name: 'serveurId',
          type: 'select',
          options: serveurs.map((s) => ({ value: s.id, label: s.nom })),
        },
        { label: 'Nombre de Tables', name: 'count', type: 'number' },
      ],
    },
  };

  const currentModal = modalContent[modalType];

  const renderTable = () => {
   if (activeTable === 'serveur') {
  return (
    <div className="bg-white p-4 rounded shadow overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Liste des Serveurs</h2>
      <table className="w-full text-left text-sm">
        <thead className="border-b">
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th className="text-right">Chiffre d'Affaires</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {serveurs.map((s) => (
            <tr key={s.id} className="border-b hover:bg-gray-50">
              <td>{s.id}</td>
              <td>{s.nom}</td>
              <td>{s.email}</td>
              <td>{s.codeUnique}</td>
              <td className="text-right font-medium">
                {s.chiffreAffaires?.toFixed(2) || '0.00'} TND
              </td>
              <td>
                <button
                  onClick={() => {
                    setModalType('serveur');
                    setFormData(s);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit size={16} />
                </button>
                 <button
                      onClick={() => deleteServeur(s.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash   size={16} />
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  }
    if (activeTable === 'carre') {
      return (
        <div className="bg-white p-4 rounded shadow overflow-auto">
          <h2 className="text-lg font-semibold mb-4">Liste des Carrés</h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b">
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Serveur</th>
                <th>Nombre de Tables</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {carres.map((c) => {
                const serveur = serveurs.find((s) => s.id === c.serveurId);
                return (
                  <tr key={c.id} className="border-b">
                    <td>{c.id}</td>
                    <td>{c.nom}</td>
                    <td>{serveur ? serveur.nom : 'Non trouvé'}</td>
                    <td>{c.tables?.length || 0}</td>
                    <td>
                      <button
                        onClick={() => {
                          setModalType('carre');
                          setFormData(c);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    if (activeTable === 'cuisinier') {
      return (
        <div className="bg-white p-4 rounded shadow overflow-auto">
          <h2 className="text-lg font-semibold mb-4">Liste des Cuisiniers</h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b">
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cuisiniers.map((c) => (
                <tr key={c.id} className="border-b">
                  <td>{c.id}</td>
                  <td>{c.nom}</td>
                  <td>{c.email}</td>
                  <td> {c.codeUnique}</td>
                  <td>
                    <button
                      onClick={() => {
                        setModalType('cuisinier');
                        setFormData(c);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                     <Edit size={16} />
                    </button>
                     <button
                      onClick={() => deleteCuisinier(c.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash   size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (activeTable === 'commande') {
      return (
        <div className="bg-white p-4 rounded shadow overflow-auto max-h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Liste des Commandes</h2>
          <table className="w-full text-left text-sm">
            <thead className="border-b">
              <tr>
                <th>#ID</th>
                <th>Serveur</th>
                <th>Table</th>
                <th>Plats</th>
                <th>Montant</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((cmd) => (
                <tr key={cmd.id} className="border-b hover:bg-gray-100">
                  <td>{cmd.id}</td>
                  <td>{cmd.serveur?.nom}</td>
                  <td>{cmd.table ? `Table ${cmd.table.numero}` : ''}</td>
                  <td>{cmd.plats.map((p) => `${p.produit.nom} x${p.quantite}`).join(', ')}</td>
                  <td>{cmd.facture?.montant || 0} TND</td>
                  <td>{new Date(cmd.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ChefHat className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setModalType('serveur');
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Ajouter Serveur
          </button>
          <button
            onClick={() => {
              setModalType('cuisinier');
              setShowModal(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Ajouter Cuisinier
          </button>
          <button
            onClick={() => {
              setModalType('carre');
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Ajouter Carré
          </button>
          <button
            onClick={() => setShowMenuModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Gérer Menu
          </button>
          <button
            onClick={handelLogout}
            className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2"
            title="Déconnexion"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4">
        <div
          className="bg-white p-4 rounded shadow cursor-pointer"
          onClick={() => setActiveTable('serveur')}
        >
          <Users className="text-blue-600 mb-2" size={24} />
          <p>Total Serveurs: {serveurs.length}</p>
        </div>
        <div
          className="bg-white p-4 rounded shadow cursor-pointer"
          onClick={() => setActiveTable('carre')}
        >
          <MenuIcon className="text-green-600 mb-2" size={24} />
          <p>Total Carrés: {carres.length}</p>
        </div>
        <div
          className="bg-white p-4 rounded shadow cursor-pointer"
          onClick={() => setActiveTable('cuisinier')}
        >
          <ChefHat className="text-red-600 mb-2" size={24} />
          <p>Total Cuisiniers: {cuisiniers.length}</p>
        </div>
        <div
          className="bg-white p-4 rounded shadow cursor-pointer"
          onClick={() => setActiveTable('commande')}
        >
          <ShoppingCart className="text-yellow-600 mb-2" size={24} />
          <p>Commandes: {stats.totalCommandes}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <DollarSign className="text-red-600 mb-2" size={24} />
          <p>CA: {stats.chiffreAffaires} TND</p>
        </div>
      </div>

      {renderTable()}

      {/* Modal Serveur, Carré, Cuisinier */}
      {showModal && currentModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl mb-4">{currentModal.title}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {currentModal.fields.map((field) => (
                <div key={field.name}>
                  <label className="block mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded"
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded"
                      required
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({});
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gestion Menu */}
      {showMenuModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowMenuModal(false)}
        >
          <div
            className="bg-white p-6 rounded w-[600px] max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Menu />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
