const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const currentRole = String(req.user.role || "")
      .trim()
      .toLowerCase();

    const allowed = allowedRoles.map((role) =>
      String(role).trim().toLowerCase()
    );

    if (!currentRole) {
      return res.status(403).json({
        message: "User role is not configured",
      });
    }

    if (!allowed.includes(currentRole)) {
      console.log(
        `ROLE DENIED: user=${req.user.id}, actual=${currentRole}, allowed=${allowed.join(", ")}`
      );

      return res.status(403).json({
        message: "You are not authorized to access this resource",
      });
    }

    next();
  };
};

export { allowRoles };