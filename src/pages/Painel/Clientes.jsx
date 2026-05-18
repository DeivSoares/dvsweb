import { useEffect, useState } from "react";

import Sidebar from "../../components/painel/Sidebar";
import Header from "../../components/painel/Header";

import { api } from "../../services/api";

import "./dashboard.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);

  const [bots, setBots] = useState([]);

  const [modal, setModal] = useState(false);

  const [editando, setEditando] = useState(false);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [nome, setNome] = useState("");

  const [discord, setDiscord] = useState("");

  const [whatsapp, setWhatsapp] = useState("");

  const [valorPago, setValorPago] = useState("");

  const [renovacao, setRenovacao] = useState("");

  const [botSelecionado, setBotSelecionado] = useState([]);

  async function carregarClientes() {
    try {
      const response = await api.get("/clientes");

      setClientes(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function carregarBots() {
    try {
      const response = await api.get("/bots");

      setBots(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  function toggleBot(botId) {
    if (botSelecionado.includes(botId)) {
      setBotSelecionado(botSelecionado.filter((id) => id !== botId));
    } else {
      setBotSelecionado([...botSelecionado, botId]);
    }
  }

  async function criarCliente() {
    try {
      if (!nome) return;

      await api.post("/clientes", {
        nome,
        discord,
        whatsapp,
        valorPago,
        renovacao,
        bots: botSelecionado,
      });

      limparFormulario();

      setModal(false);

      carregarClientes();
    } catch (err) {
      console.log(err);
    }
  }

  async function salvarEdicao() {
    try {
      await api.put(`/clientes/${clienteSelecionado.id}`, {
        nome,
        discord,
        whatsapp,
        valorPago,
        renovacao,
        bots: botSelecionado,
      });

      limparFormulario();

      setModal(false);

      setEditando(false);

      carregarClientes();
    } catch (err) {
      console.log(err);
    }
  }

  async function excluirCliente(id) {
    const confirmar = window.confirm("Deseja realmente excluir este cliente?");

    if (!confirmar) return;

    try {
      await api.delete(`/clientes/${id}`);

      carregarClientes();
    } catch (err) {
      console.log(err);
    }
  }

  function abrirEditar(cliente) {
    setClienteSelecionado(cliente);

    setNome(cliente.nome || "");

    setDiscord(cliente.discord || "");

    setWhatsapp(cliente.whatsapp || "");

    setValorPago(cliente.valorPago || "");

    setRenovacao(cliente.renovacao || "");

    setBotSelecionado(cliente.bots || []);

    setEditando(true);

    setModal(true);
  }

  function limparFormulario() {
    setNome("");

    setDiscord("");

    setWhatsapp("");

    setValorPago("");

    setRenovacao("");

    setBotSelecionado([]);
  }

  function calcularDiasRestantes(data) {
    if (!data) return "-";

    const hoje = new Date();

    const renovacao = new Date(data);

    hoje.setHours(0, 0, 0, 0);

    renovacao.setHours(0, 0, 0, 0);

    const diferenca = renovacao - hoje;

    const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

    if (dias < 0) {
      return "Expirado";
    }

    if (dias === 0) {
      return "Hoje";
    }

    if (dias === 1) {
      return "1 dia";
    }

    return `${dias} dias`;
  }

  useEffect(() => {
    carregarClientes();

    carregarBots();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <Header />

        <div className="page-top">
          <h2>Clientes</h2>

          <button
            className="primary-btn"
            onClick={() => {
              limparFormulario();

              setEditando(false);

              setModal(true);
            }}
          >
            Novo Cliente
          </button>
        </div>

        <div className="table-container">
          <table className="painel-table">
            <thead>
              <tr>
                <th>Cliente</th>

                <th>Discord</th>

                <th>Whatsapp</th>

                <th>Valor Pago</th>

                <th>Renovação</th>

                <th>Bots</th>

                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>

                  <td>{cliente.discord}</td>

                  <td>{cliente.whatsapp}</td>

                  <td>R$ {cliente.valorPago}</td>

                  <td>
                    <span
                      className={`renovacao-badge ${
                        calcularDiasRestantes(cliente.renovacao) === "Expirado"
                          ? "expired"
                          : ""
                      }`}
                    >
                      {calcularDiasRestantes(cliente.renovacao)}
                    </span>
                  </td>

                  <td>{cliente.bots?.length || 0}</td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="edit-btn"
                        onClick={() => abrirEditar(cliente)}
                      >
                        Editar
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => excluirCliente(cliente.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{editando ? "Editar Cliente" : "Novo Cliente"}</h2>

            <input
              type="text"
              placeholder="Nome do cliente"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              type="text"
              placeholder="Discord"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
            />

            <input
              type="text"
              placeholder="Whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />

            <input
              type="text"
              placeholder="Valor Pago"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
            />

            <input
              type="date"
              value={renovacao}
              onChange={(e) => setRenovacao(e.target.value)}
            />

            <div className="multi-bots">
              {bots.map((bot) => (
                <button
                  key={bot.id}
                  type="button"
                  className={`multi-bot-btn ${
                    botSelecionado.includes(bot.id) ? "selected" : ""
                  }`}
                  onClick={() => toggleBot(bot.id)}
                >
                  {bot.nome}
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={editando ? salvarEdicao : criarCliente}
              >
                {editando ? "Salvar Alterações" : "Criar Cliente"}
              </button>

              <button
                className="close-btn"
                onClick={() => {
                  setModal(false);

                  setEditando(false);
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
