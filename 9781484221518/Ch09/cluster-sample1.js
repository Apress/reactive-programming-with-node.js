var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function (worker, code, signal) {
    console.log("Worker",worker.process.pid, "died");
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer(function(req, res){
    res.writeHead(200);
    res.end('hello world\n');
    process.exit(0);
  }).listen(8000, function() {
    console.log("Server Ready!")
  });
}