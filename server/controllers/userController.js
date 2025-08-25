const db = require('../models/db');

/**
 * GET /users/me - קבלת פרופיל המשתמש הנוכחי
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // מהJWT token

    const [users] = await db.query(
      'SELECT id, name, username, email, street, suite, city, zipcode, geo_lat, geo_lng, phone, company_name, catchPhrase, bs, role, height, weight FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }

    const user = users[0];
    
    res.status(200).json({
      message: 'פרופיל נמצא בהצלחה',
      user: user
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ error: 'שגיאת שרת בקבלת פרופיל' });
  }
};

/**
 * PUT /users/me - עדכון פרופיל המשתמש הנוכחי
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // מהJWT token
    const {
      name, email, street, suite, city, zipcode, 
      geo_lat, geo_lng, phone, company_name, 
      catchPhrase, bs, height, weight
    } = req.body;

    // ולידציות נוספות
    if (height && (height < 0 || height > 300)) {
      return res.status(400).json({ error: 'גובה לא תקין (0-300 ס"מ)' });
    }
    
    if (weight && (weight < 0 || weight > 500)) {
      return res.status(400).json({ error: 'משקל לא תקין (0-500 ק"ג)' });
    }

    if (zipcode && !/^\d{5,7}$/.test(zipcode.toString())) {
      return res.status(400).json({ error: 'מיקוד לא תקין (5-7 ספרות)' });
    }

    if (geo_lat && (parseFloat(geo_lat) < -90 || parseFloat(geo_lat) > 90)) {
      return res.status(400).json({ error: 'קואורדינטת רוחב לא תקינה (-90 עד 90)' });
    }

    if (geo_lng && (parseFloat(geo_lng) < -180 || parseFloat(geo_lng) > 180)) {
      return res.status(400).json({ error: 'קואורדינטת אורך לא תקינה (-180 עד 180)' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'כתובת אימייל לא תקינה' });
    }

    // עדכון הפרופיל (בלי role - זה קבוע)
    await db.query(
      `UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        street = COALESCE(?, street),
        suite = COALESCE(?, suite),
        city = COALESCE(?, city),
        zipcode = COALESCE(?, zipcode),
        geo_lat = COALESCE(?, geo_lat),
        geo_lng = COALESCE(?, geo_lng),
        phone = COALESCE(?, phone),
        company_name = COALESCE(?, company_name),
        catchPhrase = COALESCE(?, catchPhrase),
        bs = COALESCE(?, bs),
        height = COALESCE(?, height),
        weight = COALESCE(?, weight)
       WHERE id = ?`,
      [
        name, email, street, suite, city, zipcode, 
        geo_lat, geo_lng, phone, company_name, 
        catchPhrase, bs, height, weight, userId
      ]
    );

    // החזרת הפרופיל המעודכן
    const [updatedUsers] = await db.query(
      'SELECT id, name, username, email, street, suite, city, zipcode, geo_lat, geo_lng, phone, company_name, catchPhrase, bs, role, height, weight FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      message: 'פרופיל עודכן בהצלחה',
      user: updatedUsers[0]
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ error: 'שגיאת שרת בעדכון פרופיל' });
  }
};

/**
 * GET /users/:userId - צפייה בפרופיל ציבורי של משתמש אחר
 * רק מידע בסיסי שרלוונטי לפוסטים ותגובות
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // רק מידע ציבורי מינימלי - לא מידע פרטי!
    const [users] = await db.query(
      'SELECT id, name, username, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }

    const user = users[0];

    res.status(200).json({
      message: 'פרופיל ציבורי נמצא בהצלחה',
      user: user
    });

  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ error: 'שגיאת שרת בקבלת פרופיל' });
  }
};

/**
 * DELETE /users/me - מחיקת החשבון שלי לצמיתות
 * מחק את המשתמש + כל הקונטנט הקשור (CASCADE)
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // מה-JWT token

    // בדיקה שהמשתמש קיים
    const [existingUsers] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }

    // מחיקת המשתמש - CASCADE ימחק אוטומטית:
    // ✅ passwords (user_id) 
    // ✅ posts (userId) -> comments (postId) גם נמחקות
    // ✅ comments (userId)
    // ✅ todos (userId) 
    // ✅ challenges (createdBy) -> challenge_participants גם נמחקות
    // ✅ challenge_participants (userId)
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.status(200).json({ 
      message: 'חשבון נמחק בהצלחה',
      deleted: {
        user: true,
        posts: 'נמחקו אוטומטית',
        comments: 'נמחקו אוטומטית', 
        todos: 'נמחקו אוטומטית',
        challenges: 'נמחקו אוטומטית (אם היית מאמן)',
        passwords: 'נמחקו אוטומטית'
      }
    });

  } catch (error) {
    console.error('Error in deleteAccount:', error);
    res.status(500).json({ error: 'שגיאת שרת במחיקת חשבון' });
  }
};