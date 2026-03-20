// src/middleware/role.middleware.js

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // if no specific roles passed, just continue
    if (!allowedRoles.length) {
      return next();
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
}

export default requireRole;
