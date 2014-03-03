#= require Walker

directions = (wasTouching, touching)->
  allow = []
  if not (touching.up or wasTouching.up) 
    allow.push(Phaser.UP)

  if not (touching.down or wasTouching.down)
    allow.push(Phaser.DOWN)

  if not (touching.left or wasTouching.left)
    allow.push(Phaser.LEFT)

  if not (touching.right or wasTouching.right)
    allow.push(Phaser.RIGHT)

  return allow

class Sheep extends Walker
  constructor:(game, level)->
    @alive = true
    super
    @walkTime = 0.0
    @randDir = 4
    @sprite.body.bounce.x = 0.0
    @sprite.body.bounce.y = 0.0
    @quiet_time = 2.0
    @level = level
    @walking = @on_dry_land()

  create_sprite:=>
    super
    @sprite = @game.add.sprite(0, 0, 'manswim')

  set_animations: =>
    @min_anim_velocity = 10
    @sprite.body.friction = 1

    if !@alive
      if @walking  #actually this just means "on land", they won't be walking as they are dead
        @anim_fps_x = 1
        @anim_fps_y = 1

        @sprite.animations.add("down", [35], @anim_fps_y, true)
        @sprite.animations.add("left", [35], @anim_fps_x, true)
        @sprite.animations.add("right", [35], @anim_fps_x, true)
        @sprite.animations.add("up", [35], @anim_fps_y, true)

        @sprite.animations.add("idle", [35], @anim_fps_y, true)

        @sprite.body.friction = 4   #prevent floaty graves when pushed onto land
      else
        @anim_fps_x = 3
        @anim_fps_y = 3
        @sprite.animations.frame = 1

        @sprite.animations.add("down", [32, 33, 34, 33], @anim_fps_y, true)
        @sprite.animations.add("left", [32, 33, 34, 33], @anim_fps_x, true)
        @sprite.animations.add("right", [32, 33, 34, 33], @anim_fps_x, true)
        @sprite.animations.add("up", [32, 33, 34, 33], @anim_fps_y, true)

        @sprite.animations.add("idle", [32, 33, 34, 33], @anim_fps_y, true)

    else if @walking
      @anim_fps_x = 5
      @anim_fps_y = 8
      @sprite.animations.frame = 1

      @sprite.animations.add("down", [16, 17, 18, 17], @anim_fps_y, true)
      @sprite.animations.add("left", [20, 21, 22, 21], @anim_fps_x, true)
      @sprite.animations.add("right", [24, 25, 26, 25], @anim_fps_x, true)
      @sprite.animations.add("up", [28, 29, 30, 29], @anim_fps_y, true)

      @sprite.animations.add("idle", [17], @anim_fps_y, true)
    else
      @anim_fps_x = 5
      @anim_fps_y = 5
      @sprite.animations.frame = 1

      @sprite.animations.add("down", [0, 1, 2], @anim_fps_y, true)
      @sprite.animations.add("left", [4, 5, 6], @anim_fps_x, true)
      @sprite.animations.add("right", [8, 9, 10], @anim_fps_x, true)
      @sprite.animations.add("up", [12, 13, 14], @anim_fps_y, true)

      @sprite.animations.add("idle", [13], @anim_fps_y, true)


  set_physics: =>
    super
    @sprite.body.height = 28
    @sprite.body.width = 28
    @sprite.body.offset.x = 2
    @sprite.body.offset.y = 2
    @sprite.body.maxVelocity.x = 30
    @sprite.body.maxVelocity.y = 30

  be_eaten: =>
    @alive = false
    @set_animations()

  on_dry_land: =>
    return @level.on_dry_land(@sprite.x, @sprite.y)
    # if @sprite.y > 320.0
    #     return true

    # return false

  walk_or_swim: =>
    @walking = @on_dry_land()

    if @walking
      # console.log("started walking")
      @set_animations()
    else
      # console.log("started swimming")
      @set_animations()

  wander:=>
    # randomly walks around
    @walkTime -= @game.time.elapsed / 1000.0

    if @quiet_time > 0.0
      @quiet_time -= @game.time.elapsed / 1000.0

    # if (@walkTime < 0.0) or not @sprite.body.wasTouching.none or not @sprite.body.touching
    #   if @quiet_time <= 0.0 and Phaser.Math.chanceRoll(20)
    #     sound = Phaser.Math.getRandom(['baa1','baa2', 'baa3'])
    #     @quiet_time = 5.0 + Math.random() * 5.0
    #     @set_caption("*baa*", 1.0, 20, "#FFFFFF", sound, 0.3)

    if (@walkTime < 0.0)
      #@sprite.body.velocity.equals(0.0, 0.0)

      @walkTime = 1.0 + Math.random() * 4.0

      #If we hit something always move, otherwise random roll
      #if not @sprite.body.wasTouching.none or not @sprite.body.touching or Phaser.Math.chanceRoll(70)
      @randDir = Phaser.Math.getRandom(directions(@sprite.body.wasTouching, @sprite.body.touching))
      #else
      #  @randDir = Phaser.NONE

  flee:=>
    for s in @level.skeletons
      dist =  Math.abs(s.sprite.x - @sprite.x) +
              Math.abs(s.sprite.y - @sprite.y)
      if dist < 100.0 and !@on_dry_land()
        @randDir = Phaser.UP      #this is actually down :-/
        return true

    return false

  on_update:=>
    if (@walking != @on_dry_land())
      @walk_or_swim()

    if @alive
      if (!@flee())
        @wander()
    else
      @randDir = null

    if (@randDir == Phaser.RIGHT)
      @accelerate(20, 0)

    else if (@randDir == Phaser.LEFT)
      @accelerate(-20, 0)

    else if (@randDir == Phaser.UP)
      @accelerate(0, 20)
    
    else if @randDir == Phaser.DOWN
      @accelerate(0, -20)

    else
      @accelerate(0, 0)

root = exports ? window
root.Sheep = Sheep
