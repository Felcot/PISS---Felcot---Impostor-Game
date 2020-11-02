function ClienteRest(){
	this.crearPartida=function(nick,num){
		$.getJSON("/crearPartida/"+nick+"/"+num,function(data){  //aquí no se establecen los dos puntos  
    		console.log(data);							 //simplemente se concatena el nick
		});
	}

	/*this.nuevoUsuario=function(nick){
		$.getJSON("/nuevoUsuario/"+nick,function(data){  //aquí no se establecen los dos puntos  
    		console.log(data);							 //simplemente se concatena el nick
		});
	}*/

	this.listarPartida = function(){
		$.getJSON("/listarPartida/",function(data){
			console.log(data);
		})
	}
}