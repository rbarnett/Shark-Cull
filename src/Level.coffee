#= require Dwarf
#= require Sheep
#= require Controller
#= require Pad
#= require Scene
#= require Trigger
#= require Skeleton
#= require Boulder
#= require Emperor

class Level extends Scene
  init:=>
    @started = false
    @current = null
    @game.stage.backgroundColor = '#000'
    @levels = [
      'beach',
    ]
    @pad = new Pad(@game)

    @sharks_to_kill = []
    @shark_spawn_time = 0.0

    @emperor_time = 40000
    @spawned_emperor = false

    @dude_spawn_time = 0.0

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
      @spawn_dude()
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

  spawn_shark:=>
    console.log('spawned shark')
    s = new Skeleton(@game, this)
    s.sprite.x = Math.random() * 850.0
    s.sprite.y = Math.random() * 300.0

    @objects.push(s)
    s.add_to_group(@entities)
    @walkers.push(s)
    @skeletons.push(s)

  spawn_sharks:=>
    @shark_spawn_time -= @game.time.elapsed

    if @skeletons.length == 0
      @spawn_shark()
    else if @shark_spawn_time < 0
      if Math.random() < 0.3
        @spawn_shark()
      @shark_spawn_time = 8000.0

  spawn_dude:=>
    console.log('spawned dude')
    s = new Sheep(@game, this)
    s.sprite.x = 20 + (Math.random() * (@game.width - 40))
    s.sprite.y = 20 + (Math.random() * (@game.height - 40))

    @objects.push(s)
    s.add_to_group(@entities)
    @walkers.push(s)
    @sheep.push(s)


  remove_dude:=>
    the_dude = null
    for dude in @sheep
      if !dude.alive
        the_dude = dude
        break
    
    if the_dude
      console.log('removed dude')
      index = @sheep.indexOf(the_dude)
      if (index > -1) 
        @sheep.splice(index, 1)

      index = @objects.indexOf(the_dude)
      if (index > -1) 
        @objects.splice(index, 1)

      index = @walkers.indexOf(the_dude)
      if (index > -1) 
        @walkers.splice(index, 1)

      the_dude.destroy()
  
  spawn_dudes:=>
    @dude_spawn_time -= @game.time.elapsed
    
    alive_dudes = (dude for dude in @sheep when dude.alive)
    
    if alive_dudes.length < 20
      @spawn_dude()
    else if @dude_spawn_time < 0
      if Math.random() < 0.3
        @spawn_dude()
      @dude_spawn_time = 6000.0

      if (@sheep.length - alive_dudes.length) > 60
        @remove_dude()

  spawn_emperor:=>
    if !@spawned_emperor
      #console.log(@emperor_time)
      @emperor_time -= @game.time.elapsed
      if @emperor_time < 0
        e = new Emperor(@game, this)
        e.sprite.x = 0
        e.sprite.y = 600 #410
        e.crosshair.x = e.sprite.x
        e.crosshair.y = e.sprite.y
        @objects.push(e)
        e.add_to_group(@entities)

        @spawned_emperor = true


  update:=>
    return unless @started
    @pad.update()
    player.update() for player in @players
    object.update() for object in @objects

    # kill stuff
    while @sharks_to_kill.length > 0
      @actually_kill_shark(@sharks_to_kill.pop())

    # players bonking into each other
    alive_walkers = (walker for walker in @walkers when !walker.ignore)
    walker.collide(alive_walkers, @walkers_collided) for walker in alive_walkers
   
    non_sheep_walkers = (walker for walker in alive_walkers when !(walker instanceof Sheep))
    walker.collide(@walls) for walker in non_sheep_walkers

    controller.update() for controller in @controllers
    @entities.sort('y', Phaser.Group.SORT_ASCENDING)

    @spawn_emperor()
    if @spawned_emperor
      @spawn_sharks()
    @spawn_dudes()

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

  kill_shark:(shark) =>
    # have to actually delay killing the shark until the end of the update loop, 
    # as can't remove it from the object list while it's being iterated over
    @sharks_to_kill.push(shark)

  actually_kill_shark:(shark) =>
    #console.log('kill shark' + shark)
    index = @skeletons.indexOf(shark)
    if (index > -1) 
      @skeletons.splice(index, 1)

    index = @objects.indexOf(shark)
    if (index > -1) 
      @objects.splice(index, 1)

    index = @walkers.indexOf(shark)
    if (index > -1) 
      @walkers.splice(index, 1)

    blood = new Phaser.Sprite(@game, shark.sprite.x, shark.sprite.y, 'blood')
    @floor_group.add(blood)
    shark.destroy()

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
