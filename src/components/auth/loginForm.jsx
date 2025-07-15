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
      {error && <div>{error}</div>}

      <div>
        <div>
          <label>E-post</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="epost"
          />
        </div>

        <div>
          <label>Passord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            disabled={loading}
            placeholder="passord"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
        >
          {loading ? "Laster..." : "Logg inn"}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
