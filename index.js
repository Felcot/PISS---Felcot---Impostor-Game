var fs = require("fs");
var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require("body-parser"); // es necesario para parsear los formularios
//QueryString -> Esta limitada por lo que no se puede pasar mucha información en la URI
//Por tanto, tenemos el bodyParse que permite realizar transferencia de volumenes de información superior
// a través del cuerpo del index.
var io = require("socket.io").listen(server);
var modelo = require("./Servidor/modelo.js");

var wss =  require("./Servidor/servidorWS.js");
var servidorWS = new wss.ServidorWS(); // aquí se esta creando la capa instancia de webSocket

app.set('port', process.env.PORT || 5000); // Nuestro servidor va a escuchar en caso de no estar definido
//El puerto en la variable de entorno $PORT, escuchara por el puerto 5000

var juego = new modelo.Juego();

//Las siguientes lineas hacen referencia a la raíz del servidor
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Tenemos que ir estableciendo bloques App Post Get Update Delete Dependiendo de la ruta que
//Se desea utilizar, nos encargaremos de realizar la transmisión de las peticiones de tal maneras
//Que permitira realizar la respuesta especializada por ejemplo del impostor devuelviendole la interfaz
//correspondiente por ejemplo.

app.get('/', function (request, response) {
    var contenido = fs.readFileSync(__dirname + "/Cliente/index.html");
    	// readFileSync Transmite una respuesta asincrona
    
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
    
});
app.get('/game', function (request, response) {
    var contenido = fs.readFileSync(__dirname + "/Cliente/index-game.html");
    	// readFileSync Transmite una respuesta asincrona
    
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
    
});
//Esto es la ruta dentro del API rest
/*Example: app.get('/nuevoUsuario/:param1/:param2/:param3',function(request,response){});*/
/*app.get('/nuevoUsuario/:nick',function(request,response){ //funcion de callback -- 
	var nick =  request.params.nick;
	console.log(nick);					//peticion que le hace el servidor al cliente
	usr = juego.nuevoUsuario(nick);
	response.send({"usr":usr});
});*/

app.get('/crearPartida/:nick/:num', function(request,response){
	var num = parseInt(request.params.num); // recogemos los parametros
	/*Errores posibles: Nick null, o por ejemplo numero null/notNumberType*/
	//var num = 4;
	var nick =  request.params.nick;
	var codigo = juego.crearPartida(num,nick);
	//var usr = juego.nuevoUsuario(nick); // creamos un usuario
	//var codigo = usr.crearPartida(num); //El usuario crea la partida

	response.send({"codigo":codigo}); // la función emite como respuesta el objeto json {"codigo":codigo}
});

/*app.get('/listarPartida/',function(request,response){
	var lista = juego.listarPartida();
	response.send({"Partidas":lista});
});*/

app.get('/unirAPartida/:numero', function(request,response){});
app.get('/iniciarPartida/:numero', function(request,response){});

//Le dice al servidor que se ponga a escuchar en el puerto, además permite enviar un mensaje
//por ejemplo Node app is running on port N ->  El nodo esta escuchando en el puerto N
// N es un número.
server.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

// app.listen(app.get('port'), function () {
//      console.log('Node app is running on port', app.get('port'));
// });

servidorWS.lanzarSocketSrv(io,juego);
// npm is a node package manager - Es un gestor que permite administrar Node