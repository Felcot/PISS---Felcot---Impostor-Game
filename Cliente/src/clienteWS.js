function ClienteWS (name,controlWeb){
	this.socket = undefined;
	this.nick = name;
	this.codigo;
	this.personaje;
	this.owner = false;
	this.cw = controlWeb;
	this.impostor;
	this.estado;
	this.encargo;
	this.time=0;
	this.heVotado=false;
	this.ini=function(){
		this.socket=io.connect();
		this.lanzarSocketSrv();
	}
	this.reloj=function(cont){
		setTimeout(function(){ws.mostrarReloj(cont)},1000);
	}
	this.mostrarReloj=function(cont){
		if(cont==-1){
			ataqueOn=true;
			return;
		}
		cw.mostrarReloj(cont);
		this.reloj(cont-1);
	}

	this.getImpostor =function(){
		return this.impostor;
	}
	this.setImpostor= function(impostor){
		this.impostor = impostor;
	}
	this.puedoLeer=function(data){
		return data.estado==undefined || (data.estado == "vivo" || ws.getEstado()=="fantasma");
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
		this.socket.emit('chat',this.getNick(),this.getCodigo(),msg,this.getEstado());
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
	this.tengoEncargo=function(name){
		if(this.getEncargo()[name]) return true;
		return false;
	}
	this.getEncargo=function(){
		return this.encargo;
	}
	this.setEncargo=function(encargo){
		this.encargo=encargo;
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
	this.reset=function(){
		this.codigo=undefined;
		this.personaje=undefined;
		this.owner = false;
		this.impostor=false;
		this.estado=undefined;
		this.encargo=undefined;
		resetGame();
	}
	this.crearPartida = function(max,numImpos,numTarea,propiedad,cooldown){
		// emit genera una peticion al servidor, se puede paquetizar todo mas con objetos json
		this.socket.emit('crearPartida',this.getNick(), max,numImpos,numTarea,propiedad,cooldown);
	}
	this.unirAPartida = function(codigo){
		this.setCodigo(codigo);
		this.socket.emit('unirAPartida',this.getNick(),this.getCodigo());
	}
	this.iniciarPartida = function(){
		this.socket.emit('iniciarPartida',this.getNick(),this.getCodigo());
	}
	this.abandonarPartida = function(condition){
		ws.console("Abandonando");
		this.socket.emit('abandonarPartida',this.getNick(),this.getCodigo(),condition);
	}

	this.listaPartidas = function(){
		this.socket.emit('listaPartidas');
	}
	this.listaPartidasDisponibles = function(){
		this.socket.emit('listaPartidasDisponibles');
	}
	this.report = function(){
		console.log("report."+this.nick+"."+this.codigo);
		this.socket.emit('report',this.getNick(),this.getCodigo());
	}
	this.votar = function(votado){
		this.console(this.getNick()+" Estoy votando:"+votado+" En la partida:"+this.getCodigo());
		this.socket.emit('votar',this.getNick(),votado,this.getCodigo());
	}	
	this.obtenerListaJugadores = function(){
		this.socket.emit('EstoyDentro',this.getNick(),this.getCodigo());
	}
	this.movimiento=function(direccion,x,y){
		this.socket.emit('movimiento',this.getNick(),this.getCodigo(),direccion,x,y,this.estado,this.personaje);
	}
	this.obtenerPersonajes=function(){
		this.socket.emit('obtenerPersonajes',this.codigo);
	}
	this.establecePersonaje=function(id){
		this.socket.emit('establecerPersonajeServidor',this.getCodigo(),this.getNick(),id);
	}
	this.estoyDentro = function(){
		this.socket.emit('estoyDentro',this.getCodigo());
	}
	this.realizarTarea = function(nombre){
		this.socket.emit('realizarTarea',this.getNick(),this.getCodigo(),nombre);
	}
	this.consultarLayout = function(nombre){
		this.socket.emit('consultarLayout',this.getNick(),this.getCodigo(),nombre,this.estado);
	}
	this.atacar = function(tripulante){
		this.socket.emit('enviarAtaque',this.getNick(),this.getCodigo(),tripulante);
	}
	this.heMuerto= function(tripulante){
		this.socket.emit('pintarTumba',this.getCodigo(),tripulante,this.personaje);
	}
	this.obtenerEncargo=function(){
		this.socket.emit('obtenerEncargo',this.getCodigo(),this.getNick());
	}
	this.estamosJugando=function(){
		return this.fase == "jugando";
	}
	this.volverVotacion=function(){
		if(this.heVotado)this.socket.emit('volverVotacion',this.getNick(),this.getCodigo());
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
			if(data.check){
				if(data.condition)abandonarPartida(data.nick);
				cw.mostrarModalAbandonarPartida("Ha abandondo Partida "+data.nick,false);
			}
		});
		this.socket.on('hasAbandonadoPartida',function(data){
			if(data.check){
				cli.console("Hola Abandonando");
				cw.mostrarModalAbandonarPartida(data.nick+" has abandondo Partida",true);
				cli.reset();
			}
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
			cli.fase="jugando";
			cli.time=parseInt(data.time);
			cli.reloj(cli.time);
			cli.obtenerEncargo();
			cw.mostrarJuego();
			lanzarJuego();
			cw.mostrarBarra();
			
		});
		this.socket.on('recibirEncargo',function(data){
			cli.setEncargo(data.encargo);
			cw.anunciarTareas(cli.encargo);
		});
		this.socket.on('obtenerPersonajes',function(data){
			if(data){
				cw.mostrarElegirPersonaje(data);
			}
		})
		this.socket.on('recibirPersonaje',function(personaje){
			ws.console(personaje);
			cli.setPersonaje(personaje);
			cw.mostrarPersonaje(personaje);
		});
		this.socket.on('recibirListarPartidas',function(data){
			console.log(data);
		});
		this.socket.on('recibirListarPartidasDisponibles',function(data){
			console.log(data);
			console.log("codigo ="+ cli.codigo);
			if(!cli.codigo)
				cw.mostrarUnirAPartida(data);
		});
		this.socket.on('actualizarListarPartidasDisponibles',function(lista){
			cw.actualizarMostrarUnirAPartidas(lista);
		});
		this.socket.on('recibirVotacion',function(data){
			cli.setEstado(data.votado == cli.getNick()?"fantasma":cli.getEstado());
			votarOn = true;
			ws.fase="jugando";
			cw.anunciarVotacion(data.msg);
			cli.heVotado=false;
		});
		
		this.socket.on('activarReport',function(data){
			cli.heVotado = true;
			console.log(cli.getNick() + ".activarReport");
			console.log(data);
			if(data.fase =="votacion"){
				votarOn=false;
				ws.fase=data.fase;
				report();
				cw.mostrarVotaciones(data.lista);
			}
		});
		this.socket.on('dibujarRemoto',function(data){
			for(var jugador in data)
				if(data[jugador].nick != cli.getNick()){
					console.log(">>DibujarRemoto");
					console.log(data[jugador]);
					console.log("<<");
					lanzarJugadorRemoto(data[jugador]);
				}
				crearColision();
		});
		this.socket.on('moverRemoto',function(data){
			moverRemoto(data);
		});
		
		this.socket.on('msgToChat',function(data){
			console.log("me ha llegado: "+data.nick+" "+data.msg);
			cw.inyectarMensaje(data);
		});
		this.socket.on('recibirAtaque',function(tripulante){
			if(cli.getNick() == tripulante){
				cli.setEstado("fantasma");
				cli.heMuerto(tripulante);
			}
		});
		this.socket.on('pintarTumba',function(data){
			cli.console(data);
			dibujarMuertos(data);
		});
		this.socket.on('ataqueRealizado',function(data){
			cli.reloj(cli.time);
		});
		this.socket.on('heIntentadoAtacar',function(data){
			ataqueOn=data;
		});
		this.socket.on('mostrarPorcentaje',function(porcentaje){
			cw.mostrarPorcentaje(porcentaje);
		});
		this.socket.on('actualizarEncargo',function(encargo){
			cli.getEncargo()[encargo.name]= encargo;
			tareasOn = true;
		});
		this.socket.on('anunciarGanadores',function(msg){
			ws.fase="final";
			cw.mostrarModalGanadores(msg);
		});
		this.socket.on('anunciarTareas',function(data){
			console.log("anunciarTareas");
			cw.anunciarTareas(cli.encargo);
		});
		this.socket.on('anunciarMuertos',function(data){
			console.log("anunciarMuertos");
			cw.mostrarMuertos(data);
		});
		this.socket.on('iniciarReport',function(data){
			ws.report();
		});
		this.socket.on('consultarLayout',function(data){
			layoutOn=data;
		});

	}
	this.ini();
}
