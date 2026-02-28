import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import BillPreview from './components/BillPreview';
import BillList from './components/BillList';
import SaleAdminPanel from './components/SaleAdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const rawBase = import.meta.env.BASE_URL || '/';
  const basename = rawBase.endsWith('/') && rawBase.length > 1
    ? rawBase.slice(0, -1)
    : rawBase;
  const loginNextRaw = new URLSearchParams(window.location.search).get('next');
  const loginNext = loginNextRaw && loginNextRaw.startsWith('/') ? loginNextRaw : '/';
  const isAdminPath = loginNext === '/sale_admin' || loginNext === '/sale_amin' || loginNext === '/admin';
  const loginRedirect = user
    ? (isAdminPath && user.role !== 'admin' ? '/' : loginNext)
    : '/';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router basename={basename}>
      <div className="App">
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={loginRedirect} />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminPanel onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/sale_admin" element={user ? (user.role === 'admin' ? <SaleAdminPanel onLogout={handleLogout} user={user} /> : <Navigate to="/" />) : <Navigate to="/login?next=/sale_admin" />} />
          <Route path="/sale_amin" element={user ? (user.role === 'admin' ? <SaleAdminPanel onLogout={handleLogout} user={user} /> : <Navigate to="/" />) : <Navigate to="/login?next=/sale_amin" />} />
          <Route path="/bill/:orderId" element={user ? <BillPreview /> : <Navigate to="/login" />} />
          <Route path="/bills" element={user ? <BillList user={user} /> : <Navigate to="/login" />} />
          <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/sale_admin" /> : <Dashboard user={user} onLogout={handleLogout} />) : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
