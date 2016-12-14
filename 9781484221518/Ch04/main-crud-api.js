var express = require("express"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	routes = require("./routes-crud-api-rfp")
	//userRouter = require("./routes-crud-api"),
	//loginRouter = require("./login-routes");


var app = express();

app.use(bodyParser.json());

//app.use(loginRouter.check_token);

app.use('/users', routes);
//app.use('/', loginRouter.router);

//Generic error handler
app.use(function(err, req, res, next) {
	console.error("--- Error encountered ---");
	console.trace(err);
	res.status(500).json({
		msg: err,
		error: true
	});
});

mongoose.connect('mongodb://localhost/test-chapter4');
var db = mongoose.connection;

db.once('open', function() {
	console.log("Database connection established...");
	app.listen(3004, function() {
		console.log("Server started...")
	});
})

