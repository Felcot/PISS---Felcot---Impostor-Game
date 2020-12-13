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
  var recursos=[{frame:0,sprite:"Europa"},
                {frame:3,sprite:"Gaia"},
                {frame:6,sprite:"Apolo"},
                {frame:9,sprite:"Afrodita"},
                {frame:48,sprite:"Edgar"},
                {frame:51,sprite:"Rosa"},
                {frame:54,sprite:"Morfeo"},
                {frame:57,sprite:"Ursula"}];
  //var remotos.add.group();
function lanzarJuego(){
  game = new Phaser.Game(config);
}
  function preload() {
    this.load.image("tiles", "Cliente/assets/tilesets/tuxmon-sample-32px-extruded.png");
    this.load.tilemapTiledJSON("map", "Cliente/assets/tilemaps/tuxemon-town.json");
    this.load.spritesheet("personajes","Cliente/assets/images/players.png",{frameWidth:32,frameHeight:48});
  }

  function create() {
    crear=this;
    map = crear.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    //capaTareas = map.createStaticLayer("Tareas", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
    //capaTareas.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);

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
    for(var identificador = 0; identificador < recursos.length; identificador++){
      var cond = identificador <4? 0 : 48;
      var spriteName = recursos[identificador].sprite;
      var selector = (identificador%4); // Se encarga de seleccionar un bloque de sprites
      var left = cond + 12 + 3 * selector ;
      var rigth = cond + 24  + 3 * selector;
      var back = cond + 36 + 3 * selector;
      var initFrame = recursos[identificador].frame;
      const anims = [];
      anims[identificador] = crear.anims;
      anims[identificador].create({
        key: spriteName+"-left-walk",
        frames: anims[identificador].generateFrameNames("personajes", {
          start: left,
          end: left + 2,
        }),
        repeat: -1
      });
      anims[identificador].create({
        key: spriteName+"-right-walk",
        frames: anims[identificador].generateFrameNames("personajes", {
          start: rigth,
          end: rigth + 2,
        }),
        repeat: -1
      });
      anims[identificador].create({
        key: spriteName+"-front-walk",
        frames: anims[identificador].generateFrameNames("personajes", {
          //prefix: "misa-left-walk.",
          start: initFrame,
          end: initFrame+2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims[identificador].create({
        key: spriteName+"-back-walk",
        frames: anims[identificador].generateFrameNames("personajes", {
          //prefix: "misa-left-walk.",
          start: back,
          end: back + 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
}
      

    // const camera = this.cameras.main;
    // camera.startFollow(player);
    // camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    //remotos=crear.add.group();
    cursors = crear.input.keyboard.createCursorKeys();
    //teclaA = crear.input.keyboard.addkey('a');
    //teclaV = crear.input.keyboard.addkey('v');
    //teclaT = crear.input.keyboard.addkey('t');

    console.log(ws.toString());
    lanzarJugador(ws.getPersonaje());
    ws.estoyDentro();
  }

  function lanzarJugador(numJugador){
    id = numJugador;
    player = crear.physics.add.sprite(spawnPoint.x+20*id, spawnPoint.y,"personajes",recursos[id].frame);    
    // Watch the player and worldLayer for collisions, for the duration of the scene:
    crear.physics.add.collider(player, worldLayer);
    //crear.physics.add.collider(player,capaTareas ,tareas);
    //crear.physics.add.collider(player2, worldLayer);
    camera = crear.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
  function tareas(sprite,tarea){
    //¿El sprite, el jugador local puede realizar la tarea?
    //En tal caso llamar al servidor que puede hacer la tarea, 
    //y permitir hacer la tarea.
    console.log("realizar tarea");
    /*tarea.nombre="jardines";
    //controlar tecla en la seccion de teclas...
    if(ws.encargo == tarea.nombre){
      console.log("realizar tarea "+ws.encargo);
     //ws.realizarTarea();
    }*/
  }

  function lanzarJugadorRemoto(jugador){
    var frame=recursos[jugador.personaje].frame;
    jugadores[jugador.nick]=crear.physics.add.sprite(spawnPoint.x+20*jugador.personaje, spawnPoint.y,"personajes",frame);   
    crear.physics.add.collider(jugadores[jugador.nick], worldLayer);
    jugadores[jugador.nick].nick = jugador.nick;
    jugadores[jugador.nick].personaje=jugador.personaje;
    //remotos.add(jugadores[jugador.nick]);
  }
  function dibujarMuertos(inocente){
    var x = jugadores[inocente].x;
    var y = jugadores[inocente].y;

    var numJugador =  jugadores[inocente].numJugador;
    var muerto = crear.physics.add.sprite(x,y,"muertos",recursos[numJugador].frame);
    //Alternativa
    // jugadores[inocente].setTexture()
    muertos.add(muerto);
    crear.physics.add.overlap(player,muertos,votacion); 
  }
  function votacion(sprite,muerto){
    //comprobar si el jugador local pulsa la tecla de votacion por ejemplo la V.
    //Si pulsa la V  entonces se lanza la votación
    teclaV.isDown? ws.report():console.log("se ha pulsado la tecla v");
  }

  function moverRemoto(input){
    const speed = 175;
    var remoto=jugadores[input.nick];
    if(remoto){
      const prevVelocity = player.body.velocity.clone();
      const sprite=recursos[remoto.personaje].sprite;
      remoto.body.setVelocity(0);
      remoto.setX(input.direccion.x);
      remoto.setY(input.direccion.y);
      remoto.body.velocity.normalize().scale(speed);
      var direccion =input.direccion.nombre;
      var condition = (direccion == "left"||direccion == "right"||direccion == "back"||direccion == "front");
          condition ? remoto.anims.play(sprite+"-"+direccion+"-walk",true):remoto.anims.stop();
    }
  }

  function update(time, delta) {
    const speed = 175;
    const prevVelocity = player.body.velocity.clone();

    const sprite=recursos[id].sprite;

    // Stop any previous movement from the last frame
    player.body.setVelocity(0);
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
    ws.movimiento(direccion,x,y)
    // Normalize and scale the velocity so that player can't move faster along a diagonal
    player.body.velocity.normalize().scale(speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    var condition = (direccion == "left"||direccion == "right"||direccion == "back"||direccion == "front");
          condition ? player.anims.play(sprite+"-"+direccion+"-walk",true):player.anims.stop();


    function crearCollision(){
      if(ws.impostor && crear){
        crear.physics.add.overlap(player,remotos,kill);
      }
    }
    function kill(impostor,tripulante){
      //avisar al servidor -- ataque.
      ws.atacar(tripulante.nick);
      //dibujar inocente muerto.
    }
  }