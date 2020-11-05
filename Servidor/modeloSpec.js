var modelo=require("./modelo.js");
describe("El juego del impostor", function() {
  var juego;
  //var usr;
  var nick;
  beforeEach(function() {
    juego=new modelo.Juego();
    //usr=new modelo.Usuario("Pepe",juego);
    nick = "Pepe";
  });

  it("comprobar valores iniciales del juego", function() {
    expect(Object.keys(juego.partidas).length).toEqual(0);
    //expect(usr.nick).toEqual("Pepe");
    expect(nick).toEqual("Pepe");
    //expect(usr.juego).not.toBe(undefined);
  });

  describe("el usr Pepe crea una partida de 4 jugadores",function(){
  var codigo;
  beforeEach(function() {
      //codigo=usr.crearPartida(4);
      codigo = juego.crearPartida(4,nick);
    });

  it("se comprueba la partida",function(){  
      expect(codigo).not.toBe(undefined);
      //expect(juego.partidas[codigo].nickOwner).toEqual(usr.nick);
      expect(juego.partidas[codigo].nickOwner).toEqual(nick);
      expect(juego.partidas[codigo].maximo).toEqual(4);
      expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
    var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(1);
    });

  it("varios usuarios se unen a la partida",function(){
    juego.unirAPartida(codigo,"ana");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(2);
    expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
    juego.unirAPartida(codigo,"isa");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(3);
    expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
    juego.unirAPartida(codigo,"tomas");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(4);
    expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
    });

  it("Pepe inicia la partida",function(){
    juego.unirAPartida(codigo,"ana");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(2);
    expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
    juego.unirAPartida(codigo,"isa");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(3);
    expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
    juego.unirAPartida(codigo,"tomas");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(4);
    expect(juego.partidas[codigo].fase.nombre).toEqual("completado");   
    juego.usuario[nick].iniciarPartida();
    expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
  })
   });
  describe("Abandonar partida no es impostor",function(){
    var codigo;
    beforeEach(function() {
      codigo=juego.crearPartida(4,nick);
    });
    it("Ana abandona partida en la fase inicial",function(){
      expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
      juego.unirAPartida(codigo,"ana");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(2);
      juego.partidas[codigo].usuarios["ana"].abandonarPartida();
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(1);
      expect(juego.partidas[codigo].usuarios["ana"]).toBe(undefined);
    });
    

  it("Ana abandona partida en la fase jugando - Fase completado -> inicial",function(){

      juego.unirAPartida(codigo,"ana");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(2);
      expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
      juego.unirAPartida(codigo,"isa");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(3);
      expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
      juego.unirAPartida(codigo,"tomas");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(4);
      expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
      juego.partidas[codigo].usuarios["ana"].abandonarPartida();
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(3);
      expect(juego.partidas[codigo].usuarios["ana"]).toBe(undefined);      
      expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
    });

    it("Ana abandona partida en la fase jugando, sin ser impostor",function(){

      juego.unirAPartida(codigo,"ana");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(2);
      expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
      juego.unirAPartida(codigo,"isa");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(3);
      expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
      juego.unirAPartida(codigo,"tomas");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(4);
      expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
      juego.usuario[nick].iniciarPartida();   
      do{
        for(var user in juego.partidas[codigo].usuarios){
            // Reiniciamos el contenedor, hasta tener el escenario deseado
          juego.partidas[codigo].contenedor.crewmate = {};
          juego.partidas[codigo].contenedor.impostor = {};
          juego.partidas[codigo].usuarios[user].impostor=false;
        }
        juego.partidas[codigo].AsignarImpostor();
        juego.partidas[codigo].AsignarTarea();
      }while(juego.partidas[codigo].usuarios["ana"].impostor);
      expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
      expect(juego.partidas[codigo].usuarios["ana"].impostor).toEqual(false);
      juego.partidas[codigo].usuarios["ana"].abandonarPartida();
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(3);
      expect(juego.partidas[codigo].usuarios["ana"]).toBe(undefined);
    });

   it("Ana abandona partida en la fase jugando, es impostor",function(){
      juego.unirAPartida(codigo,"ana");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(2);
      expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
      juego.unirAPartida(codigo,"isa");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(3);
      expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
      juego.unirAPartida(codigo,"tomas");
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(4);
      expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
      juego.usuario[nick].iniciarPartida();   
      do{
          for(var user in juego.partidas[codigo].usuarios){
            // Reiniciamos el contenedor, hasta tener el escenario deseado
            juego.partidas[codigo].contenedor.crewmate = {};
            juego.partidas[codigo].contenedor.impostor = {};
            juego.partidas[codigo].usuarios[user].impostor=false;
          }
          juego.partidas[codigo].AsignarImpostor();
          juego.partidas[codigo].AsignarTarea();
      }while(!juego.partidas[codigo].usuarios.ana.impostor);
      expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
      expect(juego.partidas[codigo].usuarios["ana"].impostor).toEqual(true);
      juego.partidas[codigo].usuarios["ana"].abandonarPartida();
      var num=Object.keys(juego.partidas[codigo].usuarios).length;
      expect(num).toEqual(3);
      expect(juego.partidas[codigo].usuarios["ana"]).toBe(undefined);
    });

    
  });
 describe("Asignar y Matar",function(){
    var codigo;
    beforeEach(function() {
      codigo=juego.crearPartida(4,nick);
    });
    it("Tareas asignadas",function(){
        juego.unirAPartida(codigo,"ana");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(2);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
        juego.unirAPartida(codigo,"isa");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
        juego.unirAPartida(codigo,"tomas");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(4);
        expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
        juego.usuario[nick].iniciarPartida();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");

        for(var usrExpected in juego.partidas[codigo].usuarios){
            if(!juego.partidas[codigo].usuarios[usrExpected].impostor)
              expect(juego.partidas[codigo].usuarios[usrExpected].encargo).not.toBe("ninguno");
            else
              expect(juego.partidas[codigo].usuarios[usrExpected].encargo).toEqual("ninguno");
        }
      })
    it("Al menos 1 Impostor",function(){
        juego.unirAPartida(codigo,"ana");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(2);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
        juego.unirAPartida(codigo,"isa");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
        juego.unirAPartida(codigo,"tomas");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(4);
        expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
        juego.usuario[nick].iniciarPartida();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        var expectImpostor = false;
        for(var usrExpected in juego.partidas[codigo].usuarios){
           expectImpostor = expectImpostor || juego.partidas[codigo].usuarios[usrExpected].impostor;
        }
        expect(expectImpostor).toEqual(true);
    })

    it("Matar solo impostor",function(){
        juego.unirAPartida(codigo,"ana");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(2);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
        juego.unirAPartida(codigo,"isa");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
        juego.unirAPartida(codigo,"tomas");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(4);
        expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
        juego.usuario[nick].iniciarPartida();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        var checked = false;
        var expectImpostorName="";
        var expectcrewmateName="";

        for(var usrExpected in juego.partidas[codigo].usuarios){
           if(juego.partidas[codigo].usuarios[usrExpected].impostor){
              expectImpostorName = usrExpected;
           }else if(!checked){
              checked = true;
              expectcrewmateName = usrExpected;
            }
        }
        expect(juego.partidas[codigo].usuarios[expectImpostorName].impostor).toEqual(true);
        expect(juego.partidas[codigo].usuarios[expectcrewmateName].impostor).toEqual(false);
        juego.partidas[codigo].usuarios[expectImpostorName].matar(expectcrewmateName);
        expect(juego.partidas[codigo].usuarios[expectcrewmateName].estado.nombre).toEqual("fantasma");
        expect(juego.partidas[codigo].contenedor.crewmate[expectcrewmateName]).toEqual(undefined);
    })

    it("Votar impostor",function(){
        juego.unirAPartida(codigo,"ana");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(2);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
        juego.unirAPartida(codigo,"isa");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
        juego.unirAPartida(codigo,"tomas");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(4);
        expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
        juego.usuario[nick].iniciarPartida();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        var checked = false;
        var expectImpostorName="";
        var expectcrewmateName="";

        for(var usrExpected in juego.partidas[codigo].usuarios){
           if(juego.partidas[codigo].usuarios[usrExpected].impostor){
              expectImpostorName = usrExpected;
           }else if(!checked){
              checked = true;
              expectcrewmateName = usrExpected;
            }
        }
        juego.partidas[codigo].usuarios[expectcrewmateName].report();
        expect(juego.partidas[codigo].fase.nombre).toEqual("votacion");

        for(var usrExpected in juego.partidas[codigo].usuarios){
          juego.partidas[codigo].usuarios[usrExpected].votar(expectImpostorName);
        }
        expect(juego.partidas[codigo].fase.votacion[expectImpostorName]).toEqual(4);
        juego.partidas[codigo].recuento();
        expect(juego.partidas[codigo].fase.nombre).toEqual("final");
        expect(juego.partidas[codigo].fase.ganan).toEqual("Tripulantes");
    })

    it("Votar a tripulante",function(){
        juego.unirAPartida(codigo,"ana");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(2);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
        juego.unirAPartida(codigo,"isa");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
        juego.unirAPartida(codigo,"tomas");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(4);
        expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
        juego.usuario[nick].iniciarPartida();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        var checked = false;
        var expectImpostorName="";
        var expectcrewmateName="";

        for(var usrExpected in juego.partidas[codigo].usuarios){
           if(juego.partidas[codigo].usuarios[usrExpected].impostor){
              expectImpostorName = usrExpected;
           }else if(!checked){
              checked = true;
              expectcrewmateName = usrExpected;
            }
        }
        juego.partidas[codigo].usuarios[expectcrewmateName].report();
        expect(juego.partidas[codigo].fase.nombre).toEqual("votacion");

        for(var usrExpected in juego.partidas[codigo].usuarios){
          juego.partidas[codigo].usuarios[usrExpected].votar(expectcrewmateName);
        }
        expect(juego.partidas[codigo].fase.votacion[expectcrewmateName]).toEqual(4);
        juego.partidas[codigo].recuento();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        expect(juego.partidas[codigo].usuarios[expectcrewmateName].estado.nombre).toEqual("fantasma");
        expect(juego.partidas[codigo].contenedor.crewmate[expectcrewmateName]).toEqual(undefined);
    })

    it("Votar a skipe",function(){
        juego.unirAPartida(codigo,"ana");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(2);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
        juego.unirAPartida(codigo,"isa");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
        juego.unirAPartida(codigo,"tomas");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(4);
        expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
        juego.usuario[nick].iniciarPartida();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        var checked = false;
        var expectImpostorName="";
        var expectcrewmateName="";

        for(var usrExpected in juego.partidas[codigo].usuarios){
           if(juego.partidas[codigo].usuarios[usrExpected].impostor){
              expectImpostorName = usrExpected;
           }else if(!checked){
              checked = true;
              expectcrewmateName = usrExpected;
            }
        }
        juego.partidas[codigo].usuarios[expectcrewmateName].report();
        expect(juego.partidas[codigo].fase.nombre).toEqual("votacion");

        for(var usrExpected in juego.partidas[codigo].usuarios){
          juego.partidas[codigo].usuarios[usrExpected].votar("skipe");
        }
        expect(juego.partidas[codigo].fase.votacion["skipe"]).toEqual(4);
        juego.partidas[codigo].recuento();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        for(var usrExpected in juego.partidas[codigo].usuarios){
          expect(juego.partidas[codigo].usuarios[usrExpected].estado.nombre).toEqual("vivo");
        }
    })
  });

  describe("Evaluar Victoria",function(){
    var codigo;
    beforeEach(function() {
      codigo=juego.crearPartida(4,nick);
    });
      it("Ganan tripulantes",function(){
        juego.unirAPartida(codigo,"ana");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(2);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
        juego.unirAPartida(codigo,"isa");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
        juego.unirAPartida(codigo,"tomas");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(4);
        expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
        juego.usuario[nick].iniciarPartida();   
        do{
          for(var user in juego.partidas[codigo].usuarios){
            // Reiniciamos el contenedor, hasta tener el escenario deseado
            juego.partidas[codigo].contenedor.crewmate = {};
            juego.partidas[codigo].contenedor.impostor = {};
            juego.partidas[codigo].usuarios[user].impostor=false;
                }
          juego.partidas[codigo].AsignarImpostor();
          juego.partidas[codigo].AsignarTarea();
        }while(!juego.partidas[codigo].usuarios.ana.impostor);
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        expect(juego.partidas[codigo].usuarios["ana"].impostor).toEqual(true);
        juego.partidas[codigo].usuarios["ana"].abandonarPartida();
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].usuarios["ana"]).toBe(undefined);
        expect(juego.partidas[codigo].fase.nombre).toEqual("final");
        expect(juego.partidas[codigo].fase.ganan).toEqual("Tripulantes");   
      });
        
  it("Ganan Impostores",function(){

            juego.unirAPartida(codigo,"ana");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(2);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");
        juego.unirAPartida(codigo,"isa");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].fase.nombre).toEqual("inicial");      
        juego.unirAPartida(codigo,"tomas");
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(4);
        expect(juego.partidas[codigo].fase.nombre).toEqual("completado");
        juego.usuario[nick].iniciarPartida();   
        do{
          for(var user in juego.partidas[codigo].usuarios){
            // Reiniciamos el contenedor, hasta tener el escenario deseado
            juego.partidas[codigo].contenedor.crewmate = {};
            juego.partidas[codigo].contenedor.impostor = {};
            juego.partidas[codigo].usuarios[user].impostor=false;
                }
          juego.partidas[codigo].AsignarImpostor();
          juego.partidas[codigo].AsignarTarea();
        }while(!juego.partidas[codigo].usuarios.ana.impostor);
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        expect(juego.partidas[codigo].usuarios["isa"].impostor).toEqual(false);
        juego.partidas[codigo].usuarios["isa"].abandonarPartida();
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(3);
        expect(juego.partidas[codigo].usuarios["isa"]).toBe(undefined);

        expect(juego.partidas[codigo].usuarios["tomas"].impostor).toEqual(false);
        juego.partidas[codigo].usuarios["tomas"].abandonarPartida();
        var num=Object.keys(juego.partidas[codigo].usuarios).length;
        expect(num).toEqual(2);
        expect(juego.partidas[codigo].usuarios["tomas"]).toBe(undefined);

        expect(juego.partidas[codigo].fase.nombre).toEqual("final");
        expect(juego.partidas[codigo].fase.ganan).toEqual("Impostores");   
          });
        });
});