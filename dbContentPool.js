var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'localhost',
  user  : 'student',
  password: 'default',
  database: 'student'
});

var dataBase = "cs361";
module.exports.dB = dataBase;
module.exports.pool = pool;