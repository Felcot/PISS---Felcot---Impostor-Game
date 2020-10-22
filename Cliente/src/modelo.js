function Juego(){
	this.partidas={};
	this.crearPartida=function(num,owner){
		if((num < 4) || (num > 10)){
		 	throw new Exception("N410");
		}

		let codigo=this.obtenerCodigo();
		if (!this.partidas[codigo]){
			this.partidas[codigo]=new Partida(num,owner.nick);
			owner.partida=this.partidas[codigo];
		}
		return codigo;
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
}

function Partida(num,owner){
	this.maximo=num;
	this.nickOwner=owner;
	this.fase=new Inicial();
	this.usuarios={};
	this.contenedor = new contenedor();
	this.agregarUsuario=function(nick){
		this.fase.agregarUsuario(nick,this)
	}
	this.puedeAgregarUsuario=function(nick){
		let nuevo=nick;
		let contador=1;
		while(this.usuarios[nuevo]){
			nuevo=nick+contador;
			contador=contador+1;
		}
		this.usuarios[nuevo]=new Usuario(nuevo);
		this.usuarios[nuevo].partida = this;

		//this.comprobarMinimo();
	}
	this.comprobarMinimo=function(){
		return sizeDictionary(this.usuarios)>=4
	}
	this.comprobarMaximo=function(){
		return sizeDictionary(this.usuarios)<this.maximo
	}
	this.iniciarPartida=function(){
		this.fase.iniciarPartida(this);
	}
	this.abandonarPartida=function(nick){
		this.fase.abandonarPartida(nick,this);
	}
	this.expulsarJugador=function(nick){
		this.fase.expulsarJugador(nick,this);
	}
	this.eliminarUsuario=function(nick){
		this.contenedor.eliminar(nick,this.usuarios[nick].impostor,this);
		delete this.usuarios[nick];
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
	}

	this.evaluarPartida = function(){
		F =(impostores,crewmates) => {return impostores == crewmates;};
		let cond = this.contenedor.evaluarIC(F);
		if(cond)
			this.fase = new Final('Impostores');
		
		F = (impostores) => {return impostores == 0;};
		cond = this.contenedor.evaluarI(F)
		if(cond)
			this.fase = new Final('Tripulantes')
	}

	this.eyectar=function(nick){
		if(this.usuarios[nick].impostor)
			console.log("El usuario "+nick+" era el impostor");
		else
			console.log("El usuario "+nick+" no era el impostor");
		this.matar(nick);
	}
	this.matar=function(nick){
		this.usuarios[nick].estado = new Fantasma();
		this.contenedor.eliminar(nick,this.usuarios[nick].impostor,this);
	}

	this.report = function(){
		this.fase.report(this);
	}

	this.votar = function(nick){
		this.fase.votar(nick);
	}
	this.recuento = function(){
		this.fase.recuento(this);
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
		throw new Exception("N410C");
	}
	this.abandonarPartida=function(nick,partida){
		partida.eliminarUsuario(nick);
		//comprobar si no quedan usr
	}
	this.expulsarJugador=function(nick,partida){
		partida.eliminarUsuario(nick);
	}
}

function Completado(){
	this.nombre="completado";
	this.iniciarPartida=function(partida){
		partida.puedeIniciarPartida();
	}
	this.agregarUsuario=function(nick,partida){
		if (partida.comprobarMaximo()){
			partida.puedeAgregarUsuario(nick);
		}
		else{
			new Exception("S10J")
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
}

function Jugando(){
	this.nombre="jugando";
	this.agregarUsuario=function(nick,partida){
		throw new Exception("AUPC1")
	}
	this.iniciarPartida=function(partida){
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
		partida.fase = new Votacion();
	}
}

function Final(ganadores){
	this.nombre="final";
	this.ganan=ganadores;
	this.anunciarGanador=function(ganadores){
		console.log("Los ganadores son los "+ganadores+"!!");
	}
	this.agregarUsuario=function(nick,partida){
		throw new Exception("AUPT1");
	}
	this.iniciarPartida=function(partida){} //absurdo
	this.abandonarPartida=function(nick,partida){
		throw new Exception("UAP01");
	}
	this.expulsarJugador=function(nick,partida){
		throw new Exception("EJ01");
	}
	this.anunciarGanador(ganadores);
}

/*
	Es en la fase, en la que se permite votar a los jugadores.
*/
function Votacion(){
	this.nombre = "votacion";
	this.votacion = {}
	this.votar = function(nick){
		if(!this.votacion[nick])
			this.votacion[nick] = 1;
		else
			this.votacion[nick]++;
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

}

function Usuario(nick,juego){
	this.nick=nick;
	this.juego=juego;
	this.partida;
	this.estado= new Vivo();
	this.encargo ="ninguno";
	this.impostor = false;
	this.crearPartida=function(num){
		return this.juego.crearPartida(num,this);
	}
	this.iniciarPartida=function(){
		this.partida.iniciarPartida();
	}
	this.abandonarPartida=function(){
		this.partida.abandonarPartida(this.nick);
	}
	this.expulsarJugador=function(nick){
		this.partida.expulsarJugador(nick);
	}
	this.votar = function(nick){
		this.estado.votar(nick,this.partida);
	}
	this.report = function(){
		this.estado.report(this.partida);
	}
	this.matar = function(nick){
		if(this.impostor)
			this.estado.matar(nick,this.partida);
	}
}


function Vivo(){
	this.nombre = "vivo";
	this.matar = function(nick,partida){
		partida.fase.matar(nick,partida);
	}
	this.votar = function(nick,partida){
		partida.votar(nick);
	}
	this.report = function(partida){
		partida.report();
	}
}
function Fantasma(){
	this.nombre =  "fantasma";
	this.matar = function(nick,partida){
		throw new Exception("MF01");
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
		if(impostor)
			return sizeDictionary(this.impostor);
		else
			return sizeDictionary(this.crewmate);
	}
	this.evaluarIC=function(F){
		return F(this.sizeTam(true),this.sizeTam(false));
	}
	this.evaluarI=function(F){
		return F(this.sizeTam(true));
	}
}
function inicio(){
	try{
		juego = new Juego();
		var usr =new Usuario("pepe",juego);
		var codigo = usr.crearPartida(4);
		juego.unirAPartida(codigo,"luis");
		juego.unirAPartida(codigo,"luias");
		juego.unirAPartida(codigo,"pepe");
		juego.unirAPartida(codigo,"luisito");

		usr.iniciarPartida();
	}catch(Exception){}
}
function sizeDictionary(dic){
	return Object.keys(dic).length;
}
function Exception(code){
	this.diccionario= function(code){
		var dic={};
			dic["AUPC1"] = "Error: AUPC1 Se ha intentado unir a una partida que ya a comenzado.";
			dic["AUPT2"] = "Error: AUPT2 Se ha intentado unir a una partida que ya a terminado.";
			dic["EJ01"] = "Error: EJ01 Se ha intentado expusltar a un jugador en la fase final.";
			dic["MF01"] =  "Error: MF01  Un fantasma no puede matar";
			dic["N410"] = "Error: N410 Se ha intentado crear una partida ilegal, debe tener min 4 o máx 10 Jugadores.";
			dic["N410C"] = "Error: N410C Se ha intentado iniciar una partida a al que le faltan jugadoress";
			dic["S10J"] = "Error: S10J Ya esta alcanzado el numero maximo de jugadores ";
			dic["UAP01"] = "Error: UAP01 Se ha intentado abandonar partida en la fase final.";
 		return dic[code];
	}	
	this.toConsLog= function(code){
		console.log(this.diccionario(code));
	}
	this.toConsLog(code);
}