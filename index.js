var file = "test.db";
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var result = [];
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs')
app.use('/assets', express.static(__dirname + '/assets'));
var router = express.Router();              // get an instance of the express Router
var port = process.env.PORT || 8080;        // set our port

router.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});

require('./getRoutes')(router, db);
require('./postRoutes')(router, db);

app.use('/', router);

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);
