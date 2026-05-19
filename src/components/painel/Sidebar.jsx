import "./painel.css";
import Perfil from "../../assets/icons/perfil.png";

import logo from "../../assets/icons/DvsLogo.png";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <img src={logo} alt="DvS Logo" />

          <h1>DvS</h1>

          <span>PAINEL ADMINISTRATIVO</span>
        </div>

        <nav className="sidebar-nav">
          <a href="#/painel" className="active">
            Dashboard
          </a>

          <a href="#/painel/clientes">Clientes</a>

          {/* <a href="#/painel/licencas">
            Licenças
          </a> */}

          <a href="#/painel/bots">Bots</a>

          <li>
            <a href="/#/financeiro">Financeiro</a>
          </li>

          {/* <a href="#/painel/logs">
            Logs
          </a> */}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <img src={Perfil} alt="Perfil" />
          </div>

          <div>
            <strong>Dev</strong>
            <p>Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
