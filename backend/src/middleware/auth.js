import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token em falta." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.user_id;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

export function requireAdminKey(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!key || key !== process.env.ADMIN_CONFIRM_KEY) {
    return res.status(403).json({ error: "Chave de administração inválida." });
  }
  next();
}
