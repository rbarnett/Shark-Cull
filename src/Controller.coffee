#= require Pad

class Controller
  constructor:(game, player)->
    @game = game
    @player = player
    @ax = 0
    @ay = 0
    @targetx = 0
    @targety = 0;

  left:(pid)=>
    @targetx = -1
    #@player.show_arrow(Pad.LEFT, pid)

  right:(pid)=>
    @targetx = 1
    #@player.show_arrow(Pad.RIGHT, pid)

  up:(pid)=>
    @targety = -1
    #@player.show_arrow(Pad.UP, pid)

  down:(pid)=>
    @targety = 1
    #@player.show_arrow(Pad.DOWN, pid)

  update:=>
    if (@targetx == 0)
      if (Math.abs(@player.sprite.body.velocity.x) > 1.0)
        @ax = -@player.sprite.body.velocity.x * @game.time.elapsed * 0.05
    else
      @ax = Math.min(@game.time.elapsed * @targetx * 20.0, 2000.0)
    
    if (@targety == 0)
      if (Math.abs(@player.sprite.body.velocity.y) > 1.0)
        @ay = -@player.sprite.body.velocity.y * @game.time.elapsed * 0.05
    else
      @ay = Math.min(@game.time.elapsed * @targety * 20.0, 2000.0)

    #@ax *= @game.time.elapsed / 1500.0
    #@ay *= @game.time.elapsed / 1500.0
    
    @player.accelerate(@ax, @ay)
    
    @targetx = 0
    @targety = 0
    @ax = 0
    @ay = 0

root = exports ? window
root.Controller = Controller
