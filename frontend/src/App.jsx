import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

function App() {
  const [user, setUser] = useState(null);

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
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminPanel onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard user={user} onLogout={handleLogout} />) : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
