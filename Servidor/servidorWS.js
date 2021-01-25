var modelo = require("./modelo.js");
function ServidorWS(){
	this.enviarRemitente=function(socket,mens,datos){
        socket.emit(mens,datos);
    }
	this.enviarATodos=function(io,habitacion,mens,datos){
        io.sockets.in(habitacion).emit(mens,datos);
    }
    this.enviarATodosMenosRemitente=function(socket,habitacion,mens,datos){
        socket.broadcast.to(habitacion).emit(mens,datos)
    }
    this.enviarGlobal= function(socket,mens,datos){
    	socket.broadcast.emit(mens,datos);
    }
    this.evaluarPartida=function(io,juego,codigo){
    	var partida = juego.getPartida(codigo);
    	if(!partida)return;
    	var fase = partida.evaluarPartida()
		if(fase.nombre == "final"){
			this.enviarATodos(io,codigo,"anunciarGanadores",fase.anunciarGanador());
		}
    }
	this.lanzarSocketSrv = function(io,juego){
		var cli = this;
		io.on('connection',function(socket){	// bloques io.on primer mensaje "connection" socket referencia al cliente que lo ha pedido	    
		    socket.on('crearPartida', function(nick,max,numImpos,numTarea,propiedad,cooldown) {
		        var codigo=juego.crearPartida(nick,max,numImpos,numTarea,propiedad,cooldown);	
				socket.join(codigo);	      
				console.log('Usuario: '+nick+" crea partida codigo: "+codigo);
				var lista = juego.listarJugadores(codigo);
				var result = codigo != "fallo"?{"codigo":codigo,"owner":nick,"lista":lista}: {"Error":codigo};
				 		
		       	cli.enviarRemitente(socket,"partidaCreada",result);
		       	cli.enviarGlobal(socket,"actualizarListarPartidasDisponibles",juego.listarPartidasDisponibles());		        		        
		    });

		    socket.on('unirAPartida',function(nick,codigo){
		    	console.log('El usuario: '+ nick + ' quiere unirse a la partida '+codigo);
		    	var payload = juego.unirAPartida(codigo,nick);
		    	console.log(payload);
		    	socket.join(codigo);
		    	var lista =  juego.listarJugadores(codigo);

		    	cli.enviarRemitente(socket,"unidoAPartida",{"nick":payload.nick,"codigo" : codigo,"lista":lista});
		    	cli.enviarATodosMenosRemitente(socket,codigo,"nuevoJugador",lista);
		    });
		    socket.on('abandonarPartida',function(nick,codigo,condition){
		    	console.log("El usuario: "+ nick+ " quiere abandonar la partida" + codigo);
		    	var result = juego.abandonarPartida(nick);
		    	var data = {"nick":nick,"check":result,"condition":condition}
		    	cli.enviarATodosMenosRemitente(socket,codigo,"haAbandonadoPartida",data);
		    	cli.enviarRemitente(socket,"hasAbandonadoPartida",data);
		    	if(condition){ 
		    		cli.evaluarPartida(io,juego,codigo);
		    	}else{
		    		var lista =  juego.listarJugadores(codigo);
		    		cli.enviarATodosMenosRemitente(socket,codigo,"nuevoJugador",lista);
		    	}
		    });

		    socket.on('iniciarPartida',function(nick,codigo){
		    	var fase = juego.iniciarPartida(nick,codigo);
		    	var partida = juego.getPartida(codigo);
		    	console.log("Impostor ---_----->"+partida.getImpostor());
		    	var data = {"codigo":codigo,"fase":fase.nombre,"impostor": partida.getImpostor(),"time":partida.getConfContainer().getCooldown()};
		    	fase.nombre == "jugando" ? cli.enviarATodos(io,codigo,"partidaIniciada",data): cli.enviarRemitente(socket,"esperando",data);
		    	 });
		    socket.on('listaPartidas',function(nick,codigo){
		    	var data = juego.listarPartidas();
		    	cli.enviarRemitente(socket,"recibirListarPartidas",data);
		    });
		    socket.on('listaPartidasDisponibles',function(nick,codigo){
		    	var data = juego.listarPartidasDisponibles();
		    	cli.enviarRemitente(socket,"recibirListarPartidasDisponibles",data);
		    });
		    socket.on('movimiento',function(nick,codigo,direccion,x,y,estado,id){
		    	cli.enviarATodosMenosRemitente(socket,codigo,"moverRemoto",{"nick":nick,"id":id,"direccion":{"nombre":direccion,"x":x,"y":y},"estado":estado});
		    });
		    socket.on('estoyDentro',function(codigo){
		    	var lista = juego.listarJugadores(codigo);
		    	cli.enviarRemitente(socket,"dibujarRemoto",lista);
		    });
		    socket.on('report',function(nick,codigo){
		    	var data = juego.report(nick,codigo);
		    	data.lista = juego.listarJugadorBy(codigo,"vivo");
		    	console.log(">>ServidorWS.juego.");
		    	console.log(data);
		    	console.log("<<");
		    	cli.enviarATodos(io,codigo,"activarReport",data);
		    });
		    socket.on('volverVotacion',function(nick,codigo){
		    	console.log("servidorWS.volverVotacion");
		    	var data={"fase":juego.getPartida(codigo).getFase().nombre,"lista":juego.listarJugadorBy(codigo,"vivo")};
		    	cli.enviarRemitente(socket,"activarReport",data);
		    })
		    socket.on('votar',function(nick,votado,codigo){
		    	juego.usuario[nick].votar(votado);
		    	var cond = juego.getPartida(codigo).comprobarVotacion();
		    	console.log("ServidorWS.votar.comprobarVotacion("+cond+")");
		    	if(cond){
		    		var data = juego.getPartida(codigo).recuento();
		    		console.log("ServidorWS.votar>>");
			    	console.log(data);
			    	console.log("<<");
			    	
					cli.enviarATodos(io,codigo,"recibirVotacion",data);
					cli.evaluarPartida(io,juego,codigo);
		    	}
		    });
		    socket.on('enviarAtaque',function(impostor,codigo,tripulante){
		    	var partida = juego.getPartida(codigo);
		    	console.log("serverWS.eviarAtaque: Impostor --> "+impostor+" Tripulanteeee --> "+tripulante);
		    	if(partida.impostorMatar(impostor,tripulante)){
		    		cli.enviarATodos(io,codigo,"recibirAtaque",tripulante);
		    		cli.enviarRemitente(socket,"ataqueRealizado",true);
		    	}else{
		    		cli.enviarRemitente(socket,"heIntentadoAtacar",true);
		    	}
		    	
		    	cli.evaluarPartida(io,juego,codigo);
		    });
		    socket.on('pintarTumba',function(codigo,tripulante,personaje) {
		    	cli.enviarATodos(io,codigo,"pintarTumba",{"tripulante":tripulante,"personaje":personaje});
		    });
		    socket.on('obtenerPersonajes',function(codigo){
		    	var partida= juego.getPartida(codigo);
		    	var data = partida?partida.listarPersonajesLibres():undefined;
		    	cli.enviarRemitente(socket,'obtenerPersonajes',data);

		    });
		    socket.on('establecerPersonajeServidor',function(codigo,nick,id){
		    	var usr = juego.partidas[codigo].usuarios[nick];
		    	usr.elegirPersonaje(id);
		    	var personaje = usr.getPersonaje(); 
		    	cli.enviarRemitente(socket,"recibirPersonaje",personaje);
		    });
		    socket.on('obtenerEncargo',function(codigo,nick){
		    	data = {"encargo":juego.usuario(nick).getEncargo()};
		    	cli.enviarRemitente(socket,"recibirEncargo",data);
		    });
		    socket.on('realizarTarea',function(nick,codigo,tarea){
		    	var partida = juego.getPartida(codigo);
		    	var estadoPartida = partida.realizarTarea(nick,tarea); 
		    	var data = juego.usuario(nick).getEncargo()[tarea];
		    	console.log("WS - Realizar Tarea");
		    	console.log(estadoPartida);
		    	
		    	if(estadoPartida!=undefined){/*Solo sera undefined cuando la fase sea distinta de jugando*/
		    		cli.enviarRemitente(socket,"actualizarEncargo",data.data);
			    	if(estadoPartida.fase=="final"){
			    		cli.enviarATodos(io,codigo,"mostrarFinal",estadoPartida.fase);
			    	}else{
			    		cli.enviarATodos(io,codigo,"mostrarPorcentaje",estadoPartida.porcentaje);
			    	}
			    }
			    cli.evaluarPartida(io,juego,codigo);
		    	/*estadoPartida ? cli.enviarATodos(socket,"terminarPartida",data):console.log(estadoPartida);*/
		    });
		    socket.on('consultarLayout',function(nick,codigo,info,estado){
		    	console.log("ServidorWS.consultarLayout."+nick+"."+codigo+"."+info);
		    	var partida = juego.getPartida(codigo);
		    	cli.enviarRemitente(socket,"consultarLayout",true);
		    	if(partida.esJugando()){
		    		info=="tareas"?cli.enviarRemitente(socket,"anunciarTareas",""):
		    		info=="muertos"?cli.enviarRemitente(socket,"anunciarMuertos",partida.listarJugadorBy("fantasma")):
		    		info=="report"&& estado == "vivo"?cli.enviarRemitente(socket,"iniciarReport",""):console.log("error.consultarLayout.NoneItsEquals");
		    	}
		    });
		    socket.on('chat',function(nick,codigo,msg,estado){
		    	var data = {"nick": nick, "msg": msg,"estado":estado};
		    	console.log(data);
		    	cli.enviarATodos(io,codigo,"msgToChat",data);
		    });
		});
	}
}
module.exports.ServidorWS = ServidorWS;