function Juego(){
						 // Que collection elegir? -- Array asociativo.
	this.partidas =  {}; // Utilizamos un diccionario para obtener una mayor velocidad de búsqueda.
	this.crearPartida = function(number,owner){
		do{
		let codigo = this.obtenerCodigo();
		/*if(!this.partidas[codigo]){
			this.partidas[codigo] = new Partida(number, owner);
		}*/
		}while(!this.partidas[codigo]);
		this.partidas[codigo] = new Partida(number, owner);
	}

	this.obtenerCodigo= function(){
		let cadena = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let letras = cadena.split('');
		let codigo = [];
		

		for(i=0;i<6;i++){
			codigo.push(letras[randomInt(1,25)-1]);
		}
		return codigo.join('');
	}
		
}

function Partida (number, owner){
	this.numberUsuario = number;
	this.owner = owner;
	//Patron state
	
	this.usuarios = [];//index 0 sera owner
	//this.usuarios = {};
	this.agregarUsuario=function(nick){
		//TODO
		//Comprobar si el usuario maximo number
	}
	this.agregarUsuario(owner);
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}