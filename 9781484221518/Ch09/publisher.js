var amqp = require('amqp');
 
var connection = amqp.createConnection({ host: 'localhost' });
 
// add this for better debuging 
connection.on('error', function(e) {
  console.log("Error from amqp: ", e);
});
 
// Wait for connection to become established. 
connection.on('ready', function () {
  // Use the default 'amq.topic' exchange 
  connection.publish('my-queue', 'Test message');
  console.log("Message sent!");
});