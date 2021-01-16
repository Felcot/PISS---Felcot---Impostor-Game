/*
* En este fichero se encuentra la capa de acceso a datos
*/
//Dependencias de acceso a MonGo
//Son los Drivers de acceso
var mongo=require("mongodb").MongoClient;
var ObjectID=require("mongodb").ObjectID;

function Cad(){
	this.partidas = undefined;
	////Coleccion partidas

	this.insertarPartida=function(partida,callback){
        insertar(this.partidas,partida,callback);
    }

    this.obtenerPartidas=function(callback){
    	obtenerTodos(this.partidas,callback);
    }

    this.obtenerPartidaCriterio=function(criterio,callback){
    	obtener(this.partidas,criterio,callback);
    }

	this.modificarColeccionPartidas=function(partida,callback){
        modificarColeccion(this.partidas,partida,callback);
    }

    this.eliminarPartida=function(uid,callback){
       eliminar(this.partidas,{_id:ObjectID(uid)},callback);
    }

	//// funciones genéricas

    function obtenerTodos(coleccion,callback){
        coleccion.find().toArray(function(error,col){
            callback(col);
        });
    };

    function obtener(coleccion,criterio,callback){
        coleccion.find(criterio).toArray(function(error,partida){
            if (partida.length==0){
                callback(undefined);
            }
            else{
                callback(partida[0]);
            }
        });
    };

	function insertar(coleccion,elemento,callback){
        coleccion.insertOne(elemento,function(err,result){
            if(err){
                console.log("error");
            }
            else{
                console.log("Nuevo elemento creado");
                callback(elemento);
            }
        });
    }

    function modificarColeccion(coleccion,partida,callback){
        coleccion.findAndModify({_id:ObjectID(partida._id)},{},usr,{},function(err,result){
            if (err){
                console.log("No se pudo actualizar (método genérico)");
            }
            else{     
                console.log("Partida actualizada"); 
            }
            callback(result);
        });
    }

    function eliminar(coleccion,criterio,callback){
        coleccion.remove(criterio,function(err,result){
            if(!err){
                callback(result);
            }
        });
    }
    ///Metódo para conectar
    this.connect=function(callback){
	    var cad=this;		
        //
		mongo.connect("mongodb+srv://Felcot:FOlpJDstXEx1gbBi@cluster0.c8we8.mongodb.net/ImpostorGame?retryWrites=true&w=majority",{useUnifiedTopology: true },function(err, database){
            if (err){
                console.log("No pudo conectar a la base de datos");
            }else{                
	 			console.log("conectado a Mongo: Colleccion partidas");                             
                database.db("impostorapp").collection("partidas",function(err,col){
                    if (err){
                        console.log("No se puede obtener la coleccion");
                    }else{       
                        console.log("tenemos la colección partidas");                                 
                        cad.partidas=col;                                                  
                    }
                });
              callback(database);
            }
		});
	}
}
module.exports.Cad=Cad;

//User Felcot
//Password FOlpJDstXEx1gbBi
/*
La cadena de conexión es la parte más importante en cuanto al acceso
con la bbdd. 
*/