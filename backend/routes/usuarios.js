const express = require("express");
const { auth } = require("../firebase");

const router = express.Router();
const USER_EMAIL_DOMAIN = "users.dvsweb.internal";
const USERNAME_PATTERN = /^[a-z0-9._-]+$/;

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function getEmail(username) {
  return `${normalizeUsername(username)}@${USER_EMAIL_DOMAIN}`;
}

function serializeUser(user) {
  return {
    uid: user.uid,
    username: user.customClaims?.username || user.email?.split("@")[0] || "",
    displayName: user.displayName || "",
    nivelAcesso: user.customClaims?.nivelAcesso === "Usuário"
      ? "Vendedor"
      : user.customClaims?.nivelAcesso === "Gerente"
        ? "Desenvolvedor"
        : user.customClaims?.nivelAcesso || "Vendedor",
    disabled: user.disabled,
    createdAt: user.metadata.creationTime,
    lastSignInAt: user.metadata.lastSignInTime || null,
  };
}

async function listAllUsers() {
  const users = [];
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);
    users.push(...result.users);
    pageToken = result.pageToken;
  } while (pageToken);

  return users;
}

router.get("/", async (req, res) => {
  try {
    const users = await listAllUsers();
    res.json(users.map(serializeUser));
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

router.post("/", async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const { password, displayName, nivelAcesso } = req.body;

  if (!USERNAME_PATTERN.test(username)) return res.status(400).json({ message: "Nome de usuário inválido." });
  if (!password || password.length < 6) return res.status(400).json({ message: "A senha precisa ter pelo menos 6 caracteres." });
  if (!displayName?.trim() || !nivelAcesso?.trim()) return res.status(400).json({ message: "Nome e nível de acesso são obrigatórios." });

  try {
    const user = await auth.createUser({ email: getEmail(username), password, displayName: displayName.trim() });
    await auth.setCustomUserClaims(user.uid, { username, nivelAcesso: nivelAcesso.trim() });
    res.status(201).json(serializeUser(await auth.getUser(user.uid)));
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(400).json({ message: error.code === "auth/email-already-exists" ? "Esse nome de usuário já existe." : "Não foi possível criar o usuário." });
  }
});

router.patch("/:uid", async (req, res) => {
  const { uid } = req.params;
  const username = req.body.username === undefined ? undefined : normalizeUsername(req.body.username);
  const updates = {};

  if (username !== undefined) {
    if (!USERNAME_PATTERN.test(username)) return res.status(400).json({ message: "Nome de usuário inválido." });
    updates.email = getEmail(username);
  }
  if (req.body.displayName !== undefined) updates.displayName = req.body.displayName.trim();
  if (req.body.password) {
    if (req.body.password.length < 6) return res.status(400).json({ message: "A senha precisa ter pelo menos 6 caracteres." });
    updates.password = req.body.password;
  }
  if (req.body.disabled !== undefined) updates.disabled = Boolean(req.body.disabled);

  try {
    const currentUser = await auth.getUser(uid);
    const currentClaims = currentUser.customClaims || {};
    if (Object.keys(updates).length) await auth.updateUser(uid, updates);
    await auth.setCustomUserClaims(uid, {
      ...currentClaims,
      ...(username === undefined ? {} : { username }),
      ...(req.body.nivelAcesso === undefined ? {} : { nivelAcesso: req.body.nivelAcesso.trim() }),
    });
    res.json(serializeUser(await auth.getUser(uid)));
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(400).json({ message: error.code === "auth/email-already-exists" ? "Esse nome de usuário já existe." : "Não foi possível atualizar o usuário." });
  }
});

router.delete("/:uid", async (req, res) => {
  if (req.params.uid === req.user.uid) return res.status(400).json({ message: "Você não pode excluir o próprio usuário." });

  try {
    await auth.deleteUser(req.params.uid);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    res.status(400).json({ message: "Não foi possível excluir o usuário." });
  }
});

module.exports = router;