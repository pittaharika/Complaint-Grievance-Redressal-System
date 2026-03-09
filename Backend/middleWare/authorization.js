module.exports = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      console.log(`[AUTH DENIED] No user or role in token. Path: ${req.path}`);
      return res.status(403).json({ message: "Access denied. Role missing." });
    }

    const userRole = req.user.role.toUpperCase();
    const allowedRoles = roles.map(role => role.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      console.log(`[AUTH DENIED] Path: ${req.path}, Method: ${req.method}`);
      console.log(`[AUTH DENIED] User Role: "${userRole}", Allowed Roles: ${JSON.stringify(allowedRoles)}`);
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
