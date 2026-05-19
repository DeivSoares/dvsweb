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

    let totalClientes = clientes.length;

    let totalBots = 0;

    let receitaEntrada = 0; // valorPago
    let receitaMensal = 0; // valorMensal

    clientes.forEach((cliente) => {
      totalBots += cliente.bots?.length || 0;

      receitaEntrada += Number(cliente.valorPago || 0);
      receitaMensal += Number(cliente.valorMensal || 0);
    });

    const receitaTotalEstimada = receitaEntrada + receitaMensal;

    res.json({
      clientes: totalClientes,
      bots: totalBots,

      financeiro: {
        entrada: receitaEntrada,
        mensal: receitaMensal,
        total: receitaTotalEstimada,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

module.exports = router;