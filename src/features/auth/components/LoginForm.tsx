import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { logIn } from '../../../server/dao/authentication';
import { useAuth } from '../../../app/providers/AuthContext';
import { useEffect } from 'react';
import { ROUTES } from '../../../app/constants/routes';

const LoginForm = () => {
  const router = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

        <div className="mb-2">
          <label className="block mb-1">Passord</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              disabled={loading}
              placeholder="passord"
              className="w-full border border-gray-300 rounded px-3 py-2 pr-10 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="mb-6 text-right">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-blue-600 hover:underline">
            Glemt passord?
          </Link>
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
