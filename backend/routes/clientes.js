const express = require("express");

const { db } = require("../firebase");
const { registrarAtividade } = require("../utils/atividade");
const upload = require("../middleware/upload");
const { bucket } = require("../firebase");

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
    console.log(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// =====================
// CRIAR CLIENTE (COM UPLOAD)
// =====================
router.post("/", upload.single("comprovante"), async (req, res) => {
  try {
    const { nome, discord, whatsapp, valorPago, valorMensal, renovacao, bots } =
      req.body;

    let comprovanteUrl = "";

    if (req.file) {
      const file = bucket.file(
        `comprovantes/${Date.now()}_${req.file.originalname}`,
      );

      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
      });

      await file.makePublic();

      comprovanteUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    }

    // 🔥 FIX PRINCIPAL: parse do JSON vindo do FormData
    let botsParsed = [];

    try {
      botsParsed = JSON.parse(bots || "[]");
    } catch {
      botsParsed = [];
    }

    const novoCliente = {
      nome,
      discord,
      whatsapp,
      valorPago: Number(valorPago || 0),
      valorMensal: Number(valorMensal || 0),
      renovacao,
      bots: botsParsed,
      comprovanteUrl,
      ativo: true,
      criadoEm: Date.now(),
    };

    const doc = await db.collection("clientes").add(novoCliente);

    await registrarAtividade(`Novo cliente cadastrado: ${nome}`);

    res.json({ id: doc.id, ...novoCliente });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// =====================
// EDITAR CLIENTE
// =====================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { nome, discord, whatsapp, valorPago, valorMensal, renovacao, bots } =
      req.body;

    await db
      .collection("clientes")
      .doc(id)
      .update({
        nome,
        discord,
        whatsapp,
        valorPago: Number(valorPago || 0),
        valorMensal: Number(valorMensal || 0),
        renovacao,
        bots: bots || [],
      });

    await registrarAtividade(`Cliente atualizado: ${nome}`);

    res.json({ sucesso: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// =====================
// DELETAR CLIENTE
// =====================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection("clientes").doc(id).get();
    const cliente = doc.data();

    await db.collection("clientes").doc(id).delete();

    await registrarAtividade(`Cliente excluído: ${cliente?.nome || id}`);

    res.json({ sucesso: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;
