import { useEffect, useState } from "react";
import { api } from "../../services/api";

import Sidebar from "../../components/painel/Sidebar";
import Header from "../../components/painel/Header";

import "./dashboard.css";

export default function Financeiro() {
  const [dados, setDados] = useState(null);
  const [gasto, setGasto] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState("");

  // =====================
  // GET MÊS ATUAL (YYYY-MM)
  // =====================
  function getMesAtual() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  }

  // =====================
  // GERAR ÚLTIMOS 12 MESES
  // =====================
  function gerarMeses() {
    const meses = [];
    const hoje = new Date();

    for (let i = 11; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
      const label = data.toLocaleString("pt-BR", { month: "long", year: "numeric" });
      meses.push({ value: mes, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }

    return meses;
  }

  // =====================
  // LOAD
  // =====================
  async function carregar(mes = "") {
    try {
      const url = mes ? `/dashboard?mes=${mes}` : "/dashboard";
      const res = await api.get(url);

      setDados(res.data);
      setGasto(res.data.gastoMensal || 0);
    } catch (err) {
      console.log(err);
    }
  }

  // =====================
  // HANDLE MÊS CHANGE
  // =====================
  function handleMesChange(e) {
    const mes = e.target.value;
    setMesSelecionado(mes);
    carregar(mes);
  }

  // =====================
  // SALVAR GASTO
  // =====================
  async function salvarGasto() {
    try {
      await api.put("/dashboard/financeiro", {
        gastoMensal: Number(gasto),
      });

      carregar();
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  // =====================
  // FORMATAR
  // =====================
  function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <Header />

        <div className="page-top">
          <h2>Financeiro</h2>

          <select
            value={mesSelecionado}
            onChange={handleMesChange}
            style={{
              background: "#111827",
              border: "1px solid #1f2b42",
              borderRadius: 8,
              padding: "10px 14px",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <option value="">Todos os clientes</option>
            {gerarMeses().map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>

        {!dados ? (
          <p>Carregando...</p>
        ) : (
          <>
            {/* ================= GASTO EMPRESA ================= */}
            <div className="painel-box">
              <h3>Gasto mensal da empresa</h3>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                <input
                  value={gasto}
                  onChange={(e) => setGasto(e.target.value)}
                  placeholder="Ex: 2000"
                  style={{
                    flex: 1,
                    background: "#111827",
                    border: "1px solid #1f2b42",
                    borderRadius: 12,
                    padding: 14,
                    color: "white",
                  }}
                />

                <button
                  className="primary-btn"
                  onClick={salvarGasto}
                >
                  Salvar
                </button>
              </div>
            </div>

            {/* ================= BOTS ================= */}
            <div
              className="painel-box"
              style={{ marginTop: 20 }}
            >
              <h3>Financeiro dos Bots</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 20,
                  marginTop: 20,
                }}
              >
                <div className="cliente-box">
                  <h4>💰 Entrada Inicial</h4>

                  <p>
                    {money(dados.receitaInstalacaoBots)}
                  </p>

                  <small>
                    Instalação + primeira mensalidade
                  </small>
                </div>

                <div className="cliente-box">
                  <h4>🔁 Receita Mensal</h4>

                  <p>
                    {money(dados.receitaMensalBots)}
                  </p>

                  <small>
                    Mensalidades recorrentes dos bots
                  </small>
                </div>
              </div>
            </div>

            {/* ================= SITES ================= */}
            <div
              className="painel-box"
              style={{ marginTop: 10 }}
            >
              <h3>Financeiro dos Sites</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 20,
                  marginTop: 10,
                }}
              >
                <div className="cliente-box">
                  <h4>🌐 Entrada Inicial</h4>

                  <p>
                    {money(dados.receitaInstalacaoSites)}
                  </p>

                  <small>
                    Desenvolvimento / instalação dos sites
                  </small>
                </div>

                <div className="cliente-box">
                  <h4>🖥️ Receita Mensal</h4>

                  <p>
                    {money(dados.receitaMensalSites)}
                  </p>

                  <small>
                    Hospedagem e manutenção mensal
                  </small>
                </div>
              </div>
            </div>

            {/* ================= TOTAL EMPRESA ================= */}
            <div
              className="painel-box"
              style={{ marginTop: 20 }}
            >
              <h3>Resumo Geral da Empresa</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 20,
                  marginTop: 20,
                }}
              >
                <div className="cliente-box">
                  <h4>💸 Entrada Total</h4>

                  <p>
                    {money(dados.receitaInstalacaoTotal)}
                  </p>

                  <small>
                    Bots + Sites
                  </small>
                </div>

                <div className="cliente-box">
                  <h4>📈 Receita Recorrente</h4>

                  <p>
                    {money(dados.receitaMensalTotal)}
                  </p>

                  <small>
                    {mesSelecionado ? (
                      mesSelecionado === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
                        ? "Clientes cadastrados em meses anteriores"
                        : "Clientes cadastrados neste mês"
                    ) : (
                      "Mensalidades totais da empresa"
                    )}
                  </small>
                </div>

                <div className="cliente-box">
                  <h4>🏢 Gasto Mensal</h4>

                  <p>
                    {money(dados.gastoMensal)}
                  </p>

                  <small>
                    Custos fixos da DvS
                  </small>
                </div>

                <div className="cliente-box">
                  <h4>✅ Lucro Mensal</h4>

                  <p
                    style={{
                      color:
                        dados.lucro >= 0
                          ? "#4cff9d"
                          : "#ff5f8f",
                    }}
                  >
                    {money(dados.lucro)}
                  </p>

                  <small>
                    Receita mensal - gastos
                  </small>
                </div>
              </div>
            </div>

            {/* ================= RESUMO ================= */}
            <div
              className="painel-box"
              style={{ marginTop: 20 }}
            >
              <h3>Resumo Operacional</h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <p>
                  👥 Clientes cadastrados:{" "}
                  <strong>{dados.clientes}</strong>
                </p>

                <p>
                  🤖 Bots ativos:{" "}
                  <strong>{dados.bots}</strong>
                </p>

                <p>
                  🌐 Sites online:{" "}
                  <strong>{dados.sites}</strong>
                </p>

                <p>
                  📄 Licenças:{" "}
                  <strong>{dados.licencas}</strong>
                </p>

                <p>
                  🖥️ Servidores:{" "}
                  <strong>{dados.servidores}</strong>
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}