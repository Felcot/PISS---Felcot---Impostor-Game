var minimo = 2;
function Juego(){
	this.partidas={};
	this.usuario={};
	this.crearPartida=function(num,nick){
			try{
				if((num < minimo) || (num > 10)){
				 	throw new Exception("N410");
				}

			let codigo=this.obtenerCodigo();
			if (!this.partidas[codigo]){
				this.partidas[codigo]= new Partida(num,nick,this);
				this.partidas[codigo].iniciarPersonajes();
				var usr =  this.partidas[codigo].usuarios;
				this.usuario[nick] = usr[nick];
			}
			return codigo;
		}catch(Exception){
			return "fallo";
		}
	}
	
	this.unirAPartida=function(codigo,nick){
		if (this.partidas[codigo]){
			this.partidas[codigo].agregarUsuario(nick);
		}
	}
	
	this.obtenerCodigo=function(){
		let cadena="ABCDEFGHIJKLMNOPQRSTUVXYZ";
		let letras=cadena.split('');
		let maxCadena=cadena.length;
		let codigo=[];
		for(i=0;i<6;i++){
			codigo.push(letras[randomInt(1,maxCadena)-1]);
		}
		return codigo.join('');
	}
	
	this.eliminarPartida= function(codigo){
		delete this.partida[codigo];
	}
	this.listarPartidasDisponibles=function(){
		var result = [];
		var huecos = 0;
		for (var key in this.partidas){
			var partida = this.partidas[key];
			if(partida.sePuedeEntrar() && partida.comprobarMaximo()){
				huecos = partida.emptyFree();
				result.push({"codigo":key,"ocupado":(partida.maximo-huecos),"maximo":partida.maximo});
			}
		}
		return result;
	}
	this.listarPartidas=function(){
		var result = [];
		var huecos = 0;
		for (var key in this.partidas){
			var partida = this.partidas[key];
			result.push({"codigo": key, "fase":partida.getFase()});
			}
		return result;
	}
	this.listarJugadores=function(codigo){
		var partida = this.getPartida(codigo);
		if(partida)
			return partida.listarJugadores();
		else
			console.log("no existe ese codigo");
	}
	this.usuario=function(nick){
		return this.usuario[nick];
	}
	this.nuevoUsuario= function(usr){
		var nick = usr.getNick();
		this.usuario[nick] = usr;
	}

	this.iniciarPartida = function(nick){
		var usuario = this.usuario(nick);
		return usuario ? usuario.iniciarPartida():false;
	}	
	this.getPartida = function(codigo){
		return this.partidas[codigo] ? this.partidas[codigo] : undefined;
	}
	this.abandonarPartida = function(nick){
		var usuario = this.usuario(nick);
		return usuario? usuario.abandonarPartida(): console.log("No he abandonado nick:"+nick);	
	}
	this.report=function(nick,codigo){
		var usuario = this.usuario(nick);
		return (usuario && usuario.Partida == this.getPartida(codigo))? usuario.report(): {"Error": "No reportado"};
	}
}

