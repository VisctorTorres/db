//MOngoski se usa para conectarse con MongoDb y el BOdy-Parse es un modilo para parsear midleware que se usa para recibir como objeto los JSON que manda el cliente

//Se crean las referencias a los Modulos que se usan
var express = require("express");
var mongoskin = require("mongoskin");
var bodyParser = require("body-parser");

//Variables como objetos para controlar el servidor y coenctarse a la base de datos
var app = express();
var db = mongoskin.db("mongodb://@localhost:27017/testdatabase", {safe:true});
var id = mongoskin.helper.toObjectID;


//Metodo para ver los http que se aceptan, tenemos get, post...etc
var allowMethods = function(req, res, next) {
	res.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
	next();
}
//ESte metodo es para ver la contraseña
var allowCrossTokenHeader = function(req, res, next) {
    res.header('Access-Control-Allow-Headers', 'token');
    next();
}
//Metodo para acptar los parametros del header de la peticion
var auth = function(req, res, next) {
  if (req.headers.token === "password123456") {
    return next();
  } else {
    return  next(new Error('No autorizado'));
  }
};


//En el middleware se añade el body-parse para manejar los parametros que llegan 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(allowMethods);
app.use(allowCrossTokenHeader);

//Para los parametros de colleccion se manejan independiente en cada peticion y asi poder agregarlos a la coleccion de la Base de datos 
app.param('coleccion', function(req, res, next, coleccion){
  req.collection = db.collection(coleccion);
  return next();
});

//Ahora cada funcion, la coleccion que queremos.
app.get('/api/:coleccion', auth, function(req, res, next) {
  req.collection.find({},{
    limit:10, sort: [['_id',-1]]
  }).toArray(function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

app.post('/api/:coleccion', auth, function(req, res, next) {
  req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e);
    res.send(results);
  });
});

app.get('/api/:coleccion/:id', auth, function(req, res, next) {
  req.collection.findOne({
    _id: id(req.params.id)
  }, function(e, result){
    if (e) return next(e);
 	   res.send(result);
  });
});

app.put('/api/:coleccion/:id', auth, function(req, res, next) {
	req.collection.update({
	     _id: id(req.params.id)
	}, {$set:req.body}, {safe:true, multi:false},
	    function(e, result){
	      if (e) return next(e);
		  res.send((result === 1) ? {msg:'success'} : {msg:'error'});
	});
});

app.delete('/api/:coleccion/:id', auth, function(req, res, next) {
  req.collection.remove({
      _id: id(req.params.id)
    },
    function(e, result){
      if (e) return next(e);
      res.send((result === 1) ? {msg:'success'} : {msg:'error'});
	});
});

app.listen(8080, function(){
  console.log ('Servidor escuchando en puerto 8080');
});
