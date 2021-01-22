/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */



  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  let game;// = new Phaser.Game(config);
  let cursors;
  let player;
  var jugadores={}; //la colección de jugadores remotos
  let showDebug = false;
  let camera;
  var worldLayer;
  let map;
  var crear;
  var spawnPoint;
  var id;
  var nameTag;
  var remoteTags={};
  function resetGame(){
    if(!game)return; 
    game.destroy();
    cursors=null;
    player=null;
    jugadores={}; //la colección de jugadores remotos
    showDebug = false;
    camera=null;
    worldLayer=null;
    map=null;
    crear=null;
    spawnPoint=null;
    id=null;
    capaTareas=null;
    capaLayout=null;
    tareasOn = true;
    layoutOn=true;
    ataqueOn = false;
    votarOn = true;
    remotos=null;
    muertos=null;
  }
  var recursos=[{frame:0,sprite:"Europa"},
                {frame:3,sprite:"Gaia"},
                {frame:6,sprite:"Apolo"},
                {frame:9,sprite:"Afrodita"},
                {frame:48,sprite:"Edgar"},
                {frame:51,sprite:"Rosa"},
                {frame:54,sprite:"Morfeo"},
                {frame:57,sprite:"Ursula"}];
var fantasmas=[{frame:0,sprite:"Europa-fantasma"},
                {frame:3,sprite:"Gaia-fantasma"},
                {frame:6,sprite:"Apolo-fantasma"},
                {frame:9,sprite:"Afrodita-fantasma"},
                {frame:48,sprite:"Edgar-fantasma"},
                {frame:51,sprite:"Rosa-fantasma"},
                {frame:54,sprite:"Morfeo-fantasma"},
                {frame:57,sprite:"Ursula-fantasma"}];
var tombstoneRecursos = [{frame:0,sprite:"Europa-death"},
                         {frame:1,sprite:"Gaia-death"},
                         {frame:2,sprite:"Apolo-death"},
                         {frame:3,sprite:"Afrodita-death"},
                         {frame:4,sprite:"Edgar-death"},
                         {frame:5,sprite:"Rosa-death"},
                         {frame:6,sprite:"Morfeo-death"},
                         {frame:7,sprite:"Ursula-death"},
                         {frame:8,sprite:"default-death"}]
  var capaTareas;
  var capaLayout;
  var layoutOn = true;
  var tareasOn = true;
  var ataqueOn = false;
  var votarOn = true;
  var remotos;
  var muertos;
