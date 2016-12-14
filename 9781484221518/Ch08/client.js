var rChees 	= require("../cheese");
var Cheese 	= rChees.Cheese;
var Utils 	= rChees.Utils;
var logger 	= require("./logger");

var map 	= Utils.map, 
	reduce 	= Utils.reduce,
	takeUntil = Utils.takeUntil,
	take 	= Utils.take

var socket = require('socket.io-client')('http://localhost:3000');

var _USERNAME = null;

process.stdin.resume();
process.stdin.setEncoding('utf8');

var newMsgListener = false;
var newUserMsgListener = false;
var userLoggedIn = false;

var input = new Cheese(); //grabs user input from stdin
var rcvdSystemMsgs = new Cheese(); //stream to grab system notifications
var userMsgs = new Cheese(); //stream to grab messages from other users


// Streams 

rcvdSystemMsgs
	.fromFn(newSystemMessage)
	.then(map(function(msg, done) {
		msg = JSON.parse(msg.toString())
		done(null, [msg.date, msg.msg].join('::'));
	}))
	.each(printMessage('system'));


userMsgs
	.fromFn(newUserMessage)
	.then(map(function(msg, done) {
		msg = JSON.parse(msg.toString())
		done(null, [msg.username, "(", msg.date, ") - ", msg.msg].join(' '));
	}))
	.each(printMessage());

console.log("Enter your username: ");
  
socket.on('connect', function(){
	input
		.fromStream(process.stdin)
		.then(trim)
		.then(map(toObject))
		.onError(function(err) {
			console.trace("ERROR:" , err)
		})
		.each(send);
});

///Helper functions
function printMessage(type) {
	if(!type) type = 'info';
	return function(str) {
		logger[type](str.toString());
	}
}

function send(str) {
	var msgObj = MsgParser(JSON.parse(str.toString()), socket)
	msgObj.send();
}

function toObject(str, done) {
	str = str.toString();
	var obj = null;

	if(_USERNAME) {
		obj = createMsgObj(str, _USERNAME) 
	} else {
		obj = createLoginObj(str);
	}

	done(null, JSON.stringify(obj));
}

function newCommand(str, username) {
	var parts = str.split(" ");
	return {
		type: 'new_cmd',
		cmd: parts[0].replace("/", ""),
		args: parts.slice(1),
		username: username,
		date: new Date()
	};
}

function createMsgObj(inputStr, username) {
	if(inputStr.charAt(0) == '/') {
		return newCommand(inputStr, username);
	} else {
		return {
			type: 'new_msg',
			msg: inputStr,
			date: new Date(),
			username: username
		};
	}
}

function createLoginObj(newUserName) {
	_USERNAME = newUserName;
	return {
		type: 'login',
		username: newUserName,
		date: new Date()
	};
}

/*
Add a method to the JSON, so it knows how to send itself over the socket connection
*/
function MsgParser(msgObj, socket) {
	msgObj.send = function() {
		socket.emit(msgObj.type, msgObj);
	};
	return msgObj;
}

function trim(str) {
	return str.toString().trim();
}

function newSystemMessage(push) {
	if(!newMsgListener) {
		logger.debug("New message listener set...")
		socket.on('system_msg', function(sm) {
			push(JSON.stringify(sm));
		});
		newMsgListener = true;
	}
}

function newUserMessage(push) {
	if(!newUserMsgListener) {
		logger.debug("New user message listener set...")
		socket.on('new_msg', function(sm) {
			push(JSON.stringify(sm));
		});
		newUserMsgListener = true;
	}
}


socket.on('disconnect', function(){
	logger.info("Your connection to the server is closed! Bye-bye!");
	process.exit(0);
});