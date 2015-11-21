//Load app dependencies  
var express = require('express'),  
  mongoose = require('mongoose'),  
  http = require('http');  
var app = express();  
  
//Configure: bodyParser to parse JSON data  
//           methodOverride to implement custom HTTP methods  
//           router to crete custom routes  
app.configure(function(){  
  app.use(express.bodyParser());  
  app.use(express.methodOverride());  
  app.use(app.router);  
});  
  
app.configure('development', function(){  
  app.use(express.errorHandler());  
});  
  
//Sample routes are in a separate module, just for keep the code clean  
routes = require('./routes/router')(app);  
  
//Connect to the MongoDB test database  
mongoose.connect('mongodb://localhost/test_database');  
  
//Start the server  
http.createServer(app).listen(8080);  
