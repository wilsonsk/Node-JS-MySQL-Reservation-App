//
// # No Food Left Behind Server
//
// A database server: donors can insert new data into the database; donees can view database 
//

var express = require('express');
var mysql = require('./dbContentPool.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.use(express.static('public'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

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
		res.render('Donors', context);
	});
});


//EXAMPLE Donor view: load && insert 
app.get('/Donors', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM ' + 'food', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		res.render('Donors', context);
	});
});

app.get('/Donors/food/load', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM ' +  'food', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		res.send(JSON.stringify(rows));
	});
});

//req.query.<DOM id of input>
app.get('/Donors/food/insert', function(req, res, next){
	var context = {};
	mysql.pool.query('INSERT INTO ' + 'food' + ' (business_name, food_type, quantity, address, specific_location, time_availability) VALUES (?, ?, ?, ?, ?, ?)', [req.query.business_name, req.query.food_type, req.query.quantity, req.query.address, req.query.specific_location, req.query.time_availability], function(err, result){
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
	mysql.pool.query('INSERT INTO ' + 'business' + ' (business_name, food_type, quantity, address, specific_location, time_availability) VALUES (?, ?, ?, ?, ?, ?)', [req.query.business_name, req.query.food_type, req.query.quantity, req.query.address, req.query.specific_location, req.query.time_availability], function(err, result){
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

// EXAMPLE table creation
app.get('/business/reset-table', function(req, res, next){
	var context = {};
	mysql.pool.query('DROP TABLE IF EXISTS ' + 'business', function(err){
		var createString = 'CREATE TABLE ' + 'business' + '(' + 
		'id INT PRIMARY KEY AUTO_INCREMENT, ' +
		'fid INT, ' +
		'business_name VARCHAR(255) NOT NULL,' +
		'street_address VARCHAR(255) NOT NULL,' +
		'city VARCHAR(255) NOT NULL, ' +
		'state VARCHAR(32) NOT NULL, ' +
		'zip TINYINT UNSIGNED NOT NULL,' +
		'specific_location VARCHAR(255) NOT NULL,' +
		'FOREIGN KEY (fid)' +
			'REFERENCES food_business(fk_food_id)' +
			'ON UPDATE CASCADE' +
		')ENGINE=InnoDB;';
		mysql.pool.query(createString, function(err){
			context.results = 'Table reset';
			console.log(createString);
			res.render('Donors', context);
		})
	}); 
});


app.get('food/reset-table', function(req, res, next){
	var context = {};
	mysql.pool.query('DROP TABLE IF EXISTS ' + 'food', function(err){
		var createString = 'CREATE TABLE ' + 'food' + '(' + 
		'id INT PRIMARY KEY AUTO_INCREMENT, ' +
		'bid INT, ' +
		'food_type VARCHAR(255) NOT NULL,' +
		'quantity INT NOT NULL,' +
		'availability_start DATETIME,' +
		'availability_end DATETIME,' +
		'FOREIGN KEY (bid)' +
			'REFERENCES food_business(fk_business_id)' +
			'ON UPDATE CASCADE' +
		')ENGINE=InnoDB;';
		mysql.pool.query(createString, function(err){
			context.results = 'Table reset';
			console.log(createString);
			res.render('Donors', context);
		})
	}); 
});

app.get('food_business/reset-table', function(req, res, next){
	var context = {};
		mysql.pool.query('DROP TABLE IF EXISTS ' + 'food_business', function(err){
		var createString = 'CREATE TABLE ' + 'food_business' + '(' + 
		'fk_food_id INT, ' +
		'fk_business_id INT, ' + 
		'foreign key (fk_food_id) references food(id) on delete cascade on update cascade, ' +
		'foreign key (fk_business_id) references business(id) on delete cascade on update cascade' +
		')ENGINE=InnoDB;';
		mysql.pool.query(createString, function(err){
			context.results = 'Table reset';
			console.log(createString);
			res.render('Donors', context);
		})
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