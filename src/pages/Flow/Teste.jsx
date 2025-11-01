import { useState, useEffect } from "react";
import axios from "axios";
import SearchBox from "../../components/searchbox";
import Results from "../../components/results";
import "./style.css";

function Teste() {
  const [tipo, setTipo] = useState("");       // tabela selecionada
  const [tabelas, setTabelas] = useState([]); // lista de tabelas
  const [dados, setDados] = useState([]);
  const [erro, setErro] = useState("");

  // Buscar todas as tabelas
  useEffect(() => {
    axios.get("https://localhost:3001/tabelas")
      .then(res => {
        console.log("Tabelas recebidas:", res.data);
        setTabelas(res.data);
      })
      .catch(err => console.log(err));
  }, []);

  // Buscar dados da tabela selecionada
  useEffect(() => {
    if (!tipo) return;
    setErro("");
    axios.get(`https://localhost:3001/logs/${tipo}`)
      .then(res => setDados(res.data))
      .catch(err => {
        if (err.response?.data?.error) setErro(err.response.data.error);
        else console.log(err);
        setDados([]);
      });
  }, [tipo]);

  return (
    <main className="flw">
      <h1>Painel Admin</h1>
      <SearchBox tipo={tipo} onChange={setTipo} tabelas={tabelas} />
      {erro && <p style={{ color: "red" }}>{erro}</p>}
      {tipo && dados.length > 0 && (
        <Results
          headers={Object.keys(dados[0])}
          rows={dados.map(item => Object.values(item))}
        />
      )}
    </main>
  );
}

export default Teste;
