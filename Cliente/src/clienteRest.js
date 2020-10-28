function ClienteRest(){

	this.crearPartida=function(num){
		$.getJSON("/crearPartida/"+num,function(data){  //aquí no se establecen los dos puntos  
    		console.log(data);							 //simplemente se concatena el nick
		});
	}

	this.nuevoUsuario=function(nick){
		$.getJSON("/nuevoUsuario/"+nick,function(data){  //aquí no se establecen los dos puntos  
    		console.log(data);							 //simplemente se concatena el nick
		});
	}

}