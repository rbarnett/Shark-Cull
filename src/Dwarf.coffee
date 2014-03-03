#= require Walker

class Dwarf extends Walker
  constructor:(game, level, i)->
    super(game, level, i)
    @num = i
    @signal = new Phaser.Signal()
    @chat_colour = ['#FF0000', '#FFFF88', '#8888FF', '#88FF88'][@num-1]
    @shadow_colour = ['#000000', '#000000', '#000000', '#000000'][@num-1]

    @sprite.body.friction = 2500

  create_sprite:=>
    super
    # gfx = "dwarf#{@player_number}"
    @sprite = @game.add.sprite(0, 0, 'boat')


  say:(message, callback=null)=>
    @chat_callback = callback
    @set_caption(message, 2, 20)
    timer = @game.time.create(false)
    timer.add(2500, @notify)
    timer.start()

  notify:=>
    @signal.dispatch()

  on_update:=>
    #console.log(@sprite.x, @sprite.y)

root = exports ? window
root.Dwarf = Dwarf
