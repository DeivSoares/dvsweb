const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

// =====================
// GET DASHBOARD + FINANCEIRO
// =====================
router.get("/", async (req, res) => {
  try {
    const clientesSnapshot = await db.collection("clientes").get();

    const clientes = clientesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    let totalMensal = 0;
    let totalClientes = clientes.length;
    let totalBots = 0;

    clientes.forEach((c) => {
      totalMensal += Number(c.valorMensal || 0);
      totalBots += c.bots?.length || 0;
    });

    // pega gasto mensal salvo
    const financeiroDoc = await db.collection("config").doc("financeiro").get();

    const gastoMensal = financeiroDoc.exists
      ? financeiroDoc.data().gastoMensal || 0
      : 0;

    const lucro = totalMensal - gastoMensal;

    res.json({
      clientes: totalClientes,
      bots: totalBots,
      receitaMensal: totalMensal,
      gastoMensal,
      lucro,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// =====================
// SET GASTO MENSAL
// =====================
router.put("/financeiro", async (req, res) => {
  try {
    const { gastoMensal } = req.body;

    await db.collection("config").doc("financeiro").set({
      gastoMensal: Number(gastoMensal || 0),
    });

    res.json({ sucesso: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;