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
  const [possuiBot, setPossuiBot] = useState(true);

  const [site, setSite] = useState("");
  const [valorPagoSite, setValorPagoSite] = useState("");
  const [valorMensalSite, setValorMensalSite] = useState("");

  const [renovacao, setRenovacao] = useState("");

  const [comprovanteUrl, setComprovanteUrl] = useState("");

  const [botSelecionado, setBotSelecionado] = useState([]);

  const [tipo, setTipo] = useState("bot");

  const [editId, setEditId] = useState(null);

  // =====================
  // LOAD
  // =====================
  async function carregarClientes() {
    try {
      const res = await api.get("/clientes");

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

      if (!Array.isArray(res.data)) {
        setBots([]);
        return;
      }

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

    setPossuiSite(false);
    setPossuiBot(true);

    setSite("");
    setValorPagoSite("");
    setValorMensalSite("");

    setRenovacao("");

    setComprovanteUrl("");

    setBotSelecionado([]);

    setTipo("bot");

    setEditId(null);
  }

  // =====================
  // CREATE
  // =====================
  async function criarCliente() {
    try {
      const tipoCliente = possuiSite && possuiBot ? "bot_site" : possuiSite ? "site" : "bot";

      await api.post("/clientes", {
        nome,
        discord,
        whatsapp,

        valorPago: Number(valorPago || 0),
        valorMensal: Number(valorMensal || 0),

        renovacao,

        comprovanteUrl,

        tipo: tipoCliente,

        possuiSite,

        site,

        valorPagoSite: Number(valorPagoSite || 0),
        valorMensalSite: Number(valorMensalSite || 0),

        bots: possuiBot ? botSelecionado : [],
      });

      limpar();

      setModal(false);

      carregarClientes();
    } catch (err) {
      console.log(err);
      alert("Erro ao criar cliente");
    }
  }

  // =====================
  // EDIT
  // =====================
  async function salvarEdicao() {
    try {
      const tipoCliente = possuiSite && possuiBot ? "bot_site" : possuiSite ? "site" : "bot";

      await api.put(`/clientes/${editId}`, {
        nome,
        discord,
        whatsapp,

        valorPago: Number(valorPago || 0),
        valorMensal: Number(valorMensal || 0),

        renovacao,

        comprovanteUrl,

        tipo: tipoCliente,

        possuiSite,

        site,

        valorPagoSite: Number(valorPagoSite || 0),
        valorMensalSite: Number(valorMensalSite || 0),

        bots: possuiBot ? botSelecionado : [],
      });

      limpar();

      setModal(false);

      setEditando(false);

      carregarClientes();
    } catch (err) {
      console.log(err);
      alert("Erro ao editar cliente");
    }
  }

  // =====================
  // DELETE
  // =====================
  async function excluirCliente(id) {
    const confirmar = window.confirm("Deseja excluir?");

    if (!confirmar) return;

    try {
      await api.delete(`/clientes/${id}`);

      carregarClientes();
    } catch (err) {
      console.log(err);
    }
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

    setComprovanteUrl(cliente.comprovanteUrl || "");

    setBotSelecionado(cliente.bots || []);

    setTipo(cliente.tipo === "site" ? "site" : "bot");
    setPossuiBot(cliente.bots?.length > 0 || cliente.tipo === "bot_site" || cliente.tipo === "bot");

    setSite(cliente.site || "");

    setValorPagoSite(cliente.valorPagoSite || "");
    setValorMensalSite(cliente.valorMensalSite || "");

    setPossuiSite(!!cliente.site);
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

    const renovacaoDate = new Date(data);

    const diff = renovacaoDate - hoje;

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
                <th>Tipo</th>
                <th>Discord</th>
                <th>WhatsApp</th>
                <th>Pago</th>
                <th>Mensal</th>
                <th>Site</th>
                <th>Mensalidade Site</th>
                <th>Renovação</th>
                <th>Bots</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {clientes?.map((c) => (
                <tr key={c.id}>
                  <td>{c.nome}</td>

                  <td>{c.tipo === "site" ? "🌐 Site" : c.tipo === "bot_site" ? "🤖 Bot + Site" : "🤖 Bot"}</td>

                  <td>{c.discord}</td>

                  <td>{c.whatsapp}</td>

                  <td>R$ {c.tipo === "site" ? c.valorPagoSite || 0 : c.valorPago || 0}</td>

                  <td>R$ {c.tipo === "site" ? c.valorMensalSite || 0 : c.valorMensal || 0}</td>

                  <td>
                    {c.site ? (
                      <a href={c.site} target="_blank" rel="noreferrer">
                        Abrir
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>R$ {c.valorMensalSite || 0}</td>

                  <td>
                    <span>{calcularDiasRestantes(c.renovacao)}</span>
                  </td>

                  <td>{c.bots?.length || 0}</td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="view-btn"
                        onClick={() => abrirVisualizar(c)}
                      >
                        Visualizar
                      </button>

                      <button
                        className="edit-btn"
                        onClick={() => abrirEditar(c)}
                      >
                        Editar
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => excluirCliente(c.id)}
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

      {/* ================= VIEW MODAL ================= */}
      {modalView && clienteSelecionado && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Cliente</h2>

            <p>Nome: {clienteSelecionado.nome}</p>

            <p>
              Tipo: {clienteSelecionado.tipo === "site" ? "🌐 Site" : clienteSelecionado.tipo === "bot_site" ? "🤖 Bot + Site" : "🤖 Bot"}
            </p>

            <p>Discord: {clienteSelecionado.discord}</p>

            <p>WhatsApp: {clienteSelecionado.whatsapp}</p>

            {(clienteSelecionado.tipo === "site" || clienteSelecionado.tipo === "bot_site") && (
              <>
                <p>Valor Pago (Site): R$ {clienteSelecionado.valorPagoSite}</p>
                <p>Mensalidade Site: R$ {clienteSelecionado.valorMensalSite}</p>
              </>
            )}

            {(clienteSelecionado.tipo === "bot" || clienteSelecionado.tipo === "bot_site") && (
              <>
                <p>Valor Pago (Bot): R$ {clienteSelecionado.valorPago}</p>
                <p>Mensalidade Bot: R$ {clienteSelecionado.valorMensal}</p>
              </>
            )}

            {clienteSelecionado.site && (
              <p>
                Site:{" "}
                <a
                  href={clienteSelecionado.site}
                  target="_blank"
                  rel="noreferrer"
                >
                  {clienteSelecionado.site}
                </a>
              </p>
            )}

            {clienteSelecionado.comprovanteUrl && (
              <img
                src={clienteSelecionado.comprovanteUrl}
                alt="Comprovante"
                style={{
                  width: "40%",
                  borderRadius: 8,
                }}
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

            <label className="checkbox-label">
              <input
                type="radio"
                name="tipo"
                value="bot"
                checked={tipo === "bot"}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setPossuiSite(false);
                  setPossuiBot(true);
                }}
              />
              Bot Discord
            </label>

            <label className="checkbox-label">
              <input
                type="radio"
                name="tipo"
                value="site"
                checked={tipo === "site"}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setPossuiSite(true);
                  setPossuiBot(false);
                }}
              />
              Site
            </label>

            {(tipo === "bot" || possuiBot) && (
              <>
                <input
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  placeholder="Valor Pago (Bot)"
                  type="number"
                />

                <input
                  value={valorMensal}
                  onChange={(e) => setValorMensal(e.target.value)}
                  placeholder="Mensalidade (Bot)"
                  type="number"
                />
              </>
            )}

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={possuiSite}
                onChange={(e) => setPossuiSite(e.target.checked)}
              />
              Cliente possui site
            </label>

            {tipo === "site" && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={possuiBot}
                  onChange={(e) => setPossuiBot(e.target.checked)}
                />
                Cliente possui bot
              </label>
            )}

            {possuiSite && (
              <>
                <input
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  placeholder="Link do site"
                />

                <input
                  value={valorPagoSite}
                  onChange={(e) => setValorPagoSite(e.target.value)}
                  placeholder="Valor Pago (Site)"
                  type="number"
                />

                <input
                  value={valorMensalSite}
                  onChange={(e) => setValorMensalSite(e.target.value)}
                  placeholder="Mensalidade (Site)"
                  type="number"
                />
              </>
            )}

            <input
              type="date"
              value={renovacao}
              onChange={(e) => setRenovacao(e.target.value)}
            />

            <input
              value={comprovanteUrl}
              onChange={(e) => setComprovanteUrl(e.target.value)}
              placeholder="Link do comprovante"
            />

            {(tipo === "bot" || possuiBot) && (
              <div className="multi-bots">
                {bots.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => toggleBot(b.id)}
                    className={`multi-bot-btn ${
                      botSelecionado.includes(b.id) ? "selected" : ""
                    }`}
                  >
                    {b.nome}
                  </button>
                ))}
              </div>
            )}

            <div className="modal-actions">
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
        </div>
      )}
    </div>
  );
}
