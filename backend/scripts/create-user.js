const admin = require("firebase-admin");

const { auth } = require("../firebase");

const [, , username, password, displayName, nivelAcesso] = process.argv;

const normalizedUsername = username?.trim().toLowerCase();
const email = normalizedUsername
  ? `${normalizedUsername}@users.dvsweb.internal`
  : "";

if (!normalizedUsername || !password) {
  console.error("Uso: node scripts/create-user.js usuario senha [nome] [nivel] ");
  process.exit(1);
}

if (!/^[a-z0-9._-]+$/.test(normalizedUsername)) {
  console.error("O usuário deve conter apenas letras, números, ponto, hífen ou sublinhado.");
  process.exit(1);
}

if (password.length < 6) {
  console.error("A senha precisa ter pelo menos 6 caracteres.");
  process.exit(1);
}

auth
  .createUser({
    email,
    password,
    displayName: displayName || normalizedUsername,
  })
  .then(async (user) => {
    await auth.setCustomUserClaims(user.uid, {
      username: normalizedUsername,
      nivelAcesso: nivelAcesso || "Vendedor",
    });

    console.log(`Usuário criado com sucesso: ${user.uid}`);
    console.log(`Login: ${normalizedUsername}`);
    console.log(`Nível de acesso: ${nivelAcesso || "Vendedor"}`);
  })
  .catch((error) => {
    console.error(`Não foi possível criar o usuário: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    admin.app().delete();
  });