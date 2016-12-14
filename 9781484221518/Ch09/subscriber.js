var amqp = require('amqp');
 
var connection = amqp.createConnection({ host: 'localhost' });
 
// add this for better debuging 
connection.on('error', function(e) {
  console.log("Error from amqp: ", e);
});
 
// Wait for connection to become established. 
connection.on('ready', function () {
  console.log("Listening for messages...");
  // Use the default 'amq.topic' exchange 
  connection.queue('my-queue', function (q) {
      // Catch all messages 
      q.bind('#');
    
      // Receive messages 
      q.subscribe(function (message) {
        // Print messages to stdout 
        console.log(message.data.toString());
      });
  });
});