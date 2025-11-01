import { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';

function Sql() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    // Faz a chamada GET para o backend
    axios.get('https://localhost:3001/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className='testando'>
      {/* <h1>Teste de Usuários</h1> */}

        {/* <li>Staff - ID - Cargo - Admin</li> */}
        {usuarios.map(u => (
          <td key={u.id}>{u.nome} - {u.charID} - {u.Cargo} - {u.Admin}</td>
        ))}

    </div>
  );
}

export default Sql;
