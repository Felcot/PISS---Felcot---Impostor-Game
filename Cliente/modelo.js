function Juego(){
						 // Que collection elegir? -- Array asociativo.
	this.partidas =  {}; // Utilizamos un diccionario para obtener una mayor velocidad de búsqueda.
	this.propietarios = {};
	this.crearPartida = function(number,ownerNick){

		owner = new Usuario(ownerNick);
		let codigo = this.obtenerCodigo();
		if(!this.partidas[codigo]){
			this.partidas[codigo] = new Partida(number, onwer);
			this.propietarios[onwer] = new Propietario(this.partidas[codigo]);
		}

	}
	this.unirApartida=function(nick,codigo){
		if(this.partidas[codigo])
			this.partidas[codigo].agregarUsuario(nick);
	}
	this.obtenerCodigo= function(){
		let cadena = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let letras = cadena.split('');
		let maxCadena = cadena.length;
		let codigo = [];
		for(i=0;i<6;i++){
			codigo.push(letras[randomInt(1,maxCadena)-1]);
		}
		return codigo.join('');
	}		
}

function Partida (number, owner){
	this.numberUsuario = number;
	this.nickOwner = owner;
	//Patron state
	
	//this.usuarios = [];//index 0 sera owner
	this.usuarios = {};
	this.fase = new Inicial();
	this.agregarUsuario=function(nick){
		this.fase.agregarUsuario(nick,this);
	}
	this.puedeAgregarUsuario=function(nick){
		//TODO
		//Comprobar si el usuario maximo number
		//(object.keys.(juego.partida["code"].usuarios).length)
			let cont = 1;
			let mayNick = nick;
			while(this.usuarios[mayNick]){
				mayNick = nick + cont;
				cont = cont + 1;
			}

		this.usuarios[mayNick] =  new Usuario(mayNick);
		if(partida.numberUsuario > Object.keys(partida.usuarios).length)
			this.fase = new Completado();
	}
	this.agregarUsuario(owner);
}

function Inicial(){
	this.agregarUsuario=function(nick,partida){
		partida.puedeAgregarUsuario(nick);
	}

	this.iniciarPartida = function(partida){
		if (Object.keys(partida.usuarios).length >= 4){//hacer refactor
			partida.fasde = new Jugando();
		} else{
			console.log("Todavía no tenemos el minimo de usuarios");
		}
	}
}
function Completado(){
	this.iniciarPartida = function(partida){
		partida.fase = new Jugando();
	}
}
function Jugando(){
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ya ha comenzado");
	}
	this.iniciarPartida()=function(partida){
		console.log("Error: La partida ya esta iniciada");
	}
}
function Final(){
	this.agregarUsuario=function(nick,partida){
		console.log("La partida ya ha terminado");
	}
	this.iniciarPartida=function(partida){
		console.log("No se puede iniciar una partida terminada");
	}
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

function Usuario(nick){
	this.nick = nick;
	this.juego = juego;
	this.partida;
	this.crearPartida=function(num){
		this.partida = this.juego.crearPartida(num,this);
	}
	this.iniciarPartida=function(){
		this.partida.iniciarPartida();
	}
}
