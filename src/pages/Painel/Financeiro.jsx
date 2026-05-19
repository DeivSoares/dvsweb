import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Sidebar from "../../components/painel/Sidebar";
import Header from "../../components/painel/Header";

export default function Financeiro() {
  const [gasto, setGasto] = useState(0);
  const [receita, setReceita] = useState(0);
  const [lucro, setLucro] = useState(0);

  const [novoGasto, setNovoGasto] = useState("");

  async function carregar() {
    const res = await api.get("/dashboard");

    setReceita(res.data.receita);
    setLucro(res.data.lucro);
  }

  async function salvarGasto() {
    await api.put("/financeiro", {
      gastoMensal: novoGasto,
    });

    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <Header />

        <h2>Financeiro</h2>

        <div className="painel-box">
          <p>Receita: R$ {receita}</p>
          <p>Gasto mensal: R$ {gasto}</p>
          <p>Lucro: R$ {lucro}</p>
        </div>

        <div className="painel-box">
          <h3>Definir gasto mensal</h3>

          <input
            value={novoGasto}
            onChange={(e) => setNovoGasto(e.target.value)}
            placeholder="Ex: 500"
          />

          <button onClick={salvarGasto} className="primary-btn">
            Salvar
          </button>
        </div>
      </main>
    </div>
  );
}