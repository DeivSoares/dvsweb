import { useEffect, useState } from "react";

import Sidebar from "../../components/painel/Sidebar";
import Header from "../../components/painel/Header";
import { useAuth } from "../../services/AuthContext";
import { api } from "../../services/api";

import "./dashboard.css";

const initialForm = { username: "", password: "", displayName: "", nivelAcesso: "Vendedor", photoURL: "" };

export default function Configuracoes() {
  const { user, reloadUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editando, setEditando] = useState(null);
  const [mensagem, setMensagem] = useState("");

  async function carregarUsuarios() {
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      setMensagem(error.response?.data?.message || "Não foi possível carregar os usuários.");
    }
  }

  useEffect(() => { carregarUsuarios(); }, []);

  function atualizarCampo(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function limpar() {
    setForm(initialForm);
    setEditando(null);
  }

  async function salvar(event) {
    event.preventDefault();
    setMensagem("");

    try {
      if (editando) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.patch(`/usuarios/${editando}`, payload);
        if (editando === user?.uid) await reloadUser();
      } else {
        await api.post("/usuarios", form);
      }
      limpar();
      await carregarUsuarios();
      setMensagem("Usuário salvo com sucesso.");
    } catch (error) {
      setMensagem(error.response?.data?.message || "Não foi possível salvar o usuário.");
    }
  }

  function editar(usuario) {
    setEditando(usuario.uid);
    setForm({ username: usuario.username, password: "", displayName: usuario.displayName, nivelAcesso: usuario.nivelAcesso, photoURL: usuario.photoURL || "" });
  }

  async function excluir(usuario) {
    if (!window.confirm(`Excluir o usuário ${usuario.username}?`)) return;
    try {
      await api.delete(`/usuarios/${usuario.uid}`);
      await carregarUsuarios();
      setMensagem("Usuário excluído com sucesso.");
    } catch (error) {
      setMensagem(error.response?.data?.message || "Não foi possível excluir o usuário.");
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <Header />
        <section className="page-top"><div><h2>Configurações</h2><p>Gerencie os usuários e níveis de acesso do painel.</p></div></section>
        <section className="dashboard-content settings-content">
          <form className="painel-box settings-form" onSubmit={salvar}>
            <h2>{editando ? "Editar usuário" : "Cadastrar usuário"}</h2>
            <label>Nome de usuário<input name="username" value={form.username} onChange={atualizarCampo} pattern="[A-Za-z0-9._-]+" disabled={Boolean(editando)} required /></label>
            <label>Nome completo<input name="displayName" value={form.displayName} onChange={atualizarCampo} required /></label>
            <label>URL da imagem do Discord<input name="photoURL" type="url" value={form.photoURL} onChange={atualizarCampo} placeholder="https://media.discordapp.net/..." /></label>
            {form.photoURL && <img className="settings-avatar-preview" src={form.photoURL} alt="Prévia do avatar" />}
            <label>{editando ? "Nova senha (opcional)" : "Senha"}<input name="password" type="password" minLength={6} value={form.password} onChange={atualizarCampo} required={!editando} /></label>
            <label>Nível de acesso<select name="nivelAcesso" value={form.nivelAcesso} onChange={atualizarCampo}><option>Vendedor</option><option>Desenvolvedor</option><option>Administrador</option><option>CEO</option></select></label>
            <div className="settings-actions"><button type="submit">{editando ? "Salvar alterações" : "Cadastrar usuário"}</button>{editando && <button type="button" className="view-btn" onClick={limpar}>Cancelar</button>}</div>
            {mensagem && <p className="settings-message" role="status">{mensagem}</p>}
          </form>
          <div className="painel-box settings-users"><h2>Usuários cadastrados</h2><div className="table-container"><table className="painel-table"><thead><tr><th>Usuário</th><th>Nome</th><th>Nível</th><th>Ações</th></tr></thead><tbody>{usuarios.map((usuario) => <tr key={usuario.uid}><td>{usuario.username}</td><td>{usuario.displayName}</td><td>{usuario.nivelAcesso}</td><td><button className="edit-btn" type="button" onClick={() => editar(usuario)}>Editar</button>{!usuario.disabled && <button className="danger-btn" type="button" onClick={() => excluir(usuario)}>Excluir</button>}</td></tr>)}</tbody></table></div></div>
        </section>
      </main>
    </div>
  );
}