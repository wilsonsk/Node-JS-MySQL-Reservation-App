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

//EXAMPLE Donee view
app.get('/Donees', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM ' + 'Food', function(err, rows, fields){
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
	mysql.pool.query('SELECT * FROM ' + 'Food', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		res.render('Donors', context);
	});
});

app.get('/Donors/load', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM ' +  'Food', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		res.send(JSON.stringify(rows));
	});
});

app.get('/Donors/insert', function(req, res, next){
	var context = {};
	mysql.pool.query('INSERT INTO ' + 'Food' + ' (id, business_name, food_type, quantity, address, specific_location, time_availability) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.query.dept_id, req.query.proj_id, req.query.first_name, req.query.last_name, req.query.salary], function(err, result){
		if(err){
			next(err);
			return;
		}
	})
	mysql.pool.query('SELECT * FROM ' + 'Food', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		res.send(JSON.stringify(rows));
	})
});


// EXAMPLE table creation
app.get('/Donors/reset-table', function(req, res, next){
	var context = {};
	mysql.pool.query('DROP TABLE IF EXISTS ' + 'Food', function(err){
		var createString = 'CREATE TABLE ' + 'Food' + '(' + 
		'id INT PRIMARY KEY AUTO_INCREMENT, ' +
		'business_name VARCHAR(255) NOT NULL,' +
		'food_type VARCHAR(255) NOT NULL,' +
		'quantity INT NOT NULL' +
		'address VARCHAR(255) NOT NULL,' +
		'specific_location VARCHAR(255) NOT NULL,' +
		'time_availability TIME, ' +
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