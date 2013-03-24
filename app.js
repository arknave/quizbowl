var express = require('express');
var http = require('http');
var path = require('path');
var dbroute = require('./routes/database');
var app = express();

require('jade');
app.set('view engine', 'jade');
app.set('view options', {layout: false});
app.configure(function(){
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.logger());
  app.use(express.bodyParser({uploadDir:'./uploads'}));
});

app.get('/', function(req, res){
  res.render('index');
});

app.get('/search/:query?', function(req,res){
  res.render('search');
});

app.post('/database/:type/index', dbroute.index);
app.get('/database/search', dbroute.search);
app.post('/database/update', dbroute.update);

var port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log("Listening on " + port);
});
