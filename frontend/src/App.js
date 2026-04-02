import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import VillagerDash   from './pages/VillagerDashboard';
import AshaDash       from './pages/AshaWorkerDashboard';
import SymptomChecker from './pages/SymptomChecker';
import HealthRecords  from './pages/HealthRecords';
import EmergencyPage  from './pages/EmergencyPage';
import HospitalFinder from './pages/HospitalFinder';
import SchemesPage    from './pages/SchemesPage';
import ChatbotPage    from './pages/ChatbotPage';
import ReportsPage    from './pages/ReportsPage';
import AshaRegister   from './pages/AshaRegisterVillager';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-bg" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div className="spinner" style={{width:48,height:48}}/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'asha_worker' ? '/asha' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Nunito, sans-serif', fontWeight: 600 } }} />
        <Routes>
          <Route path="/"         element={<RootRedirect />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Villager routes */}
          <Route path="/dashboard"    element={<PrivateRoute><VillagerDash /></PrivateRoute>} />
          <Route path="/symptoms"     element={<PrivateRoute><SymptomChecker /></PrivateRoute>} />
          <Route path="/health-records" element={<PrivateRoute><HealthRecords /></PrivateRoute>} />
          <Route path="/emergency"    element={<PrivateRoute><EmergencyPage /></PrivateRoute>} />
          <Route path="/hospitals"    element={<PrivateRoute><HospitalFinder /></PrivateRoute>} />
          <Route path="/schemes"      element={<PrivateRoute><SchemesPage /></PrivateRoute>} />
          <Route path="/chatbot"      element={<PrivateRoute><ChatbotPage /></PrivateRoute>} />
          <Route path="/reports"      element={<PrivateRoute><ReportsPage /></PrivateRoute>} />

          {/* ASHA worker routes */}
          <Route path="/asha"                element={<PrivateRoute role="asha_worker"><AshaDash /></PrivateRoute>} />
          <Route path="/asha/register"       element={<PrivateRoute role="asha_worker"><AshaRegister /></PrivateRoute>} />
          <Route path="/asha/health-records" element={<PrivateRoute role="asha_worker"><HealthRecords /></PrivateRoute>} />
          <Route path="/asha/emergency"      element={<PrivateRoute role="asha_worker"><EmergencyPage /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
