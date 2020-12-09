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
		    	var data = {"codigo":codigo,"fase":fase.nombre};
		    	fase.nombre == "Jugando" ? cli.enviarATodos(io,codigo,"partidaIniciada",data): cli.enviarRemitente(socket,"esperando",data);
		    	fase.nombre == "Jugando" ? lanzarJuego():console.log("No se ha lanzado el juego");
		    });
		    socket.on('listaPartidas',function(nick,codigo){
		    	var data = juego.listarPartidas();
		    	cli.enviarRemitente(socket,"recibirListarPartidas",data);
		    });
		    socket.on('listaPartidasDisponibles',function(nick,codigo){
		    	var data = juego.listarPartidasDisponibles();

		    	console.log("ListaPartidasDisponibles:-->"+data);
		    	cli.enviarRemitente(socket,"recibirListarPartidasDisponibles",data);
		    });
		    socket.on('meHeMovido',function(codigo,personaje,direccion){
		    	cli.enviarATodosMenosRemitente(socket,codigo,"seHaMovido",{"personaje":personaje,"direccion":direccion});
		    });
		    socket.on('estoyDentro',function(nick,codigo){
		    	var lista = juego.partida[codigo].obtenerListaJugadores();
		    	/*var jugador = juego.getPartida(codigo).getUsuario(nick);
		    	data={"nick":nick,"personaje":juegador.getPersonaje()};
		    	cli.enviarATodosMenosRemitente(socket,codigo,"dibujarRemoto",data);*/
		    	cli.enviarRemitente(socket,"dibujarRemoto",lista);
		    });
		    socket.on('report',function(nick,codigo){
		    	var data = juego.report(nick,codigo);
		    	cli.enviarATodos(io,codigo,"activarReport",data);
		    });
		    socket.on('votar',function(nick,votado){
		    	data = juego.usuario[nick].votar(votado);
		    	cli.enviarATodos(socket,"recibirVotacion",data);
		    });
		});
	}
}
module.exports.ServidorWS = ServidorWS;