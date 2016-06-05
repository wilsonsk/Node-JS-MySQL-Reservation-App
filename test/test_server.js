//var assert = require('chai').assert;
var chai = require('chai');
var chaiHttp = require('chai-http');
var request = require ('supertest');
var should = chai.should();
chai.use(chaiHttp);

var app = require('../server.js');
var business_model = require('../models/business');
var mysql = require('../dbContentPool.js');

//Prior to writing the tests the database was pre-populated
//
//Business table:
//+-----+---------------+------------------+-----------+-------+-------+-------------------+
//| id  | name          | street_address   | city      | state | zip   | specific_location |
//+-----+---------------+------------------+-----------+-------+-------+-------------------+
//|   1 | whole foods   | 2342 tanasbourne | hillsboro | OR    | 97006 | talk to cashier   |
//|   2 | Subway        | 1111 ne 43       | portland  | OR    | 97229 | out back          |
//|   4 | Bob's Burgers | 6241 Oceanside   | San Diego | CA    | 93117 | next to dumpster  |
//+-----+---------------+------------------+-----------+-------+-------+-------------------+
//
//Food table:
//+----+-----+---------+----------+---------------------+---------------------+
//| id | bid | type    | quantity | availability_start  | availability_end    |
//+----+-----+---------+----------+---------------------+---------------------+
//|  1 |   1 | apples  |        8 | 0000-00-00 00:00:00 | 0000-00-00 00:00:00 |
//|  2 |   2 | bread   |       15 | 0000-00-00 00:00:00 | 0000-00-00 00:00:00 |
//|  3 |   4 | burgers |        5 | 2016-06-01 17:30:00 | 2016-06-01 19:30:00 |
//+----+-----+---------+----------+---------------------+---------------------+

