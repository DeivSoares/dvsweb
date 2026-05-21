const express = require("express");

const { db } = require("../firebase");
const { registrarAtividade } = require("../utils/atividade");

const router = express.Router();

// =====================
// LISTAR CLIENTES
// =====================
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("clientes").get();

    const clientes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(clientes);
  } catch (err) {
    console.log("Erro listar clientes:", err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

// =====================
// CRIAR CLIENTE
// =====================
router.post("/", async (req, res) => {
  try {
    const {
      nome,
      discord,
      whatsapp,

      valorPago,
      valorMensal,

      renovacao,

      bots,

      comprovanteUrl,

      possuiSite,
      site,
      valorMensalSite,
      valorPagoSite,

      tipo,
    } = req.body;

    const novoCliente = {
      nome: nome || "",

      discord: discord || "",

      whatsapp: whatsapp || "",

      // =====================
      // BOT
      // =====================
      valorPago: Number(valorPago || 0),

      valorMensal: Number(valorMensal || 0),

      bots: Array.isArray(bots) ? bots : [],

      // =====================
      // SITE
      // =====================
      possuiSite: Boolean(possuiSite),

      site: site || "",

      valorMensalSite: Number(valorMensalSite || 0),

      valorPagoSite: Number(valorPagoSite || 0),

      // =====================
      // OUTROS
      // =====================
      comprovanteUrl: comprovanteUrl || "",

      renovacao: renovacao || "",

      tipo: tipo || "bot",

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
    console.log("Erro criar cliente:", err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

// =====================
// EDITAR CLIENTE
// =====================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      discord,
      whatsapp,

      valorPago,
      valorMensal,

      renovacao,

      bots,

      comprovanteUrl,

      possuiSite,
      site,
      valorMensalSite,
      valorPagoSite,

      tipo,
    } = req.body;

    await db
      .collection("clientes")
      .doc(id)
      .update({
        nome: nome || "",

        discord: discord || "",

        whatsapp: whatsapp || "",

        // =====================
        // BOT
        // =====================
        valorPago: Number(valorPago || 0),

        valorMensal: Number(valorMensal || 0),

        bots: Array.isArray(bots) ? bots : [],

        // =====================
        // SITE
        // =====================
        possuiSite: Boolean(possuiSite),

        site: site || "",

        valorMensalSite: Number(valorMensalSite || 0),

        valorPagoSite: Number(valorPagoSite || 0),

        // =====================
        // OUTROS
        // =====================
        comprovanteUrl: comprovanteUrl || "",

        renovacao: renovacao || "",

        tipo: tipo || "bot",

        atualizadoEm: Date.now(),
      });

    await registrarAtividade(
      `Cliente atualizado: ${nome}`
    );

    res.json({
      sucesso: true,
    });
  } catch (err) {
    console.log("Erro editar cliente:", err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

// =====================
// DELETAR CLIENTE
// =====================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const clienteDoc = await db
      .collection("clientes")
      .doc(id)
      .get();

    const cliente = clienteDoc.data();

    await db
      .collection("clientes")
      .doc(id)
      .delete();

    await registrarAtividade(
      `Cliente excluído: ${cliente?.nome || id}`
    );

    res.json({
      sucesso: true,
    });
  } catch (err) {
    console.log("Erro deletar cliente:", err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

module.exports = router;