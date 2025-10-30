import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import AdminDashboard from './dashboard/DashboardAdmin'
import CuisinierDashboard from './dashboard/DashboardCuisinier'
import ServeurDashboard from './dashboard/DashboardServeur'
function App() {
   return (
     <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard-serveur/:id" element={<ServeurDashboard />} />
        <Route path="/dashboard-cuisinier/:id" element={<CuisinierDashboard />} />
      </Routes>
    </Router>
  )
}
export default App
