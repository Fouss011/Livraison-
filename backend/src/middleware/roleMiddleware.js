function requireRoles(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Accès refusé. Rôle non autorisé."
      });
    }

    next();
  };
}

module.exports = requireRoles;