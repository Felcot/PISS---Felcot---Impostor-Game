describe("El juego del impostor", function() {
  var juego;
  var usr;

  beforeEach(function() {
    juego=new Juego();
    usr=new Usuario("Pepe",juego);
  });

  it("comprobar valores iniciales del juego", function() {
    expect(Object.keys(juego.partidas).length).toEqual(0);
    expect(usr.nick).toEqual("Pepe");
    expect(usr.juego).not.toBe(undefined);
  });

  describe("el usr Pepe crea una partida de 4 jugadores",function(){
  var codigo;
  beforeEach(function() {
      codigo=usr.crearPartida(4);
    });

  it("se comprueba la partida",function(){  
      expect(codigo).not.toBe(undefined);
      expect(juego.partidas[codigo].nickOwner).toEqual(usr.nick);
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
    usr.iniciarPartida();
    expect(juego.partidas[codigo].fase.nombre).toEqual("jugando");
  })
   });
  describe("Abandonar partida no es impostor",function(){
    var codigo;
    beforeEach(function() {
      codigo=usr.crearPartida(4);
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
      usr.iniciarPartida();   
      do{
        for(var user in juego.partidas[codigo].usuarios){
          juego.partidas[codigo].contenedor.eliminar(user,juego.partidas[codigo].usuarios[user].impostor);
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
      usr.iniciarPartida();   
      do{
          for(var user in juego.partidas[codigo].usuarios){
            juego.partidas[codigo].contenedor.eliminar(user,juego.partidas[codigo].usuarios[user].impostor);
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
  describe("Evaluar Victoria",function(){
    var codigo;
    beforeEach(function() {
      codigo=usr.crearPartida(4);
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
        usr.iniciarPartida();   
        do{
          for(var user in juego.partidas[codigo].usuarios){
            juego.partidas[codigo].contenedor.eliminar(user,juego.partidas[codigo].usuarios[user].impostor);
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
        usr.iniciarPartida();   
        do{
          for(var user in juego.partidas[codigo].usuarios){
            juego.partidas[codigo].contenedor.eliminar(user,juego.partidas[codigo].usuarios[user].impostor);
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