function lanzarJuego(){
  game = new Phaser.Game(config);
}
  function preload() {
    this.load.image("tiles", "Cliente/assets/tilesets/tuxmon-sample-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "Cliente/assets/tilemaps/tuxemon-town.json");
    this.load.spritesheet("personajes-vivo","Cliente/assets/images/players.png",{frameWidth:32,frameHeight:48});
    this.load.spritesheet("personajes-fantasma","Cliente/assets/images/fantasmas.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("tombstone","Cliente/assets/images/tombstone.png",{frameWidth:32,frameHeight:64});
  }

  function create() {
    crear=this;
    map = crear.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");
     
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    const abovebelowLayer = map.createStaticLayer("AboveBelow Player", tileset, 0, 0);
    worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    capaTareas = map.createStaticLayer("capaTareas", tileset, 0, 0);
    capaLayout = map.createStaticLayer("capaLayout", tileset, 0, 0);

    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);
    const aboveAboveLayer = map.createStaticLayer("AboveAbove Player", tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
    capaTareas.setCollisionByProperty({ collides: true });
    capaLayout.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);
    aboveAboveLayer.setDepth(15);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

    // Create a sprite with physics enabled via the physics system. The image used for the sprite has
    // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
    // player = this.physics.add
    //   .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    //   .setSize(30, 40)
    //   .setOffset(0, 24);

    // // Watch the player and worldLayer for collisions, for the duration of the scene:
    //this.physics.add.collider(player, worldLayer);
    var estado = {"0":"vivo","1":"fantasma"}
    const anims = [];
    for(var identificador = 0; identificador < recursos.length; identificador++){
      for(var estadoSelector = 0; estadoSelector < 2; estadoSelector++){
      var cond = identificador <4? 0 : 48;
      var vivo =estado[""+estadoSelector] == "vivo";
      var initFrame =  vivo? recursos[identificador].frame : fantasmas[identificador].frame;
      var spriteName = vivo? recursos[identificador].sprite:fantasmas[identificador].sprite;
      var selector = (identificador%4); // Se encarga de seleccionar un bloque de sprites
      var left = cond + 12 + 3 * selector ;
      var rigth = cond + 24  + 3 * selector;
      var back = cond + 36 + 3 * selector;
      var id =identificador+(estado[""+estadoSelector]!=vivo?9:0);
      anims[id] = crear.anims;
      anims[id].create({
        key: spriteName+"-left-walk",
        frames: anims[id].generateFrameNames("personajes-"+estado[""+estadoSelector], {
          start: left,
          end: left + 2,
        }),
        repeat: -1
      });
      anims[id].create({
        key: spriteName+"-right-walk",
        frames: anims[id].generateFrameNames("personajes-"+estado[""+estadoSelector], {
          start: rigth,
          end: rigth + 2,
        }),
        repeat: -1
      });
      anims[id].create({
        key: spriteName+"-front-walk",
        frames: anims[id].generateFrameNames("personajes-"+estado[""+estadoSelector], {
          //prefix: "misa-left-walk.",
          start: initFrame,
          end: initFrame+2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims[id].create({
        key: spriteName+"-back-walk",
        frames: anims[id].generateFrameNames("personajes-"+estado[""+estadoSelector], {
          //prefix: "misa-left-walk.",
          start: back,
          end: back + 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims[id].create({
        key: spriteName+"death",
        frames: anims[id].generateFrameNames("tombstone", {
          //prefix: "misa-left-walk.",
          start: id,
          end: id,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
  }
}
      

    // const camera = this.cameras.main;
    // camera.startFollow(player);
    // camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    cursors = crear.input.keyboard.createCursorKeys();
    muertos = crear.add.group();
    remotos = crear.add.group();
    /*
      TECLAS
    */
    teclaA = crear.input.keyboard.addKey('a');
    teclaV = crear.input.keyboard.addKey('v');
    teclaT = crear.input.keyboard.addKey('t');
    teclaI = crear.input.keyboard.addKey('i');

    lanzarJugador(ws.getPersonaje(),ws.getEstado());
    ws.estoyDentro();
  }
  
  function crearFantasma(data){
    var cond = jugadores[data.tripulante]?true:false;
    var trip = cond ? jugadores[data.tripulante] : player;
    cond? remoteTags[data.tripulante].visible=trip.visible=false
        : trip.setTexture("personajes-fantasma");
    if(!cond){
      for(var usr in jugadores){
        remoteTags[usr].visible=jugadores[usr]=true;
      }
    }
    trip.alpha =0.5;
  }
  
  function dibujarMuertos(data){
    var cond = jugadores[data.tripulante]?true:false;
    var trip = cond ? jugadores[data.tripulante] : player;
    var x =  trip.x;
    var y = trip.y;
    var muerto = crear.physics.add.sprite(x,y,"tombstone",data.personaje);
    //Alternativa
    // jugadores[inocente].setTexture()

    muertos.add(muerto);
    crear.physics.add.overlap(player,muertos,votacion,()=>{return votarOn}); 
    cond? remoteTags[data.tripulante].visible=trip.visible=false
        : trip.setTexture("personajes-fantasma");
    trip.alpha =0.5;
  }

  function votacion(sprite,muerto){
    //comprobar si el jugador local pulsa la tecla de votacion por ejemplo la V.
    //Si pulsa la V  entonces se lanza la votación
    if(ws.getEstado() == "vivo" && teclaV.isDown){
      votarOn = false;     
      ws.report();
    }
  }
  function report(){
    /*Esta funcion se encarga de eliminar todos las tumbas, 
      si se ha llamado ha reportar*/
    var i = 0;
    for(i=0;i<muertos.children.size;i++){
        muertos.children.entries[0].destroy();
      }
  }
  function abandonarPartida(nick){
    //Elimina a un jugador del juego
    jugadores[nick].destroy();
  }
  function moverRemoto(input){
    var remoto=jugadores[input.nick];
    var remotoTag = remoteTags[input.nick];
    if(remoto && remotoTag){
      if(input.estado != "fantasma" || ws.getEstado()=="fantasma"){
        remoto.visible = true;
        remotoTag.visible=true;
        const speed = 175;
        const prevVelocity = player.body.velocity.clone();
        const sprite = input.estado == "vivo"?recursos[input.id].sprite:fantasmas[input.id].sprite;
        remoto.body.setVelocity(0);
        remoto.setX(input.direccion.x);
        remoto.setY(input.direccion.y);
        remotoTag.setX(input.direccion.x-25);
        remotoTag.setY(input.direccion.y-50);
        remoto.body.velocity.normalize().scale(speed);
        var direccion =input.direccion.nombre;
        var condition = (direccion == "left"||direccion == "right"||direccion == "back"||direccion == "front");
            condition ? remoto.anims.play(sprite+"-"+direccion+"-walk",true):remoto.anims.stop();
      }else{
        remoto.visible = false;
        remotoTag.visible=false;
      }
    }
  }
  function realizarTareas(sprite,objeto){
      //¿El sprite, el jugador local puede realizar la tarea?
      //En tal caso llamar al servidor que puede hacer la tarea, 
      //y permitir hacer la tarea.
      if(ws.tengoEncargo(objeto.properties.tarea) && teclaT.isDown){
        tareasOn=false;
        ws.console("realizar tarea");
        ws.realizarTarea(objeto.properties.tarea);
        //cw.mostrarModalTarea(ws.encargo);
      }
  }
  function consultarLayout(sprite,objeto){
      //¿El sprite, el jugador local puede realizar la tarea?
      //En tal caso llamar al servidor que puede hacer la tarea, 
      //y permitir hacer la tarea.
      if(teclaI.isDown){
        layoutOn=false;
        ws.console("game.consultarLayout."+objeto.properties.info);
        ws.consultarLayout(objeto.properties.info);
      }
  }
  function lanzarJugador(numJugador,estado){
    id = numJugador;
    player = crear.physics.add.sprite(spawnPoint.x+20*id, spawnPoint.y,"personajes-"+estado,recursos[id].frame);    
    // Watch the player and worldLayer for collisions, for the duration of the scene:
    crear.physics.add.collider(player, worldLayer);
    crear.physics.add.collider(player,capaTareas ,realizarTareas,()=>{return tareasOn});
    crear.physics.add.collider(player,capaLayout ,consultarLayout,()=>{return layoutOn});
    nameTag = crear.add.text(player.x-25,player.y-50,ws.nick,{fontSize:'16px',fill:'#75D5E8'});
    camera = crear.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  }

  function crearColision(){
      if(crear && ws.impostor){
        crear.physics.add.overlap(player,remotos,kill,()=>{return ataqueOn});
      }
        
        //: console.log("crearColision.false.crear["+(crear&&true)+"].impostor["+ws.impostor+"]");
    }
    function kill (sprite,inocente){
      var nick = inocente.nick
      if(teclaA.isDown){
        ataqueOn=false;
        ws.atacar(nick);
      }
  }
  function lanzarJugadorRemoto(jugador){
    var frame=recursos[jugador.personaje].frame;
    jugadores[jugador.nick]=crear.physics.add.sprite(spawnPoint.x+20*jugador.personaje, spawnPoint.y,"personajes-"+jugador.estado,frame);   
    crear.physics.add.collider(jugadores[jugador.nick], worldLayer);
    jugadores[jugador.nick].nick = jugador.nick;
    jugadores[jugador.nick].personaje=jugador.personaje;
    remotos.add(jugadores[jugador.nick]);
    remoteTags[jugador.nick]=crear.add.text(spawnPoint.x+20*jugador.personaje-25,spawnPoint.y-50,jugador.nick,{fontSize:'16px',fill:'#DAECF0'});
  }
  function update(time, delta) {
    if(!ws.estamosJugando())return;
    const speed = 175;
    const prevVelocity = player.body.velocity.clone();
    const sprite = ws.getEstado() == "vivo"?recursos[id].sprite:fantasmas[id].sprite;
    // Stop any previous movement from the last frame
    player.body.setVelocity(0);
    //nameTag.destroy();
    //player2.body.setVelocity(0);
    var direccion = "stop";
    // Horizontal movement
    if (cursors.left.isDown) {
      player.body.setVelocityX(-speed);
      direccion="left";
    } else if (cursors.right.isDown) {
      player.body.setVelocityX(speed);
      direccion="right";
    }

    // Vertical movement
    if (cursors.up.isDown) {
      player.body.setVelocityY(-speed);
      direccion="back";
    } else if (cursors.down.isDown) {
      player.body.setVelocityY(speed);
      direccion ="front";
    }
    var x = player.x;
    var y = player.y;
    nameTag.setX(x-25)
    nameTag.setY(y-50)

    ws.movimiento(direccion,x,y)
    // Normalize and scale the velocity so that player can't move faster along a diagonal
    player.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    var condition = (direccion == "left"||direccion == "right"||direccion == "back"||direccion == "front");
          condition ? player.anims.play(sprite+"-"+direccion+"-walk",true):player.anims.stop();
}