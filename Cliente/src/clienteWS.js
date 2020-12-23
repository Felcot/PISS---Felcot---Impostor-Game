function ClienteWS (name,controlWeb){
	this.socket = undefined;
	this.nick = name;
	this.codigo;
	this.personaje;
	this.owner = false;
	this.cw = controlWeb;
	this.impostor;
	this.estado;
	this.ini=function(){
		this.socket=io.connect();
		this.lanzarSocketSrv();
	}
	this.getImpostor =function(){
		return this.impostor;
	}
	this.setImpostor= function(impostor){
		this.impostor = impostor;
	}
	this.toString=function(){
		var result = "Mi nombre es "+this.nick+"\n";
		result += "Estoy en la partida "+this.codigo+"\n";
		result+= "Mi personaje es "+this.personaje+"\n";
		result += !this.owner ? "No":"Si";
		result += " soy el propietario\n";
		return result;
	}
	this.sendMensaje = function(msg){
		console.log("Procedemos a enviar el mensaje ("+msg+")");
		this.socket.emit('chat',this.getNick(),this.getCodigo(),msg);
	}
	//esto permite llamar a esta funcion
	//servidor WebSocket dentro del cliente
	this.console=function(msg){
		console.log(msg);
	}
	this.getCodigo =  function(){
		return this.codigo;
	}
	this.setCodigo = function(codigo){
		this.codigo = codigo;
	}
	this.getNick = function(){
		return this.nick;
	}
	this.getPersonaje=function(){
		return this.personaje;
	}
	this.isOwner=function(){
		return this.owner;
	}
	this.setPersonaje = function(personaje){
		this.personaje=personaje;
	}
	this.getEstado=function(){
		return this.estado;
	}
	this.setEstado = function(estado){
		this.estado = estado;
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
	this.obtenerListaJugadores = function(){
		this.socket.emit('EstoyDentro',this.getNick(),this.getCodigo());
	}
	this.movimiento=function(direccion,x,y){
		this.socket.emit('movimiento',this.getNick(),this.getCodigo(),direccion,x,y,this.estado,this.personaje);
	}
	this.establecePersonaje=function(id){
		this.socket.emit('establecerPersonajeServidor',this.getCodigo(),this.getNick(),id);
	}
	this.estoyDentro = function(){
		this.socket.emit('estoyDentro',this.getCodigo());
	}
	this.realizarTarea = function(tarea){
		this.socket.emit('realizarTarea',this.getNick(),this.getCodigo(),tarea);
	}
	this.atacar = function(tripulante){
		this.socket.emit('enviarAtaque',this.getNick(),this.getCodigo(),tripulante);
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
			cli.owner = data.codigo != "fallo"; //Si no ha fallado se establece como owner
			data.codigo != "fallo"? cw.mostrarEsperandoRivales(data.lista): cw.mostrarCrearPartida();
		});
		this.socket.on('unidoAPartida',function(data){
			console.log(data)
			cw.mostrarEsperandoRivales(data.lista);
		});
		this.socket.on('nuevoJugador',function(data){
			console.log("Se une a la partida "+data.nick);
			cw.mostrarEsperandoRivales(data);
			});
		this.socket.on('haAbandonadoPartida',function(data){
			if(data.check)
				console.log("Ha abandondo Partida "+data.nick)
		});
		this.socket.on('esperando',function(data){
			console.log("esperando");
		});
		this.socket.on('partidaIniciada',function(data){
			console.log("Partida "+data.codigo+" esta en fase "+ data.fase);
			//Aquí va el inicio al juego
			cw.limpiarHTML("ALL");
			cli.console(data.impostor +" "+cli.getNick());
			cli.impostor=data.impostor==cli.getNick();
			if(cli.getPersonaje()==undefined){
				cli.establecePersonaje("default");
			}			
			cli.estado="vivo";
			lanzarJuego();
		});
		this.socket.on('recibirPersonaje',function(personaje){
			cli.setPersonaje(personaje);
		});
		this.socket.on('recibirListarPartidas',function(data){
			console.log(data);
		});
		this.socket.on('recibirListarPartidasDisponibles',function(data){
			console.log(data);
			if(!cli.codigo)
				cw.mostrarUnirAPartida(data);
		});
		this.socket.on('recibirVotacion',function(data){
			console.log(data);

		});
		this.socket.on('activarReport',function(data){
			console.log(data);
			//Dibujar Votación --> un formulario, radioButton, etc...
		});
		this.socket.on('dibujarRemoto',function(data){
			for(var jugador in data)
				if(data[jugador].nick != cli.getNick()){
					console.log(">>"+data[jugador]);
					lanzarJugadorRemoto(data[jugador]);
				}
				crearColision();
		});
		this.socket.on('moverRemoto',function(data){
			moverRemoto(data);
		});
		/*this.socket.on('recibirEngargo',function(data){
			cli.setEncargo(data.encargo);
			cli.setImpostor(data.impostor);
			cw.mostrarModalSimple();
		});*/
		this.socket.on('msgToChat',function(data){
			console.log("me ha llegado: "+data.nick+" "+data.msg);
			cw.inyectarMensaje(data);
		});
		this.socket.on('recibirAtaque',function(tripulante){
			if(cli.getNick() == tripulante)
				cli.setEstado("fantasma");
		})
		/** COMPLETAR FALTA EMIT
		this.socket.on('recibirEncargo',function(data){
			console.log(data);
			if(data.impostor)
				$('#avisarImpostor').modal("show");
		});**/
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