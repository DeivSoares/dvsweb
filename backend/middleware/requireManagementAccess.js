const MANAGEMENT_LEVELS = ["CEO", "Administrador"];

function requireManagementAccess(req, res, next) {
  if (!MANAGEMENT_LEVELS.includes(req.user?.nivelAcesso)) {
    return res.status(403).json({
      error: "Acesso negado",
      message: "Apenas usuários CEO ou Administrador podem acessar esta área.",
    });
  }

  return next();
}

module.exports = requireManagementAccess;