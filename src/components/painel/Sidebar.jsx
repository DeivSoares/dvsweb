import { useEffect, useState } from "react";

import "./painel.css";
import Perfil from "../../assets/icons/perfil.png";
import { useAuth } from "../../services/AuthContext";

import logo from "../../assets/icons/DvsLogo.png";

export default function Sidebar() {
  const { user, claims, logout } = useAuth();
  const canManage = ["CEO", "Administrador"].includes(claims.nivelAcesso);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", isOpen);

    return () => document.body.classList.remove("sidebar-open");
  }, [isOpen]);

  return (
    <>
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="sidebar-toggle-icon" aria-hidden="true">
          {isOpen ? "x" : "="}
        </span>
      </button>

      {isOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Fechar menu"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar${isOpen ? " is-open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <img src={logo} alt="DvS Logo" />

            <h1>DvS</h1>

            <span>PAINEL ADMINISTRATIVO</span>
          </div>

          <nav className="sidebar-nav">
            <a href="#/painel" className="active" onClick={() => setIsOpen(false)}>
              Dashboard
            </a>

            <a href="#/painel/clientes" onClick={() => setIsOpen(false)}>
              Clientes
            </a>

            {/* <a href="#/painel/licencas">
            Licenças
          </a> */}

            <a href="#/painel/bots" onClick={() => setIsOpen(false)}>
              Bots
            </a>

            {canManage && (
              <a href="#/painel/financeiro" onClick={() => setIsOpen(false)}>
                Financeiro
              </a>
            )}

            {canManage && (
              <a href="#/painel/configuracoes" onClick={() => setIsOpen(false)}>
                Configurações
              </a>
            )}

            {/* <a href="#/painel/logs">
            Logs
          </a> */}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              <img src={user?.photoURL || Perfil} alt="Perfil" />
            </div>

            <div>
              <strong>{user?.displayName || claims.username || "Usuário"}</strong>
              <p>{claims.nivelAcesso || "Usuário"}</p>
            </div>
          </div>

          <button className="sidebar-logout" type="button" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
