import { useEffect, useState } from "react";

import Sidebar from "../../components/painel/Sidebar";
import Header from "../../components/painel/Header";

import { api } from "../../services/api";

import "./dashboard.css";

export default function Bots() {
  const [bots, setBots] = useState([]);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const [modal, setModal] = useState(false);

  const [botSelecionado, setBotSelecionado] =
    useState(null);

  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] =
    useState("");

  const [editVersao, setEditVersao] =
    useState("");
  const [editValor, setEditValor] = useState("");

  async function carregarBots() {
    try {
      const response = await api.get("/bots");

      setBots(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function criarBot() {
    try {
      if (!nome) return;

      await api.post("/bots", {
        nome,
        descricao,
        valorMensal: Number(valor || 0),
      });

      setNome("");
      setDescricao("");
      setValor("");

      carregarBots();
    } catch (err) {
      console.log(err);
    }
  }

  function abrirModal(bot) {
    setBotSelecionado(bot);

    setEditNome(bot.nome);

    setEditDescricao(bot.descricao);

    setEditVersao(bot.versao);

    setEditValor(bot.valorMensal ?? bot.valor ?? "");

    setModal(true);
  }

  async function salvarEdicao() {
    try {
      await api.put(`/bots/${botSelecionado.id}`, {
        nome: editNome,
        descricao: editDescricao,
        versao: editVersao,
        valorMensal: Number(editValor || 0),
      });

      setModal(false);

      carregarBots();
    } catch (err) {
      console.log(err);
    }
  }

  async function excluirBot() {
    try {
      await api.delete(
        `/bots/${botSelecionado.id}`
      );

      setModal(false);

      carregarBots();
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    carregarBots();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="dashboard-main">
        <Header />

        <div className="page-top">
          <h2>Bots</h2>
        </div>

        <div className="bot-form">
          <input
            type="text"
            placeholder="Nome do bot"
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Descrição"
            value={descricao}
            onChange={(e) =>
              setDescricao(e.target.value)
            }
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Valor mensal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <button onClick={criarBot}>
            Criar Bot
          </button>
        </div>

        <div className="bots-grid">
          {bots.map((bot) => (
            <div className="bot-card" key={bot.id}>
              <div className="bot-top">
                <h3>{bot.nome}</h3>

                <button
                  className="edit-btn"
                  onClick={() =>
                    abrirModal(bot)
                  }
                >
                  Editar
                </button>
              </div>

              <p>{bot.descricao}</p>

              <strong>
                Mensalidade: R$ {Number(bot.valorMensal ?? bot.valor ?? 0).toFixed(2)}
              </strong>
              <br></br>
              <p>
                <small>
                  Versão: {bot.versao}
                </small>
              </p>
            </div>
          ))}
        </div>
      </main>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Editar Bot</h2>

            <input
              type="text"
              value={editNome}
              onChange={(e) =>
                setEditNome(e.target.value)
              }
            />

            <input
              type="text"
              value={editDescricao}
              onChange={(e) =>
                setEditDescricao(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              value={editVersao}
              onChange={(e) =>
                setEditVersao(
                  e.target.value
                )
              }
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={editValor}
              onChange={(e) => setEditValor(e.target.value)}
              placeholder="Valor mensal"
            />

            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={salvarEdicao}
              >
                Salvar
              </button>

              <button
                className="danger-btn"
                onClick={excluirBot}
              >
                Excluir
              </button>

              <button
                className="close-btn"
                onClick={() =>
                  setModal(false)
                }
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