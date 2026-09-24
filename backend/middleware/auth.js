const { auth } = require("../firebase");

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Não autenticado",
      message: "Envie um token Bearer válido.",
    });
  }

  try {
    req.user = await auth.verifyIdToken(token);
    return next();
  } catch (error) {
    console.error("Token Firebase inválido:", error.code || error.message);

    return res.status(401).json({
      error: "Não autenticado",
      message: "Sua sessão expirou. Faça login novamente.",
    });
  }
}

module.exports = authenticate;