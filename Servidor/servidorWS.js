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
		    	fase.nombre == "jugando" ? cli.enviarATodos(io,codigo,"partidaIniciada",data): cli.enviarRemitente(socket,"esperando",data);
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
		    socket.on('movimiento',function(nick,codigo,direccion,x,y){
		    	cli.enviarATodosMenosRemitente(socket,codigo,"moverRemoto",{"nick":nick,"direccion":{"nombre":direccion,"x":x,"y":y}});
		    });
		    socket.on('estoyDentro',function(codigo){
		    	var lista = juego.listarJugadores(codigo);
		    	cli.enviarRemitente(socket,"dibujarRemoto",lista);
		    });
		    socket.on('report',function(nick,codigo){
		    	var data = juego.report(nick,codigo);
		    	cli.enviarATodos(io,codigo,"activarReport",data);
		    });
		    socket.on('votar',function(nick,votado){
		    	var data = juego.usuario[nick].votar(votado);
		    	cli.enviarATodos(socket,"recibirVotacion",data);
		    });
		    socket.on('establecerPersonajeServidor',function(codigo,nick,id){
		    	var usr = juego.partidas[codigo].usuarios[nick];
		    	usr.elegirPersonaje(id);
		    	var personaje = usr.getPersonaje(); 
		    	cli.enviarRemitente(socket,"recibirPersonaje",personaje);
		    })
		});
	}
}
module.exports.ServidorWS = ServidorWS;