var winston = require("winston");


 var colors =  {
      info: 'blue',
      error: 'red',
      debug: 'yellow',
      system: 'green'
 };


var logger = new (winston.Logger)({
	level: 'system',
	levels: {
	  	info: 1,
	  	error: 2,
	  	debug: 3,
	  	system: 4
	},
	transports: [
	  new (winston.transports.Console)({colorize: true}),
	]
});

winston.addColors(colors);
module.exports = logger;