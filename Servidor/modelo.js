var moduleCad= require('./cad.js');
function Juego(min,persistencia){
	this.minimo=min;
	console.log("Se ha establecido el minimo en: "+this.minimo);
	this.partidas={};
	this.usuario={};
	this.cad;

	this.crearPartida=function(nick,max,numImpos,numTarea,propiedad,cooldown){
			try{
				let codigo="fallo";
		console.log("modelo.Juego.crearPartida("+nick+"."+max+"."+numImpos+"."+numTarea+"."+propiedad+"."+cooldown+")");
				if((max < this.minimo) || (max > 10)){
				 	throw new Exception("N410");
				}

				do{
					codigo=this.obtenerCodigo();
				}while(this.partidas[codigo]);
			
			//if (!this.partidas[codigo]){
				this.partidas[codigo]= new Partida(max,this.minimo,nick,codigo,this,numImpos,numTarea,propiedad?"privada":"publica",cooldown);
				this.partidas[codigo].iniciarPersonajes();
				var usr =  this.partidas[codigo].usuarios;
				this.usuario[nick] = usr[nick];
			//}
			return codigo;
		}catch(Exception){
			return codigo/*"fallo"*/;
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
			if(partida.esPublica()&&partida.sePuedeEntrar() && partida.comprobarMaximo()){
				huecos = partida.emptyFree();
				console.log("juego.huecos:"+huecos)
				console.log("juego.partida.confContainer:"+partida.confContainer.getMaximo())

				result.push({"codigo":key,"ocupado":(partida.confContainer.getMaximo()-huecos),"maximo":partida.confContainer.getMaximo()});
			}
		}
		console.log("modelo.juego.listarPartidasDisponibles.result{");
		console.log(result);
		console.log("}");
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
		console.log(">>juego.report.nick'"+nick+"'.codigo'"+codigo+"'{");
		var result = (usuario && this.getPartida(codigo))? usuario.report(): {"Error": "No reportado"};
		console.log("}.result:")
		console.log(result);
		console.log("<<");
		return result;
	}
	this.listarJugadorBy=function(codigo,estado){
		return this.getPartida(codigo).listarJugadorBy(estado);
	}
	// se realiza la llamada a la conexion con la capa de acceso a datos
	
	this.initCap=function(persistencia){
		if(persistencia){
			this.cad= new moduleCad.Cad();
			this.cad.connect(function(db){
				console.log("conectado a Atlas");});
		}
	}
	this.initCap(persistencia);
	
}
function confContainer(max,min,NumImpostores,NumTareas,propiedad,cooldown){
	this.MaxJugadores=max;
	this.MinJugadores=min;
	this.NumImpostores=NumImpostores;
	this.NumTareas=NumTareas;
	this.cooldown=cooldown;
	this.propiedad=propiedad;
	this.getMaximo=function(){
		return this.MaxJugadores;
	}
	this.getMinimo=function(){
		return this.MinJugadores;
	}
	this.getNumImpostores=function(){
		return this.NumImpostores;
	}
	this.getNumTareas=function(){
		return this.NumTareas;
	}
	this.getCooldown=function(){
		return this.cooldown;
	}
	this.getPropiedad=function(){
		return this.propiedad;
	}
	this.setPropiedad=function(propiedad){
		this.propiedad=propiedad;
	}
	this.esPublica=function(){
		return this.propiedad=="publica";
	}
}
function Partida(max,min,owner,codigo,juego,NumImpostores,NumTareas,propiedad,cooldown){
	this.confContainer = new confContainer(max,min,NumImpostores,NumTareas,propiedad,cooldown);
	this.codigo = codigo;
	this.nickOwner=owner;
	this.fase=new Inicial();
	this.usuarios={};
	this.juego = juego;
	this.contenedor = new contenedor();
	this.sprites=[];
	this.Tareas={};
	this.total_tareas;
	this.tareasCompletadas=0;
	this.iniciarPersonajes = function(){
		var spritesNumber = 8;
		for (var id = 0; id < spritesNumber; id++){
			this.sprites.push({"id":id,"elegido":false});
		} 
	}
	this.getConfContainer = function(){
		return this.confContainer;
	}
	this.comprobarVotacion = function(){
		return this.fase.comprobarVotacion(this);
	}
	this.listarJugadorBy=function(estado){
		console.log(">>modelo.partida.listarJugadorBy."+estado);
		var result = [];
		for(var usr in this.usuarios)
			if(this.usuarios[usr].getEstado() == estado)
				result.push(usr);
		return result;
	}
	
	this.elegirPersonaje=function(usr,id){
		if(id == "default"){
			var lista = this.listarPersonajesLibres();
			this.elegirPersonaje(usr,lista[0]);
		}else{
			var personaje =usr.getPersonaje();
			if(personaje != undefined){
				this.sprites[personaje].elegido=false;
			}
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
			var usr = this.usuarios[nick];
			result.push({"nick":usr.getNick(),"personaje":usr.getPersonaje(),"estado":usr.getEstado()});
		}
		return result;
	}
	this.esPublica=function(){
		return this.confContainer.esPublica();
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
		return sizeDictionary(this.usuarios)>=this.confContainer.getMinimo();
	}
	this.comprobarMaximo=function(){
		return sizeDictionary(this.usuarios)<this.confContainer.getMaximo();
	}
	this.iniciarPartida=function(){
			return this.fase.iniciarPartida(this);
	}
	this.abandonarPartida=function(nick,personaje){
		console.log("abandonarPartida."+this.fase.nombre+"."+nick);
		if(personaje != undefined){
				this.sprites[personaje].elegido=false;
			}
		this.fase.abandonarPartida(nick,this);
		return this.getUsuarios(nick);
	}
	this.expulsarJugador=function(nick){
		this.fase.expulsarJugador(nick,this);
	}
	this.eliminarUsuario=function(nick){
		if(this.contenedor.isEnable(this))
			this.contenedor.eliminar(nick,this.usuarios[nick].impostor,this);
		delete this.usuarios[nick];
		return this.comprobarUsuarios()<0 ? this.eliminarPartida(this.codigo) : false;
	}
	this.comprobarUsuarios=function(){
		return sizeDictionary(this.usuarios);
	}
	this.AsignarTarea = function(){
		for(var usr in this.usuarios){
			if(!this.usuarios[usr].impostor){
				for (var tareaNum = 0; tareaNum < this.confContainer.getNumTareas();) {
					var enc = encargo();
					if(!this.Tareas[usr+enc.getNombre()]){
						this.usuarios[usr].addEncargo(enc);
						this.Tareas[usr+enc.getNombre()] = "No Completado"; 
						this.contenedor.declarar(this.usuarios[usr]);
						tareaNum+=1;

					}
				}
		    }
		}
		this.total_tareas =sizeDictionary(this.Tareas);
	}
	this.AsignarImpostor = function(){
		let keys = Object.keys(this.usuarios);
		for (var impos = 0; impos < this.confContainer.getNumImpostores();) {
			let usr = this.usuarios[keys[randomInt(0,keys.length)]];
			if(!usr.impostor){
				usr.impostor = true;
				usr.addEncargo(new Tarea({"nombre":"impostor","coste":0}));
				this.contenedor.declarar(usr);
				impos+=1;
			}
		}
	}
	this.puedeIniciarPartida = function(){
		this.AsignarImpostor();
		this.AsignarTarea();
		this.fase = new Jugando();
		return this;
	}
	this.evaluarPartida = function(){
		return this.fase.evaluarPartida(this);
		
	}
	this.puedeEvaluarPartida=function(){
		if(this.tareasCompletadas==this.total_tareas){
			this.fase = new Final('Tripulantes');
		}else{
			F =(impostores,crewmates) => {return impostores >= crewmates;};
			let cond = this.contenedor.evaluarIC(F);
			this.comprobarPartida(cond,'impostores');
			
			F = (impostores) => {return impostores == 0;};
			cond = this.contenedor.evaluarI(F)
			this.comprobarPartida(cond,'Tripulantes');
			if(cond)
				this.fase = new Final('Tripulantes');
		}
		return this.fase;
	}
	this.comprobarPartida = function(condition,ganan){
		this.fase = condition ? new Final(ganan):this.fase;
		return this.fase;
	}
	
	this.eyectar=function(nick){
		console.log("partida.eyectar.params("+nick+")");
		this.fase.matar(nick,this);
		var result = this.usuarios[nick].impostor? "El usuario "+nick+" era el impostor":"El usuario "+nick+" no era el impostor";
		console.log("partida("+this.codigo+").eyectar>>"+result+"<<");
		return result;
	}
	this.impostorMatar=function(impostor,tripulante){
		return this.fase.impostorMatar(impostor,tripulante,this);
	}
	this.impostorPuedeMatar=function(impostor,tripulante){
		return this.usuarios[impostor].matar(tripulante);
	}
	this.matar=function(nick){
		var result = this.usuarios[nick].asesinado();
		this.contenedor.eliminar(nick,this.usuarios[nick].impostor,this);
		return result;
	}

	this.report = function(){
		console.log("\t>>partida.report>>DelegaFase>>");
		return {"fase":this.fase.report(this)};
	}

	this.votar = function(usr,nick){
		return this.fase.votar(usr,nick);
	}
	this.recuento = function(){
		return this.fase.recuento(this);
	}
	this.sePuedeEntrar = function(){
		return this.fase.nombre == "inicial" || this.fase.nombre == "completado";
	}
	this.realizarTarea = function(nick,tarea){
		return this.fase.realizarTarea(nick,tarea,this);
	}
	this.puedeRealizarTarea = function(nick,tarea){
		return this.actualizarTareas(this.usuarios[nick].realizarTarea(tarea),nick,tarea); 	
	}
	this.actualizarTareas = function(cond,nick,tarea){
		if(cond && this.Tareas[nick+tarea]){
			console.log("actualizarTareas.cond."+cond);
			console.log(this.Tareas);
			this.tareasCompletadas+=1; 
			delete this.Tareas[nick+tarea];
		}
		var result = {"fase":this.comprobarPartida((sizeDictionary(this.Tareas) <= 0),'Tripulantes').nombre,"porcentaje":this.obtenerPorcentajeTareas()};
		console.log("actualizarTareas.fase.nombre["+result.fase+"]");
		return result;
	}
	this.obtenerPorcentajeTareas=function(){
		console.log("partida.obtenerPorcentajeTareas.tareasCompletadas("+this.tareasCompletadas+")");
		return (this.tareasCompletadas/this.total_tareas)*100;
	}
	this.emptyFree= function(){
		return this.confContainer.getMaximo() - this.comprobarUsuarios();
	}
	this.getFase =function(){
		return this.fase;
	}
	this.getCodigo= function(){
		return this.codigo;
	}
	this.getImpostor = function(){
		var user;
		for(var usr in this.usuarios){
			user=this.usuarios[usr];
			if(user.getImpostor()){
				return user.nick;
			}
		}
		return "Error";
	}
	this.getUsuarios = function(nick){
		return this.usuarios[nick];
	}
	this.esJugando=function(){
		return this.fase.esJugando();
	}
	this.esVotando=function(){
		return this.fase.esVotando();
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
	this.esJugando=function(){
		return false;
	}
	this.esVotando=function(){
		return false;
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
	this.evaluarPartida=function(partida){
		try{
			throw new Exception("eP01");
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
	this.impostorMatar=function(impostor,tripulante){
		try{
			throw new Exception("CM01");
		}catch(Exception){
			/* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.comprobarVotacion =function(partida){
		try{
			throw new Exception("CB01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.realizarTarea = function(nick,tarea,partida){
		try{
			throw new Exception("rT01");
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
	this.evaluarPartida=function(partida){
		try{
			throw new Exception("eP02");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
			return partida;
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
	this.impostorMatar=function(impostor,tripulante){
		try{
			throw new Exception("CM01");
		}catch(Exception){
			/* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.comprobarVotacion =function(partida){
		try{
			throw new Exception("CB01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.realizarTarea = function(nick,tarea,partida){
		try{
			throw new Exception("rT02");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.esJugando=function(){
		return false;
	}
	this.esVotando=function(){
		return false;
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
	this.impostorMatar=function(impostor,tripulante,partida){
		return partida.impostorPuedeMatar(impostor,tripulante);
	}
	this.matar=function(nick,partida){
		return partida.matar(nick);
	}

	this.report = function(partida){
		var msgC = "\t\t>>fase.nombre'"+partida.fase.nombre+"'.report.partida.fase.nombre'";
		partida.fase = new Votacion();
		console.log(msgC+partida.fase.nombre+"'<<");
		console.log("\t<<")
		return partida.fase.nombre;
	}
	this.evaluarPartida=function(partida){
		return partida.puedeEvaluarPartida();
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
	this.realizarTarea = function(nick,tarea,partida){
		return partida.puedeRealizarTarea(nick,tarea);
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
	this.comprobarVotacion =function(partida){
		try{
			throw new Exception("CB01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.esJugando=function(){
		return true;
	}
	this.esVotando=function(){
		return false;
	}
}

function Final(ganadores){
	this.nombre="final";
	this.ganan=ganadores;
	this.anunciarGanador=function(){
		console.log("Los ganadores son los "+this.ganan+"!!");
		return "Los ganadores son los "+this.ganan+"!!";
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
	this.evaluarPartida=function(partida){
		return this;
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
	this.impostorMatar=function(impostor,tripulante){
		try{
			throw new Exception("CM01");
		}catch(Exception){
			/* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.esJugando=function(){
		return false;
	}
	this.esVotando=function(){
		return false;
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
	this.comprobarVotacion =function(partida){
		try{
			throw new Exception("CB01");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.realizarTarea = function(nick,tarea,partida){
		try{
			throw new Exception("rT03");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
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
	this.evaluarPartida=function(partida){
		return partida.puedeEvaluarPartida();
	}
	this.recuento=function(partida){
		let masVotado = "skip";
		this.votacion["skip"] = 0;
		let check = true;
		for(var votado in this.votacion)
			if(this.votacion[masVotado]<=this.votacion[votado]){
				check = (this.votacion[masVotado] == this.votacion[votado]);
				masVotado=votado;
			}
		
		var result = (masVotado!= "skip" && !check)? partida.eyectar(masVotado)
		:"Nadie ha sido eyectado";
		console.log("VOTACION-"+masVotado+"-RECUENTO--->"+result);
		console.log("recuento--->"+partida.fase.nombre);
		if(partida.fase.nombre != "final")
			partida.fase = new Jugando();
		var data = {"votado":masVotado,"msg":result};
		return data;
	}
	this.comprobarVotacion =function(partida){
		return sizeDictionary(this.votantes) == sizeDictionary(partida.listarJugadorBy("vivo"));
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
		return partida.matar(nick);
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
	this.impostorMatar=function(impostor,tripulante){
		try{
			throw new Exception("CM01");
		}catch(Exception){
			/* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.realizarTarea = function(nick,tarea,partida){
		try{
			throw new Exception("rT04");
		}catch(Exception){
		   /* El tratamiento esta realizado en
			* Exception
			*/
		}
	}
	this.esJugando=function(){
		return false;
	}
	this.esVotando=function(){
		return true;
	}
	return this.nombre;
}
function encargo(){
	let encargos = [{"nombre":"Comprar","coste":20},{"nombre":"encontrarLlave","coste":5},
					{"nombre":"Jardines","coste":18},{"nombre":"Entrenar","coste":17},
					{"nombre":"abrirCofre","coste":15},{"nombre":"Colada","coste":17}];
	return new Tarea(encargos[randomInt(0, encargos.length)]);
}
function Tarea(tarea){
	this.data = {"name":tarea.nombre,"coste":tarea.coste,"realizado":0};
	this.getNombre = function(){
		return this.data.name;
	}
	this.getCoste= function(){
		return this.data.coste;
	}
	this.realizarTarea = function(){
		return !this.comprobarTarea() ? this.puedeRealizarTarea():true;
	}
	this.puedeRealizarTarea = function(){
		console.log("1: Tarea["+this.data.name+"].puedeRealizarTarea.realizado("+this.data.realizado+")");
		this.data.realizado +=1;
		console.log("2: Tarea["+this.data.name+"].puedeRealizarTarea.realizado("+this.data.realizado+")");
		return this.comprobarTarea();
	}
	this.comprobarTarea= function(){
		return this.data.realizado>=this.data.coste;
	}
}
function Usuario(nick,juego){
	this.nick=nick;
	this.juego=juego;
	this.partida;
	this.estado= new Vivo();
	this.encargo ={};
	this.impostor = false;
	this.personaje = undefined;
	/*
		Produccion
	*/
	
	this.realizarTarea=function(tarea){
		return this.encargo[tarea].realizarTarea();
	}
	this.addEncargo=function(tarea){
		this.encargo[tarea.getNombre()]=tarea;
	}
	
	/*
		Completado
	*/
	this.getImpostor = function(){return this.impostor;}
	this.getNick = function(){return this.nick;}
	this.getEstado=function(){return this.estado.getName();}
	this.getEncargo=function(){return this.encargo;}
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
		return (!this.partida.abandonarPartida(this.nick,this.personaje)); // si true entonces abandona partida
	}
	this.expulsarJugador=function(nick){
		this.partida.expulsarJugador(nick);
	}
	this.votar = function(nick){
		return this.estado.votar(this,nick,this.partida);
	}
	this.report = function(){
		return this.estado.report(this.partida);
	}
	this.matar = function(victima){
		if(this.impostor)
			return this.estado.matar(victima,this.partida);
	}

	this.asesinado = function(){
		return this.estado.asesinado(this);
	}
	this.elegirPersonaje=function(id){
		this.partida.elegirPersonaje(this,id);
	}
	this.getPersonaje=function(){
		return this.personaje;
	}
	//Permite establecer un personaje.
	this.setPersonaje=function(personaje){
		if(personaje != undefined) 
		this.personaje = personaje;
		console.log("El usuario--->"+this.getNick()+" ha recibido el personaje:"+this.getPersonaje());
	} 
}


function Vivo(){
	this.nombre = "vivo";
	this.matar = function(nick,partida){
		return partida.fase.matar(nick,partida);
	}
	this.asesinado = function(usr){
		usr.estado = new Fantasma();
		return true;
	}
	this.votar = function(usr,nick,partida){
		partida.votar(usr,nick);
	}
	this.report = function(partida){
		return partida.report();
	}
	this.getName=function(){
		return this.nombre;
	}
}
function Fantasma(){
	this.nombre =  "fantasma";
	this.getName=function(){return this.nombre;}
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
		   return false;
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
/*
function encargo(){
	let encargos = ["Basuras","Calles","Jardines","Mobiliario"];
	return encargos[randomInt(0, encargos.length)];
}*/

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
		if(!this.isEnable(partida))return;
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
	this.isEnable=function(partida){
		return partida.esJugando()||partida.esVotando();
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
			dic["IaG01"] = "Error IaG01: No se puede anunciar un ganador en la fase Inicial.";
			dic["CaG01"] = "Error IaG01: No se puede anunciar un ganador en la fase Completado.";
			dic["JaG01"] = "Error IaG01: No se puede anunciar un ganador en la fase Jugando.";
			dic["VaG01"] = "Error IaG01: No se puede anunciar un ganador en la fase Votacion.";
			dic["CB01"] = "Error CB01: No se puede comprobarVotacion fuera de la fase Votacion";
			dic["rT01"] = "Error rT01: No se puede realizarTarea en la fase Inicial";
			dic["rT02"] = "Error rT01: No se puede realizarTarea en la fase Completado";
			dic["rT03"] = "Error rT01: No se puede realizarTarea en la fase Final";
			dic["rT04"] = "Error rT01: No se puede realizarTarea en la fase Votancion";
 		return dic[code];
	}	
	
	this.toConsLog= function(code){
		console.log(this.diccionario(code));
	}
	this.toConsLog(code);
}

module.exports.Juego=Juego;
module.exports.Usuario=Usuario;