const express = require("express");

const { db } = require("../firebase");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const clientesSnapshot =
      await db
        .collection("clientes")
        .get();

    const clientes =
      clientesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    const totalClientes =
      clientes.length;

    const totalLicencas =
      clientes.length;

    const totalServidores =
      clientes.length;

    let totalBots = 0;

    clientes.forEach((cliente) => {
      totalBots +=
        cliente.bots?.length || 0;
    });

    res.json({
      clientes: totalClientes,
      licencas: totalLicencas,
      servidores: totalServidores,
      bots: totalBots,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

module.exports = router;