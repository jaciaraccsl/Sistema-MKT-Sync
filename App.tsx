
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SocialMedia from './pages/SocialMedia';
import Traffic from './pages/Traffic';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Login />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Kanban />} />
        <Route path="social" element={<SocialMedia />} />
        <Route path="traffic" element={<Traffic />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
