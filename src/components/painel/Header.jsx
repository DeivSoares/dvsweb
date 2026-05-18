import "./painel.css";
import Perfil from "../../assets/icons/perfil.png";

export default function Header() {
  return (
    <header className="dashboard-header">
      <div>
        <h1>Painel Administrativo</h1>
        <p>Gerencie seus bots e licenças</p>
      </div>

      <div className="header-user">
        <div className="user-avatar">
          {/* <img src={Perfil} alt="Perfil" /> */}
        </div>
      </div>
    </header>
  );
}