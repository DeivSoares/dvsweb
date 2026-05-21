const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const clientesSnapshot = await db.collection("clientes").get();

    const clientes = clientesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalClientes = clientes.length;

    let totalBots = 0;
    let totalSites = 0;

    // 💰 RECEITAS
    let receitaInstalacao = 0;
    let receitaMensal = 0;
    let receitaBots = 0;
    let receitaSites = 0;

    clientes.forEach((c) => {
      totalBots += c.bots?.length || 0;
      totalSites += c.possuiSite ? 1 : 0;
      // entrada (instalação + primeira mensalidade)
      receitaInstalacao += Number(c.valorPago || 0);

      // recorrência (mensalidade real)
      receitaMensal += Number(c.valorMensal || 0);
    });

    // gasto mensal da empresa
    const financeiroDoc = await db.collection("config").doc("financeiro").get();

    const gastoMensal = financeiroDoc.exists
      ? Number(financeiroDoc.data().gastoMensal || 0)
      : 0;

    // lucro baseado no mensal recorrente
    const lucro = receitaMensal - gastoMensal;

    res.json({
      clientes: totalClientes,

      // compatibilidade antiga
      licencas: totalClientes,
      servidores: totalClientes,
      sites: totalSites,

      bots: totalBots,

      // 🔥 NOVO MODELO FINANCEIRO
      receitaInstalacao,
      receitaMensal, // <-- ESSA é a importante (MRR)

      gastoMensal,
      lucro,

      receitaBots,
      receitaSites,
    });
  } catch (err) {
    console.log("Erro dashboard:", err);

    res.status(500).json({ error: "Erro interno" });
  }
});

// =====================
// DEFINIR GASTO MENSAL
// =====================
router.put("/financeiro", async (req, res) => {
  try {
    const { gastoMensal } = req.body;

    await db
      .collection("config")
      .doc("financeiro")
      .set({
        gastoMensal: Number(gastoMensal || 0),
        atualizadoEm: Date.now(),
      });

    res.json({ sucesso: true });
  } catch (err) {
    console.log("Erro financeiro:", err);

    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;
