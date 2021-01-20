function ControlWeb(){
	var me = this;
	var ownerGame = false;
	this.initHTML = function(){
		this.mainMenu();
	}
	this.mainMenu= function(){
		this.limpiarHTML("mainRemove");
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
			if(nick){
				ws =  new ClienteWS(nick);
				$('#register').remove();
				me.mainMenu();
			}
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
					cadena+='<input type="number" class="form-control" id="max" min="4" max="8" value="4">';
					cadena+='<label class="labelGeneral" for="num">Número de Impostores:</label>';
					cadena+='<input type="number" class="form-control" id="numImpos" min="1" max="3" value="1">';
					cadena+='<label class="labelGeneral" for="num">Número Tareas:</label>';
					cadena+='<input type="number" class="form-control" id="numTarea" min="1" max="4" value="1">';
					cadena+='<label class="labelGeneral" for="num">Partida propiedad:</label>';
					cadena+='<input type="checkbox" id="propiedad">';
				cadena+='</div>';
				cadena+='<button id = "btnCP" type="button" class="btn btn-primary">Crear</button><button id = "btnMainMenu" type="button" data-dismiss="modal" class="btn btn-primary">Volver al Menú</button>'
			cadena+='</div>';

		
		$('#crearPartida').append(cadena);
		//#crearPartida busca un id
		//.crearPartida busca una clase
		// solo # busca etiqueta html

		$('#btnMainMenu').on('click',function(){
			me.mainMenu();
		});
		$('#btnCP').on('click',function(){
			var max = $('#max').val();
			var numImpos = $('#numImpos').val();
			var numTarea = $('#numTarea').val();
			var propiedad = document.getElementById('propiedad').checked;
			console.log(max+"."+numImpos+"."+numTarea+"."+propiedad);
			$('#mostrarCP').remove();
			ws.crearPartida(max,numImpos,numTarea,propiedad);
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
			esperandoRival += ws.isOwner()? '</div><div id="ownerGame"></div></div>':'<button id="btnAbandonarPartida" type="button" class="btn btn-primary">Abandonar Partida</button></div></div>';
		
		$('#esperandoRival').append(esperandoRival);
		$('#btn-msg').on('click',function(){
			var msg = $('#msg').val();
			if(msg!= '')
				ws.sendMensaje(msg);
			$('#msg').val('');
		});
		$('#btnAbandonarPartida').on('click',function(){
			ws.abandonarPartida(false);
		});
		this.mostrarInicarPartida();
		
	}

	this.mostrarPartidasDisponibles = function(lista){
		console.log("mostrarPartidasDisponibles."+lista);
		var cadena= '<div id = "listaPartidas"><div class = "list-group">';
			for(var partida in lista){
					cadena+='<a href="#" class="list-group-item" value="'+lista[partida].codigo+'">'+lista[partida].codigo+'<span class="badge">'+lista[partida].ocupado+'/'+lista[partida].maximo+'</span></a>';
				}
			cadena+= '</div></div>';
		return cadena;
	} 
	this.actualizarMostrarUnirAPartidas=function(lista){
		console.log("actualizarMostrarUnirAPartidas."+lista);
		$('#listaPartidas').remove();
		$('#listaPartidasContainer').append(this.mostrarPartidasDisponibles(lista));
	}
	this.mostrarUnirAPartida = function(lista){
		console.log("mostrarUnirAPartida."+lista);
		this.limpiarHTML("mUAP");
		var cadena= '';
		cadena +='<div id="mUAP" class ="list-group">';
			cadena+='<label class="labelGeneral" for="num">Elige y Juega:</label>';
			cadena+='<div id="listaPartidasContainer">';
				cadena+=this.mostrarPartidasDisponibles(lista);
			cadena+='</div>';
			cadena+='<button id = "btnmUAP" type="button" class="btn btn-primary">Unirse</button><button id = "btnMainMenu" type="button" class="btn btn-primary">Volver al Menú</button>'
			cadena+= '</div>';

		$('#unirAPartida').append(cadena);

		 StoreValue = [];
	    $(".list-group-item").on('click',function(){
	        StoreValue = [];
	        StoreValue.push($(this).attr("value")); // add text to array
	    });

		$('#btnmUAP').on('click',function(){
			var codigo = StoreValue[0];
			if(codigo){
				ws.unirAPartida(codigo);
				me.mostrarEsperandoRivales();
			}
		});

		$('#btnMainMenu').on('click',function(){
			me.mainMenu();
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
		$('#btnAbandonarPartida').on('click',function(){
			ws.abandonarPartida(false);
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
		this.clearModal();
		$('#barra').append('<div id="barraProgreso" class="row"></div>');
	}
	this.mostrarPorcentaje=function(porcentaje){
		$('#barraProgresoItem').remove();
		var barraProgreso = '<div id="barraProgresoItem">'+(porcentaje?porcentaje%100:0)+'%</div>';
		$('#barraProgreso').append(barraProgreso);
	}
	
	this.inyectarMensaje= function(data){
		if(ws.puedoLeer(data))
			$('#mensajes').append('<div id="mensaje"><label id=nick-chat>('+data.nick+')></label><label id="msg-chat">'+data.msg+'</label></div>');
	};
	this.mostrarJuego=function(){
		$('game-container').remove();
		var game = '<div id="game-container">';
		var button = '<button id="btnAbandonarPartida" type="button" class="btn btn-primary">Abandonar Partida</button></div>';
		$('#game').append(game+button)
		$('#btnAbandonarPartida').on('click',function(){
			ws.abandonarPartida(true);
		});
	}
	this.mostrarChat = function(){
		var chat ='<div id="chat"> <div id="mensajes"></div>';
				chat+='<input id="msg" type="text" value="">';
				chat+='<button id="btn-msg">enviar</button>';
			chat+='</div>';
		return chat;

	}
	this.buildListaJugadores=function(lista){
		var jugadores = '<div id="votaciones"><div class = "list-group">';
			for(var nick in lista)
				jugadores+='<a href="#" class="list-group-item" value="'+lista[nick]+'">'+lista[nick]+'</a>';
			jugadores +='</div></div>';
		return jugadores;
	}
	this.mostrarVotaciones = function(lista){
		this.mostrarModalVotacion(this.buildListaJugadores(lista));
	}
	this.mostrarMuertos = function(lista){
		this.mostrarModalMuertos(this.buildListaJugadores(lista));
	}
	this.mostrarModalSimple=function(msg){
		this.clearModal();
		var contenidoModal = '<p id="avisarImpostor">'+msg+'</p>';
		$('#contenidoModal').append(contenidoModal);
		$('#modalGeneral').modal("show");

	}
	this.anunciarTareas=function(lista){
		this.clearModal();
		ws.console("HOLA MUNDO");
		var listaEncargos = '<ul id="listaEncargos">';
		ws.console(lista);
		for(var enc in lista){
			listaEncargos+='<li>'+enc+'</li>'
		}
		listaEncargos +='</ul>';
		this.mostrarModalTarea(listaEncargos);
		$('#modalGeneral').modal("show");
	}
	this.mostrarModalTarea=function(msg){
		this.clearModal();
		var contenidoModal = '<div id="viewTarea">'+msg+'</p>';
		$('#contenidoModal').append(contenidoModal);
		$('#modalGeneral').modal("show");
	}
	this.mostrarModalMuertos=function(msg){
		this.clearModal();
		var contenidoModal = '<div id="viewMuertos">'+msg+'</p>';
		$('#contenidoModal').append(contenidoModal);
		$('#modalGeneral').modal("show");
	}
	this.mostrarModalVotacion=function(msg){
		this.clearModal();
		var contenidoModal = '<div id="viewVotacion" class="modal-body"><div class="container-fluid">';
    	contenidoModal +='<div class="row"><div class="col-md-2">'+msg+'</div>';
		contenidoModal += '<div class="col-md-4">'+this.mostrarChat()+'</div></div></div></div>';
		var button ='<div id="modalFooterRemove"><button id="btnModalExec" type="button" class="btn btn-secondary" data-dismiss="modal">votar</button>';
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
		$('#btn-msg').on('click',function(){
			ws.sendMensaje($('#msg').val());
			$('#msg').val('');
		});
	}
	this.mostrarModalAbandonarPartida=function(msg,condition){
		this.clearModal();
		var contenidoModal = '<p id="abandonarPartida">'+msg+'</p>';
		var button='<div id="modalFooterRemove">';
		button+=condition?'<button id="btnMenu" type="button" data-dismiss="modal" aria-label="Close" class="btn btn-primary">Volver al Menú</button>'
		:'<button type="button" class="close" data-dismiss="modal" aria-label="Close">Cerrar</button>';
		button +='</div>';

		$('#contenidoModal').append(contenidoModal);
		$('#modalFooter').append(button);
		$('#modalGeneral').modal("show");
		$('#btnMenu').on('click',function(){
			$('#game-container').remove();
			ws.reset();
			me.clearModal();
			me.mainMenu();
		});
	}
	this.mostrarModalGanadores=function(msg,condition){
		this.clearModal();
		var contenidoModal = '<p id="ganadores">'+msg+'</p>';
	    var button='<div id="modalFooterRemove"><button id = "btnMenu" type="button" aria-label="Close" data-dismiss="modal" class="btn btn-primary">Volver al Menú</button></div>';

				
		$('#contenidoModal').append(contenidoModal);
		$('#modalFooter').append(button);
		$('#modalGeneral').modal("show");
		$('#btnMenu').on('click',function(){
			$('#game-container').remove();
			ws.reset();
			me.clearModal();
			me.mainMenu();
		});
	}
	this.anunciarVotacion=function(msg){
		this.clearModal();
		this.mostrarModalSimple(msg);
	}
	this.clearModal=function(){
		$('#avisarImpostor').remove();
		$('#viewTarea').remove();
		$('#viewVotacion').remove();
		$('#btnVotar').remove();
		$('#abandonarPartida').remove();
		$('#ganadores').remove();
		$('#btnMenu').remove();
		$('#viewMuertos').remove();
		$('#barraProgreso').remove();
		$('#modalFooterRemove').remove();
	}
}


/*
 * Una vez pasados los test y demás
 * hacer commit y añadir a la rama
 } Buscar información como hacer merge
 * git branch -d nombreRama
 * 
 */