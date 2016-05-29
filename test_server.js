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

app.get('/', function(req, res, next){
	var context = {};
	res.render('home', context);
});

app.get('/test', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM ' + 'business', function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		var businesses = rows;
		//res.render('test_page', businesses);
		res.send(typeof(businesses));
		console.log(businesses);
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
