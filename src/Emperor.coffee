#= require Actor

class Emperor extends Actor
  constructor:(game, level)->
    super(game)
    @level = level

  set_physics: =>
    super
    @sprite.body.width = 46
    @sprite.body.height = 100
    @sprite.body.offset.x = 5
    @sprite.body.offset.y = 6
    @sprite.body.maxVelocity.x = 0.5
    @sprite.body.maxVelocity.y = 0.5
    @sprite.body.collideWorldBounds = false
    @sprite.body.friction = 100.0
    

  create_sprite:=>
    @sprite = @game.add.sprite(0, 0, 'emperor')
    @crosshair = @game.add.sprite(0, 0, 'crosshair')

  move_to_position:=>
    dx = 0 - @sprite.x
    dy = 410 - @sprite.y

    @accelerate(dx*80, dy*80)

  target_sharks:=>
    nearest = null
    nearest_dist = 9999
    for s in @level.skeletons
      dist =  Math.abs(s.sprite.x - @crosshair.x) +
              Math.abs(s.sprite.y - @crosshair.y)
      if dist < 4.0
        @level.kill_shark(s)
        nearest = null
        break
      if dist < nearest_dist
        nearest_dist = dist
        nearest = s

    dx = 0.0
    dy = 0.0
    
    if nearest
      dx = nearest.sprite.x - @crosshair.x
      dy = nearest.sprite.y - @crosshair.y
    else 
      dx = 70.0 - @crosshair.x
      dy = 440.0 - @crosshair.y

    max_crosshair_move = 20.0
    dx = Math.min(dx, max_crosshair_move)
    dx = Math.max(dx, -max_crosshair_move)
    dy = Math.min(dy, max_crosshair_move)
    dy = Math.max(dy, -max_crosshair_move)

    @crosshair.x += (@game.time.elapsed / 1000.0) * dx * 3
    @crosshair.y += (@game.time.elapsed / 1000.0) * dy * 3
    #@accelerate(dx*5, dy*3)

  on_update:()=>
    @collide(@level.walkers)
    @collide(@level.boulders)
    #@collide(@level.walls)
    #@game.debug.renderSpriteBody(@sprite);

    @move_to_position()
    @target_sharks()


root = exports ? window
root.Emperor = Emperor