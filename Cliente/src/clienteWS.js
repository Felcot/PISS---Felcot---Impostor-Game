function ClienteWS (name,controlWeb){
	this.socket = undefined;
	this.nick = name;
	this.codigo;
	this.cw = controlWeb;
	this.ini=function(){
		this.socket=io.connect();
		this.lanzarSocketSrv();
	}
	//esto permite llamar a esta funcion
	//servidor WebSocket dentro del cliente
	this.getCodigo =  function(){
		return this.codigo;
	}
	this.setCodigo = function(codigo){
		this.codigo = codigo;
	}
	this.getNick = function(){
		return this.nick;
	}
	this.crearPartida = function(number){
		// emit genera una peticion al servidor, se puede paquetizar todo mas con objetos json
		this.socket.emit('crearPartida',this.getNick(), number);
	}
	this.unirAPartida = function(codigo){
		this.setCodigo(codigo);
		this.socket.emit('unirAPartida',this.getNick(),this.getCodigo());
	}
	this.iniciarPartida = function(){
		this.socket.emit('iniciarPartida',this.getNick(),this.getCodigo());
	}
	this.abandonarPartida = function(){
		this.socket.emit('abandonarPartida',this.getNick(),this.getCodigo());
	}

	this.listaPartidas = function(){
		this.socket.emit('listaPartidas');
	}
	this.listaPartidasDisponibles = function(){
		this.socket.emit('listaPartidasDisponibles');
	}
	this.report = function(){
		this.socket.emit('report',this.getNick(),this.getCodigo());
	}
	this.votar = function(votado){
		this.socket.emit('votar',this.getNick(),votado);
	}	
	this.lanzarSocketSrv = function(){
		var cli =  this; // capturar el objeto, porque se hace pisto manchego con las funciones de callback.
						 // y se puede llegar a perder. Se lanza una porcion de codigo que se encargad de escuchar
						 // el listener.
		this.socket.on('connect',function(){
			console.log("Conectado al servidor de WS");
		});
		this.socket.on('partidaCreada',function(data){
			cli.setCodigo(data.codigo);
			console.log(data);
			data.codigo != "fallo"? cw.mostrarEsperandoRivales(): cw.mostrarCrearPartida();
		});
		this.socket.on('unidoAPartida',function(data){
			console.log(data)
		});
		this.socket.on('nuevoJugador',function(nick){
			console.log("Se une a la partida "+nick);
			});
		this.socket.on('haAbandonadoPartida',function(data){
			if(data.check)
				console.log("Ha abandondo Partida "+data.nick)
		});
		this.socket.on('partidaIniciada',function(data){
			console.log("Partida "+data.codigo+" esta en fase "+ data.fase);
		});
		this.socket.on('recibirListarPartidas',function(data){
			console.log(data);
		});
		this.socket.on('recibirListarPartidasDisponibles',function(data){
			console.log(data);
			cw.mostrarUnirAPartida(data);
		});
		this.socket.on('recibirVotacion',function(data){
			console.log(data);
		});
		this.socket.on('activarReport',function(data){
			console.log(data);
		});

	}

	this.ini();
}
//En el lado del cliente, no tenemos que exportar, ya que en este lado es la anarquia.

var ws,ws2,ws3,ws4,ws5;
function pruebasWS(){
	ws2 = new ClienteWS("Juani");
	ws3 = new ClienteWS("Juana");
	ws4 = new ClienteWS("Juanan");
	ws5 = new ClienteWS("YoAbandono");
	codigo = ws.getCodigo();
	ws5.unirAPartida(codigo);
	ws2.unirAPartida(codigo);
	ws5.abandonarPartida();
	ws3.unirAPartida(codigo);
	ws4.unirAPartida(codigo);
}