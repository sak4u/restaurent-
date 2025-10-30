import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codeUnique, setCodeUnique] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let res;

      if (role === 'admin') {
        res = await axios.post('http://localhost:3000/auth/login/admin', {
          email,
          password,
        });
      } else {
        res = await axios.post(`http://localhost:3000/auth/login/${role}`, {
          codeUnique,
        });
      }

      const { user } = res.data;

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
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20 bg-white p-8 shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Connexion</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Sélecteur de rôle */}
        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="serveur">Serveur</option>
          <option value="cuisinier">Cuisinier</option>
        </select>

        {/* Champs conditionnels */}
        {role === 'admin' ? (
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
        )}

        {error && <div className="text-red-500">{error}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
};

export default Login;