function Partida(num,owner,juego){
	this.maximo=num;
	this.nickOwner=owner;
	this.fase=new Inicial();
	this.usuarios={};
	this.juego = juego;
	this.contenedor = new contenedor();
	this.sprites=[];
	this.iniciarPersonajes = function(){
		var spritesNumber = 8;
		for (var id = 0; id < spritesNumber; id++){
			this.sprites.push({"id":id,"elegido":false});
		} 
	}
	
	this.elegirPersonaje=function(usr,id){
		if(id == "default"){
			var lista = this.listarPersonajesLibres();
			this.elegirPersonaje(usr,lista[0]);
		}else{
			console.log("El id es --->"+this.sprites[id].id);
			usr.setPersonaje(this.sprites[id].id);
			this.sprites[id].elegido = true;
		}	
	}
	this.listarPersonajesLibres=function(){
		var result = [];
		for (var id = 0; id < this.sprites.length;id++){
			if(!this.sprites[id].elegido)
				result.push(this.sprites[id].id);
		}
		return result;
	}
	this.listarJugadores=function(){
		var result = [];
		for (var nick in this.usuarios){
			result.push({"nick":this.usuarios[nick].getNick(),"personaje":this.usuarios[nick].getPersonaje()});
		}
		return result;
	}
	this.getUsuarios = function(nick){
		return this.usuarios[nick];
	}
	this.agregarUsuario=function(nick){
		this.fase.agregarUsuario(nick,this);
	}
	this.puedeAgregarUsuario=function(nick){
		let nuevo=nick;
		let contador=1;
		while(this.usuarios[nuevo]){
			nuevo=nick+contador;
			contador=contador+1;
		}
		this.usuarios[nuevo]=new Usuario(nuevo);
		this.juego.nuevoUsuario(this.usuarios[nuevo]);
		this.usuarios[nuevo].partida = this;
	}
	this.comprobarMinimo=function(){
		return sizeDictionary(this.usuarios)>=minimo;
	}
	this.comprobarMaximo=function(){
		return sizeDictionary(this.usuarios)<this.maximo
	}
	this.iniciarPartida=function(){
			return this.fase.iniciarPartida(this);
	}
	this.abandonarPartida=function(nick){
		this.fase.abandonarPartida(nick,this);
		return this.getUsuarios(nick);
	}
	this.expulsarJugador=function(nick){
		this.fase.expulsarJugador(nick,this);
	}
	this.eliminarUsuario=function(nick){
		this.contenedor.eliminar(nick,this.usuarios[nick].impostor,this);
		delete this.usuarios[nick];
		// if(this.comprobarUsuarios()<0)
		// 	this.juego.eliminarPartida(this.codigo);
		return this.comprobarUsuarios()<0 ? this.eliminarPartida(this.codigo) : false;
	}
	this.comprobarUsuarios=function(){
		return sizeDictionary(this.usuarios);
	}
	this.AsignarTarea = function(){
		for(var usr in this.usuarios){
			if(!this.usuarios[usr].impostor){
				this.usuarios[usr].encargo = encargo();
				this.contenedor.declarar(this.usuarios[usr]);
			}
		}
	}
	this.AsignarImpostor = function(){
		let keys = Object.keys(this.usuarios);
		let usr = this.usuarios[keys[randomInt(0,keys.length)]];
		usr.impostor = true;
		this.contenedor.declarar(usr);
	}
	this.puedeIniciarPartida = function(){
		this.AsignarImpostor();
		this.AsignarTarea();
		this.fase = new Jugando();
		return this;
	}

	this.evaluarPartida = function(){
		F =(impostores,crewmates) => {return impostores == crewmates;};
		let cond = this.contenedor.evaluarIC(F);
		if(cond)
			this.fase = new Final('Impostores');
		
		F = (impostores) => {return impostores == 0;};
		cond = this.contenedor.evaluarI(F)
		if(cond)
			this.fase = new Final('Tripulantes');
	}

	this.eyectar=function(nick){
		if(this.usuarios[nick].impostor)
			console.log("El usuario "+nick+" era el impostor");
		else
			console.log("El usuario "+nick+" no era el impostor");
		this.matar(nick);
	}
	this.matar=function(nick){
		this.usuarios[nick].asesinado()
		this.contenedor.eliminar(nick,this.usuarios[nick].impostor,this);
	}

	this.report = function(){
		return {"Fase":this.fase.report(this)};
	}

	this.votar = function(usr,nick){
		return this.fase.votar(usr,nick);
	}
	this.recuento = function(){
		this.fase.recuento(this);
	}
	this.sePuedeEntrar = function(){
		return this.fase.nombre == "inicial" || this.fase.nombre == "completado";
	}
	this.emptyFree= function(){
		return this.maximo - this.comprobarUsuarios();
	}
	this.getFase =function(){
		return this.fase;
	}
	this.getCodigo= function(){
		return this.codigo;
	}
	this.agregarUsuario(owner);
}

