var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rCheese = require("../cheese");
var logger = require("./logger");
var Cheese = rCheese.Cheese;

var map 	= rCheese.Utils.map,
	take 	= rCheese.Utils.take,
	filter 	= rCheese.Utils.filter;

var _USERS = {}

function setupStreams(usrname, socket) {
	var msgs = new Cheese();	
	var logins = new Cheese();
	var commands = new Cheese();

	var msgsListener = false;
	var cmdListener = false;

	//== New messages stream
	//It simply broadcasts all messages sent if they have the required attributes
	msgs.fromFn(function(push) {
		if(!msgsListener) {
			msgsListener = true;
			logger.debug("New messages listener set...")
			socket.on('new_msg', function(msg) {
				if(msg.username == usrname) {
					push(JSON.stringify(msg)); //serialize object
				}
			});
		}
	})
	.then(filter(function(m, done) {
		var mObj = JSON.parse(m.toString());
		done(null, mObj.msg != '' && mObj.msg != null && mObj.date != null && mObj.username != null);
	}))
	.each(function(obj) {
		//de-serialize object
		logger.debug("Emitting new message: ", obj.toString());
		socket.broadcast.emit('new_msg', JSON.parse(obj.toString()));
	});


	//== Commands stream
	commands.fromFn(function(push) {
		if(!cmdListener) {
			cmdListener = true;
			logger.debug("New command listener set...");
			socket.on('new_cmd', function(cmd) {
				console.log("new command received: ", cmd.username, usrname)
				if(cmd.username == usrname) {
					push(JSON.stringify(cmd));
				}
			})
		}
	})
	.then(executeCommand)
	.then(filter(function(v, done) {
		done(null, v != null);
	}))
	.onError(function(err) { //format error message so it can be sent back to the client
		return JSON.stringify({msg: err.message, date: new Date()});
	})
	.each(sendBackResponse(socket))

	//== Login stream
	logins.fromArray([usrname])
  	.then(map(function(username, done) { //turn the username into a message to send to everyone else
	  	var newObj = JSON.stringify({msg: [username, 'has just logged in.'].join(' '), date: new Date()})
	  	done(null, newObj);
	}))
	.each(function(obj) {
	  	logger.info("User logged in, broadcast message sent");
	  	socket.broadcast.emit('system_msg', JSON.parse(obj.toString()));
  	});

  return {
  	socket: socket,
  	msgs: msgs,
  	logins: logins,
  	commands: commands
  };
}

io.on('connection', function(socket){
	socket.on('login', function(data) {
		var usrname = data.username;
		_USERS[usrname] = setupStreams(usrname, socket)
	});
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});

//=== helper functions  ===
function sendBackResponse(socket) {
	return function(respObj) {
		socket.emit('system_msg', JSON.parse(respObj.toString()));	
	}
}


// == command functions ==
function executeCommand(cmd) {
	var cmdObj = JSON.parse(cmd.toString());
	
	var commands = {
		listUsers: listUsersCommand,
		exit: closeConnection
	};

	if(!commands[cmdObj.cmd]) {
		throw new Error("Error: Unknown command");
	} else {
		var result = commands[cmdObj.cmd](cmdObj);
		return (result !== null) ? JSON.stringify(result) : null;
	}
}

///=== EXIT command helper functions ===

//Notify all users that one has left the chat room
function notifyUsers(cmd) {
	var cmdObj = JSON.parse(cmd.toString());
	var socket = _USERS[cmdObj.username].socket;
	if(!socket) throw new Error("Socket not found for user: ", cmdObj.username);

	socket.broadcast.emit('system_msg', {
		msg: [cmdObj.username, 'has left the chatroom'].join(" "),
		date: new Date()
	});
	return cmd;
}

//Close the connection between the client that wants to leave and the server
function disconnect(cmd) {
	var cmdObj = JSON.parse(cmd.toString());
	var socket = _USERS[cmdObj.username].socket;
	if(!socket) throw new Error("Socket not found for user: ", cmdObj.username);
	socket.disconnect();
	return cmd;
}

//Remove the user from the list of connected users and release it's memory
function removeUser(cmd) {
	var cmdObj = JSON.parse(cmd.toString());
	delete _USERS[cmdObj.username];
	return cmd;
}

//EXIT command main function
function closeConnection(cmd) {
	var exitStream = new Cheese();
	exitStream
		.fromArray([JSON.stringify(cmd)])
		.then(notifyUsers)
		.then(disconnect)
		.then(removeUser)
		.each(function(obj) {
			obj = JSON.parse(obj.toString());
			logger.info("User '" + obj.username + "' has closed the connection");
		});

	return null;
}

///=== List Users command helper function

function listUsersCommand(cmd) {
	return { 
		msg: ["The following users are part of this chat room:", Object.keys(_USERS).join(", ")].join(" "), 
		date: new Date()
	};
}
