function ClienteRest(){
	this.crearPartida=function(nick,num){
		$.getJSON("/crearPartida/"+nick+"/"+num,function(data){  //aquí no se establecen los dos puntos  
    		console.log(data);							 //simplemente se concatena el nick
    		//callback(data);
		});
	}

	this.listarPartida = function(){
		$.getJSON("/listarPartida/",function(data){
			console.log(data);
		})
	}
	//unirApartida
	//abandonarPartida
	//inicarPartida
}

//esta función está en el archivo clienteRest.js pero NO está dentro del objeto ClienteRest()
function pruebas(){
	var codigo=undefined;
	rest.crearPartida("pepe",3,function(data){ //Esta es la definicion del Callback
		codigo=data.codigo;		
	});
	rest.crearPartida("pepe",4,function(data){
		codigo=data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
		rest.unirAPartida("juanma",codigo);
	});
	rest.crearPartida("pepe",5,function(data){
		codigo=data.codigo;
		rest.unirAPartida("juan",codigo);
		rest.unirAPartida("juani",codigo);
		rest.unirAPartida("juana",codigo);
		rest.unirAPartida("juanma",codigo);
	});
	
//agregar otras partidas de 6, 7… hasta 10 jugadores
}

//para usar esta función hay que llamarla desde la consola del navegador (una vez se ha lanzado el servidor)
