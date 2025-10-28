// import { useState } from "react";
// import SearchBox from "../../components/searchbox";
// import Results from "../../components/results";
// import "./style.css";

// function Flow() {
//   const opcoes = {
//     staff: ["Staff", "ID", "Cargo", "Admin"],
//     voltou: ["Player", "Distância", "Cooldown", "Data e Hora"],
//     vdm: ["Assassino", "Vítima", "Coordenada", "Veículo", "Código da Morte", "Data e Hora"], // chave sem acento
//     kill: ["Assassino", "Vítima", "Coordenada", "Causa da Morte", "Código da Morte", "Data e Hora"],
//     gg: ["Player","ID", "Código da Morte", "Coordenada", "Itens Perdidos", "Data e Hora"],
//     ggairdrop: ["Player","ID", "Coordenada", "Itens Perdidos", "Data e Hora"],
//   };

//   const [tipo, setTipo] = useState("kill");

//   const handleChange = (e) => setTipo(e.target.value);

//   // resolve headers aqui no pai e passa já prontos para o Results
//   const headers = opcoes[tipo] || [];

//   // opcional: dados dinâmicos pra demonstrar
//   const sampleRows = [
//     ["Tchan", "Kah", "Coordenada", "WEAPON_SPECIAL_CARBINE_MK2", "HASDA144", "23/10 às 12:00"],
//     ["Tchan", "Kah", "Coordenada", "WEAPON_SPECIAL_CARBINE_MK2", "HASDA144", "23/10 às 12:00"],
//   ];

//   console.log("Tipo selecionado:", tipo, "Headers no App:", headers);
//   return (
//     <main className="flw">
//       <h1>Painel Admin</h1>
//       <SearchBox tipo={tipo} onChange={handleChange} />
//       <Results headers={headers} rows={sampleRows} />
//     </main>
//   );
// }
// export default Flow;

import { useState, useEffect } from "react";
import axios from "axios";
import SearchBox from "../../components/searchbox";
import Results from "../../components/results";
import "./style.css";

function App() {
  // Define os headers possíveis
  const opcoes = {
    staff: ["Staff", "ID", "Cargo", "Admin"],
    voltou: ["Player", "Distância", "Cooldown", "Data e Hora"],
    vdm: ["Assassino","Vítima","Coordenada","Veículo","Código da Morte","Data e Hora",], // chave sem acento
    morte: ["Assassino","Vítima","Coordenada","Causa da Morte","Código da Morte","Data e Hora",],
    gg: ["Player","ID","Código da Morte","Coordenada","Itens Perdidos","Data e Hora",],
    ggairdrop: ["Player", "ID", "Coordenada", "Itens Perdidos", "Data e Hora"],
  };

  const [tipo, setTipo] = useState("mortes");  // Tipo selecionado
  const [dados, setDados] = useState([]);      // Dados vindos do MySQL
  const [erro, setErro] = useState("");        // Para exibir erro caso a tabela não exista

  // Função para atualizar tipo
  const handleChange = (event) => setTipo(event.target.value);

  // useEffect para buscar dados do backend
   useEffect(() => {
    setErro(""); // reset do erro
    axios.get(`http://localhost:3001/logs/${tipo}`)
      .then((res) => {
        const dadosFormatados = res.data.map(item => Object.values(item));
        setDados(dadosFormatados);
      })
      .catch((err) => {
        if (err.response?.data?.error) {
          setErro(err.response.data.error);
          setDados([]);
        } else {
          console.log(err);
        }
      });
  }, [tipo]);

  return (
    <main className="flw">
      <h1>Painel Admin</h1>
      <SearchBox tipo={tipo} onChange={handleChange} />
       {erro ? <p style={{ color: "red" }}>{erro}</p> : null}
      <Results headers={opcoes[tipo]} rows={dados} />
    </main>
  );
}

export default App;
