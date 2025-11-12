import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logIn } from '../../../server/dao/authentication';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import { supabase } from '../../../server/supabaseClient';

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

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) { setError('Ugyldig e-post eller passord'); setLoading(false); return; }
    router('/dashboard');
    setLoading(false);
  };

  return (
    <div>
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
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? 'Laster...' : 'Logg inn'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
