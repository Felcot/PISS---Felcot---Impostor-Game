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
	this.lanzarSocketSrv = function(io,juego){
		var cli = this;
		io.on('connection',function(socket){	// bloques io.on primer mensaje "connection" socket referencia al cliente que lo ha pedido	    
		    socket.on('crearPartida', function(nick,num) {
		        var codigo=juego.crearPartida(num,nick);	
				socket.join(codigo);	      
				console.log('Usuario: '+nick+" crea partida codigo: "+codigo);
				var lista = juego.listarJugadores(codigo);
				var result = codigo != "fallo"?{"codigo":codigo,"owner":nick,"lista":lista}: {"Error":codigo};
				 		
		       	cli.enviarRemitente(socket,"partidaCreada",result);
		       	//cli.enviarGlobal(socket,"recibirListarPartidasDisponibles",lista);		        		        
		    });

		    socket.on('unirAPartida',function(nick,codigo){
		    	console.log('El usuario: '+ nick + ' quiere unirse a la partida '+codigo);
		    	var result = juego.unirAPartida(codigo,nick);
		    	socket.join(codigo);
		    	var lista =  juego.listarJugadores(codigo);

		    	cli.enviarRemitente(socket,"unidoAPartida",{"codigo" : codigo,"lista":lista});
		    	cli.enviarATodosMenosRemitente(socket,codigo,"nuevoJugador",lista);
		    });
		    socket.on('abandonarPartida',function(nick,codigo){
		    	console.log("El usuario: "+ nick+ " quiere abandonar la partida" + codigo);
		    	var result = juego.abandonarPartida(nick);
		    	cli.enviarATodosMenosRemitente(socket,codigo,"haAbandonadoPartida",{"nick":nick,"check":result});
		    });

		    socket.on('iniciarPartida',function(nick,codigo){
		    	var fase = juego.iniciarPartida(nick,codigo);
		    	var partida = juego.getPartida(codigo);
		    	console.log("Impostor ---_----->"+partida.getImpostor());
		    	var data = {"codigo":codigo,"fase":fase.nombre,"impostor": partida.getImpostor()};
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
		    	data.lista = juego.listarVivos(codigo);
		    	console.log(">>ServidorWS.juego.");
		    	console.log(data);
		    	console.log("<<");
		    	cli.enviarATodos(io,codigo,"activarReport",data);
		    });
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
		    	}
		    });
		    socket.on('enviarAtaque',function(impostor,codigo,tripulante){
		    	var partida = juego.getPartida(codigo);
		    	console.log("serverWS.eviarAtaque: Impostor --> "+impostor+" Tripulanteeee --> "+tripulante);
		    	if(partida.impostorMatar(impostor,tripulante)){
		    		//console.log("enviarAtaque.tripulante["+tripulante+"]");
		    		cli.enviarATodos(io,codigo,"recibirAtaque",tripulante);
		    	}
		    	cli.enviarRemitente(socket,"ataqueRealizado",true);
		    });
		    socket.on('pintarTumba',function(codigo,tripulante,personaje) {
		    	cli.enviarATodos(io,codigo,"pintarTumba",{"tripulante":tripulante,"personaje":personaje});
		    })
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
		    	cli.enviarRemitente(socket,"actualizarEncargo",data.data);
		    	if(estadoPartida.fase=="final"){
		    		cli.enviarATodos(io,codigo,"mostrarFinal",estadoPartida.fase);
		    	}else{
		    		cli.enviarATodos(io,codigo,"mostrarPorcentaje",estadoPartida.porcentaje);
		    	}
		    	/*estadoPartida ? cli.enviarATodos(socket,"terminarPartida",data):console.log(estadoPartida);*/
		    });
		    socket.on('chat',function(nick,codigo,msg){
		    	var data = {"nick": nick, "msg": msg};
		    	console.log(data);
		    	cli.enviarATodos(io,codigo,"msgToChat",data);
		    });
		});
	}
}
module.exports.ServidorWS = ServidorWS;