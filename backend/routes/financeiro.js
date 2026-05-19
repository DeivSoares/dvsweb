const express = require("express");
const { db } = require("../firebase");
const router = express.Router();

// =====================
// PEGAR CONFIG
// =====================
router.get("/", async (req, res) => {
  try {
    const doc = await db.collection("financeiro").doc("config").get();

    res.json(doc.data() || { gastoMensal: 0 });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// =====================
// ATUALIZAR GASTO MENSAL
// =====================
router.put("/", async (req, res) => {
  try {
    const { gastoMensal } = req.body;

    await db.collection("financeiro").doc("config").set({
      gastoMensal: Number(gastoMensal || 0),
    });

    res.json({ sucesso: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;