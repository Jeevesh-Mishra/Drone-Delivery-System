import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import RouteOptimization from './pages/Route';
import DeliveryManagement from './pages/Delivery';
import Analytics from './pages/Analytics';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check login session on load
  useEffect(() => {
    const token = localStorage.getItem('drone_token');
    const userData = localStorage.getItem('drone_user');

    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (err) {
        // Corrupted session — clear it
        localStorage.removeItem('drone_token');
        localStorage.removeItem('drone_user');
      }
    }
    setCheckingSession(false);
  }, []);

  const handleLoginSuccess = (token: string, loggedUser: { name: string; email: string; role: string }) => {
    localStorage.setItem('drone_token', token);
    localStorage.setItem('drone_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('drone_token');
    localStorage.removeItem('drone_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" style={{ borderWidth: '3px' }}></div>
          <p className="text-sm text-gray-400 font-medium">Loading Drone Command Center...</p>
        </div>
      </div>
    );
  }

  // Render Auth screen if not logged in
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render Dashboard Layout wrapper if logged in
  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard user={user} onNavigate={setActiveTab} />
      )}
      
      {activeTab === 'fleet' && (
        <Fleet />
      )}
      
      {activeTab === 'route' && (
        <RouteOptimization />
      )}

      {activeTab === 'delivery' && (
        <DeliveryManagement />
      )}

      {activeTab === 'analytics' && (
        <Analytics />
      )}
    </Layout>
  );
};

export default App;
