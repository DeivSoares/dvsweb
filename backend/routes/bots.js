const express = require("express");
const { db } = require("../firebase");
const { registrarAtividade } = require("../utils/atividade");
const requireDeveloperAccess = require("../middleware/requireDeveloperAccess");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("bots").get();

    const bots = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(bots);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

router.post("/", requireDeveloperAccess, async (req, res) => {
  try {
    const { nome, descricao, versao, valorMensal, valor } = req.body;

    if (!nome) {
      return res.status(400).json({
        error: "Nome obrigatório",
      });
    }

    const valorDoBot = Number(valorMensal ?? valor ?? 0);

    const novoBot = {
      nome,
      descricao: descricao || "",
      versao: versao || "1.0.0",
      valorMensal: valorDoBot,
      valor: valorDoBot,
      ativo: true,
      criadoEm: Date.now(),
    };

    const doc = await db.collection("bots").add(novoBot);
    await registrarAtividade(`Novo bot cadastrado: ${nome}`);
    res.json({
      id: doc.id,
      ...novoBot,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});
router.put("/:id", requireDeveloperAccess, async (req, res) => {
  try {
    const { id } = req.params;

    const { nome, descricao, versao, valorMensal, valor } = req.body;

    const valorDoBot = Number(valorMensal ?? valor ?? 0);

    await db.collection("bots").doc(id).update({
      nome,
      descricao,
      versao,
      valorMensal: valorDoBot,
      valor: valorDoBot,
    });
    await registrarAtividade(`Bot atualizado: ${nome}`);
    res.json({
      sucesso: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

router.delete("/:id", requireDeveloperAccess, async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("bots").doc(id).delete();
    await registrarAtividade("Bot excluído");
    res.json({
      sucesso: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});
module.exports = router;
