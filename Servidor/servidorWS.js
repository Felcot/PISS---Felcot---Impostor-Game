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

	this.lanzarSocketSrv = function(io,juego){
		var cli=this;
		io.on('connection',function(socket){	// bloques io.on primer mensaje "connection" socket referencia al cliente que lo ha pedido	    
		    socket.on('crearPartida', function(nick,num) {
		        var codigo=juego.crearPartida(num,nick);	
				socket.join(codigo);	      
				console.log('Usuario: '+nick+" crea partida codigo: "+codigo);
				var data = codigo != "fallo"?{"codigo":codigo,"owner":nick}: {"Error":codigo}; 				
		       	cli.enviarRemitente(socket,"partidaCreada",data);		        		        
		    });

		    socket.on('unirAPartida',function(nick,codigo){
		    	console.log('El usuario: '+ nick + ' quiere unirse a la partida '+codigo);
		    	var result = juego.unirAPartida(codigo,nick);
		    	socket.join(codigo);
		    	var owner = juego.partidas[codigo].nickOwner;
		    	cli.enviarRemitente(socket,"unidoAPartida",{"codigo" : codigo,"owner":owner});
		    	cli.enviarATodosMenosRemitente(socket,codigo,"nuevoJugador",nick);
		    });
		    socket.on('abandonarPartida',function(nick,codigo){
		    	console.log("El usuario: "+ nick+ " quiere abandonar la partida" + codigo);
		    	var result = juego.abandonarPartida(nick);
		    	cli.enviarATodosMenosRemitente(socket,codigo,"haAbandonadoPartida",{"nick":nick,"check":result});
		    });

		    socket.on('iniciarPartida',function(nick,codigo){
		    	var fase = juego.iniciarPartida(nick,codigo);
		    	cli.enviarATodos(io,codigo,"partidaIniciada",{"codigo":codigo,"fase":fase.nombre});
		    });
		    socket.on('listaPartidas',function(nick,codigo){
		    	var data = juego.listarPartidas();
		    	cli.enviarRemitente(socket,"recibirListarPartidas",data);
		    });
		    socket.on('listaPartidasDisponibles',function(nick,codigo){
		    	var data = juego.listarPartidasDisponibles();

		    	console.log(data);
		    	cli.enviarRemitente(socket,"recibirListarPartidasDisponibles",data);
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