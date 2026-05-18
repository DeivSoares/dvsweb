const { db } = require("../firebase");

async function registrarAtividade(
  mensagem
) {
  try {
    await db
      .collection("atividades")
      .add({
        mensagem,
        data: Date.now(),
      });
  } catch (err) {
    console.log(
      "Erro ao registrar atividade",
      err
    );
  }
}

module.exports = {
  registrarAtividade,
};