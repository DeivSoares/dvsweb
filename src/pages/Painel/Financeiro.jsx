import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Sidebar from "../../components/painel/Sidebar";
import Header from "../../components/painel/Header";

export default function Financeiro() {
  const [dados, setDados] = useState(null);
  const [gasto, setGasto] = useState("");

  async function carregar() {
    const res = await api.get("/dashboard");
    setDados(res.data);
    setGasto(res.data.gastoMensal || 0);
  }

  async function salvarGasto() {
    await api.put("/dashboard/financeiro", {
      gastoMensal: gasto,
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

        {!dados ? (
          <p>Carregando...</p>
        ) : (
          <>
            <div className="painel-box">
              <h3>Definir gasto mensal</h3>

              <input
                value={gasto}
                onChange={(e) => setGasto(e.target.value)}
                placeholder="Ex: 2000"
              />

              <button className="primary-btn" onClick={salvarGasto}>
                Salvar
              </button>
            </div>
            <div className="painel-box">
              <p>Receita mensal: R$ {dados.receitaMensal}</p>
              <p>Gasto mensal: R$ {dados.gastoMensal}</p>
              <p>
                Lucro: <strong>R$ {dados.lucro}</strong>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
