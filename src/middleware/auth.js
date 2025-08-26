const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
  return (req, res, next) => {
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ error: "[ERRO] :: Token necessário." });

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return res.status(401).json({ error: "[ERRO] :: Formato do token inválido." });

    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "[ERRO] :: Acesso negado." });
      }
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "[ERRO] :: Token inválido." });
    }
  };
};
