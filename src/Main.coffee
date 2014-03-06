#= require SceneManager
#= require Level
#= require Splash

class Main extends Phaser.State
  # Weird bug with certain objects and particular versions of
  # coffeescript; without this call, instanceof checks fail
  constructor:(fullscreen, scene)->
    super
    @starting_scene = scene
    @start_fullscreen = fullscreen

  preload:()=>
    @game.stage.backgroundColor = '#000000'
    @game.stage.scale.pageAlignHorizontally = true;
    @game.stage.scale.refresh();
    message = "Loading..."
    style = {
      font: "20px Arial",
      fill: "#FFFFFF",
      align: "center"
    }
    @text = @game.add.text(@game.world.centerX, @game.world.centerY, message, style)
    @text.anchor.setTo(0.5, 0.5);
    @game.load.image('logo', 'assets/logo.png')
    @game.load.image('labs', 'assets/labs.png')
    @game.load.spritesheet('boat', 'assets/boat.png', 32, 32)
    @game.load.spritesheet('sharksprite', 'assets/shark.png', 32, 32)
    @game.load.spritesheet('manswim', 'assets/manswim.png', 32, 32)
    @game.load.spritesheet('world', 'assets/world.png', 32, 32)
    @game.load.spritesheet('emperor', 'assets/emperor.png', 96, 128)
    @game.load.image('crosshair', 'assets/crosshair.png')
    @game.load.image('boulder', 'assets/boulder.png')
    @game.load.image('blood', 'assets/blood.png')
    @game.load.tilemap('beach', 'maps/beach.json', null, Phaser.Tilemap.TILED_JSON)
    @game.load.audio('themetune', 'songs/music.mp3');
    
    @game.load.audio('pain', 'sounds/pain.wav');
    @game.load.audio('crazy', 'sounds/CrazyTime.mp3');
    @game.load.audio('collect', 'sounds/Collect.mp3');
    @game.load.audio('baa1', 'sounds/SheepBaa1.mp3')
    @game.load.audio('baa2', 'sounds/SheepBaa2.mp3')
    @game.load.audio('baa3', 'sounds/SheepBaa3.mp3')
    @game.load.audio('button1', 'sounds/Button1.mp3');
    @game.load.audio('button2', 'sounds/Button2.mp3');
    @game.load.audio('bones', 'sounds/SkeletonBones.mp3')
    @game.load.audio('coin1', 'sounds/Coin1.mp3');
    @game.load.audio('coin2', 'sounds/Coin2.mp3');
    @game.load.audio('coin3', 'sounds/Coin3.mp3');
    @game.load.audio('coin4', 'sounds/Coin4.mp3');
    @game.load.audio('burp', 'sounds/Burp.mp3');
    
    @game.world.remove(@text)
    @text.destroy()

  create:()=>
    @music = @game.add.audio('themetune');
    #@music.play('', 0, 4, true)
    @game.physics.gravity.y = 0
    @game.stage.fullScreenScaleMode = Phaser.StageScaleMode.SHOW_ALL;
    @scene_manager = new SceneManager()
    @scene_manager.add('splash', new Splash(@game, @scene_manager))
    @scene_manager.add('level', new Level(@game, @scene_manager))
    @scene_manager.init(@starting_scene)
    if @start_fullscreen
      @game.input.onDown.add(@gofull);

  gofull:=>
    @game.stage.scale.startFullScreen();

  update:=>
    @scene_manager.update()

  render:=>
    @scene_manager.render()

root = exports ? window
root.Main = Main
