function ControlWeb(){
	var me = this;
	var ownerGame = false;
	this.initHTML = function(){
		this.mainMenu();
	}
	this.mainMenu= function(){
		$('#mainRemove').remove();
		var html = '<div id="mainRemove">';
		if(ws == undefined){
			html += this.mostrarRegistrarse();
		}else{
			html+='<button id = "btnmmCP" type="button" class="btn btn-primary">Crear partida</button>';
			html+='<button id = "btnuAP" type="button" class="btn btn-primary">Unir a Partida</button>';
		}
		html += '</div>'; 
		$('#mainMenu').append(html);
		$('#btnRegister').on('click',function(){
			var nick = $('#nick').val();
			ws =  new ClienteWS(nick);
			$('#register').remove();
			me.mainMenu();
		});
		$('#btnmmCP').on('click',function(){
			me.mostrarCrearPartida();
		});
		$('#btnuAP').on('click',function(){
			ws.listaPartidasDisponibles();
		});
	}
	this.mostrarRegistrarse = function(){
		var register =  '<div id="register" class="form-group">';
					register += '<div class="row">'
					register+='<div class="col-md-4"></div><div class="col-md-4"><label id="Nnick" class="labelGeneral" for="usr">Nick:</label></div>';
					register+='</div><div class="col-md-4"></div><div class="row"><div class="col-md-4"><input type="text" class="form-control" id="nick"></div>';
					register+='</div><div class="row">';
					register+='<div class="col-md-5"></div><div id="d-btnRegister" class="col-md-2"><button id = "btnRegister" type="button" class="btn btn-primary">Registrarse</button>';
				register+='</div></div></div>';
		return register;
	}
	this.mostrarCrearPartida = function(){
		this.limpiarHTML("mostrarCP");
		var cadena =  '<div id="mostrarCP">' 
				cadena+='<div class="form-group">';
					cadena+='<label class="labelGeneral" for="num">Número Máximo:</label>';
					cadena+='<input type="text" class="form-control" id="num">';
				cadena+='</div>';
				cadena+='<button id = "btnCP" type="button" class="btn btn-primary">Crear</button>'
			cadena+='</div>';

		
		$('#crearPartida').append(cadena);
		//#crearPartida busca un id
		//.crearPartida busca una clase
		// solo # busca etiqueta html
		$('#btnCP').on('click',function(){
			var num = $('#num').val();
			$('#mostrarCP').remove();
			ws.crearPartida(num);
		});
			}


	this.mostrarEsperandoRivales= function(lista){
		$('#esperandoRemove').remove();
		this.limpiarHTML("esperandoRemove");
		var esperandoRival = '<div id="esperandoRemove"><div class="row justify-content-center justify-content-md-start">';
		esperandoRival += '<div class="col-md-4"><label class="labelGeneral" for="num">Jugadores:</label><div id="jugadores" class = "list-group">';
				for(var usr in lista)
					esperandoRival+='<a href="#" class="list-group-item list-group-item-light" value="'+lista[usr].nick+'">'+lista[usr].nick+'</a>';
			esperandoRival += '</div></div><div class="col-md-4"><div id="waiting">';
			esperandoRival+= '<div class="spinner-outside rotate-left"></div>';
		esperandoRival+='<div class="spinner-inside rotate-right"></div>';
		esperandoRival+='<h4 class="letterSpinner">Esperando </br>Jugadores</h4></div></div>';
			esperandoRival += '<div class = "col-md-4">'
			esperandoRival += this.mostrarChat();
			esperandoRival +='</div>';	
			esperandoRival += ws.isOwner()? '</div><div id="ownerGame"></div></div>':'</div></div>';

		$('#esperandoRival').append(esperandoRival);
		$('#btn-msg').on('click',function(){
			ws.sendMensaje($('#msg').val());
			$('#msg').val('');
		});
		this.mostrarInicarPartida();
		
	}

	this.mostrarPartidasDisponibles = function(lista){
		var cadena= '<div id = "listaPartidas"><div class = "list-group">';
			for(var partida in lista){
					cadena+='<a href="#" class="list-group-item" value="'+lista[partida].codigo+'">'+lista[partida].codigo+'<span class="badge">'+lista[partida].ocupado+'/'+lista[partida].maximo+'</span></a>';
				}
			cadena+= '</div></div>';
		return cadena;
	} 
	this.mostrarUnirAPartida = function(lista){
		this.limpiarHTML("mUAP");
		var cadena= '<div id="mUAP" class ="list-group">';
			cadena+='<label class="labelGeneral" for="num">Elige y Juega:</label>';
				cadena+=this.mostrarPartidasDisponibles(lista);
			cadena+='<button id = "btnmUAP" type="button" class="btn btn-primary">Unirse</button>'
			cadena+= '</div>';
		//this.limpiarHTML("unirAPartida");
		$('#unirAPartida').append(cadena);

		 StoreValue = [];
	    $(".list-group-item").on('click',function(){
	        StoreValue = [];
	        StoreValue.push($(this).attr("value")); // add text to array
	    });

		$('#btnmUAP').on('click',function(){
			var codigo = StoreValue[0];
			console.log(codigo);
			$('#unirAPartida').remove();
			ws.unirAPartida(codigo);
			me.mostrarEsperandoRivales();
		});
	}
	this.mostrarInicarPartida=function(){
		var ownerGame = '<div id="initialGameButton">';
			ownerGame +='<button id = "btnInitGame" type="button" class="btn btn-primary">Iniciar Partida</button>'
			ownerGame += '</div>'
		$('#ownerGame').append(ownerGame);
		$('#btnInitGame').on('click',function(){
			ws.iniciarPartida();
		});
	}
	this.limpiarHTML=function(cadena){
		
		if(cadena != "mainRemove")$('#mainRemove').remove();
		if(cadena != "mostrarCP")$('#mostrarCP').remove();
		if(cadena != "mUAP")$('#mUAP').remove();
		if(cadena != "esperandoRemove")$('#esperandoRemove').remove();
		if(cadena != "initialGame") $('#initialGame').remove();
	}
	this.mostrarBarra=function(){
		$('#barra').append('<div id="barraProgreso" class="row"></div>');
	}
	this.mostrarPorcentaje=function(porcentaje){
		$('#barraProgresoItem').remove();
		var barraProgreso = '<div id="barraProgresoItem" sytle="width:'+(porcentaje*10)+'px">'+porcentaje+'</div>';
		$('#barraProgreso').append(barraProgreso);
	}
	this.inyectarMensaje= function(data){
		
		$('#mensajes').append('<div id="mensaje"><label id=nick-chat>('+data.nick+')></label><label id="msg-chat">'+data.msg+'</label></div>');
	};
	this.mostrarChat = function(data){
		var chat ='<div id="chat"> <div id="mensajes"></div>';
				chat+='<input id="msg" type="text" value="">';
				chat+='<button id="btn-msg">enviar</button>';
			chat+='</div>';
		return chat;

	}
	this.mostrarVotaciones = function(lista){
		var votaciones = '<div id="votaciones"><div class = "list-group">';
			for(var nick in lista)
				votaciones+='<a href="#" class="list-group-item" value="'+lista[nick]+'">'+lista[nick]+'</a>';
			votaciones +='</div></div>';
		this.mostrarModalVotacion(votaciones);
	}
	this.mostrarModalSimple=function(msg){
		$('#avisarImpostor').remove();
		var contenidoModal = '<p id="avisarImpostor">'+msg+'</p>';
		$('#contenidoModal').append(contenidoModal);
		$('#modalGeneral').modal("show");
	}
	this.mostrarModalTarea=function(msg){
		$('#avisarImpostor').remove();
		$('#viewTarea').remove();
		var contenidoModal = '<p id="viewTarea">'+msg+'</p>';
		$('#contenidoModal').append(contenidoModal);
		$('#modalGeneral').modal("show");
	}
	this.mostrarModalVotacion=function(msg){
		$('#avisarImpostor').remove();
		$('#viewTarea').remove();
		var contenidoModal = '<div id="viewVotacion">'+msg+'</div>';
		var button ='<div id="btnVotar"><button id="btnModalExec" type="button" class="btn btn-secondary" data-dismiss="modal">votar</button>';
			button += '<button id="btnModalExecSkip" type="button" class="btn btn-secondary" data-dismiss="modal">skip</button></div>';
		if(ws.getEstado()!="fantasma")
			$('#modalFooter').append(button);
		$('#contenidoModal').append(contenidoModal);
		$('#modalGeneral').modal("show");

		StoreValue = [];
		$(".list-group-item").on('click',function(){
	        StoreValue = [];
	        StoreValue.push($(this).attr("value")); // add text to array
	    });
		$('#btnModalExec').on('click',function(){
			var votado = StoreValue[0];
			ws.votar(votado);
			$('#btnVotar').remove();
		});
		$('#btnModalExecSkip').on('click',function(){
			StoreValue = [];
			ws.votar("skip");
			$('#btnVotar').remove();
		});
	}
}


/*
 * Una vez pasados los test y demás
 * hacer commit y añadir a la rama
 } Buscar información como hacer merge
 * git branch -d nombreRama
 * 
 */

