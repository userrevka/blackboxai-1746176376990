import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Chat from './components/Chat';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [view, setView] = useState(token ? 'chat' : 'login');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      setView('chat');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setView('login');
    }
  }, [token, username]);

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {view === 'login' && <Login setToken={setToken} setUsername={setUsername} setView={setView} />}
      {view === 'signup' && <Signup setView={setView} />}
      {view === 'chat' && <Chat token={token} username={username} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
