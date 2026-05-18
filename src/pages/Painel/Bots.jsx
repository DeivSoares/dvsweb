import { useEffect, useState } from "react";

import Sidebar from "../../components/painel/Sidebar";
import Header from "../../components/painel/Header";

import { api } from "../../services/api";

import "./dashboard.css";

export default function Bots() {
  const [bots, setBots] = useState([]);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [modal, setModal] = useState(false);

  const [botSelecionado, setBotSelecionado] =
    useState(null);

  const [editNome, setEditNome] = useState("");
  const [editDescricao, setEditDescricao] =
    useState("");

  const [editVersao, setEditVersao] =
    useState("");

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
      });

      setNome("");
      setDescricao("");

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

    setModal(true);
  }

  async function salvarEdicao() {
    try {
      await api.put(`/bots/${botSelecionado.id}`, {
        nome: editNome,
        descricao: editDescricao,
        versao: editVersao,
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

              <small>
                Versão: {bot.versao}
              </small>
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