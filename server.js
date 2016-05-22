//
// # No Food Left Behind Server
//
// A database server: donors can insert new data into the database; donees can view database 
//

var express = require('express');
var mysql = require('./dbContentPool.js');
var bodyParser = require('body-parser');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.use(express.static('public'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//Have to use process.env.PORT to have it load a preview in Cloud9, will change back to regular port on final release
//app.set('port', 3000);
app.set('port', process.env.PORT);

//Load css or any js (/public)
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res, next){
	var context = {};
	res.render('home', context);
});

//EXAMPLE Donee view
app.get('/Donees', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM ' + 'food', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		var foods = rows;
		res.render('Donors', {foods});
	});
});

app.get('/Donors/business', function(req, res, next){
	var context = {};
		mysql.pool.query('SELECT * FROM ' + 'business', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		
		var businesses = rows;
		
		res.render('Donors/business/index', {businesses});
	});
});

app.get('/Donors/food', function(req, res, next){

		mysql.pool.query('SELECT * FROM ' + 'food', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		
		var foods = rows;
		
		res.render('Donors/food/index', {foods});
	});
});


//GET: Goes to the Add Business page and loads up the form
app.get('/Donors/business/create', function(req, res, next){
		res.render('Donors/business/create');
});


//POST: Sends POST data from the Add Business form
app.post('/Donors/business/create', function(req, res){
	
	var query = 'INSERT INTO business (`name`, `street_address`, `city`, `state`, `zip`, `specific_location`) VALUES (';
	query += '"' + req.body.business_name + '", ';
	query += '"' + req.body.street_address + '", ';
	query += '"' + req.body.city + '", ';
	query += '"' + req.body.state + '", ';
	query += '"' + req.body.zip + '", ';
	query += '"' + req.body.specific_location;	
	query += '");';
	
	mysql.pool.query(query, function(err, rows, fields){
		if (err) {
			throw err;
		}
		
		res.redirect('Donors/business');
	});
});

app.get('/Donors/food/create', function(req, res, next){
	
	mysql.pool.query('SELECT id, name FROM business', function(err, rows, fields){
		
		if (err) {
			throw err;
		}
		
		var businesses = rows;
		
		res.render('Donors/food/create', {businesses});
	});
});

app.post('/Donors/food/create', function(req, res, next){

	var query = 'INSERT INTO food (`bid`, `type`, `quantity`, `availability_start`, `availability_end`)  VALUES ( ';
	query += '"' + req.body.business_id + '", ';
	query += '"' + req.body.food_type + '", ';
	query += req.body.quantity + ', ';
	query += '"' + req.body.availability_start + '", ';
	query += '"' + req.body.availability_end;
	query += '");';
	
	mysql.pool.query(query, function(err, rows, fields){
		if (err) {
			throw err;
		}
		
		res.redirect('Donors/food');
	});
	
});

//req.query.<DOM id of input>
app.get('/Donors/food/insert', function(req, res, next){
	var context = {};
	mysql.pool.query('INSERT INTO ' + 'food' + ' (food_type, quantity, availability_start, availability_end) VALUES (?, ?, ?, ?)', [req.query.food_type, req.query.quantity, req.query.availability_start, req.query.availability_end], function(err, result){
		if(err){
			next(err);
			return;
		}
	})
	mysql.pool.query('SELECT * FROM ' + 'food', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		res.send(JSON.stringify(rows));
	})
});

//req.query.<DOM id of input>
app.get('/Donors/business/insert', function(req, res, next){
	var context = {};
	mysql.pool.query('INSERT INTO ' + 'business' + ' (business_name, street_address, city, state, zip, specific_location) VALUES (?, ?, ?, ?, ?, ?)', [req.query.business_name, req.query.street_address, req.query.city, req.query.state, req.query.zip, req.query.specific_location], function(err, result){
		if(err){
			next(err);
			return;
		}
	})
	mysql.pool.query('SELECT * FROM ' + 'business', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		res.send(JSON.stringify(rows));
	})
});

// Reset tables
app.get('/business/reset-table', function(req, res, next){
	var context = {};
	mysql.pool.query('TRUNCATE TABLE food', function(err){
	
		if (err) {
			throw err;
		}
	}); 
	
	mysql.pool.query('DELETE FROM business', function(err){
		
		if (err) {
			throw err;
		}

		mysql.pool.query('ALTER TABLE business AUTO_INCREMENT = 1', function(err){
			
			if (err){
				throw err;
			}
			
			context.results = 'Table reset';
			res.render('home', context);
		})
	}); 
});

app.get('/food/reset-table', function(req, res, next){
	var context = {};
	mysql.pool.query('TRUNCATE TABLE food', function(err){
		
			if (err) {
				throw err;
			}
		
			context.results = 'food table reset';
			res.render('home', context);
	}); 
});

app.use(function(req, res){
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.type('plain/text');
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
	console.log("Express started on 52.11.133.195:" + app.get('port') + ", press Ctrl-C to terminate");
});