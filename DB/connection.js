const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'shahi',
  password: 'shahi1212!',
  database: 'fullstack7_db'
});

connection.connect((err) => {
  if (err) {
    console.error('שגיאה בהתחברות לבסיס נתונים:', err);
    return;
  }
  console.log('התחברות מוצלחת לבסיס הנתונים!');
});

module.exports = connection;