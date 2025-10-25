import { useState } from "react";
import SearchBox from "../../components/searchbox";
import Results from "../../components/results";
import "./style.css";

function Flow() {
  const opcoes = {
    voltou: ["Player", "Distância", "Cooldown", "Data e Hora"],
    vdm: ["Assassino", "Vítima", "Coordenada", "Veículo", "Código da Morte", "Data e Hora"], // chave sem acento
    kill: ["Assassino", "Vítima", "Coordenada", "Causa da Morte", "Código da Morte", "Data e Hora"],
    gg: ["Player","ID", "Código da Morte", "Coordenada", "Itens Perdidos", "Data e Hora"],
    ggairdrop: ["Player","ID", "Coordenada", "Itens Perdidos", "Data e Hora"],
  };

  const [tipo, setTipo] = useState("kill");

  const handleChange = (e) => setTipo(e.target.value);

  // resolve headers aqui no pai e passa já prontos para o Results
  const headers = opcoes[tipo] || [];

  // opcional: dados dinâmicos pra demonstrar
  const sampleRows = [
    ["Tchan", "Kah", "Coordenada", "WEAPON_SPECIAL_CARBINE_MK2", "HASDA144", "23/10 às 12:00"],
    ["Tchan", "Kah", "Coordenada", "WEAPON_SPECIAL_CARBINE_MK2", "HASDA144", "23/10 às 12:00"],
  ];

  console.log("Tipo selecionado:", tipo, "Headers no App:", headers);
  return (
    <main className="flw">
      <h1>Painel Admin</h1>
      <SearchBox tipo={tipo} onChange={handleChange} />
      <Results headers={headers} rows={sampleRows} />
    </main>
  );
}
export default Flow;
