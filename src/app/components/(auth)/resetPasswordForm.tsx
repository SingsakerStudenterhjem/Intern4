import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../server/supabaseClient';
import { resetPassword } from '../../../server/dao/authentication';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../../contexts/authContext';

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const handleTokenExchange = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError('Kunne ikke verifisere lenken: ' + error.message);
        }
        setExchanging(false);
        return;
      }

      const hash = window.location.hash;
      if (hash && hash.includes('type=recovery')) {
        setExchanging(false);
        return;
      }

      setExchanging(false);
    };

    handleTokenExchange();
  }, []);

  const sessionReady = !authLoading && !!user;
  const stillLoading = exchanging || authLoading;

  if (stillLoading) {
    return <p className="text-gray-600">Verifiserer lenke...</p>;
  }

  if (!sessionReady) {
    return (
      <div>
        <p className="text-red-500 mb-4">
          {error || 'Lenken er ugyldig eller utløpt. Vennligst be om en ny tilbakestillingslenke.'}
        </p>
        <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-blue-600 hover:underline">
          Be om ny lenke
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Passordet må være minst 6 tegn.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passordene stemmer ikke overens.');
      return;
    }

    setLoading(true);

    const result = await resetPassword(password);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    navigate(ROUTES.DASHBOARD);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <label className="block mb-1">Nytt passord</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="nytt passord"
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

      <div className="mb-6">
        <label className="block mb-1">Bekreft passord</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            placeholder="bekreft passord"
            className="w-full border border-gray-300 rounded px-3 py-2 pr-10 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !password || !confirmPassword}
        className="w-full py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? 'Oppdaterer...' : 'Oppdater passord'}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
