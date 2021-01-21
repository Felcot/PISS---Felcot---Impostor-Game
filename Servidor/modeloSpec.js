var modelo=require("./modelo.js");
describe("El juego del impostor", function() {
  var juego;
  var nick;
  var max = 4;
  beforeEach(function() {
    juego=new modelo.Juego(max,false);
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
      codigo = juego.crearPartida(nick,max,1,1,true);
    });

  it("se comprueba la partida",function(){  
      expect(codigo).not.toBe(undefined);
      //expect(juego.partidas[codigo].nickOwner).toEqual(usr.nick);
      expect(juego.partidas[codigo].nickOwner).toEqual(nick);
      expect(juego.partidas[codigo].confContainer.getMaximo()).toEqual(4);
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
      codigo = juego.crearPartida(nick,max,1,1,true);
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
      console.log("line 119--104");
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
      console.log("line 130--104");
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
        for(var user in juego.partidas[codigo].usuarios){
          if(juego.partidas[codigo].usuarios[user].impostor ){
            expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
            expect(juego.partidas[codigo].usuarios[user].impostor).toEqual(true);
            juego.partidas[codigo].usuarios[user].abandonarPartida();
            expect(juego.partidas[codigo].usuarios[user]).toBe(undefined);
          }
        }
      expect(juego.partidas[codigo].fase.nombre).toEqual("final");
      expect(juego.partidas[codigo].fase.ganan).toEqual("Tripulantes"); 
    });

  });

 describe("[Asignar y Matar]>",function(){
    var codigo;
    beforeEach(function() {
      codigo = juego.crearPartida(nick,max,1,1,true);
    });
    it("--Tareas asignadas-->",function(){
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
          var encargo = juego.partidas[codigo].usuarios[usrExpected].getEncargo();
          for(var encr in encargo)
            expect(encargo[encr].getNombre()).not.toEqual("ninguno");
        }
        console.log("line 201--180");
      });
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
        console.log("line 219--203");
        for(var usrExpected in juego.partidas[codigo].usuarios){
           expectImpostor = expectImpostor || juego.partidas[codigo].usuarios[usrExpected].impostor;
        }
        console.log("line 223--203");
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
        console.log("line 245--227");
        for(var usrExpected in juego.partidas[codigo].usuarios){
           if(juego.partidas[codigo].usuarios[usrExpected].impostor){
              expectImpostorName = usrExpected;
           }else if(!checked){
              checked = true;
              expectcrewmateName = usrExpected;
            }
        }
        console.log("line 254--227");
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
        var partida =juego.getPartida(codigo);
        expect(partida.fase.nombre).toEqual("completado");
        juego.usuario[nick].iniciarPartida();
        expect(partida.fase.nombre).toEqual("jugando");
        var impostor = partida.getImpostor();

      
        partida.usuarios[impostor].report();
        expect(partida.fase.nombre).toEqual("votacion");

        for(var usrExpected in juego.partidas[codigo].usuarios){
          partida.usuarios[usrExpected].votar(impostor);
        }
        expect(partida.fase.votacion[impostor]).toEqual(4);
        partida.recuento();
        expect(partida.getFase().nombre).toEqual("final");
        expect(juego.getPartida(codigo).fase.ganan).toEqual("Tripulantes");
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
        var impostor = juego.getPartida(codigo).getImpostor();
        for(var usrExpected in juego.getPartida(codigo).usuarios)
          if(usrExpected != impostor){ expectcrewmateName = usrExpected; break;}

        juego.partidas[codigo].usuarios[expectcrewmateName].report();
        expect(juego.partidas[codigo].fase.nombre).toEqual("votacion");
        for(var usrExpected in juego.partidas[codigo].usuarios){
          juego.getPartida(codigo).usuarios[usrExpected].votar(expectcrewmateName);
        }
        expect(juego.partidas[codigo].fase.votacion[expectcrewmateName]).toEqual(4);
        juego.partidas[codigo].recuento();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        expect(juego.partidas[codigo].usuarios[expectcrewmateName].estado.nombre).toEqual("fantasma");
        expect(juego.partidas[codigo].contenedor.crewmate[expectcrewmateName]).toEqual(undefined);
    })

    it("Votar skip",function(){
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
          juego.partidas[codigo].usuarios[usrExpected].votar("skip");
        }
        expect(juego.partidas[codigo].fase.votacion["skip"]).toEqual(4);
        juego.partidas[codigo].recuento();
        expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
        for(var usrExpected in juego.partidas[codigo].usuarios){
          expect(juego.partidas[codigo].usuarios[usrExpected].estado.nombre).toEqual("vivo");
        }
    });
  });

  describe("Evaluar Victoria",function(){
    var codigo;
    beforeEach(function() {
      codigo = juego.crearPartida(nick,max,1,1,true);
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
        
        var cont = num;
        for(var user in juego.partidas[codigo].usuarios){
          if(juego.partidas[codigo].usuarios[user].impostor){
            expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
            expect(juego.partidas[codigo].usuarios[user].impostor).toEqual(true);
            juego.partidas[codigo].usuarios[user].abandonarPartida();
            var num=Object.keys(juego.partidas[codigo].usuarios).length;
            expect(num).toEqual(3);
            expect(juego.partidas[codigo].usuarios[user]).toBe(undefined);
            break;
          }
        }
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
        
        var cont = num;
        for(var user in juego.partidas[codigo].usuarios){
          if(!juego.partidas[codigo].usuarios[user].impostor &&juego.partidas[codigo].fase.nombre!="final"){
            expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
            expect(juego.partidas[codigo].usuarios[user].impostor).toEqual(false);
            cont-=1,
            juego.partidas[codigo].usuarios[user].abandonarPartida();
            var num=Object.keys(juego.partidas[codigo].usuarios).length;
            expect(num).toEqual(cont);
            expect(juego.partidas[codigo].usuarios[user]).toBe(undefined);
          }
        }
        expect(juego.partidas[codigo].fase.nombre).toEqual("final");
        expect(juego.partidas[codigo].fase.ganan).toEqual("impostores");   
          });
        });
  describe("Configuración de Partida",function(){
    it(">>publica, 8 jugadores, 3 tareas,2 impostores, por pepe",function(){
      var partida = juego.getPartida(juego.crearPartida(nick,8,2,3,false));
      var confContainer = partida.getConfContainer();
      expect(confContainer.getMaximo()).toEqual(8);
      expect(confContainer.getMinimo()).toEqual(4);
      expect(confContainer.getNumImpostores()).toEqual(2);
      expect(confContainer.getNumTareas()).toEqual(3);
    });
    it(">>publica, 8 jugadores, 3 tareas,2 impostores, por Pepe",function(){
      var partida = juego.getPartida(juego.crearPartida(nick,8,2,3,false));
      var confContainer = partida.getConfContainer();
      expect(partida.nickOwner).toEqual(nick);
      expect(confContainer.getMaximo()).toEqual(8);
      expect(confContainer.getMinimo()).toEqual(4);
      expect(confContainer.getNumImpostores()).toEqual(2);
      expect(confContainer.getNumTareas()).toEqual(3);

    });
  });
});