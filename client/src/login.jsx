import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codeUnique, setCodeUnique] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔄 Réinitialiser les champs
  const resetFields = () => {
    setEmail('');
    setPassword('');
    setCodeUnique('');
    setError('');
    setSuccess('');
  };

  // 🔐 Connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ✅ Validation côté client
    if (role === 'admin' && (!email || !password)) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if ((role === 'serveur' || role === 'cuisinier') && !codeUnique) {
      setError('Veuillez entrer votre code unique.');
      return;
    }

    setLoading(true);
    try {
      let res;

      // Simule un appel API (à remplacer par ton endpoint)
      if (role === 'admin') {
        res = await axios.post(`http://localhost:3000/auth/login/admin`, { email, password });
      } else {
        res = await axios.post(`http://localhost:3000/auth/login/${role}`, { codeUnique });
      }

      const user = res.data?.user;
      if (!user) throw new Error('Utilisateur introuvable.');

      // 💾 Sauvegarde dans localStorage
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', role);
      localStorage.setItem('nom', user.nom);

      // 🔀 Redirection selon le rôle
      switch (role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'serveur':
          navigate(`/dashboard-serveur/${user.id}`);
          break;
        case 'cuisinier':
          navigate(`/dashboard-cuisinier/${user.id}`);
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  // 📧 Récupération du code unique oublié
  const handleForgotCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Veuillez entrer votre email.');
      return;
    }

    setLoading(true);
    try {
      // Simule un appel API (à remplacer)
      await axios.post(`http://localhost:3000/${role}/forget-code/`, { email });
      setSuccess('Votre code unique a été envoyé à votre adresse email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l’envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20 bg-white p-8 shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {forgotMode ? 'Récupération du code unique' : 'Connexion'}
      </h2>

      <form
        onSubmit={forgotMode ? handleForgotCode : handleLogin}
        className="space-y-4"
      >
        {/* Sélecteur de rôle */}
        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            resetFields();
          }}
        >
          <option value="admin">Admin</option>
          <option value="serveur">Serveur</option>
          <option value="cuisinier">Cuisinier</option>
        </select>

        {/* Champs selon le mode */}
        {!forgotMode ? (
          role === 'admin' ? (
            <>
              <input
                type="email"
                className="w-full border p-2 rounded"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="Code Unique"
              value={codeUnique}
              onChange={(e) => setCodeUnique(e.target.value)}
              required
            />
          )
        ) : (
          <input
            type="email"
            className="w-full border p-2 rounded"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        {/* Messages */}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}

        {/* Bouton principal */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded text-white ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading
            ? 'Veuillez patienter...'
            : forgotMode
            ? 'Envoyer le code unique'
            : 'Se connecter'}
        </button>

        {/* Liens de bas de formulaire */}
        {!forgotMode && (role === 'serveur' || role === 'cuisinier') && (
          <p
            onClick={() => {
              resetFields();
              setForgotMode(true);
            }}
            className="text-blue-600 text-sm text-center cursor-pointer hover:underline"
          >
            Code oublié ?
          </p>
        )}

        {forgotMode && (
          <p
            onClick={() => {
              resetFields();
              setForgotMode(false);
            }}
            className="text-gray-500 text-sm text-center cursor-pointer hover:underline"
          >
            Retour à la connexion
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
