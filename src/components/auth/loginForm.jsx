import React, { useState } from "react";
import { authService } from "../../services/api/authService";
import { useAuth } from "../../hooks/useAuth";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();

  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Vennligst skriv inn både e-post og passord");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await authService.login(email, password);

      if (!result.success) {
        setError(result.error || "Ugyldig e-post eller passord");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Det oppstod en feil under innlogging");
    } finally {
      setLoading(false);
    }
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
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={loading}
            placeholder="passord"
            className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"

          />
        </div>

          <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
              {loading ? "Laster..." : "Logg inn"}
          </button>
      </div>
    </div>
  );
};

export default LoginForm;
