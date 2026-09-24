const admin = require("firebase-admin");

const { auth } = require("../firebase");

const [, , email, password, displayName] = process.argv;

if (!email || !password) {
  console.error("Uso: node scripts/create-user.js email senha [nome]");
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
    displayName,
  })
  .then((user) => {
    console.log(`Usuário criado com sucesso: ${user.uid}`);
  })
  .catch((error) => {
    console.error(`Não foi possível criar o usuário: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => {
    admin.app().delete();
  });