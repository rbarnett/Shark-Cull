#= require Dwarf
#= require Sheep
#= require Controller
#= require Pad
#= require Scene
#= require Trigger
#= require Skeleton
#= require Boulder

class Level extends Scene
  init:=>
    @started = false
    @current = null
    @game.stage.backgroundColor = '#000'
    @levels = [
      'beach',
    ]
    @pad = new Pad(@game)

    @next()

  next:=>
    @started = false
    @game.world.removeAll() unless @faders

    @bumped = false
    @sheeped = false
    @signals = {
      start: new Phaser.Signal()
      finish: new Phaser.Signal()
    }

    level_group = if @faders then @faders else @game.add.group()
    @render_order = @game.add.group()
    level_group.addAt(@render_order, 0)
    @faders = null

    @render_order.alpha = 0

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

    background = map.createLayer('Background', undefined, undefined, @render_order)
    scenery = map.createLayer('Scenery', undefined, undefined, @render_order)
    @floor_group = @game.add.group()
    @render_order.add(@floor_group)
    @walls = map.createLayer('Walls', undefined, undefined, @render_order)
    @entities = @game.add.group()
    @render_order.add(@entities)
    roof = map.createLayer('Roof', undefined, undefined, @render_order)

    map.addTilesetImage('world', 'world')

    @triggers = []
    @objects = []
    @walkers = []
    @boulders = []
    @controllers = []
    @sheep = []
    @skeletons = []
    @players = [
      new Dwarf(@game, this, 1),
      #new Dwarf(@game, this, 2),
      #new Dwarf(@game, this, 3),
      #new Dwarf(@game, this, 4)
    ]
    for player, i in @players
      player.add_to_group(@entities)
      @walkers.push(player)
      controller = new Controller(@game, player)
      @pad.on(i, Pad.UP, controller.up)
      @pad.on(i, Pad.DOWN, controller.down)
      @pad.on(i, Pad.LEFT, controller.left)
      @pad.on(i, Pad.RIGHT, controller.right)
      @controllers.push(controller)

    for spawn in map.objects.Spawns
      switch spawn.name
        when "player"
          player = @players[+spawn.properties.id-1]
          player.sprite.x = spawn.x
          player.sprite.y = spawn.y - player.sprite.height
        when "trigger"
          trigger = new Trigger(@game, this, spawn.properties)
          if trigger.properties.id != null
            @signals[trigger.properties.id] ||= trigger.signal
          @triggers.push(trigger)
        when "object"
          layer = @entities
          o =
            switch spawn.properties.type
              when "sheep"
                new Sheep(@game, this)
              when "boulder"
                new Boulder(@game, this)
              when "skeleton"
                new Skeleton(@game, this)
              else
                alert("missing definition for type: #{spawn.properties.type}")
          o.sprite.x = spawn.x
          o.sprite.y = spawn.y - o.sprite.height
          @objects.push(o)

          o.add_to_group(layer)
          @walkers.push(o) if (o instanceof Walker)
          @boulders.push(o) if (o instanceof Boulder)
          @sheep.push(o) if (o instanceof Sheep)
          @skeletons.push(o) if (o instanceof Skeleton)

    random_sheep = 30
    while random_sheep > 0
      s = new Sheep(@game, this)
      s.sprite.x = 20 + (Math.random() * (@game.width - 40))
      s.sprite.y = 20 + (Math.random() * (@game.height - 40))

      @objects.push(s)
      s.add_to_group(@entities)
      @walkers.push(s)
      @sheep.push(s)

      random_sheep -= 1

    for trigger in @triggers
      @signals[trigger.properties.event].addOnce(trigger.handle)

    @pain = @game.add.sound('pain')
    @fadein()

  fadein:=>
    @game.add.tween(@render_order).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true);
    timer = @game.time.create(false)
    timer.add(1000, @endfade)
    timer.start()

  endfade:=>
    @signals['finish'].addOnce(@fadeout)
    @signals['start'].dispatch()
    @started = true

  fadeout:=>
    @game.add.tween(@render_order).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
    timer = @game.time.create(false)
    timer.add(1000, @next)
    timer.start()

  render:=>
    # to enabled debug draw, also change Phaser.AUTO to Phaser.CANVAS in dev.html.erb
    #@game.debug.renderSpriteBody(o.sprite) for o in @objects
    #@game.debug.renderSpriteBody(p.sprite) for p in @players

  update:=>
    return unless @started
    @pad.update()
    player.update() for player in @players
    object.update() for object in @objects

    # players bonking into each other
    alive_walkers = (walker for walker in @walkers when !walker.ignore)
    walker.collide(alive_walkers, @walkers_collided) for walker in alive_walkers
   
    non_sheep_walkers = (walker for walker in alive_walkers when !(walker instanceof Sheep))
    walker.collide(@walls) for walker in non_sheep_walkers

    controller.update() for controller in @controllers
    @entities.sort('y', Phaser.Group.SORT_ASCENDING)

  walkers_collided:(p1, p2) =>
    return
    # return if p1.exited || p2.exited

    # unless @sheeped
    #   if (p1 instanceof Dwarf) and (p2 instanceof Sheep)
    #     if (p1.sprite.body.touching.right) and (p2.sprite.body.velocity.x > 70.0)
    #       if (p2.sprite.body.velocity.y > -5.0) and (p2.sprite.body.velocity.y < 5)
    #         p1.say("So soft...")
    #         @sheeped = true

    # if p1.sprite.body.speed+p2.sprite.body.speed >= 300
    #   @pain.play('', 0, 1)

    #   if p1.is_swapable() and p2.is_swapable() #and @current>0
    #     p1.cool_down_swap(10.0)
    #     p2.cool_down_swap(10.0)
    #     @pad.swap_controls(p1.player_number - 1, p2.player_number - 1)
    #     unless @bumped
    #       @bumped = true
    #       @pad.disable()
    #       p1.say "What the...", =>
    #         p2.say "I feel dizzy", =>
    #           trigger = new Trigger(@game, this, {})
    #           trigger.show_hint("(colliding hard swaps controls)")
    #           trigger.signal.add =>
    #             @pad.enable()


  on_dry_land:(posx, posy) =>
    if posy > 420 
      return true

    if posx < 50 and posy > 340
      return true

    if posx < 113 and posy > 365
      return true

    if posx < 208 and posy > 398
      return true

    if posx > 656 and posy > 398
      return true

    if posx > 753 and posy > 365
      return true

    if posx > 818 and posy > 340
      return true

    # 50, 340
    # 113,  374
    # 208, 403
    # 420?
    # 656, 403
    # 753,  374
    # 818, 340

    return false

root = exports ? window
root.Level = Level
