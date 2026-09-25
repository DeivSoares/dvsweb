const DEVELOPER_LEVELS = ["Desenvolvedor", "Administrador", "CEO"];

function requireDeveloperAccess(req, res, next) {
  if (!DEVELOPER_LEVELS.includes(req.user?.nivelAcesso)) {
    return res.status(403).json({
      error: "Acesso negado",
      message: "Apenas usuários Desenvolvedor, Administrador ou CEO podem alterar bots.",
    });
  }

  return next();
}

module.exports = requireDeveloperAccess;