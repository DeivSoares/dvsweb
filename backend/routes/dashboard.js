const express = require("express");
const { db } = require("../firebase");

const router = express.Router();

// =====================
// DASHBOARD + FINANCEIRO
// =====================
router.get("/", async (req, res) => {
  try {
    const { mes } = req.query; // Formato: YYYY-MM

    const clientesSnapshot = await db.collection("clientes").get();

    const clientes = clientesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // =====================
    // FILTRAR CLIENTES POR MÊS (se aplicável)
    // =====================
    let clientesFiltrados = clientes;

    if (mes) {
      const mesAtual = new Date();
      const mesAtualFormatado = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, "0")}`;
      const ehMesAtual = mes === mesAtualFormatado;

      clientesFiltrados = clientes.filter((c) => {
        if (!c.criadoEm) return false;

        const dataCriacao = new Date(c.criadoEm);
        const mesCriacao = `${dataCriacao.getFullYear()}-${String(dataCriacao.getMonth() + 1).padStart(2, "0")}`;

        if (ehMesAtual) {
          // Se é mês atual, pega clientes criados em meses anteriores
          return mesCriacao < mes;
        } else {
          // Se é mês passado, pega clientes criados naquele mês
          return mesCriacao === mes;
        }
      });
    }

    // =====================
    // TOTAIS
    // =====================
    const totalClientes = clientesFiltrados.length;

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
    const totalLicencasServidores = clientesFiltrados.filter(
      (c) =>
        c.tipo === "bot" ||
        c.tipo === "BOT" ||
        c.tipo === "bot_site"
    ).length;

    clientesFiltrados.forEach((c) => {
      // =====================
      // BOTS (apenas para clientes tipo BOT ou bot_site)
      // =====================
      if (
        c.tipo === "bot" ||
        c.tipo === "BOT" ||
        c.tipo === "bot_site"
      ) {
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
    // DEBUG
    // =====================
    console.log("=== DASHBOARD DEBUG ===");
    console.log("Mês selecionado:", mes || "Todos os clientes");
    console.log("Total Clientes (filtrado):", totalClientes);
    console.log("Clientes BOT:", totalLicencasServidores);
    console.log("Clientes com Site:", clientes.filter(c => c.possuiSite).length);
    console.log("Receita Instalação Bots:", receitaInstalacaoBots);
    console.log("Receita Mensal Bots:", receitaMensalBots);
    console.log("Receita Instalação Sites:", receitaInstalacaoSites);
    console.log("Receita Mensal Sites:", receitaMensalSites);
    console.log("=======================");

    // =====================
    // RESPONSE
    // =====================
    res.json({
      // gerais
      clientes: totalClientes,
      mesSelecionado: mes || null,

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
      receitaInstalacaoTotal: receitaInstalacaoBots + receitaInstalacaoSites,
      receitaMensalTotal: receitaMensalBots + receitaMensalSites,

      // =====================
      // EMPRESA
      // =====================
      gastoMensal,
      lucro: (receitaMensalBots + receitaMensalSites) - gastoMensal,
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