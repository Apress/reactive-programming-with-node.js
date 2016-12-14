var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

} else {
  var crypto = require('crypto');  
  var express = require('express');  

  var app = express();

  app.get('/', function (req, res) {  
      // Simulate route processing delay
      var randSleep = Math.round(1000 + (Math.random() * 1000));
      setTimeout(function() {
        res.send("Hello world!");
      }, randSleep);
  });

  app.listen(9000);
}