/**
 * Middleware לבדיקת הרשאות משתמש
 * עובד רק אחרי authenticateToken - מניח שיש req.user
 */

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // בדיקה שיש משתמש מחובר (מה-authenticateToken middleware)
      if (!req.user) {
        return res.status(401).json({ 
          error: 'לא מחובר - נדרש אימות' 
        });
      }

      // בדיקה שיש role למשתמש
      if (!req.user.role) {
        return res.status(403).json({ 
          error: 'אין הרשאות מוגדרות למשתמש' 
        });
      }

      // אם allowedRoles הוא מחרוזת יחידה - הפוך למערך
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      // בדיקה שהמשתמש יש לו את ההרשאה הנדרשת
      if (!rolesArray.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'אין לך הרשאה לביצוע פעולה זו',
          required: rolesArray,
          current: req.user.role
        });
      }

      // הכל בסדר - ממשיך לפונקציה הבאה
      next();
      
    } catch (error) {
      console.error('Error in requireRole middleware:', error);
      return res.status(500).json({ 
        error: 'שגיאת שרת בבדיקת הרשאות' 
      });
    }
  };
};

module.exports = requireRole;