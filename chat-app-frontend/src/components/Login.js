import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken, setUsername, setView }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        emailOrUsername,
        password,
      });
      setToken(res.data.token);
      setUsername(res.data.username);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{' '}
        <button
          onClick={() => setView('signup')}
          className="text-blue-600 hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

export default Login;
