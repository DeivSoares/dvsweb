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
      gastoMensal: Number(gasto),
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
            {/* ================= GASTO ================= */}
            <div className="painel-box">
              <h3>Gasto mensal da empresa</h3>

              <input
                value={gasto}
                onChange={(e) => setGasto(e.target.value)}
                placeholder="Ex: 2000"
              />

              <button className="primary-btn" onClick={salvarGasto}>
                Salvar
              </button>
            </div>

            {/* ================= MÉTRICAS ================= */}
            <div className="painel-box">
              <h3>Métricas financeiras</h3>

              <p>
                💰 Receita instalação (entrada):{" "}
                <strong>R$ {dados.receitaInstalacao}</strong>
              </p>

              <p>
                🔁 Receita mensal recorrente (MRR):{" "}
                <strong>R$ {dados.receitaMensal}</strong>
              </p>

              <p>
                💸 Gasto mensal: <strong>R$ {dados.gastoMensal}</strong>
              </p>

              <p>
                📈 Lucro mensal:{" "}
                <strong style={{ color: "#4cff9d" }}>R$ {dados.lucro}</strong>
              </p>
            </div>

            {/* ================= RESUMO RÁPIDO ================= */}
            <div className="painel-box">
              <h3>Resumo</h3>

              <p>Total de clientes: {dados.clientes}</p>
              <p>Total de bots ativos: {dados.bots}</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
