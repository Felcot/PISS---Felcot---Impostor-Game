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
		        var usr=new modelo.Usuario(nick);
				var codigo=juego.crearPartida(num,usr);	
				socket.join(codigo);	      
				console.log('Usuario: '+nick+" crea partida codigo: "+codigo);  				
		       	cli.enviarRemitente(socket,"partidaCreada",{"codigo":codigo,"owner":nick});		        		        
		    });

		    socket.on('unirAPartida',function(nick,codigo){
		    	console.log('El usuario: '+ nick + ' quiere unirse a la partida '+codigo);
		    	var result = juego.unirAPartida(nick,codigo);
		    	socket.join(codigo);
		    	var owner = juego.partidas[codigo].nickOwner;
		    	cli.enviarRemitente(socket,"unidoAPartida",{"codigo" : codigo,"owner":owner});
		    	cli.enviarATodosMenosRemitente(socket,codigo,"nuevoJugador",nick);
		    });

		    socket.on('iniciarPartida',function(nick,codigo){
		    	// var usr = juego.usuario(nick);
		    	// var fase = usr.iniciarPartida();
		    	// var codigo = usr.getPartidaCode();
		    	// cli.enviarATodos(socket,"partidaIniciada",{"codigo":codigo,"fase":fase});

		    	juego.iniciarPartida(nick,codigo);
		    	var fase = juego.partias[codigo].fase.nombre;
		    	cli.enviarATodos(socket,"partidaIniciada",{"codigo":codigo,"fase":fase});
		    });
		    socket.on('listarPartidas',function(nick,codigo){
		    	var data = juego.listarPartidas();
		    	cli.enviarRemitente(socket,"recibirListarPartidas",data);
		    });
		    socket.on('listarPartidasDisponibles',function(nick,codigo){
		    	var data = juego.listarPartidasDisponibles();
		    	cli.enviarRemitente(socket,"recibirListarPartidasDisponibles",data);
		    });
		});
	}
}
module.exports.ServidorWS = ServidorWS;