function ClienteWS (){
	this.socket = undefined;
	this.nick = undefined;
	this.codigo = undefined;
	this.ini=function(){
		this.socket=io.connect();
		this.lanzarSocketSrv();
	}//() //esto permite llamar a esta funcion
	//servidor WebSocket dentro del cliente
	this.getCodigo =  function(){
		return this.codigo;
	}

	this.crearPartida = function(nick,number){
		// emit genera una peticion al servidor, se puede paquetizar todo mas con objetos json
		this.nick = nick;
		this.socket.emit('crearPartida',nick, number);
	}
	this.unirAPartida = function(nick,codigo){
		this.nick = nick;
		this.codigo = codigo;
		this.socket.emit('unirAPartida',nick,codigo);
	}
	this.iniciarPartida = function(){
		this.socket.emit('iniciarPartida',nick,codigo);
	}

	this.listaPartidas = function(){
		this.socket.emit('listaPartidas');
	}
	this.listaPartidasDisponibles = function(){
		this.socket.emit('listaPartidasDisponibles');
	}
	
	this.lanzarSocketSrv = function(){
		var cli =  this; // capturar el objeto, porque se hace pisto manchego con las funciones de callback.
						 // y se puede llegar a perder. Se lanza una porcion de codigo que se encargad de escuchar
						 // el listener.
		this.socket.on('connect',function(){
			console.log("Conectado al servidor de WS");
		});
		this.socket.on('partidaCreada',function(data){
			console.log(data)
			this.codigo = data.codigo;
			//pruebasWS();
			// console.log("Codigo de la partida:"+data.codigo);
			// console.log("Propietario de la partida:"+data.owner);
		});
		this.socket.on('unidoAPartida',function(data){
			console.log(data)
		});
		this.socket.on('nuevoJugador',function(nick){
			console.log("Se une a la partida "+nick);
			});

		this.socket.on('partidaIniciada',function(data){
			console.log("Partida "+data.codigo+" esta en fase "+ data.fase);
		});
		this.socket.on('recibirListarPartidas',function(data){
			console.log(data);
		});
		this.socket.on('recibirListarPartidasDisponibles',function(data){
			console.log(data);
		});
	}

	//this.ini();
}
//En el lado del cliente, no tenemos que exportar, ya que en este lado es la anarquia.


function pruebasWS(){
	var ws2 = new ClienteWS();
	var ws3 = new ClienteWS();
	var ws4 = new ClienteWS();
	var codigo = ws.getCodigo();
	ws2.unirAPartida("Juani",codigo);
	ws2.unirAPartida("Juana",codigo);
	ws2.unirAPartida("Juanan",codigo);
}