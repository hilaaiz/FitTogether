const jwt = require('jsonwebtoken');

/**
 * Middleware לאימות JWT
 * בודק אם בבקשה נשלח token בכותרת Authorization
 * אם כן – מוודא שהחתימה נכונה ומחזיר את ה־payload ל־req.user
 * אחרת – מחזיר שגיאת 401/403
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // מחפש כותרת Authorization
  const token = authHeader && authHeader.split(' ')[1]; // מצפה ל-"Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    // שומר את המידע מתוך ה-token בבקשה, כך שנוכל להשתמש בו ב־controllers
    req.user = user; // user = { id, role, iat, exp }
    next();
  });
}

module.exports = authenticateToken;
