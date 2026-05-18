const express = require("express");

const { db } = require("../firebase");
const { registrarAtividade } = require("../utils/atividade");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("clientes").get();

    const clientes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(clientes);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      nome,
      discord,
      whatsapp,
      valorPago,
      renovacao,
      bots,
    } = req.body;

    const novoCliente = {
      nome,
      discord,
      whatsapp,
      valorPago,
      renovacao,

      bots: bots || [],

      ativo: true,

      criadoEm: Date.now(),
    };

    const doc = await db
      .collection("clientes")
      .add(novoCliente);

    await registrarAtividade(
      `Novo cliente cadastrado: ${nome}`
    );

    res.json({
      id: doc.id,
      ...novoCliente,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { nome, discord, whatsapp, valorPago, renovacao, bots } = req.body;

    await db.collection("clientes").doc(id).update({
      nome,
      discord,
      whatsapp,
      valorPago,
      renovacao,
      bots,
    });
    await registrarAtividade(`Cliente atualizado: ${nome}`);
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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("clientes").doc(id).delete();

    await registrarAtividade("Cliente excluído");

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