describe("No Food Left Behind Server Test", function() {
  
  //GET /incorrect/route
  //We should expect status code 404 for a incorrect route.
  describe("GET /incorrect/route", function() {
    
    it("Should return status code 404", function(done) {
      chai.request(app)
        .get('/incorrect/route')
        .end(function(err,res){
          res.should.have.status(404);
          res.should.be.html;
          res.text.should.include('Error 404 - Page Not Found');
          done();
        })
    });
  });
  
  
  //GET /
  //We should expect status code 200 for a successful render of the Home page.
  describe("GET /", function() {
    
    it("Should return status code 200 and contain appropriate text", function(done) {
      chai.request(app)
        .get('/')
        .end(function(err,res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include('No Food Left Behind');
          done();
        })
    });
  });
  
  
  //GET /contact
  //We should expect status code 200 for a successful render of the Contact page.
  describe("GET /contact", function() {
    
    it("Should return status code 200 and contain appropriate text", function(done) {
      chai.request(app)
        .get('/contact')
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include('Contact Us');
          done();
        })
    });
  });
  
  
  //GET /about
  //We should expect status code 200 for a successful render of the About page.
  describe("GET /about", function() {
    
    it("Should return status code 200 and contain appropriate text", function(done) {
      chai.request(app)
        .get('/about')
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include('About Us');
          done();
        })
    });
  });
  
  
  //GET /Donors/business
  //We should expect status code 200 for a successful render of the View Business page.
  describe("GET /Donors/business", function() {
    
    before(function(done){
      
      mysql.pool.query('INSERT INTO business (`name`, `street_address`, `city`, `state`, `zip`, `specific_location`)' +
            'VALUES ("Safeway","1010 SW Jefferson St","Portland","OR","97201","talk to cashier")', function(err, rows, fields){
  	  	if(err){
  	  		return;
  	  	}
  	  });
      
      done();
    });
    
    after(function(done){
      //Remove record from database to avoid duplicate entry error when running test again
	  	mysql.pool.query('DELETE FROM business where street_address = "1010 SW Jefferson St"', function(err, rows, fields){
    		if(err){
    			return;
    		}
    	});
      
      done();
    });
    
    
    it("Should return status code 200 and contain appropriate records", function(done) {
      chai.request(app)
        .get('/Donors/business')
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Safeway");
          res.text.should.include("1010 SW Jefferson St");
          res.text.should.include("Portland");
          res.text.should.include("OR");
          res.text.should.include("97201");
          res.text.should.include("talk to cashier");
          done();
        })
    });
  });
  
  
  //POST /Donors/business
  describe("POST /Donors/business", function() {
    
    it("Should alert user to 'Pick a Specific Donor'", function(done) {
      chai.request(app)
        .post('/Donors/business/')
        .send({"business_id":"--Select Donor--"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Selected Invalid Business");
          done();
        })
    });
    
    it("Should display food available from selected donor if any'", function(done) {
      var foods;
      
      //Select all food available from business with bid 1
      mysql.pool.query('SELECT food.*, business.name FROM food JOIN business ON food.bid = business.id WHERE bid = 1', function(err, rows, fields){
  			if (err) {
  				throw err;
  			}	
  			
  			foods = rows;
		  });
		  
      chai.request(app)
        .post('/Donors/business/')
        .send({"business_id":"1"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          for(var i=0; i<foods.length; i++) {
            res.text.should.include(foods[i].name);
            res.text.should.include(foods[i].type);
          }
          done();
        })
    });
  });
  
  
  //GET /Donors/business/create
  //We should expect status code 200 for a successful render of the Add Business page.
  describe("GET /Donors/business/create", function() {
    
    it("Should return status code 200 and contain appropriate text", function(done) {
      chai.request(app)
        .get('/Donors/business/create')
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include('New Donor Business Entry:');
          res.text.should.include("Enter Business Name");
          res.text.should.include("Enter Street Address");
          res.text.should.include("Enter Business City");
          res.text.should.include("Enter Business State");
          res.text.should.include("Enter Business Zip Code");
          res.text.should.include("Enter Specific Location");
          done();
        })
    });
  });
  
  
  //POST /Donors/business/create
  describe("POST /Donors/business/create", function() {
    
    after(function(done){
      //Remove record from database to avoid duplicate entry error when running test again
	  	mysql.pool.query('DELETE FROM business where street_address = "someplace"', function(err, rows, fields){
    		if(err){
    			return;
    		}
    	});
      
      done();
    });
    
    it("Should successfully populate the business database with POST data and display new record'", function(done) {
      chai.request(app)
        .post('/Donors/business/create')
        .send({"business_name":"some", "street_address":"someplace", "city":"somecity", "state":"OR", "zip":"12345", "specific_location":"somewhere"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("some");
          res.text.should.include("someplace");
          res.text.should.include("somecity");
          res.text.should.include("OR");
          res.text.should.include("12345");
          res.text.should.include("somewhere");
          done();
        })
    });
    
    it("Should alert user to 'Enter a Business Name'", function(done) {
      chai.request(app)
        .post('/Donors/business/create')
        .send({"business_name":"", "street_address":"somestreet", "city":"somecity", "state":"OR", "zip":"12345", "specific_location":"somewhere"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Enter a Business Name");
          done();
        })
    });
    
    it("Should alert user to 'Enter a Street Address'", function(done) {
      chai.request(app)
        .post('/Donors/business/create')
        .send({"business_name":"some", "street_address":"", "city":"somecity", "state":"OR", "zip":"12345", "specific_location":"somewhere"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Enter a Street Address");
          done();
        })
    });
    
    it("Should alert user to 'Enter a City'", function(done) {
      chai.request(app)
        .post('/Donors/business/create')
        .send({"business_name":"some", "street_address":"someplace", "city":"", "state":"OR", "zip":"12345", "specific_location":"somewhere"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Enter a City");
          done();
        })
    });
    
    it("Should alert user to 'Enter a State'", function(done) {
      chai.request(app)
        .post('/Donors/business/create')
        .send({"business_name":"some", "street_address":"someplace", "city":"some city", "state":"", "zip":"12345", "specific_location":"somewhere"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Select a State");
          done();
        })
    });
    
    it("Should alert user to 'Enter a Zip Code'", function(done) {
      chai.request(app)
        .post('/Donors/business/create')
        .send({"business_name":"some", "street_address":"someplace", "city":"somecity", "state":"OR", "zip":"", "specific_location":"somewhere"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Enter a Zip Code");
          done();
        })
    });
  });
  
  //GET /Donors/food
  //We should expect status code 200 for a successful render of the View Food page.
  describe("GET /Donors/food", function() {
    
    before(function(done){
      
      mysql.pool.query('INSERT INTO food (`bid`, `type`, `quantity`, `availability_start`, `availability_end`)' +
            'VALUES ("1","bananas","20","2016-08-13 16:30:00","2016-08-13 20:00:00")', function(err, rows, fields){
  	  	if(err){
  	  		return;
  	  	}
  	  });
      
      done();
    });
    
    after(function(done){
      //Remove record from database to avoid duplicate entry error when running test again
	  	mysql.pool.query('DELETE FROM food where bid = 1 AND type = "bananas"', function(err, rows, fields){
    		if(err){
    			return;
    		}
    	});
      
      done();
    });
    
    
    it("Should return status code 200 and contain appropriate records", function(done) {
      chai.request(app)
        .get('/Donors/food')
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("whole foods");
          res.text.should.include("bananas");
          res.text.should.include("20");
          res.text.should.include("8/13/2016 4:30 pm");
          res.text.should.include("8/13/2016 8:00 pm");
          done();
        })
    });
  });
  
  
  //GET /Donors/food/create
  //We should expect status code 200 for a successful render of the Add Food page.
  describe("GET /Donors/food/create", function() {
    
    it("Should return status code 200 and contain appropriate text", function(done) {
      chai.request(app)
        .get('/Donors/food/create')
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include('Donor:');
          res.text.should.include("Enter a Food Type");
          res.text.should.include("Enter Food Quantity/Servings");
          res.text.should.include("Enter Pickup Time Availability Start");
          res.text.should.include("Enter Pickup Time Availability End");
          done();
        })
    });
  });
  
  
  //POST /Donors/food/create
  describe("POST /Donors/food/create", function() {
    
    after(function(done){
      //Remove record from database to avoid duplicate entry error when running test again
	  	mysql.pool.query('DELETE FROM food where bid = 2 AND type = "tomatoes"', function(err, rows, fields){
    		if(err){
    			return;
    		}
    	});
      
      done();
    });
    
    it("Should successfully populate the food database with POST data and display new record'", function(done) {
      chai.request(app)
        .post('/Donors/food/create')
        .send({"business_id":"2", "food_type":"tomatoes", "quantity":"30", "availability_start":"2016-06-10T13:30:00Z", "availability_end":"2016-06-10T18:30:00Z"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Subway");
          res.text.should.include("tomatoes");
          res.text.should.include("30");
          res.text.should.include("6/10/2016 1:30 pm");
          res.text.should.include("6/10/2016 6:30 pm");
          done();
        })
    });
    
    it("Should alert user to select 'Donor'", function(done) {
      chai.request(app)
        .post('/Donors/food/create')
        .send({"business_id":"--Select Donor--", "food_type":"tomatoes", "quantity":"30", "availability_start":"2016-06-10T13:30:00Z", "availability_end":"2016-06-10T18:30:00Z"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Select a Business");
          done();
        })
    });
    
    it("Should alert user to 'Enter a Food Type'", function(done) {
      chai.request(app)
        .post('/Donors/food/create')
        .send({"business_id":"2", "food_type":"", "quantity":"30", "availability_start":"2016-06-10T13:30:00Z", "availability_end":"2016-06-10T18:30:00Z"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Enter a Food Type");
          done();
        })
    });
    
    it("Should alert user to 'Enter Food Quantity/Servings'", function(done) {
      chai.request(app)
        .post('/Donors/food/create')
        .send({"business_id":"2", "food_type":"tomatoes", "quantity":"", "availability_start":"2016-06-10T13:30:00Z", "availability_end":"2016-06-10T18:30:00Z"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Select a Quantity");
          done();
        })
    });
    
    it("Should alert user to 'Enter Pickup Time Availability Start'", function(done) {
      chai.request(app)
        .post('/Donors/food/create')
        .send({"business_id":"2", "food_type":"tomatoes", "quantity":"30", "availability_start":"", "availability_end":"2016-06-10T18:30:00Z"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Select an Availability Start Time");
          done();
        })
    });
    
    it("Should alert user to 'Enter Pickup Time Availability End'", function(done) {
      chai.request(app)
        .post('/Donors/food/create')
        .send({"business_id":"2", "food_type":"tomatoes", "quantity":"30", "availability_start":"2016-06-10T13:30:00Z", "availability_end":""})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Enter an Availability End Time");
          done();
        })
    });
  });
  
  
  //POST /Donors/food/reserve
  describe("POST /Donors/food/reserve", function() {
    var current_row_id;
    
    before(function(done){
      
      mysql.pool.query('INSERT INTO food (`bid`, `type`, `quantity`, `availability_start`, `availability_end`)' +
            'VALUES ("1","bananas","20","2016-08-13 16:30:00","2016-08-13 20:00:00")', function(err, rows, fields){
  	  	if(err){
  	  		return;
  	  	}
  	  });
  	  
	  	mysql.pool.query('SELECT * FROM food where bid = 1 AND type = "bananas"', function(err, rows, fields){
    		if(err){
    			return;
    		}
    	  
    	  current_row_id = rows[0].id
    	});
      
      done();
    });
    
    after(function(done){
      //Remove record from database to avoid duplicate entry error when running test again
	  	mysql.pool.query('DELETE FROM food where bid = 1 AND type = "bananas"', function(err, rows, fields){
    		if(err){
    			return;
    		}
    	});
      
      done();
    });
    
    it("Should alert user to 'Pick a Food Type To Reserve'", function(done) {
      chai.request(app)
        .post('/Donors/food/reserve/')
        .send({"food_id":"--Select Food Type--"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Select a Food Type");
          done();
        })
    });
    
    it("Should alert user to enter a 'Quantity'", function(done) {
      chai.request(app)
        .post('/Donors/food/reserve/')
        .send({"quantity":""})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Must Select a Quantity");
          done();
        })
    });
    
    it("Should alert user if quantity selected is too high", function(done) {
      chai.request(app)
        .post('/Donors/food/reserve/')
        .send({"food_id":current_row_id,"quantity":"21"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("Invalid Quantity");
          done();
        })
    });
    
    it("Should display record if selected quantity is valid", function(done) {
      chai.request(app)
        .post('/Donors/food/reserve/')
        .send({"food_id":current_row_id,"quantity":"18"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.include("whole foods");
          res.text.should.include("bananas");
          done();
        })
    });
		  
    
    it("Should remove record if total quantity is selected", function(done) {
      chai.request(app)
        .post('/Donors/food/reserve/')
        .send({"food_id":current_row_id,"quantity":"2"})
        .end(function(err , res){
          res.should.have.status(200);
          res.should.be.html;
          res.text.should.not.include("bananas");
          done();
        })
    });
  });
});
