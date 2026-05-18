import { useEffect, useState } from "react";

import Sidebar from "../../components/painel/Sidebar";
import Header from "../../components/painel/Header";
import Card from "../../components/painel/Card";

import { api } from "../../services/api";

import "./dashboard.css";

export default function Dashboard() {
  const [dados, setDados] = useState({
    clientes: 0,
    licencas: 0,
    bots: 0,
    servidores: 0,
  });

  const [atividades, setAtividades] = useState([]);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const response = await api.get("/dashboard");

        setDados(response.data);

        const atividadesResponse = await api.get("/atividades");

        setAtividades(atividadesResponse.data);
      } catch (err) {
        console.log(err);
      }
    }

    carregarDashboard();
  }, []);

  useEffect(() => {
    async function carregar() {
      try {
        console.log("CHAMANDO API...");

        const res = await api.get("/dashboard/test");

        console.log("RESPOSTA:", res.data);
      } catch (err) {
        console.log("ERRO API:", err);
      }
    }

    carregar();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <Header />

        <section className="dashboard-cards">
          <Card title="Clientes" value={dados.clientes} />

          <Card title="Licenças" value={dados.licencas} />

          <Card title="Bots Vendidos" value={dados.bots} />

          <Card title="Servidores" value={dados.servidores} />
        </section>

        <section className="dashboard-content">
          <div className="painel-box">
            <h2>Atividade Recente</h2>

            {atividades.length === 0 && (
              <div className="atividade-item">
                <span>Nenhuma atividade registrada</span>

                <small>Agora</small>
              </div>
            )}

            {atividades.map((atividade) => (
              <div className="atividade-item" key={atividade.id}>
                <span>{atividade.mensagem}</span>

                <small>
                  {new Date(atividade.data).toLocaleString("pt-BR")}
                </small>
              </div>
            ))}
          </div>

          <div className="painel-box">
            <h2>Status Sistema</h2>

            <div className="status-item online">API Online</div>

            <div className="status-item online">Firebase Conectado</div>

            <div className="status-item online">Painel Operacional</div>
          </div>
        </section>
      </main>
    </div>
  );
}
