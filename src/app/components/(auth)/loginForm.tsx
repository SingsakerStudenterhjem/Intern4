import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logIn } from '../../../server/dao/authentication';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';

const LoginForm = () => {
  const router = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    setError(null);
    setLoading(true);

    const result = await logIn(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
  };

  return (
  <form onSubmit={handleLogin}>
    {error && <div className="text-red-500 mb-4">{error}</div>}

      <div>
        <div className="mb-4">
          <label className="block mb-1">E-post</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="epost"
            className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1">Passord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            disabled={loading}
            placeholder="passord"
            className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? 'Laster...' : 'Logg inn'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
