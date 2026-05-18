const express = require("express");

const { db } = require("../firebase");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("atividades")
      .orderBy("data", "desc")
      .limit(4)
      .get();

    const atividades =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    res.json(atividades);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Erro interno",
    });
  }
});

module.exports = router;