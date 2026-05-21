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
  const [modalView, setModalView] = useState(false);
  const [nome, setNome] = useState("");
  const [discord, setDiscord] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [valorMensal, setValorMensal] = useState("");
  const [possuiSite, setPossuiSite] = useState(false);
  const [site, setSite] = useState("");
  const [valorMensalSite, setValorMensalSite] = useState("");
  const [renovacao, setRenovacao] = useState("");
  const [comprovanteUrl, setComprovanteUrl] = useState("");
  const [botSelecionado, setBotSelecionado] = useState([]);
  const [editId, setEditId] = useState(null);

  // =====================
  // LOAD
  // =====================
  async function carregarClientes() {
    try {
      const res = await api.get("/clientes");

      console.log("CLIENTES:", res.data);

      if (!Array.isArray(res.data)) {
        console.log("Resposta inválida:", res.data);
        setClientes([]);
        return;
      }

      setClientes(res.data);
    } catch (err) {
      console.log("ERRO CLIENTES:", err);
      setClientes([]);
    }
  }

  async function carregarBots() {
    try {
      const res = await api.get("/bots");
      setBots(res.data);
    } catch (err) {
      console.log(err);
      setBots([]);
    }
  }

  useEffect(() => {
    carregarClientes();
    carregarBots();
  }, []);

  // =====================
  // BOTS MULTI SELECT
  // =====================
  function toggleBot(id) {
    setBotSelecionado((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  // =====================
  // RESET
  // =====================
  function limpar() {
    setNome("");
    setDiscord("");
    setWhatsapp("");
    setValorPago("");
    setValorMensal("");
    setRenovacao("");
    setBotSelecionado([]);
    setComprovanteUrl("");
    setEditId(null);
  }

  // =====================
  // CREATE
  // =====================
  async function criarCliente() {
    await api.post("/clientes", {
      nome,
      discord,
      whatsapp,
      valorPago,
      valorMensal,
      renovacao,
      bots: botSelecionado,
      comprovanteUrl,
      possuiSite,
      site,
      valorMensalSite,
    });

    limpar();
    setModal(false);
    carregarClientes();
  }

  // =====================
  // EDIT
  // =====================
  async function salvarEdicao() {
    await api.put(`/clientes/${editId}`, {
      nome,
      discord,
      whatsapp,
      valorPago,
      valorMensal,
      renovacao,
      bots: botSelecionado,
      comprovanteUrl, // 🔥 FALTAVA ISSO
    });

    limpar();
    setModal(false);
    setEditando(false);
    carregarClientes();
  }

  // =====================
  // DELETE
  // =====================
  async function excluirCliente(id) {
    const confirmar = window.confirm("Deseja excluir?");

    if (!confirmar) return;

    await api.delete(`/clientes/${id}`);
    carregarClientes();
  }

  // =====================
  // EDIT OPEN
  // =====================
  function abrirEditar(cliente) {
    setEditando(true);
    setModal(true);
    setEditId(cliente.id);

    setNome(cliente.nome || "");
    setDiscord(cliente.discord || "");
    setWhatsapp(cliente.whatsapp || "");
    setValorPago(cliente.valorPago || "");
    setValorMensal(cliente.valorMensal || "");
    setRenovacao(cliente.renovacao || "");
    setBotSelecionado(cliente.bots || []);
  }

  // =====================
  // VIEW MODAL
  // =====================
  function abrirVisualizar(cliente) {
    setClienteSelecionado(cliente);
    setModalView(true);
  }

  // =====================
  // DIAS RESTANTES
  // =====================
  function calcularDiasRestantes(data) {
    if (!data) return "-";

    const hoje = new Date();
    const renovacao = new Date(data);

    const diff = renovacao - hoje;
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (dias < 0) return "Expirado";
    if (dias === 0) return "Hoje";
    if (dias === 1) return "1 dia";

    return `${dias} dias`;
  }

  // =====================
  // RENDER
  // =====================
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
              limpar();
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
                <th>WhatsApp</th>
                <th>Pago</th>
                <th>Mensal</th>
                <th>Renovação</th>
                <th>Bots</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {clientes?.map((c) => (
                <tr key={c.id}>
                  <td>{c.nome}</td>
                  <td>{c.discord}</td>
                  <td>{c.whatsapp}</td>
                  <td>R$ {c.valorPago}</td>
                  <td>R$ {c.valorMensal}</td>

                  <td>
                    <span>{calcularDiasRestantes(c.renovacao)}</span>
                  </td>

                  <td>{c.bots?.length || 0}</td>

                  <td>
                    <button
                      className="view-btn"
                      onClick={() => abrirVisualizar(c)}
                    >
                      Visualizar
                    </button>

                    <button className="edit-btn" onClick={() => abrirEditar(c)}>
                      Editar
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => excluirCliente(c.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ================= VIEW MODAL ================= */}
      {modalView && clienteSelecionado && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Cliente</h2>

            <p>Nome: {clienteSelecionado.nome}</p>
            <p>Discord: {clienteSelecionado.discord}</p>
            <p>WhatsApp: {clienteSelecionado.whatsapp}</p>
            <p>Pago: R$ {clienteSelecionado.valorPago}</p>
            <p>Mensal: R$ {clienteSelecionado.valorMensal}</p>

            {clienteSelecionado.comprovanteUrl && (
              <img
                src={clienteSelecionado.comprovanteUrl}
                style={{ width: "40%", borderRadius: 8 }}
              />
            )}

            <button className="close-btn" onClick={() => setModalView(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL CREATE/EDIT ================= */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{editando ? "Editar Cliente" : "Novo Cliente"}</h2>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome"
            />
            <input
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="Discord"
            />
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="WhatsApp"
            />
            <input
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              placeholder="Valor Pago"
            />
            <input
              value={valorMensal}
              onChange={(e) => setValorMensal(e.target.value)}
              placeholder="Mensal"
            />
            <input
              type="checkbox"
              checked={possuiSite}
              onChange={(e) => setPossuiSite(e.target.checked)}
            />
            {possuiSite && (
              <input
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="Site"
              />
            )}
            {possuiSite && (
              <input
                value={valorMensalSite}
                onChange={(e) => setValorMensalSite(e.target.value)}
                placeholder="Valor Mensal do Site"
              />
            )}
            <input
              type="date"
              value={renovacao}
              onChange={(e) => setRenovacao(e.target.value)}
            />

            <input
              value={comprovanteUrl}
              onChange={(e) => setComprovanteUrl(e.target.value)}
              placeholder="Link do comprovante (imagem)"
            />

            <div className="multi-bots">
              {bots.map((b) => (
                <button
                  key={b.id}
                  onClick={() => toggleBot(b.id)}
                  className={botSelecionado.includes(b.id) ? "selected" : ""}
                >
                  {b.nome}
                </button>
              ))}
            </div>

            <button
              onClick={editando ? salvarEdicao : criarCliente}
              className="primary-btn"
            >
              Salvar
            </button>

            <button className="close-btn" onClick={() => setModal(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