function Inicial(){
	this.nombre="inicial";
	this.agregarUsuario=function(nick,partida){
		partida.puedeAgregarUsuario(nick);
		if (partida.comprobarMinimo()){
			partida.fase=new Completado();
		}		
	}
	this.iniciarPartida=function(partida){
		try{
			throw new Exception("N410C");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
			return partida;
		}

	}
	this.abandonarPartida=function(nick,partida){
		partida.eliminarUsuario(nick);
	}
	this.expulsarJugador=function(nick,partida){
		partida.eliminarUsuario(nick);
	}
	this.matar = function(nick,partida){
		try{
			throw new Exception("IM01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.report = function(partida){
		try{
			throw new Exception("IM01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
		throw new Exception("IR01");
	}
	this.recuento = function(partida){
		try{
			throw new Exception("IR02");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.anunciarGanador= function(ganadores){
		try{
			throw new Exception("IaG01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
}

function Completado(){
	this.nombre="completado";
	this.iniciarPartida=function(partida){
		return partida.puedeIniciarPartida();
	}
	this.agregarUsuario=function(nick,partida){
		if (partida.comprobarMaximo()){
			partida.puedeAgregarUsuario(nick);
		}
		else{
			try{
				throw new Exception("S10J");
			}catch(Exception){
			   /* El tratamiento esta realizado en
				* Exception
				*/
			}
		}
	}
	this.abandonarPartida=function(nick,partida){
		partida.eliminarUsuario(nick);
		if (!partida.comprobarMinimo()){
			partida.fase=new Inicial();
		}
	}
	this.expulsarJugador=function(nick,partida){
		this.abandonarPartida(nick,partida);
	}
	this.matar = function(nick,partida){
		try{
				throw new Exception("CM01");
			}catch(Exception){
			   /* El tratamiento esta realizado en
				* Exception
				*/
			}
		
	}
	this.report = function(partida){
		try{
				throw new Exception("CR01");
			}catch(Exception){
			   /* El tratamiento esta realizado en
				* Exception
				*/
			}
		
	}
	this.recuento = function(partida){
		try{
				throw new Exception("CR02");
			}catch(Exception){
			   /* El tratamiento esta realizado en
				* Exception
				*/
			}
		
	}
	this.anunciarGanador= function(ganadores){
		try{
				throw new Exception("CaG01");
			}catch(Exception){
			   /* El tratamiento esta realizado en
				* Exception
				*/
			}
		
	}
}

function Jugando(){
	this.nombre="jugando";
	this.agregarUsuario=function(nick,partida){
		try{
				throw new Exception("AUPC1");
			}catch(Exception){
			   /* El tratamiento esta realizado en
				* Exception
				*/
			}
	}
	this.iniciarPartida=function(partida){
		try{
			throw new Exception("N410C");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.abandonarPartida=function(nick,partida){
		partida.eliminarUsuario(nick);
	}
	this.expulsarJugador=function(nick,partida){
		//TODO
		//Solo cuando todos los jugadores votan por su expulsión de la partida.
	}

	this.matar=function(nick,partida){
		partida.matar(nick);
	}
	this.report = function(partida){
		return partida.fase = new Votacion();
	}
	this.recuento = function(partida){
		try{
			throw new Exception("JR01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.anunciarGanador= function(ganadores){
		try{
			throw new Exception("JaG01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
}

function Final(ganadores){
	this.nombre="final";
	this.ganan=ganadores;
	this.anunciarGanador=function(ganadores){
		console.log("Los ganadores son los "+ganadores+"!!");
	}
	this.agregarUsuario=function(nick,partida){
		try{
			throw new Exception("AUPT1");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.iniciarPartida=function(partida){
		try{
			throw new Exception("N410C");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	} //absurdo
	this.abandonarPartida=function(nick,partida){
		try{
			throw new Exception("UAP01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.expulsarJugador=function(nick,partida){
		try{
			throw new Exception("FeJ01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
		
	}
	this.recuento = function(partida){
		try{
			throw new Exception("FR02");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
		
	}
	this.matar = function(nick,partida){
		try{
			throw new Exception("CM01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
		
	}
	this.report = function(partida){
		try{
			throw new Exception("CR01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}

	this.anunciarGanador(ganadores);
}

/*
	Es en la fase, en la que se permite votar a los jugadores.
*/
function Votacion(){
	this.nombre = "votacion";
	this.votacion = {}
	this.votantes = {}
	this.votar = function(votante,nick){
		return !this.votantes[votante.nick]?this.addVotante(votante,nick):{"check":true,"Error": votante.nick+"Ya habias votado"};
	}
	this.addVotante =  function(votante,nick){
		this.votantes[votante.nick] = votante;
		return this.puedeVotar(nick);
	}
	this.puedeVotar = function(nick){
		this.votacion[nick] = !this.votacion[nick]? 1: this.votacion[nick]+1;

		return {"check":true,"Votado":nick};
	}
	this.recuento=function(partida){
		let masVotado = "skipe";
		this.votacion["skipe"] = 0;
		let check = false;
		for(var votado in this.votacion)
			if(this.votacion[masVotado]<=this.votacion[votado]){
				check = (this.votacion[masVotado] == this.votacion[votado]);
				masVotado=votado;
			}
		if(masVotado != "skipe" && !check){
			partida.eyectar(masVotado);
		}else{
			console.log("Nadie ha sido eyectado");
		}
		
		if(partida.fase.nombre != "final")
			partida.fase = new Jugando();
	}
		
	this.agregarUsuario=function(nick,partida){
		throw new Exception("VaU01");
		try{
			throw new Exception("CR01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.iniciarPartida=function(partida){
		try{
			throw new Exception("ViP01");	
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	} 
	this.abandonarPartida=function(nick,partida){
		try{
			throw new Exception("VaP01"); // Esto realmente es así comrpobar
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.expulsarJugador=function(nick,partida){
		//TODO
		try{
			throw new Exception("VeJ01"); // Esto no es cierto, debe ser implementado
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.anunciarGanador= function(ganadores){
		try{
			throw new Exception("VaG01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.matar = function(nick,partida){
		try{
			throw new Exception("VM01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.report = function(partida){
		try{
			throw new Exception("VR01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	return this.nombre;
}

function Usuario(nick,juego){
	this.nick=nick;
	this.juego=juego;
	this.partida;
	this.estado= new Vivo();
	this.encargo ="ninguno";
	this.impostor = false;
	this.personaje = undefined;
	this.elegirPersonaje=function(id){
		this.partida.elegirPersonaje(this,id);
	}
	this.getPersonaje=function(){
		return this.personaje;
	}
	//Permite establecer un personaje.
	this.setPersonaje=function(personaje){
		this.personaje = personaje;
		console.log("El usuario--->"+this.getNick()+" ha recibido el personaje:"+this.getPersonaje());
	} 
	this.getNick = function(){return this.nick;}
	this.crearPartida=function(num){
		return this.juego.crearPartida(num,this);
	}

	this.iniciarPartida=function(){
		if(this.partida.nickOwner == nick)
			return this.partida.iniciarPartida().getFase();
	}
	this.getPartidaCode = function(){
		return this.partida.getCodigo();
	}
	this.abandonarPartida=function(){
		return (!this.partida.abandonarPartida(this.nick)); // si true entonces abandona partida
	}
	this.expulsarJugador=function(nick){
		this.partida.expulsarJugador(nick);
	}
	this.votar = function(nick){
		return this.estado.votar(this,nick,this.partida);
	}
	this.report = function(){
		this.estado.report(this.partida);
	}
	this.matar = function(nick){
		if(this.impostor)
			this.estado.matar(nick,this.partida);
	}

	this.asesinado = function(){
		this.estado.asesinado(this);
	}
}


function Vivo(){
	this.nombre = "vivo";
	this.matar = function(nick,partida){
		partida.fase.matar(nick,partida);
	}
	this.asesinado = function(usr){
		usr.estado = new Fantasma();
	}
	this.votar = function(usr,nick,partida){
		partida.votar(usr,nick);
	}
	this.report = function(partida){
		partida.report();
	}
}
function Fantasma(){
	this.nombre =  "fantasma";
	this.matar = function(nick,partida){
		try{
			throw new Exception("FM01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.asesinado = function(usr){
		try{
			throw new Exception("FA01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.votar=function(nick,partida){
		try{
			throw new Exception("FV01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.report = function(partida){
		try{
			throw new Exception("FR01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}	
}

function encargo(){
	let encargos = ["Basuras","Calles","Jardines","Mobiliario"];
	return encargos[randomInt(0, encargos.length)];
}
function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

/*
	El siguiente contenedor permite observar el estado de victoria
	de la partida. Pues cada vez que el contenedor elimina a un usuario
	de los diccionarios impostor o crewmate entonces le recuerda a la partida
	que tienes que evaluar su estado de victoria.
*/
function contenedor(){
	this.impostor = {}
	this.crewmate = {}

	this.eliminar=function(nick,cond,partida){
		if(cond)
			delete this.impostor[nick];
		else
			delete this.crewmate[nick];
		partida.evaluarPartida();
	}
	
	this.declarar=function(usr){
		if(usr.impostor)
			this.impostor[usr.nick] = usr;
		else
			this.crewmate[usr.nick] = usr;
	}
	this.sizeTam= function(impostor){
		return impostor? sizeDictionary(this.impostor):sizeDictionary(this.crewmate);
	}
	this.evaluarIC=function(F){
		return F(this.sizeTam(true),this.sizeTam(false));
	}
	this.evaluarI=function(F){
		return F(this.sizeTam(true));
	}
}
// function inicio(){
// 	try{
// 		juego = new Juego();
// 		var usr =new Usuario("pepe",juego);
// 		var codigo = usr.crearPartida(4);
// 		juego.unirAPartida(codigo,"luis");
// 		juego.unirAPartida(codigo,"luias");
// 		juego.unirAPartida(codigo,"pepe");
// 		juego.unirAPartida(codigo,"luisito");

// 		usr.iniciarPartida();
// 	}catch(Exception){}
// }
function sizeDictionary(dic){
	return Object.keys(dic).length;
}
function Exception(code){
	this.diccionario= function(code){
		var dic={};
			dic["AUPC1"] = "Error AUPC1: Se ha intentado unir a una partida que ya a comenzado.";
			dic["AUPT2"] = "Error AUPT2: Se ha intentado unir a una partida que ya a terminado.";
			dic["EJ01"] = "Error EJ01: Se ha intentado expusltar a un jugador en la fase final.";
			dic["N410"] = "Error N410: Se ha intentado crear una partida ilegal, debe tener min 4 o máx 10 Jugadores.";
			dic["N410C"] = "Error N410C: Se ha intentado iniciar una partida a al que le faltan jugadoress.";
			dic["S10J"] = "Error S10J: Ya esta alcanzado el numero maximo de jugadores.";
			dic["UAP01"] = "Error UAP01: Se ha intentado abandonar partida en la fase final.";
			dic["FM01"] =  "Error MF01:  Un fantasma no puede matar.";
 			dic["FR01"] = "Error FR01: No se puede votar cuando se es fantasma.";
			dic["FV01"] = "Error FV01: No se puede votar cuando se es fantasma.";
			dic["FA01"] = "Error FA01: No se puede matar a un fantasma.";
			dic["VaU01"] = "Error VaU01: En la fase de votacion no se puede agregar nuevos usuarios.";
			dic["ViP01"] = "Error ViP01: En la fase de votacion no se puede iniciar Partida.";
			dic["VaP01"] = "Error VaP01: En la fase de votacion no se puede abandonarPartida.";
			dic["VeJ01"] = "Error VeJ01: Trabajando en ello, sera implementado en los proximos días, perdonen las molestias.";
			dic["FeJ01"] = "Error FeJ01: No se puede expulsar a un jugador en la fase final.";
			dic["IM01"] = "Error IM01: No se puede matar a ningun jugador en la fase inicial.";
			dic["IM01"] = "Error IM01: No se puede activar la señar de report en la fase inicial.";
			dic["CM01"] = "Error CM01: No se puede matar a ningun jugador en la fase completado.";
			dic["VM01"] = "Error CM01: No se puede matar a ningun jugador en la fase votacion.";
			dic["CR01"] = "Error CR01: No se puede activar la señar de report en la fase completado.";
			dic["VR01"] = "Error CR01: No se puede activar la señar de report en la fase votacion.";
			dic["IR02"] = "Error IR01: No se puede realizar el recuento en la fase Inicial.";
			dic["CR02"] = "Error CR02: No se puede realizar el recuento en la fase Completado.";
			dic["JR01"] = "Error JR01: No se puede realizar el recuento en la fase Jugando.";
			dic["FR02"] = "Error FR02: No se puede realizar el recuento en la fase Final.";
			dic["IaG01"] = "Error IaG01: No se puede anunciar un ganador en la fase Inicial."
			dic["CaG01"] = "Error IaG01: No se puede anunciar un ganador en la fase Completado."
			dic["JaG01"] = "Error IaG01: No se puede anunciar un ganador en la fase Jugando."
			dic["VaG01"] = "Error IaG01: No se puede anunciar un ganador en la fase Votacion."
 		return dic[code];
	}	
	
	this.toConsLog= function(code){
		console.log(this.diccionario(code));
	}
	this.toConsLog(code);
}

module.exports.Juego=Juego;
module.exports.Usuario=Usuario;