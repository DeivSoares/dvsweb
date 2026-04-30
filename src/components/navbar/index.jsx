import { Link } from 'react-router-dom';
import './style.css';

function Navbar() {
  return (
    <nav>
      <img src={require('../../assets/icons/DvsLogo.png')} alt="DVS Logo" />
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/sobre">Sobre</Link></li>
        <li><Link to="/contato">Contato</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;