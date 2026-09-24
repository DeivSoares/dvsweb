function requireCEO(req, res, next) {
  if (req.user?.nivelAcesso !== "CEO") {
    return res.status(403).json({
      error: "Acesso negado",
      message: "Apenas usuários com nível CEO podem gerenciar usuários.",
    });
  }

  return next();
}

module.exports = requireCEO;