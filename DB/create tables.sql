CREATE DATABASE IF NOT EXISTS fullstack7_db;

-- יצירת המשתמש עם סיסמה
CREATE USER IF NOT EXISTS 'shahi'@'localhost' IDENTIFIED BY 'shahi1212!';
CREATE USER IF NOT EXISTS 'shahi'@'%' IDENTIFIED BY 'shahi1212!';

-- מתן הרשאות מלאות על בסיס הנתונים
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX
ON fullstack7_db.*
TO 'shahi'@'localhost';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX
ON fullstack7_db.*
TO 'shahi'@'%';

FLUSH PRIVILEGES;

-- בחירת בסיס הנתונים
USE fullstack7_db;

-- מוחקים טבלאות ישנות בסדר הפוך לתלותים
DROP TABLE IF EXISTS challenge_participants;
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS passwords;
DROP TABLE IF EXISTS users;

-- טבלת משתמשים
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT,
    username TEXT,
    email TEXT,
    street TEXT,
    suite TEXT,
    city TEXT,
    zipcode TEXT,
    geo_lat TEXT,
    geo_lng TEXT,
    phone TEXT,
    company_name TEXT,
    catchPhrase TEXT,
    bs TEXT,
    role ENUM('user','coach') DEFAULT 'user',
    height DECIMAL(5,2),  -- גובה
    weight DECIMAL(5,2)   -- משקל
);

-- טבלת סיסמאות
CREATE TABLE passwords (
    user_id VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255),
    FOREIGN KEY(user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- טבלת אתגרים (צריכה להיות לפני todos)
CREATE TABLE challenges (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    goal INT NOT NULL,          -- כמות המשתתפים הדרושה
    progress INT DEFAULT 0,     -- כמה כבר סיימו
    deadline DATE,              -- דדליין
    media_url TEXT,             -- תמונה/וידאו של האתגר
    createdBy VARCHAR(255),     -- המאמן שיצר
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(createdBy) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- טבלת משימות (todos) – עכשיו יכולה להפנות ל-challenges
CREATE TABLE todos (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255),
    title TEXT,
    completed BOOLEAN DEFAULT FALSE,
    challengeId VARCHAR(255) NULL,  -- אם המשימה שייכת לאתגר
    FOREIGN KEY(userId) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(challengeId) REFERENCES challenges(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- טבלת פוסטים
CREATE TABLE posts (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255),
    title TEXT,
    body TEXT,
    image_url TEXT,  -- תמונה לפוסט
    FOREIGN KEY(userId) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- טבלת תגובות
CREATE TABLE comments (
    id VARCHAR(255) PRIMARY KEY,
    postId VARCHAR(255),
    name TEXT,
    email TEXT,
    body TEXT,
    userId VARCHAR(255),
    FOREIGN KEY(postId) REFERENCES posts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(userId) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- טבלת השתתפות באתגרים
CREATE TABLE challenge_participants (
    challengeId VARCHAR(255),
    userId VARCHAR(255),
    completed BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (challengeId, userId),
    FOREIGN KEY(challengeId) REFERENCES challenges(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(userId) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
