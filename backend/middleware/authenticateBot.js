const crypto = require("crypto");

function authenticateBot(req, res, next) {
  const expectedKey = process.env.BOT_API_KEY?.trim();
  const providedKey = req.get("x-api-key");

  if (!expectedKey) {
    console.error("BOT_API_KEY não configurada.");
    return res.status(503).json({ error: "Integração do bot indisponível" });
  }

  if (typeof providedKey !== "string") {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const expected = Buffer.from(expectedKey);
  const provided = Buffer.from(providedKey);
  if (
    expected.length !== provided.length ||
    !crypto.timingSafeEqual(expected, provided)
  ) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  return next();
}

module.exports = authenticateBot;
