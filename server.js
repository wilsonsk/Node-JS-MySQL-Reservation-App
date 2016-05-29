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
app.set('port', 3000);
//app.set('port', process.env.PORT);

//Load css or any js (/public)
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//google map api
var GoogleMapsAPI = require('googlemaps');
var publicConfig = {
  key: 		      'AIzaSyDYdH9euGG8X0wOgdVWvEfvDpsnZwdZjNM',
  stagger_time:       1000, // for elevationPath 
  encode_polylines:   false,
  secure:             true, // use https 
  proxy:              'http://52.11.133.195:3000' // optional, set a proxy for HTTP requests 
};
var gmAPI = new GoogleMapsAPI(publicConfig);

app.get('/', function(req, res, next){
	var context = {};
	res.render('home', context);
});

app.get('/contact', function(req, res, next){
	var context = {};
	res.render('contact', context);
});

app.get('/about', function(req, res, next){
	var context = {};
	res.render('about', context);
});

app.get('/testMap', function(req, res, next){
	var params = {
  center: '444 W Main St Lock Haven PA',
  zoom: 15,
  size: '500x400',
  maptype: 'roadmap',
  markers: [
    {
      location: '300 W Main St Lock Haven, PA',
      label   : 'A',
      color   : 'green',
      shadow  : true
    },
    {
      location: '444 W Main St Lock Haven, PA',
      icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe%7C996600'
    }
  ],
  style: [
    {
      feature: 'road',
      element: 'all',
      rules: {
        hue: '0x00ff00'
      }
    }
  ],
  path: [
    {
      color: '0x0000ff',
      weight: '5',
      points: [
        '41.139817,-77.454439',
        '41.138621,-77.451596'
      ]
    }
  ]
	};
	var results = gmAPI.staticMap(params);
	res.render('Donees/doneeViewTest', {map : results});

});


app.get('/test', function(req, res, next){
                mysql.pool.query('SELECT * FROM ' + 'business', function(err, rows, fields){
                if(err){
                        next(err);
                        return;
                }

                var businesses = rows;
                res.render('Donees/doneeView', {businesses : businesses});
        });
});

app.post('/test', function(req, res, next){
//select * from food where bid=req.body.business_id;
//needs error checking (check user submitted a bid) or else it terminates server

         var query = 'SELECT * FROM food WHERE bid=';
         query += req.body.business_id;
         query += ';';

        mysql.pool.query(query, function(err, rows, fields){
                if (err) {
                        throw err;
                }

                var foods = rows;

                res.render('Donors/food/index', {foods : foods});
        });
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
		res.render('Donors', {foods : foods});
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
		
		res.render('Donors/business/index', {businesses : businesses});
	});
});

app.get('/Donors/food', function(req, res, next){

		mysql.pool.query('SELECT * FROM ' + 'food', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		
		var foods = rows;
		
		res.render('Donors/food/index', {foods : foods});
	});
});


//GET: Goes to the Add Business page and loads up the form
app.get('/Donors/business/create', function(req, res, next){
		res.render('Donors/business/create');
});


//POST: Sends POST data from the Add Business form upon submission
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
		
		res.render('Donors/food/create', {businesses : businesses});
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

//Next function handles the case where a donee wants to check the inventory of a specific donor/business
app.post('/Donors/business', function(req, res, next){
//select * from food where bid=req.body.business_id;
//needs error checking (check user submitted a bid) or else it terminates server

	 var query = 'SELECT * FROM food WHERE bid=';
	 query += req.body.business_id;
	 query += ';';

	mysql.pool.query(query, function(err, rows, fields){
		if (err) {
			throw err;
		}	
		
		var foods = rows;
		
		res.render('Donors/food/index', {foods : foods});
	});
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
