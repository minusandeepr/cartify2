export default async function adminLogger(req, res, next) {
  try {
    
    const user = req.user;
    if (!user || user.role !== "admin") {
      
      return next();
    }

    
    const action = {
      adminId: user.id ?? user._id ?? null,
      username: user.username ?? user.email ?? "unknown",
      method: req.method,
      path: req.originalUrl || req.url,
      body: req.body ? JSON.stringify(req.body).slice(0, 2000) : null,
      ip: req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || null,
      createdAt: new Date()
    };

    
    req.adminAction = action;

    next();
  } catch (err) {
    console.error("adminLogger error:", err);
    next();
  }
}
