#= require Dwarf
#= require Controller
#= require Pad
#= require Scene

class Level extends Scene
  init:=>
    @current = null
    @levels = [
      'level01',
      'level02'
    ]
    @players = [
      new Dwarf(@game, 1),
      new Dwarf(@game, 2),
      new Dwarf(@game, 3),
      new Dwarf(@game, 5)
    ]
    @controllers = []
    for player in @players
      @controllers.push(new Controller(player, @game))
    @pad = new Pad(@game)
    for controller, i in @controllers
      @pad.on(i, Pad.UP, controller.up)
      @pad.on(i, Pad.DOWN, controller.down)
      @pad.on(i, Pad.LEFT, controller.left)
      @pad.on(i, Pad.RIGHT, controller.right)
    @next()

  next:=>
    @game.world.removeAll()
    if @current == null
      @current = 0
    else
      @current += 1
      @current = 0 if @current > @levels.length-1
    map = @game.add.tilemap(@levels[@current])

    # had to do this manually; should be this:
    # map.setCollisionByExclusion([], true, 'Walls')
    index = map.getLayerIndex('Walls')
    layer = map.layers[index]
    for y in [0...layer.height]
      for x in [0...layer.width]
        tile = layer.data[y][x]
        if tile && tile.index > 0
          tile.collides = true
          tile.faceTop = true
          tile.faceBottom = true
          tile.faceLeft = true
          tile.faceRight = true
    map.calculateFaces(index)

    map.addTilesetImage('world', 'world')
    background = map.createLayer('Background')
    scenery = map.createLayer('Scenery')
    @walls = map.createLayer('Walls')
    roof = map.createLayer('Roof')

    for spawn in map.objects.Spawns
      switch spawn.name
        when "player"
          player = @players[+spawn.properties.id-1]
          player.sprite.x = spawn.x
          player.sprite.y = spawn.y

    @entities = @game.add.group()
    @entities.add(player.sprite) for player in @players

    render_order = @game.add.group()
    render_order.add(background)
    render_order.add(scenery)
    render_order.add(@walls)
    render_order.add(@entities)
    render_order.add(roof)

    @pain = @game.add.sound('pain')

  update:=>
    @pad.update()
    player.update() for player in @players
    player.collide(@players, @players_collided) for player in @players
    player.collide(@walls) for player in @players
    controller.update() for controller in @controllers
    @entities.sort('y', Phaser.Group.SORT_ASCENDING)

  exchangeDirection:(p1, p2, d1, d2)=>
    console.log(p1, p2, d1, d2)
    @pad.on(p1, d1, @controllers[p2].getAction(d2))
    @pad.on(p2, d2, @controllers[p1].getAction(d1))

  players_collided:(@p1, @p2) =>
    if @p1.body.speed+@p2.body.speed >= 500
      @pain.play('', 0, 1)

root = exports ? window
root.Level = Level