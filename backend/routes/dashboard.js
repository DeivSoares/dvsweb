const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

// =====================
// DASHBOARD + FINANCEIRO
// =====================
router.get("/", async (req, res) => {
  try {
    const clientesSnapshot = await db.collection("clientes").get();

    const clientes = clientesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // =====================
    // TOTAIS
    // =====================
    const totalClientes = clientes.length;

    let totalBots = 0;
    let totalSites = 0;

    // =====================
    // RECEITAS
    // =====================

    // Entrada inicial (instalação)
    let receitaInstalacaoBots = 0;
    let receitaInstalacaoSites = 0;

    // Mensal recorrente
    let receitaMensalBots = 0;
    let receitaMensalSites = 0;

    // Contar clientes com tipo BOT para licenças e servidores
    const totalLicencasServidores = clientes.filter(
      (c) => c.tipo === "bot" || c.tipo === "BOT"
    ).length;

    clientes.forEach((c) => {
      // =====================
      // BOTS (apenas para clientes tipo BOT)
      // =====================
      if (c.tipo === "bot" || c.tipo === "BOT") {
        const quantidadeBots = c.bots?.length || 0;

        totalBots += quantidadeBots;

        // instalação + primeira mensalidade do BOT
        receitaInstalacaoBots += Number(c.valorPago || 0);

        // mensalidade recorrente do BOT
        receitaMensalBots += Number(c.valorMensal || 0);
      }

      // =====================
      // SITES
      // =====================
      if (c.possuiSite) {
        totalSites += 1;

        // instalação do site
        receitaInstalacaoSites += Number(c.valorPagoSite || 0);

        // hospedagem / mensalidade site
        receitaMensalSites += Number(c.valorMensalSite || 0);
      }
    });

    // =====================
    // TOTAIS GERAIS
    // =====================
    const receitaInstalacaoTotal =
      receitaInstalacaoBots + receitaInstalacaoSites;

    const receitaMensalTotal =
      receitaMensalBots + receitaMensalSites;

    // =====================
    // GASTO MENSAL
    // =====================
    const financeiroDoc = await db
      .collection("config")
      .doc("financeiro")
      .get();

    const gastoMensal = financeiroDoc.exists
      ? Number(financeiroDoc.data().gastoMensal || 0)
      : 0;

    // =====================
    // LUCRO
    // =====================
    const lucro = receitaMensalTotal - gastoMensal;

    // =====================
    // RESPONSE
    // =====================
    res.json({
      // gerais
      clientes: totalClientes,

      // dashboard antigo
      licencas: totalLicencasServidores,
      servidores: totalLicencasServidores,

      // quantidades
      bots: totalBots,
      sites: totalSites,

      // =====================
      // BOTS
      // =====================
      receitaInstalacaoBots,
      receitaMensalBots,

      // =====================
      // SITES
      // =====================
      receitaInstalacaoSites,
      receitaMensalSites,

      // =====================
      // TOTAIS
      // =====================
      receitaInstalacaoTotal,
      receitaMensalTotal,

      // =====================
      // EMPRESA
      // =====================
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

    await db
      .collection("config")
      .doc("financeiro")
      .set({
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