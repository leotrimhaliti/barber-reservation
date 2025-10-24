import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { LogIn, User, Lock, Loader2 } from 'lucide-react';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Gabim në Kyçje:', error.message);
      setMessage(`Gabim në kyçje: ${error.message}. Kontrolloni të dhënat.`);
    } else {
      setMessage('Kyçja u bë me sukses! Duke u ridrejtuar...');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-6">
          <LogIn className="w-8 h-8 text-gray-800 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Kyçu si Administrator</h2>
          <p className="text-sm text-gray-500">Për të menaxhuar rezervimet</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@pronari.com"
                required
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-gray-800 focus:border-gray-800 transition"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Fjalëkalimi
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Fjalëkalimi"
                required
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-gray-800 focus:border-gray-800 transition"
                disabled={loading}
              />
            </div>
          </div>

          {message && (
            <p className={`text-sm p-3 rounded-lg ${
                message.includes('Gabim') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
            {loading ? 'Duke Kyçur...' : 'Kyçu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;