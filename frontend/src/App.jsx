import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './components/Auth/Login';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import TimerPage from './components/Timer/TimerPage';
import ZonasPage from './components/Zonas/ZonasPage';
import UsuariosPage from './components/Usuarios/UsuariosPage';
import SettingsPage from './components/Settings/SettingsPage';

const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          isAuthenticated ? (
            <MainLayout />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timers" element={<TimerPage />} />
        <Route path="/zonas" element={<ZonasPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default AppContent;