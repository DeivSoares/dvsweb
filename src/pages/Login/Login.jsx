import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import logo from "../../assets/icons/DvsLogo.png";
import { useAuth } from "../../services/AuthContext";
import { auth } from "../../services/firebase";
import { usernameToAuthEmail } from "../../services/username";

import "./login.css";

function getLoginError(error) {
  if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
    return "Nome de usuário ou senha incorretos.";
  }

  if (error.code === "auth/too-many-requests") {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }

  return "Não foi possível entrar. Verifique sua conexão e tente novamente.";
}

export default function Login() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/painel" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, usernameToAuthEmail(username), password);
      const destination = location.state?.from?.pathname || "/painel";
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(getLoginError(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <img src={logo} alt="DvS" />
          <span>PAINEL ADMINISTRATIVO</span>
        </div>

        <div className="login-heading">
          <p className="login-eyebrow">Acesso restrito</p>
          <h1 id="login-title">Bem-vindo de volta</h1>
          <p>Entre com suas credenciais para acessar o painel.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Nome de usuário</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="seu.usuario"
            pattern="[A-Za-z0-9._-]+"
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            minLength={6}
            required
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>
      </section>
    </main>
  );
}