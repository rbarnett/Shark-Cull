#= require Walker

class Skeleton extends Walker
  constructor:(game, level)->
    super
    @walkTime = 0.0
    @randDir = 4
    @maxY = 320.0

  create_sprite:=>
    super
    @sprite = @game.add.sprite(0, 0, 'sharksprite')
    @quiet_time = 2

  set_animations: =>
    @anim_fps_x = 5
    @anim_fps_y = 5
    @min_anim_velocity = 25
    super

  set_physics: =>
    super
    @sprite.body.height = 16
    @sprite.body.width = 24
    @sprite.body.offset.x = 4
    @sprite.body.offset.y = 16
    @sprite.body.maxVelocity.x = 30
    @sprite.body.maxVelocity.y = 30

  directions:(wasTouching, touching)->
    allow = []
    #if (not (touching.up or wasTouching.up)) 
    if @sprite.y < @maxY
      allow.push(Phaser.UP)

    if true #not (touching.down or wasTouching.down)
      allow.push(Phaser.DOWN)

    if true #not (touching.left or wasTouching.left)
      allow.push(Phaser.LEFT)

    if true #not (touching.right or wasTouching.right)
      allow.push(Phaser.RIGHT)

    return allow

  wander:=>
    # randomly walks around
    @walkTime -= @game.time.elapsed / 1000.0

    if (@walkTime < 0.0) or (@sprite.y > @maxY and @randDir == Phaser.UP)
      @walkTime = 1.0 + Math.random() * 4.0

      #If we hit something always move, otherwise random roll
      #if not @sprite.body.wasTouching.none or not @sprite.body.touching or Phaser.Math.chanceRoll(70)
      @randDir = Phaser.Math.getRandom(@directions(@sprite.body.wasTouching, @sprite.body.touching))
      
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
  
  on_update:=>
    # Walks to nearest sheep
    nearest = null
    nearest_dist = 9999
    for s in @level.sheep
      dist =  Math.abs(s.sprite.x - @sprite.x) +
              Math.abs(s.sprite.y - @sprite.y)
      if dist < nearest_dist and dist > 50.0 and !s.on_dry_land()
        nearest_dist = dist
        nearest = s

    if @quiet_time > 0.0
      @quiet_time -= @game.time.elapsed / 1000.0

    # if nearest_dist < 100.0
    #   if @quiet_time <= 0.0 and Phaser.Math.chanceRoll(1)
    #     @quiet_time = 5.0 + Math.random() * 5.0
    #     @game.add.sound('bones').play('', 0, 0.3, false, true)
    #     nearest.say("eek!")

    if nearest and nearest_dist < 100
      dx = nearest.sprite.x - @sprite.x
      dy = nearest.sprite.y - @sprite.y
      @accelerate(dx*5, dy*3)
    else
      @wander()

root = exports ? window
root.Skeleton = Skeleton
