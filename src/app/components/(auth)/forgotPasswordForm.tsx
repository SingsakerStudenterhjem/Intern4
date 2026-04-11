import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../server/dao/authentication';
import { ROUTES } from '../../constants/routes';

const COOLDOWN_SECONDS = 60;

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);
      setLoading(true);

      const result = await forgotPassword(email);

      setLoading(false);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSent(true);
      setCountdown(COOLDOWN_SECONDS);
    },
    [email]
  );

  const handleResend = async () => {
    setError(null);
    setLoading(true);

    const result = await forgotPassword(email);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setCountdown(COOLDOWN_SECONDS);
  };

  if (sent) {
    return (
      <div>
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
          <p className="text-green-800 text-sm">
            Hvis det finnes en konto med denne e-postadressen, vil du motta en e-post med en lenke
            for å tilbakestille passordet ditt.
          </p>
        </div>

        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        <div className="flex items-center justify-between">
          <Link to={ROUTES.LOGIN} className="text-sm text-blue-600 hover:underline">
            Tilbake til innlogging
          </Link>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || loading}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {countdown > 0 ? `Send på nytt (${countdown}s)` : 'Send på nytt'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="text-red-500 mb-4">{error}</div>}

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

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? 'Sender...' : 'Send tilbakestillingslenke'}
      </button>

      <div className="mt-4 text-center">
        <Link to={ROUTES.LOGIN} className="text-sm text-blue-600 hover:underline">
          Tilbake til innlogging
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
