const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("📦 Token z hlavičky:", token); // 👈 DEBUG 1
  console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET); // 👈 DEBUG 2

  if (!token) {
    return res.status(401).json({ message: "Token chybí" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ JWT ověřování selhalo:", err.name, err.message); // 👈 DEBUG 3
      return res.status(403).json({ message: "Neplatný nebo expirovaný token" });
    }

    console.log("✅ JWT ověřený. Payload:", decoded); // ✅ DEBUG 4

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  });
}

module.exports = authenticateToken;
