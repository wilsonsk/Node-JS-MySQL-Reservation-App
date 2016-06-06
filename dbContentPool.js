 var mysql = require('mysql');
 var pool = mysql.createPool({
   host  : 'localhost',
   user  : 'root',
   //password: 'default',
   database: 'cs361'
 });

 var dataBase = "cs361";
 module.exports.dB = dataBase;
 module.exports.pool = pool;

/*
//Connect to our Cloud9 MySQL instance for now, change it to AWS when we finalize
//Also, we won't be able to use OSU's MySQL because it doesn't allow connections from non-OSU IP addresses.
//Ex: Can connect from our OSU ENGR webspace, but nowhere else.
var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'localhost',
  user  : 'root',
  password: 'default',
  database: 'c9'
});

var dataBase = "c9";
module.exports.dB = dataBase;
module.exports.pool = pool;
*/
