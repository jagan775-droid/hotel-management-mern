// Usage: authorize("admin", "manager")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user ? req.user.role : "guest"}' is not authorized for this action`);
    }
    next();
  };
};

module.exports = { authorize };
