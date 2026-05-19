const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

// =====================
// DASHBOARD PRINCIPAL
// =====================
router.get("/", async (req, res) => {
  try {
    const clientesSnapshot = await db.collection("clientes").get();

    const clientes = clientesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalClientes = clientes.length;

    let totalBots = 0;
    let totalMensal = 0;

    clientes.forEach((c) => {
      totalBots += c.bots?.length || 0;
      totalMensal += Number(c.valorMensal || 0);
    });

    // financeiro (gasto da empresa)
    const financeiroDoc = await db
      .collection("config")
      .doc("financeiro")
      .get();

    const gastoMensal =
      financeiroDoc.exists
        ? Number(financeiroDoc.data().gastoMensal || 0)
        : 0;

    const lucro = totalMensal - gastoMensal;

    res.json({
      clientes: totalClientes,

      // 🔥 compatibilidade com seu sistema antigo
      licencas: totalClientes,
      servidores: totalClientes,

      // novos dados
      bots: totalBots,
      receitaMensal: totalMensal,
      gastoMensal,
      lucro,
    });
  } catch (err) {
    console.log("Erro dashboard:", err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

// =====================
// DEFINIR GASTO MENSAL
// =====================
router.put("/financeiro", async (req, res) => {
  try {
    const { gastoMensal } = req.body;

    await db.collection("config").doc("financeiro").set({
      gastoMensal: Number(gastoMensal || 0),
      atualizadoEm: Date.now(),
    });

    res.json({
      sucesso: true,
    });
  } catch (err) {
    console.log("Erro financeiro:", err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

module.exports = router;