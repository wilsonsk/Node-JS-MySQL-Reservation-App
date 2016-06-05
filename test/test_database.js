var assert = require('chai').assert;
var chai = require('chai');
var app = require('../server.js');
var request = require ('supertest');
var should = chai.should();

var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'localhost',
  user  : 'root',
  password: 'default',
  database: 'test'
});

var dataBase = "test";
module.exports.dB = dataBase;
module.exports.pool = pool;

//Create tables for testing
pool.getConnection(function(err, connection) {
  connection.query('DROP TABLE IF EXISTS `food_test`;', function(err){
		if(err){
			throw err;
		}
  });
  
  connection.query('DROP TABLE IF EXISTS `business_test`;', function(err){
		if(err){
			throw err;
		}
  });
  
  connection.query('CREATE TABLE `business_test` (' + 
  	'`id` INT PRIMARY KEY AUTO_INCREMENT,' + 
  	'`name` VARCHAR(255) NOT NULL,' +
  	'`street_address` VARCHAR(255) NOT NULL,' +
  	'`city` VARCHAR(255) NOT NULL,' +
  	'`state` CHAR(2) NOT NULL,' +
  	'`zip` VARCHAR(5) NOT NULL,' +
  	'`specific_location` VARCHAR(255),' +
  	'UNIQUE KEY (street_address)' +
    ') ENGINE = InnoDB DEFAULT CHARSET = utf8;', function(err){
  		if(err){
  			throw err;
  		}
  });
  
  connection.query('CREATE TABLE `food_test` (' + 
  	'`id` INT PRIMARY KEY AUTO_INCREMENT,' + 
  	'`bid` INT NOT NULL,' +
  	'`type` VARCHAR(255) NOT NULL,' +
  	'`quantity` INT UNSIGNED NOT NULL,' +
  	'`availability_start` DATETIME NOT NULL,' +
  	'`availability_end` DATETIME NOT NULL,' +
  	'FOREIGN KEY (bid) REFERENCES business_test(id) ON UPDATE CASCADE,' +
  	'UNIQUE KEY (bid, `type`)' +
    ') ENGINE = InnoDB DEFAULT CHARSET = utf8;', function(err){
  		if(err){
  			throw err;
  		}
  });
        
  connection.release();
});



