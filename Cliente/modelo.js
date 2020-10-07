function Juego(){
						 // Que collection elegir? -- Array asociativo.
	this.partidas =  {}; // Utilizamos un diccionario para obtener una mayor velocidad de búsqueda.
	this.crearPartida = function(number,owner){
		//do{
		let codigo = this.obtenerCodigo();
		//alert(codigo);
		if(!this.partidas[codigo]){
			this.partidas[codigo] = new Partida(number, owner);
		}
		//}while(this.partidas[codigo]);
		//this.partidas[codigo] = new Partida(number, owner);
	}
	this.unirApartida=function(nick,codigo){
		//TODO
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
	
	this.usuarios = [];//index 0 sera owner
	//this.usuarios = {};
	this.fase = new Inicial();
	this.agregarUsuario=function(nick){
		this.fase.agregarUsuario(nick,this);
	}
	this.puedeAgregarUsuario=function(nick){
		//TODO
		//Comprobar si el usuario maximo number
		//(object.keys.(juego.partida["code"].usuarios).length)
		if(this.numberUsuario > this.usuarios.length){
			let cont=1;
			mayNick = nick;
			while(this.usuarios.includes(mayNick)){
				mayNick= nick + cont;
				cont= cont+1;
			}else
				this.fase = new Jugando();
			
		}
		this.usuarios.push(mayNick);
	}
	this.agregarUsuario(owner);
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

function Usuario(nick){
	this.nick = nick;
}

function Inicial(){
	this.agregarUsuario=function(nick,partida){
		partida.puedeAgregarUsuario(nick);
	}
}
function Jugando(){}
function Final(){
	this.agregarUsuario=function(nick,partida){
		partida.puedeAgregarUsuario(nick);
	}
}