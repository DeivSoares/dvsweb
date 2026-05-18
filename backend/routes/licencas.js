const express = require("express");

const { db } = require("../firebase");

const router = express.Router();

router.post("/criar", async (req, res) => {
  try {
    const {
      clienteId,
      dias,
      botId,
    } = req.body;

    const expira = Date.now() + (
      dias * 86400000
    );

    await db.collection("licencas").add({
      clienteId,
      botId,
      ativa: true,
      expira,
      criadoEm: Date.now(),
    });

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

router.get("/validar/:botId", async (req, res) => {
  try {
    const { botId } = req.params;

    const snapshot = await db
      .collection("licencas")
      .where("botId", "==", botId)
      .where("ativa", "==", true)
      .get();

    if (snapshot.empty) {
      return res.json({
        valida: false,
      });
    }

    const licenca = snapshot.docs[0].data();

    if (Date.now() > licenca.expira) {
      return res.json({
        valida: false,
        motivo: "expirada",
      });
    }

    res.json({
      valida: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

module.exports = router;