//Test suite "No Food Left Behind"
describe("No Food Left Behind Database Test", function() {
  
  describe('Test CRUD functionality of business table', function () {
    //Set up database here with dummy data
    before(function(done) {
      //Allow query enough time to execute
      setTimeout(function() {
        //Code to populate test table here before test
        pool.getConnection(function(err, connection) {
          connection.query('INSERT INTO business_test (`name`, `street_address`, `city`, `state`, `zip`, `specific_location`)' +
            'VALUES ("Whole Foods","2342 tanasbourne","Hillsboro","OR","97006","talk to cashier");', function(err){
        		if(err){
        			throw err;
        		}
          });
          
          connection.release();
          done(); 
        });
      }, 1000);
    });
    
    it('Should select and return one row with expected record', function (done) {
      pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM business_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
          console.log(rows.length);
      		assert.equal(rows.length, "1");
      		assert.equal(rows[0].id, "1");
      		assert.equal(rows[0].name, "Whole Foods");
      		assert.equal(rows[0].street_address, "2342 tanasbourne");
      		assert.equal(rows[0].city, "Hillsboro");
      		assert.equal(rows[0].state, "OR");
      		assert.equal(rows[0].zip, "97006");
      		assert.equal(rows[0].specific_location, "talk to cashier");
      		done();
        });
        
        connection.release();
      });
    });
    
    it('Should insert a valid record', function (done) {
      pool.getConnection(function(err, connection) {
        connection.query('INSERT INTO business_test (`name`, `street_address`, `city`, `state`, `zip`, `specific_location`)' +
          'VALUES ("Safeway","1010 SW Jefferson St","Portland","OR","97201","talk to cashier");');
          
        connection.query('SELECT * FROM business_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
      		
      		console.log("hi");
      		console.log("rows[0].name: " + rows[0].name);
          
      		assert.equal(rows.length, "2");
      		assert.equal(rows[1].id, "2");
      		assert.equal(rows[1].name, "Safeway");
      		assert.equal(rows[1].street_address, "1010 SW Jefferson St");
      		assert.equal(rows[1].city, "Portland");
      		assert.equal(rows[1].state, "OR");
      		assert.equal(rows[1].zip, "97201");
      		assert.equal(rows[1].specific_location, "talk to cashier");
      		done();
        });
        
        connection.release();
      });
    });
    
    it('Should not insert a record with duplicate street address', function (done) {
      pool.getConnection(function(err, connection) {
        connection.query('INSERT INTO business_test (`name`, `street_address`, `city`, `state`, `zip`, `specific_location`)' +
          'VALUES ("Safeway","1010 SW Jefferson St","Portland","OR","97201","talk to cashier");');
          
        connection.query('SELECT * FROM business_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
          
      		assert.equal(rows.length, "2");
      		done();
        });
        
        connection.release();
      });
    });
    
    it('Should update the second record', function (done) {
      pool.getConnection(function(err, connection) {
        connection.query('UPDATE business_test SET specific_location = "talk to manager" WHERE id = 2;');
          
        connection.query('SELECT * FROM business_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
          
      		assert.equal(rows.length, "2");
      		assert.equal(rows[1].specific_location, "talk to manager");
      		done();
        });
        
        connection.release();
      });
    });
    
    it('Should delete the second record', function (done) {
      pool.getConnection(function(err, connection) {
        connection.query('DELETE FROM business_test WHERE id = 2;');
          
        connection.query('SELECT * FROM business_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
          
      		assert.equal(rows.length, "1");
      		assert.equal(rows[0].id, "1");
      		done();
        });
        
        connection.release();
      });
    });
  });
  
  describe('Test CRUD functionality of food table', function () {
    //Set up database here with dummy data
    before(function(done) {
      // Allow query enough time to execute
      setTimeout(function() {
        //Code to populate test table here before test
        pool.getConnection(function(err, connection) {
          connection.query('INSERT INTO food_test (`bid`, `type`, `quantity`, `availability_start`, `availability_end`)' +
            'VALUES ("1","bread","5","2016-08-12 13:30:00","2016-08-12 18:00:00");', function(err){
        		if(err){
        			throw err;
        		}
          });
          
          connection.release();
          done();
        });
      }, 1000);
    });
      
    it('Should select and return one row with expected record', function(done) {
      pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM food_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
          
      		assert.equal(rows.length, "1");
      		assert.equal(rows[0].id, "1");
      		assert.equal(rows[0].bid, "1");
      		assert.equal(rows[0].type, "bread");
      		assert.equal(rows[0].quantity, "5");
      		assert.equal(String(rows[0].availability_start), "Fri Aug 12 2016 13:30:00 GMT+0000 (UTC)");
      		assert.equal(String(rows[0].availability_end), "Fri Aug 12 2016 18:00:00 GMT+0000 (UTC)");
      		done();
        });
        
        connection.release();
      });
    });
    
    it('Should insert a valid record', function(done) {
      pool.getConnection(function(err, connection) {
        connection.query('INSERT INTO food_test (`bid`, `type`, `quantity`, `availability_start`, `availability_end`)' +
          'VALUES ("1","apples","20","2016-08-13 16:30:00","2016-08-13 20:00:00");');
        
        connection.query('SELECT * FROM food_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
          
      		assert.equal(rows.length, "2");
      		assert.equal(rows[1].id, "2");
      		assert.equal(rows[1].bid, "1");
      		assert.equal(rows[1].type, "apples");
      		assert.equal(rows[1].quantity, "20");
      		assert.equal(String(rows[1].availability_start), "Sat Aug 13 2016 16:30:00 GMT+0000 (UTC)");
      		assert.equal(String(rows[1].availability_end), "Sat Aug 13 2016 20:00:00 GMT+0000 (UTC)");
      		done();
        });
        
        connection.release();
      });
    });
    
    it('Should not insert a record with duplicate bid and type', function(done) {
      pool.getConnection(function(err, connection) {
        connection.query('INSERT INTO food_test (`bid`, `type`, `quantity`, `availability_start`, `availability_end`)' +
          'VALUES ("1","apples","20","2016-08-13 16:30:00","2016-08-13 20:00:00");');
        
        connection.query('SELECT * FROM food_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
          
      		assert.equal(rows.length, "2");
      		done();
        });
        
        connection.release();
      });
    });
    
    it('Should update the second record', function(done) {
      pool.getConnection(function(err, connection) {
        connection.query('UPDATE food_test SET quantity = "19" WHERE id = 2;');
          
        connection.query('SELECT * FROM food_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
          
      		assert.equal(rows.length, "2");
      		assert.equal(rows[1].quantity, "19");
      		done();
        });
        
        connection.release();
      });
    });
    
    it('Should delete the second record', function(done) {
      pool.getConnection(function(err, connection) {
        connection.query('DELETE FROM food_test WHERE id = 2;');
          
        connection.query('SELECT * FROM food_test;', function(err, rows, fields){
      		if(err){
      			throw err;
      		}
          
      		assert.equal(rows.length, "1");
      		assert.equal(rows[0].id, "1");
      		done();
        });
        
        connection.release();
      });
    });
  });
});
