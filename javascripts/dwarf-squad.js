(function() {
  var SceneManager, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SceneManager = (function() {
    function SceneManager() {
      this.get_current = __bind(this.get_current, this);
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
      this.init = __bind(this.init, this);
      this.add = __bind(this.add, this);
      this.scenes = {};
      this.current = null;
    }

    SceneManager.prototype.add = function(name, scene) {
      return this.scenes[name] = scene;
    };

    SceneManager.prototype.init = function(name) {
      var faders;
      if (this.current !== null) {
        faders = this.scenes[this.current].faders;
        this.scenes[this.current].fini();
        this.scenes[this.current].faders = null;
      }
      this.current = name;
      this.scenes[this.current].faders = faders;
      return this.scenes[this.current].init();
    };

    SceneManager.prototype.update = function() {
      if (this.current !== null) {
        return this.scenes[this.current].update();
      }
    };

    SceneManager.prototype.render = function() {
      if (this.current !== null) {
        return this.scenes[this.current].render();
      }
    };

    SceneManager.prototype.get_current = function() {
      return this.scenes[this.current];
    };

    return SceneManager;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.SceneManager = SceneManager;

}).call(this);
(function() {
  var Entity, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Entity = (function() {
    function Entity(game) {
      this.say = __bind(this.say, this);
      this.onDestroy = __bind(this.onDestroy, this);
      this.remove_from_group = __bind(this.remove_from_group, this);
      this.add_to_group = __bind(this.add_to_group, this);
      this.destroy = __bind(this.destroy, this);
      this.create_sprite = __bind(this.create_sprite, this);
      this.game = game;
      this.dead = false;
      this.create_sprite();
      this.solid = true;
    }

    Entity.prototype.create_sprite = function() {};

    Entity.prototype.destroy = function() {
      if (this.dead) {
        return;
      }
      this.sprite.destroy();
      this.dead = true;
      return this.onDestroy();
    };

    Entity.prototype.add_to_group = function(group) {
      group.add(this.sprite);
      this.current_group = group;
      if (this.on_add_to_group) {
        return this.on_add_to_group(group);
      }
    };

    Entity.prototype.remove_from_group = function(group) {
      group.remove(this.sprite);
      this.current_group = null;
      if (this.on_remove_from_group) {
        return this.on_remove_from_group(group);
      }
    };

    Entity.prototype.onDestroy = function() {};

    Entity.prototype.say = function(dialogue) {};

    return Entity;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Entity = Entity;

}).call(this);
(function() {
  var Actor, offset_x, offset_y, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  offset_x = function(body) {
    var x;
    return x = body.x + body.halfWidth;
  };

  offset_y = function(body) {
    var y;
    return y = body.y - 1.1 * body.height;
  };

  Actor = (function(_super) {
    __extends(Actor, _super);

    function Actor(game) {
      this.activate_target = __bind(this.activate_target, this);
      this.accelerate = __bind(this.accelerate, this);
      this.on_update = __bind(this.on_update, this);
      this.update = __bind(this.update, this);
      this.collide_object = __bind(this.collide_object, this);
      this.collide = __bind(this.collide, this);
      this.set_caption = __bind(this.set_caption, this);
      this.set_physics = __bind(this.set_physics, this);
      Actor.__super__.constructor.call(this, game);
      this.caption = null;
      this.shadow = null;
      this.message_remaining = 0.0;
      this.set_physics();
      this.chat_callback = null;
      this.chat_colour = '#FFFFFF';
      this.shadow_colour = '#000000';
      this.shadow_offset = [1, 2];
    }

    Actor.prototype.set_physics = function() {
      this.sprite.body.friction = 1;
      this.sprite.body.maxVelocity.x = 150;
      this.sprite.body.maxVelocity.y = 150;
      this.sprite.body.collideWorldBounds = true;
      this.sprite.body.bounce.x = 0.1;
      this.sprite.body.bounce.y = 0.1;
      this.sprite.body.height = 34;
      this.sprite.body.width = 34;
      this.sprite.body.offset.x = 0;
      this.sprite.body.offset.y = 0;
      this.sprite.body.oldPostUpdate = this.sprite.body.postUpdate;
      this.sprite.body.postUpdate = function() {
        this.oldPostUpdate();
        this.sprite.float_x = this.sprite.x;
        this.sprite.float_y = this.sprite.y;
        this.sprite.x = parseInt(this.sprite.x);
        return this.sprite.y = parseInt(this.sprite.y);
      };
      this.sprite.body.oldPreUpdate = this.sprite.body.preUpdate;
      return this.sprite.body.preUpdate = function() {
        if (this.sprite.float_x) {
          this.sprite.x = this.sprite.float_x;
        }
        if (this.sprite.float_y) {
          this.sprite.y = this.sprite.float_y;
        }
        return this.oldPreUpdate();
      };
    };

    Actor.prototype.set_caption = function(message, time, size, color, sound, volume) {
      var shadow, shadow_colour, style;
      if (color == null) {
        color = null;
      }
      if (sound == null) {
        sound = null;
      }
      if (volume == null) {
        volume = 0.5;
      }
      color || (color = this.chat_colour);
      shadow_colour = this.shadow_colour;
      style = {
        font: "bold " + size + "px Arial",
        fill: color,
        align: "center"
      };
      shadow = {
        font: "bold " + size + "px Arial",
        fill: shadow_colour,
        align: "center"
      };
      if (this.caption) {
        this.caption.destroy();
        this.shadow.destroy();
      }
      this.shadow = this.game.add.text(0, 0, message, shadow);
      this.caption = this.game.add.text(0, 0, message, style);
      this.caption.anchor.setTo(0.5, 1.0);
      this.shadow.anchor.setTo(0.5, 1.0);
      if (sound) {
        this.game.add.sound(sound).play('', 0, volume, false, true);
      }
      return this.message_remaining = time;
    };

    Actor.prototype.collide = function(others, callback, processor_fn) {
      var other, _i, _len, _results;
      if (callback == null) {
        callback = null;
      }
      if (processor_fn == null) {
        processor_fn = null;
      }
      if (others instanceof Array) {
        _results = [];
        for (_i = 0, _len = others.length; _i < _len; _i++) {
          other = others[_i];
          _results.push(this.collide_object(other, callback, processor_fn));
        }
        return _results;
      } else {
        return this.collide_object(others, callback, processor_fn);
      }
    };

    Actor.prototype.collide_object = function(other, callback, processor_fn) {
      var _this = this;
      if (other instanceof Entity) {
        if (other.sprite === this.sprite) {
          return;
        }
        return this.game.physics.collide(this.sprite, other.sprite, function(us, other_sprite) {
          if (callback) {
            return callback(_this, other);
          }
        }, function(us, other_sprite) {
          if (processor_fn) {
            return processor_fn(_this, other);
          }
        });
      } else {
        return this.game.physics.collide(this.sprite, other, callback, processor_fn);
      }
    };

    Actor.prototype.update = function() {
      this.on_update();
      this.message_remaining -= this.game.time.elapsed / 1000.0;
      if (this.message_remaining < 0.0) {
        this.message_remaining = 0;
        if (this.caption) {
          this.caption.destroy();
          this.shadow.destroy();
          this.caption = null;
          this.shadow = null;
          if (this.chat_callback) {
            this.chat_callback();
          }
        }
      }
      if (this.caption) {
        this.caption.x = offset_x(this.sprite.body);
        this.caption.y = offset_y(this.sprite.body);
        this.shadow.x = offset_x(this.sprite.body) + this.shadow_offset[0];
        return this.shadow.y = offset_y(this.sprite.body) + this.shadow_offset[1];
      }
    };

    Actor.prototype.on_update = function() {};

    Actor.prototype.accelerate = function(ax, ay) {
      if (ax > 1.0 || ax < -1.0) {
        this.sprite.body.acceleration.x = ax;
      } else if (this.sprite.body.velocity.x !== 0) {
        this.sprite.body.acceleration.x = -(this.sprite.body.velocity.x * 15.0);
      }
      if (ay > 1.0 || ay < -1.0) {
        return this.sprite.body.acceleration.y = ay;
      } else if (this.sprite.body.velocity.y !== 0) {
        return this.sprite.body.acceleration.y = -(this.sprite.body.velocity.y * 15.0);
      }
    };

    Actor.prototype.activate_target = function(msg) {
      var x, _i, _len, _ref, _results;
      if (this.properties.target) {
        _ref = this.level.objects;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          if (x.properties && x.properties.id === this.properties.target) {
            _results.push(x.targeted(msg));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    return Actor;

  })(Entity);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Actor = Actor;

}).call(this);
(function() {
  var Walker, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Walker = (function(_super) {
    __extends(Walker, _super);

    function Walker(game, level, player_number) {
      if (player_number == null) {
        player_number = -1;
      }
      this.cool_down_swap = __bind(this.cool_down_swap, this);
      this.is_swapable = __bind(this.is_swapable, this);
      this.is_playable = __bind(this.is_playable, this);
      this.on_walking_collide = __bind(this.on_walking_collide, this);
      this.update = __bind(this.update, this);
      this.set_animations = __bind(this.set_animations, this);
      this.player_number = player_number;
      this.level = level;
      Walker.__super__.constructor.call(this, game);
      this.game = game;
      this.anim_fps_x = 20;
      this.anim_fps_y = 10;
      this.min_anim_velocity = 29.0;
      this.set_animations();
      this.ignore = false;
      this.animStartTime = 1.0;
      this.axisOwner = [-1, -1, -1, -1];
      this.exited = false;
      this.facing = Pad.UP;
      this.swap_cool = 0.0;
    }

    Walker.prototype.set_animations = function() {
      var idleChoice, idleFps;
      this.sprite.animations.frame = 1;
      this.sprite.animations.add("down", [0, 1, 2, 1], this.anim_fps_y, true);
      this.sprite.animations.add("left", [4, 5, 6, 5], this.anim_fps_x, true);
      this.sprite.animations.add("right", [8, 9, 10, 9], this.anim_fps_x, true);
      this.sprite.animations.add("up", [12, 13, 14, 13], this.anim_fps_y, true);
      idleChoice = Math.floor(Math.random() * 4);
      return idleFps = 0.05 + (Math.random() * 0.2);
    };

    Walker.prototype.update = function() {
      var newAnim;
      if (this.animStartTime > -1.0) {
        this.animStartTime -= this.game.time.elapsed;
      }
      if (this.animStartTime < 0.0) {
        newAnim = false;
        if (this.sprite.body.velocity.x > this.min_anim_velocity && Math.abs(this.sprite.body.velocity.x) > Math.abs(this.sprite.body.velocity.y)) {
          this.sprite.animations.play("right");
          this.facing = Pad.RIGHT;
          newAnim = true;
        } else if (this.sprite.body.velocity.x < -this.min_anim_velocity && Math.abs(this.sprite.body.velocity.x) > Math.abs(this.sprite.body.velocity.y)) {
          this.sprite.animations.play("left");
          this.facing = Pad.LEFT;
          newAnim = true;
        } else if (this.sprite.body.velocity.y > this.min_anim_velocity) {
          this.sprite.animations.play("down");
          this.facing = Pad.DOWN;
          newAnim = true;
        } else if (this.sprite.body.velocity.y < -this.min_anim_velocity) {
          this.sprite.animations.play("up");
          this.facing = Pad.UP;
          newAnim = true;
        } else {
          this.sprite.animations.play("idle");
          this.facing = Pad.DOWN;
          newAnim = false;
        }
        if (newAnim) {
          this.animStartTime = 250;
        }
      }
      if (this.swap_cool > 0.0) {
        this.swap_cool -= this.game.time.elapsed / 1000.0;
      }
      return Walker.__super__.update.apply(this, arguments);
    };

    Walker.prototype.on_walking_collide = function(us, them) {
      if (!them.solid) {
        return false;
      }
      return true;
    };

    Walker.prototype.is_playable = function() {
      return this.player_number !== -1;
    };

    Walker.prototype.is_swapable = function() {
      return this.is_playable() && this.swap_cool <= 0.0;
    };

    Walker.prototype.cool_down_swap = function(time) {
      return this.swap_cool = time;
    };

    return Walker;

  })(Actor);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Walker = Walker;

}).call(this);
(function() {
  var Dwarf, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dwarf = (function(_super) {
    __extends(Dwarf, _super);

    function Dwarf(game, level, i) {
      this.on_update = __bind(this.on_update, this);
      this.notify = __bind(this.notify, this);
      this.say = __bind(this.say, this);
      this.set_animations = __bind(this.set_animations, this);
      this.create_sprite = __bind(this.create_sprite, this);
      Dwarf.__super__.constructor.call(this, game, level, i);
      this.num = i;
      this.signal = new Phaser.Signal();
      this.chat_colour = ['#FF0000', '#FFFF88', '#8888FF', '#88FF88'][this.num - 1];
      this.shadow_colour = ['#000000', '#000000', '#000000', '#000000'][this.num - 1];
      this.sprite.body.friction = 2500;
    }

    Dwarf.prototype.create_sprite = function() {
      Dwarf.__super__.create_sprite.apply(this, arguments);
      return this.sprite = this.game.add.sprite(0, 0, 'boat');
    };

    Dwarf.prototype.set_animations = function() {
      this.anim_fps_x = 8;
      this.anim_fps_y = 8;
      this.sprite.animations.frame = 1;
      this.sprite.animations.add("down", [0, 1], this.anim_fps_y, true);
      this.sprite.animations.add("left", [4, 5], this.anim_fps_x, true);
      this.sprite.animations.add("right", [8, 9], this.anim_fps_x, true);
      return this.sprite.animations.add("up", [12, 13], this.anim_fps_y, true);
    };

    Dwarf.prototype.say = function(message, callback) {
      var timer;
      if (callback == null) {
        callback = null;
      }
      this.chat_callback = callback;
      this.set_caption(message, 2, 20);
      timer = this.game.time.create(false);
      timer.add(2500, this.notify);
      return timer.start();
    };

    Dwarf.prototype.notify = function() {
      return this.signal.dispatch();
    };

    Dwarf.prototype.on_update = function() {};

    return Dwarf;

  })(Walker);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Dwarf = Dwarf;

}).call(this);
(function() {
  var Sheep, directions, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  directions = function(wasTouching, touching) {
    var allow;
    allow = [];
    if (!(touching.up || wasTouching.up)) {
      allow.push(Phaser.UP);
    }
    if (!(touching.down || wasTouching.down)) {
      allow.push(Phaser.DOWN);
    }
    if (!(touching.left || wasTouching.left)) {
      allow.push(Phaser.LEFT);
    }
    if (!(touching.right || wasTouching.right)) {
      allow.push(Phaser.RIGHT);
    }
    return allow;
  };

  Sheep = (function(_super) {
    __extends(Sheep, _super);

    function Sheep(game, level) {
      this.on_update = __bind(this.on_update, this);
      this.flee = __bind(this.flee, this);
      this.wander = __bind(this.wander, this);
      this.walk_or_swim = __bind(this.walk_or_swim, this);
      this.on_dry_land = __bind(this.on_dry_land, this);
      this.be_eaten = __bind(this.be_eaten, this);
      this.set_physics = __bind(this.set_physics, this);
      this.set_animations = __bind(this.set_animations, this);
      this.create_sprite = __bind(this.create_sprite, this);
      this.alive = true;
      Sheep.__super__.constructor.apply(this, arguments);
      this.walkTime = 0.0;
      this.randDir = 4;
      this.sprite.body.bounce.x = 0.0;
      this.sprite.body.bounce.y = 0.0;
      this.quiet_time = 2.0;
      this.level = level;
      this.walking = this.on_dry_land();
    }

    Sheep.prototype.create_sprite = function() {
      Sheep.__super__.create_sprite.apply(this, arguments);
      return this.sprite = this.game.add.sprite(0, 0, 'manswim');
    };

    Sheep.prototype.set_animations = function() {
      this.min_anim_velocity = 10;
      this.sprite.body.friction = 1;
      if (!this.alive) {
        if (this.walking) {
          this.anim_fps_x = 1;
          this.anim_fps_y = 1;
          this.sprite.animations.add("down", [35], this.anim_fps_y, true);
          this.sprite.animations.add("left", [35], this.anim_fps_x, true);
          this.sprite.animations.add("right", [35], this.anim_fps_x, true);
          this.sprite.animations.add("up", [35], this.anim_fps_y, true);
          this.sprite.animations.add("idle", [35], this.anim_fps_y, true);
          return this.sprite.body.friction = 4;
        } else {
          this.anim_fps_x = 3;
          this.anim_fps_y = 3;
          this.sprite.animations.frame = 1;
          this.sprite.animations.add("down", [32, 33, 34, 33], this.anim_fps_y, true);
          this.sprite.animations.add("left", [32, 33, 34, 33], this.anim_fps_x, true);
          this.sprite.animations.add("right", [32, 33, 34, 33], this.anim_fps_x, true);
          this.sprite.animations.add("up", [32, 33, 34, 33], this.anim_fps_y, true);
          return this.sprite.animations.add("idle", [32, 33, 34, 33], this.anim_fps_y, true);
        }
      } else if (this.walking) {
        this.anim_fps_x = 5;
        this.anim_fps_y = 8;
        this.sprite.animations.frame = 1;
        this.sprite.animations.add("down", [16, 17, 18, 17], this.anim_fps_y, true);
        this.sprite.animations.add("left", [20, 21, 22, 21], this.anim_fps_x, true);
        this.sprite.animations.add("right", [24, 25, 26, 25], this.anim_fps_x, true);
        this.sprite.animations.add("up", [28, 29, 30, 29], this.anim_fps_y, true);
        return this.sprite.animations.add("idle", [17], this.anim_fps_y, true);
      } else {
        this.anim_fps_x = 5;
        this.anim_fps_y = 5;
        this.sprite.animations.frame = 1;
        this.sprite.animations.add("down", [0, 1, 2], this.anim_fps_y, true);
        this.sprite.animations.add("left", [4, 5, 6], this.anim_fps_x, true);
        this.sprite.animations.add("right", [8, 9, 10], this.anim_fps_x, true);
        this.sprite.animations.add("up", [12, 13, 14], this.anim_fps_y, true);
        return this.sprite.animations.add("idle", [13], this.anim_fps_y, true);
      }
    };

    Sheep.prototype.set_physics = function() {
      Sheep.__super__.set_physics.apply(this, arguments);
      this.sprite.body.height = 28;
      this.sprite.body.width = 28;
      this.sprite.body.offset.x = 2;
      this.sprite.body.offset.y = 2;
      this.sprite.body.maxVelocity.x = 30;
      return this.sprite.body.maxVelocity.y = 30;
    };

    Sheep.prototype.be_eaten = function() {
      this.alive = false;
      return this.set_animations();
    };

    Sheep.prototype.on_dry_land = function() {
      return this.level.on_dry_land(this.sprite.x, this.sprite.y);
    };

    Sheep.prototype.walk_or_swim = function() {
      this.walking = this.on_dry_land();
      if (this.walking) {
        return this.set_animations();
      } else {
        return this.set_animations();
      }
    };

    Sheep.prototype.wander = function() {
      this.walkTime -= this.game.time.elapsed / 1000.0;
      if (this.quiet_time > 0.0) {
        this.quiet_time -= this.game.time.elapsed / 1000.0;
      }
      if (this.walkTime < 0.0) {
        this.walkTime = 1.0 + Math.random() * 4.0;
        return this.randDir = Phaser.Math.getRandom(directions(this.sprite.body.wasTouching, this.sprite.body.touching));
      }
    };

    Sheep.prototype.flee = function() {
      var dist, s, _i, _len, _ref;
      _ref = this.level.skeletons;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        dist = Math.abs(s.sprite.x - this.sprite.x) + Math.abs(s.sprite.y - this.sprite.y);
        if (dist < 100.0 && !this.on_dry_land()) {
          this.randDir = Phaser.UP;
          return true;
        }
      }
      return false;
    };

    Sheep.prototype.on_update = function() {
      if (this.walking !== this.on_dry_land()) {
        this.walk_or_swim();
      }
      if (this.alive) {
        if (!this.flee()) {
          this.wander();
        }
      } else {
        this.randDir = null;
      }
      if (this.randDir === Phaser.RIGHT) {
        return this.accelerate(20, 0);
      } else if (this.randDir === Phaser.LEFT) {
        return this.accelerate(-20, 0);
      } else if (this.randDir === Phaser.UP) {
        return this.accelerate(0, 20);
      } else if (this.randDir === Phaser.DOWN) {
        return this.accelerate(0, -20);
      } else {
        return this.accelerate(0, 0);
      }
    };

    return Sheep;

  })(Walker);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Sheep = Sheep;

}).call(this);
(function() {
  var Pad, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Pad = (function() {
    function Pad(game) {
      this.poll = __bind(this.poll, this);
      this.update = __bind(this.update, this);
      this.on = __bind(this.on, this);
      this.flip = __bind(this.flip, this);
      this.swap_controls = __bind(this.swap_controls, this);
      this.enable_player = __bind(this.enable_player, this);
      this.disable = __bind(this.disable, this);
      this.enable = __bind(this.enable, this);
      this.game = game;
      this.enabled = true;
      this.game.input.gamepad.start();
      this.pads = [this.game.input.gamepad.pad1, this.game.input.gamepad.pad2, this.game.input.gamepad.pad3, this.game.input.gamepad.pad4];
      this.kb = this.game.input.keyboard;
      this.kb.addKeyCapture([Phaser.Keyboard.W, Phaser.Keyboard.A, Phaser.Keyboard.S, Phaser.Keyboard.D, Phaser.Keyboard.G, Phaser.Keyboard.V, Phaser.Keyboard.B, Phaser.Keyboard.N, Phaser.Keyboard.O, Phaser.Keyboard.K, Phaser.Keyboard.L, Phaser.Keyboard.COLON, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);
      this.state = [
        {
          UP: null,
          DOWN: null,
          LEFT: null,
          RIGHT: null
        }, {
          UP: null,
          DOWN: null,
          LEFT: null,
          RIGHT: null
        }, {
          UP: null,
          DOWN: null,
          LEFT: null,
          RIGHT: null
        }, {
          UP: null,
          DOWN: null,
          LEFT: null,
          RIGHT: null
        }
      ];
      this.enabled = [true, true, true, true];
    }

    Pad.prototype.enable = function() {
      return this.enabled = [true, true, true, true];
    };

    Pad.prototype.disable = function() {
      return this.enabled = [false, false, false, false];
    };

    Pad.prototype.enable_player = function(num) {
      return this.enabled[num] = true;
    };

    Pad.prototype.swap_controls = function(p1, p2) {
      if (Phaser.Math.chanceRoll(50)) {
        this.flip(p1, p2, Pad.UP);
        return this.flip(p1, p2, Pad.DOWN);
      } else {
        this.flip(p1, p2, Pad.LEFT);
        return this.flip(p1, p2, Pad.RIGHT);
      }
    };

    Pad.prototype.flip = function(p1, p2, d) {
      var c1, c2;
      c1 = this.state[p1][d];
      c2 = this.state[p2][d];
      this.state[p1][d] = c2;
      return this.state[p2][d] = c1;
    };

    Pad.prototype.on = function(index, direction, callback) {
      return this.state[index][direction] = callback;
    };

    Pad.prototype.update = function() {
      var pad, _i, _len, _ref;
      _ref = this.pads;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pad = _ref[_i];
        this.poll(pad);
      }
      if (this.state[0][Pad.UP] && this.kb.isDown(Phaser.Keyboard.W)) {
        if (this.enabled[0]) {
          this.state[0][Pad.UP](0);
        }
      }
      if (this.state[0][Pad.DOWN] && this.kb.isDown(Phaser.Keyboard.S)) {
        if (this.enabled[0]) {
          this.state[0][Pad.DOWN](0);
        }
      }
      if (this.state[0][Pad.LEFT] && this.kb.isDown(Phaser.Keyboard.A)) {
        if (this.enabled[0]) {
          this.state[0][Pad.LEFT](0);
        }
      }
      if (this.state[0][Pad.RIGHT] && this.kb.isDown(Phaser.Keyboard.D)) {
        if (this.enabled[0]) {
          this.state[0][Pad.RIGHT](0);
        }
      }
      if (this.state[1][Pad.UP] && this.kb.isDown(Phaser.Keyboard.G)) {
        if (this.enabled[1]) {
          this.state[1][Pad.UP](1);
        }
      }
      if (this.state[1][Pad.DOWN] && this.kb.isDown(Phaser.Keyboard.B)) {
        if (this.enabled[1]) {
          this.state[1][Pad.DOWN](1);
        }
      }
      if (this.state[1][Pad.LEFT] && this.kb.isDown(Phaser.Keyboard.V)) {
        if (this.enabled[1]) {
          this.state[1][Pad.LEFT](1);
        }
      }
      if (this.state[1][Pad.RIGHT] && this.kb.isDown(Phaser.Keyboard.N)) {
        if (this.enabled[1]) {
          this.state[1][Pad.RIGHT](1);
        }
      }
      if (this.state[2][Pad.UP] && this.kb.isDown(Phaser.Keyboard.O)) {
        if (this.enabled[2]) {
          this.state[2][Pad.UP](2);
        }
      }
      if (this.state[2][Pad.DOWN] && this.kb.isDown(Phaser.Keyboard.L)) {
        if (this.enabled[2]) {
          this.state[2][Pad.DOWN](2);
        }
      }
      if (this.state[2][Pad.LEFT] && this.kb.isDown(Phaser.Keyboard.K)) {
        if (this.enabled[2]) {
          this.state[2][Pad.LEFT](2);
        }
      }
      if (this.state[2][Pad.RIGHT] && this.kb.isDown(Phaser.Keyboard.COLON)) {
        if (this.enabled[2]) {
          this.state[2][Pad.RIGHT](2);
        }
      }
      if (this.state[0][Pad.UP] && this.kb.isDown(Phaser.Keyboard.UP)) {
        if (this.enabled[0]) {
          this.state[0][Pad.UP](0);
        }
      }
      if (this.state[0][Pad.DOWN] && this.kb.isDown(Phaser.Keyboard.DOWN)) {
        if (this.enabled[0]) {
          this.state[0][Pad.DOWN](0);
        }
      }
      if (this.state[0][Pad.LEFT] && this.kb.isDown(Phaser.Keyboard.LEFT)) {
        if (this.enabled[0]) {
          this.state[0][Pad.LEFT](0);
        }
      }
      if (this.state[0][Pad.RIGHT] && this.kb.isDown(Phaser.Keyboard.RIGHT)) {
        if (this.enabled[0]) {
          return this.state[0][Pad.RIGHT](0);
        }
      }
    };

    Pad.prototype.poll = function(pad) {
      if (this.state[0][Pad.UP] && pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < -Pad.SENSITIVITY) {
        if (this.enabled[0]) {
          this.state[0][Pad.UP](0);
        }
      }
      if (this.state[0][Pad.DOWN] && pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > Pad.SENSITIVITY) {
        if (this.enabled[0]) {
          this.state[0][Pad.DOWN](0);
        }
      }
      if (this.state[0][Pad.LEFT] && pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -Pad.SENSITIVITY) {
        if (this.enabled[0]) {
          this.state[0][Pad.LEFT](0);
        }
      }
      if (this.state[0][Pad.RIGHT] && pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > Pad.SENSITIVITY) {
        if (this.enabled[0]) {
          this.state[0][Pad.RIGHT](0);
        }
      }
      if (this.state[1][Pad.UP] && pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP)) {
        if (this.enabled[1]) {
          this.state[1][Pad.UP](1);
        }
      }
      if (this.state[1][Pad.DOWN] && pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN)) {
        if (this.enabled[1]) {
          this.state[1][Pad.DOWN](1);
        }
      }
      if (this.state[1][Pad.LEFT] && pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT)) {
        if (this.enabled[1]) {
          this.state[1][Pad.LEFT](1);
        }
      }
      if (this.state[1][Pad.RIGHT] && pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT)) {
        if (this.enabled[1]) {
          this.state[1][Pad.RIGHT](1);
        }
      }
      if (this.state[2][Pad.UP] && pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) < -Pad.SENSITIVITY) {
        if (this.enabled[2]) {
          this.state[2][Pad.UP](2);
        }
      }
      if (this.state[2][Pad.DOWN] && pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_Y) > Pad.SENSITIVITY) {
        if (this.enabled[2]) {
          this.state[2][Pad.DOWN](2);
        }
      }
      if (this.state[2][Pad.LEFT] && pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) < -Pad.SENSITIVITY) {
        if (this.enabled[2]) {
          this.state[2][Pad.LEFT](2);
        }
      }
      if (this.state[2][Pad.RIGHT] && pad.axis(Phaser.Gamepad.XBOX360_STICK_RIGHT_X) > Pad.SENSITIVITY) {
        if (this.enabled[2]) {
          this.state[2][Pad.RIGHT](2);
        }
      }
      if (this.state[3][Pad.UP] && pad.isDown(Phaser.Gamepad.XBOX360_Y)) {
        if (this.enabled[3]) {
          this.state[3][Pad.UP](3);
        }
      }
      if (this.state[3][Pad.DOWN] && pad.isDown(Phaser.Gamepad.XBOX360_A)) {
        if (this.enabled[3]) {
          this.state[3][Pad.DOWN](3);
        }
      }
      if (this.state[3][Pad.LEFT] && pad.isDown(Phaser.Gamepad.XBOX360_X)) {
        if (this.enabled[3]) {
          this.state[3][Pad.LEFT](3);
        }
      }
      if (this.state[3][Pad.RIGHT] && pad.isDown(Phaser.Gamepad.XBOX360_B)) {
        if (this.enabled[3]) {
          return this.state[3][Pad.RIGHT](3);
        }
      }
    };

    return Pad;

  })();

  Pad.UP = 0;

  Pad.RIGHT = 1;

  Pad.DOWN = 2;

  Pad.LEFT = 3;

  Pad.SENSITIVITY = 0.8;

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Pad = Pad;

}).call(this);
(function() {
  var Controller, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Controller = (function() {
    function Controller(game, player) {
      this.update = __bind(this.update, this);
      this.down = __bind(this.down, this);
      this.up = __bind(this.up, this);
      this.right = __bind(this.right, this);
      this.left = __bind(this.left, this);
      this.game = game;
      this.player = player;
      this.ax = 0;
      this.ay = 0;
      this.targetx = 0;
      this.targety = 0;
    }

    Controller.prototype.left = function(pid) {
      return this.targetx = -1;
    };

    Controller.prototype.right = function(pid) {
      return this.targetx = 1;
    };

    Controller.prototype.up = function(pid) {
      return this.targety = -1;
    };

    Controller.prototype.down = function(pid) {
      return this.targety = 1;
    };

    Controller.prototype.update = function() {
      if (this.targetx === 0) {
        if (Math.abs(this.player.sprite.body.velocity.x) > 1.0) {
          this.ax = -this.player.sprite.body.velocity.x * this.game.time.elapsed * 0.05;
        }
      } else {
        this.ax = Math.min(this.game.time.elapsed * this.targetx * 20.0, 2000.0);
      }
      if (this.targety === 0) {
        if (Math.abs(this.player.sprite.body.velocity.y) > 1.0) {
          this.ay = -this.player.sprite.body.velocity.y * this.game.time.elapsed * 0.05;
        }
      } else {
        this.ay = Math.min(this.game.time.elapsed * this.targety * 20.0, 2000.0);
      }
      this.player.accelerate(this.ax, this.ay);
      this.targetx = 0;
      this.targety = 0;
      this.ax = 0;
      return this.ay = 0;
    };

    return Controller;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Controller = Controller;

}).call(this);
(function() {
  var Scene, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Scene = (function() {
    function Scene(game, director) {
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
      this.fini = __bind(this.fini, this);
      this.init = __bind(this.init, this);
      this.game = game;
      this.director = director;
    }

    Scene.prototype.init = function() {};

    Scene.prototype.fini = function() {};

    Scene.prototype.update = function() {};

    Scene.prototype.render = function() {};

    return Scene;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Scene = Scene;

}).call(this);
(function() {
  var Trigger, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Trigger = (function() {
    function Trigger(game, level, properties) {
      this.finish = __bind(this.finish, this);
      this.play_dialogue = __bind(this.play_dialogue, this);
      this.play_sound = __bind(this.play_sound, this);
      this.fade_out = __bind(this.fade_out, this);
      this.fade_in = __bind(this.fade_in, this);
      this.show_hint = __bind(this.show_hint, this);
      this.show_caption = __bind(this.show_caption, this);
      this.set_input = __bind(this.set_input, this);
      this.handle = __bind(this.handle, this);
      this.init = __bind(this.init, this);
      this.game = game;
      this.level = level;
      this.properties = properties;
      this.signal = new Phaser.Signal();
      this.init();
    }

    Trigger.prototype.init = function() {};

    Trigger.prototype.handle = function() {
      var notify;
      notify = true;
      if (this.properties['caption']) {
        notify = false;
        this.show_caption(this.properties['caption']);
      }
      if (this.properties['hint']) {
        notify = false;
        this.show_hint(this.properties['hint']);
      }
      if (this.properties['sound']) {
        this.play_sound(this.properties['sound']);
      }
      if (this.properties['input']) {
        this.set_input(this.properties['input']);
      }
      if (this.properties['dialogue']) {
        notify = false;
        this.play_dialogue(this.properties['dialogue']);
      }
      if (notify) {
        return this.finish();
      }
    };

    Trigger.prototype.set_input = function(state) {
      switch (state) {
        case 'enable':
          return this.level.pad.enable();
        case 'disable':
          return this.level.pad.disable();
        case '0':
          this.level.pad.enable_player(0);
          return this.level.pad.enable_player(3);
        case '1':
          return this.level.pad.enable_player(1);
        case '2':
          return this.level.pad.enable_player(2);
        case '3':
          return this.level.pad.enable_player(3);
      }
    };

    Trigger.prototype.show_caption = function(caption) {
      var shadow, style;
      style = {
        font: "40px Arial",
        fill: "#FFFFFF",
        align: "center"
      };
      shadow = {
        font: "40px Arial",
        fill: "#000000",
        align: "center"
      };
      this.shadow = this.game.add.text(this.game.world.centerX + 4, this.game.world.centerY + 4, caption, shadow);
      this.shadow.anchor.setTo(0.5, 0.5);
      this.shadow.alpha = 0;
      this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, caption, style);
      this.text.anchor.setTo(0.5, 0.5);
      this.text.alpha = 0;
      return this.fade_in();
    };

    Trigger.prototype.show_hint = function(caption) {
      var shadow, style;
      style = {
        font: "18px Arial",
        fill: "#FFFF00",
        align: "center"
      };
      shadow = {
        font: "18px Arial",
        fill: "#000000",
        align: "center"
      };
      this.shadow = this.game.add.text(this.game.world.centerX + 2, this.game.world.centerY + 2, caption, shadow);
      this.shadow.anchor.setTo(0.5, 0.5);
      this.shadow.alpha = 0;
      this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, caption, style);
      this.text.anchor.setTo(0.5, 0.5);
      this.text.alpha = 0;
      return this.fade_in();
    };

    Trigger.prototype.fade_in = function() {
      var timer;
      this.game.add.tween(this.text).to({
        alpha: 1
      }, 500, Phaser.Easing.Linear.None, true);
      this.game.add.tween(this.shadow).to({
        alpha: 1
      }, 500, Phaser.Easing.Linear.None, true);
      timer = this.game.time.create(false);
      timer.add(2000, this.fade_out);
      return timer.start();
    };

    Trigger.prototype.fade_out = function() {
      var timer;
      this.game.add.tween(this.text).to({
        alpha: 0
      }, 500, Phaser.Easing.Linear.None, true);
      this.game.add.tween(this.shadow).to({
        alpha: 0
      }, 500, Phaser.Easing.Linear.None, true);
      timer = this.game.time.create(false);
      timer.add(1000, this.finish);
      return timer.start();
    };

    Trigger.prototype.play_sound = function(sound) {
      return this.game.add.sound(sound).play('', 0, 1);
    };

    Trigger.prototype.play_dialogue = function(set) {
      var _this = this;
      switch (set) {
        case 'intro1':
          this.level.players[0].signal.addOnce(this.finish);
          return this.level.players[0].say("So, that's the plan. Let's go!");
        case 'intro2':
          this.level.players[1].signal.addOnce(this.finish);
          return this.level.players[1].say("Right behind you, Nigel.");
        case 'intro3':
          this.level.players[2].signal.addOnce(this.finish);
          return this.level.players[2].say("Save some treasure for me!");
        case 'intro4':
          this.level.players[3].signal.addOnce(this.finish);
          return this.level.players[3].say("*burp*");
        case 'set1':
          this.level.players[3].signal.addOnce(this.finish);
          return this.level.players[1].say("Awww no!", function() {
            return _this.level.players[2].say("The sheep!", function() {
              return _this.level.players[0].say("We must...", function() {
                return _this.level.players[3].say("*sigh*");
              });
            });
          });
        case 'bones':
          this.level.players[1].signal.addOnce(this.finish);
          return this.level.players[1].say("Oh, dear.");
        case 'treasure':
          this.level.players[3].signal.addOnce(this.finish);
          return this.level.players[0].say("Dwarves.", function() {
            return _this.level.players[1].say("Freaking.", function() {
              return _this.level.players[2].say("LOVE.", function() {
                return _this.level.players[3].say("TREASURE!!!!", function() {
                  _this.level.players[0].say("CHAAARRRGE!!");
                  _this.level.players[1].say("CHAAARRRGE!!");
                  _this.level.players[2].say("CHAAARRRGE!!");
                  return _this.level.players[3].say("*grin*");
                });
              });
            });
          });
      }
    };

    Trigger.prototype.finish = function() {
      if (this.text) {
        this.text.destroy();
        this.shadow.destroy();
      }
      return this.signal.dispatch();
    };

    return Trigger;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Trigger = Trigger;

}).call(this);
(function() {
  var Skeleton, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Skeleton = (function(_super) {
    __extends(Skeleton, _super);

    function Skeleton(game, level) {
      this.on_update = __bind(this.on_update, this);
      this.wander = __bind(this.wander, this);
      this.set_physics = __bind(this.set_physics, this);
      this.set_animations = __bind(this.set_animations, this);
      this.create_sprite = __bind(this.create_sprite, this);
      Skeleton.__super__.constructor.apply(this, arguments);
      this.walkTime = 0.0;
      this.randDir = 4;
      this.maxY = 320.0;
    }

    Skeleton.prototype.create_sprite = function() {
      Skeleton.__super__.create_sprite.apply(this, arguments);
      this.sprite = this.game.add.sprite(0, 0, 'sharksprite');
      return this.quiet_time = 2;
    };

    Skeleton.prototype.set_animations = function() {
      this.anim_fps_x = 5;
      this.anim_fps_y = 5;
      this.min_anim_velocity = 25;
      return Skeleton.__super__.set_animations.apply(this, arguments);
    };

    Skeleton.prototype.set_physics = function() {
      Skeleton.__super__.set_physics.apply(this, arguments);
      this.sprite.body.height = 28;
      this.sprite.body.width = 28;
      this.sprite.body.offset.x = 0;
      this.sprite.body.offset.y = 0;
      this.sprite.body.maxVelocity.x = 30;
      return this.sprite.body.maxVelocity.y = 30;
    };

    Skeleton.prototype.directions = function(wasTouching, touching) {
      var allow;
      allow = [];
      if (this.sprite.y < this.maxY) {
        allow.push(Phaser.UP);
      }
      if (true) {
        allow.push(Phaser.DOWN);
      }
      if (true) {
        allow.push(Phaser.LEFT);
      }
      if (true) {
        allow.push(Phaser.RIGHT);
      }
      return allow;
    };

    Skeleton.prototype.wander = function() {
      this.walkTime -= this.game.time.elapsed / 1000.0;
      if ((this.walkTime < 0.0) || (this.sprite.y > this.maxY && this.randDir === Phaser.UP)) {
        this.walkTime = 1.0 + Math.random() * 4.0;
        this.randDir = Phaser.Math.getRandom(this.directions(this.sprite.body.wasTouching, this.sprite.body.touching));
        if (this.randDir === Phaser.RIGHT) {
          return this.accelerate(20, 0);
        } else if (this.randDir === Phaser.LEFT) {
          return this.accelerate(-20, 0);
        } else if (this.randDir === Phaser.UP) {
          return this.accelerate(0, 20);
        } else if (this.randDir === Phaser.DOWN) {
          return this.accelerate(0, -20);
        } else {
          return this.accelerate(0, 0);
        }
      }
    };

    Skeleton.prototype.on_update = function() {
      var dist, dx, dy, nearest, nearest_dist, s, _i, _len, _ref;
      nearest = null;
      nearest_dist = 9999;
      _ref = this.level.sheep;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        if (!(s.alive && !s.walking)) {
          continue;
        }
        dist = Math.abs(s.sprite.x - this.sprite.x) + Math.abs(s.sprite.y - this.sprite.y);
        if (dist < 35.0) {
          s.be_eaten();
        } else if (dist < nearest_dist && dist > 50.0) {
          nearest_dist = dist;
          nearest = s;
        }
      }
      if (this.quiet_time > 0.0) {
        this.quiet_time -= this.game.time.elapsed / 1000.0;
      }
      if (nearest && nearest_dist < 100) {
        dx = nearest.sprite.x - this.sprite.x;
        dy = nearest.sprite.y - this.sprite.y;
        return this.accelerate(dx * 5, dy * 3);
      } else {
        return this.wander();
      }
    };

    return Skeleton;

  })(Walker);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Skeleton = Skeleton;

}).call(this);
(function() {
  var Boulder, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Boulder = (function(_super) {
    __extends(Boulder, _super);

    function Boulder(game, level) {
      this.on_update = __bind(this.on_update, this);
      this.create_sprite = __bind(this.create_sprite, this);
      this.set_physics = __bind(this.set_physics, this);
      Boulder.__super__.constructor.call(this, game);
      this.level = level;
    }

    Boulder.prototype.set_physics = function() {
      Boulder.__super__.set_physics.apply(this, arguments);
      this.sprite.body.width = 38;
      this.sprite.body.height = 38;
      this.sprite.body.offset.x = 5;
      this.sprite.body.offset.y = 6;
      this.sprite.body.maxVelocity.x = 30;
      return this.sprite.body.maxVelocity.y = 30;
    };

    Boulder.prototype.create_sprite = function() {
      return this.sprite = this.game.add.sprite(0, 0, 'boulder');
    };

    Boulder.prototype.on_update = function() {
      this.collide(this.level.walkers);
      this.collide(this.level.boulders);
      return this.game.debug.renderSpriteBody(this.sprite);
    };

    return Boulder;

  })(Actor);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Boulder = Boulder;

}).call(this);
(function() {
  var Emperor, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Emperor = (function(_super) {
    __extends(Emperor, _super);

    function Emperor(game, level) {
      this.on_update = __bind(this.on_update, this);
      this.target_sharks = __bind(this.target_sharks, this);
      this.move_to_position = __bind(this.move_to_position, this);
      this.create_sprite = __bind(this.create_sprite, this);
      this.set_physics = __bind(this.set_physics, this);
      Emperor.__super__.constructor.call(this, game);
      this.level = level;
    }

    Emperor.prototype.set_physics = function() {
      Emperor.__super__.set_physics.apply(this, arguments);
      this.sprite.body.width = 46;
      this.sprite.body.height = 100;
      this.sprite.body.offset.x = 5;
      this.sprite.body.offset.y = 6;
      this.sprite.body.maxVelocity.x = 0.5;
      this.sprite.body.maxVelocity.y = 0.5;
      this.sprite.body.collideWorldBounds = false;
      return this.sprite.body.friction = 100.0;
    };

    Emperor.prototype.create_sprite = function() {
      this.sprite = this.game.add.sprite(0, 0, 'emperor');
      return this.crosshair = this.game.add.sprite(0, 0, 'crosshair');
    };

    Emperor.prototype.move_to_position = function() {
      var dx, dy;
      dx = 0 - this.sprite.x;
      dy = 410 - this.sprite.y;
      return this.accelerate(dx * 80, dy * 80);
    };

    Emperor.prototype.target_sharks = function() {
      var dist, dx, dy, max_crosshair_move, nearest, nearest_dist, s, _i, _len, _ref;
      nearest = null;
      nearest_dist = 9999;
      _ref = this.level.skeletons;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        dist = Math.abs(s.sprite.x - this.crosshair.x) + Math.abs(s.sprite.y - this.crosshair.y);
        if (dist < 4.0) {
          this.level.kill_shark(s);
          nearest = null;
          break;
        }
        if (dist < nearest_dist) {
          nearest_dist = dist;
          nearest = s;
        }
      }
      dx = 0.0;
      dy = 0.0;
      if (nearest) {
        dx = nearest.sprite.x - this.crosshair.x;
        dy = nearest.sprite.y - this.crosshair.y;
      } else {
        dx = 70.0 - this.crosshair.x;
        dy = 440.0 - this.crosshair.y;
      }
      max_crosshair_move = 20.0;
      dx = Math.min(dx, max_crosshair_move);
      dx = Math.max(dx, -max_crosshair_move);
      dy = Math.min(dy, max_crosshair_move);
      dy = Math.max(dy, -max_crosshair_move);
      this.crosshair.x += (this.game.time.elapsed / 1000.0) * dx * 3;
      return this.crosshair.y += (this.game.time.elapsed / 1000.0) * dy * 3;
    };

    Emperor.prototype.on_update = function() {
      this.collide(this.level.walkers);
      this.collide(this.level.boulders);
      this.move_to_position();
      return this.target_sharks();
    };

    return Emperor;

  })(Actor);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Emperor = Emperor;

}).call(this);
(function() {
  var Level, root, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Level = (function(_super) {
    __extends(Level, _super);

    function Level() {
      this.on_dry_land = __bind(this.on_dry_land, this);
      this.actually_kill_shark = __bind(this.actually_kill_shark, this);
      this.kill_shark = __bind(this.kill_shark, this);
      this.walkers_collided = __bind(this.walkers_collided, this);
      this.update = __bind(this.update, this);
      this.spawn_emperor = __bind(this.spawn_emperor, this);
      this.spawn_dudes = __bind(this.spawn_dudes, this);
      this.remove_dude = __bind(this.remove_dude, this);
      this.spawn_dude = __bind(this.spawn_dude, this);
      this.spawn_sharks = __bind(this.spawn_sharks, this);
      this.spawn_shark = __bind(this.spawn_shark, this);
      this.render = __bind(this.render, this);
      this.fadeout = __bind(this.fadeout, this);
      this.endfade = __bind(this.endfade, this);
      this.fadein = __bind(this.fadein, this);
      this.next = __bind(this.next, this);
      this.init = __bind(this.init, this);
      _ref = Level.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Level.prototype.init = function() {
      this.started = false;
      this.current = null;
      this.game.stage.backgroundColor = '#000';
      this.levels = ['beach'];
      this.pad = new Pad(this.game);
      this.sharks_to_kill = [];
      this.shark_spawn_time = 0.0;
      this.emperor_time = 50000;
      this.spawned_emperor = false;
      this.dude_spawn_time = 0.0;
      return this.next();
    };

    Level.prototype.next = function() {
      var background, controller, i, index, layer, level_group, map, o, player, random_sheep, roof, scenery, spawn, tile, trigger, x, y, _base, _i, _j, _k, _l, _len, _len1, _len2, _m, _name, _ref1, _ref2, _ref3, _ref4, _ref5;
      this.started = false;
      if (!this.faders) {
        this.game.world.removeAll();
      }
      this.bumped = false;
      this.sheeped = false;
      this.signals = {
        start: new Phaser.Signal(),
        finish: new Phaser.Signal()
      };
      level_group = this.faders ? this.faders : this.game.add.group();
      this.render_order = this.game.add.group();
      level_group.addAt(this.render_order, 0);
      this.faders = null;
      this.render_order.alpha = 0;
      if (this.current === null) {
        this.current = 0;
      } else {
        this.current += 1;
        if (this.current > this.levels.length - 1) {
          this.current = 0;
        }
      }
      map = this.game.add.tilemap(this.levels[this.current]);
      index = map.getLayerIndex('Walls');
      layer = map.layers[index];
      for (y = _i = 0, _ref1 = layer.height; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; y = 0 <= _ref1 ? ++_i : --_i) {
        for (x = _j = 0, _ref2 = layer.width; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; x = 0 <= _ref2 ? ++_j : --_j) {
          tile = layer.data[y][x];
          if (tile && tile.index > 0) {
            tile.collides = true;
            tile.faceTop = true;
            tile.faceBottom = true;
            tile.faceLeft = true;
            tile.faceRight = true;
          }
        }
      }
      map.calculateFaces(index);
      background = map.createLayer('Background', void 0, void 0, this.render_order);
      scenery = map.createLayer('Scenery', void 0, void 0, this.render_order);
      this.floor_group = this.game.add.group();
      this.render_order.add(this.floor_group);
      this.walls = map.createLayer('Walls', void 0, void 0, this.render_order);
      this.entities = this.game.add.group();
      this.render_order.add(this.entities);
      roof = map.createLayer('Roof', void 0, void 0, this.render_order);
      map.addTilesetImage('world', 'world');
      this.triggers = [];
      this.objects = [];
      this.walkers = [];
      this.boulders = [];
      this.controllers = [];
      this.sheep = [];
      this.skeletons = [];
      this.players = [new Dwarf(this.game, this, 1)];
      _ref3 = this.players;
      for (i = _k = 0, _len = _ref3.length; _k < _len; i = ++_k) {
        player = _ref3[i];
        player.add_to_group(this.entities);
        this.walkers.push(player);
        controller = new Controller(this.game, player);
        this.pad.on(i, Pad.UP, controller.up);
        this.pad.on(i, Pad.DOWN, controller.down);
        this.pad.on(i, Pad.LEFT, controller.left);
        this.pad.on(i, Pad.RIGHT, controller.right);
        this.controllers.push(controller);
      }
      _ref4 = map.objects.Spawns;
      for (_l = 0, _len1 = _ref4.length; _l < _len1; _l++) {
        spawn = _ref4[_l];
        switch (spawn.name) {
          case "player":
            player = this.players[+spawn.properties.id - 1];
            player.sprite.x = spawn.x;
            player.sprite.y = spawn.y - player.sprite.height;
            break;
          case "trigger":
            trigger = new Trigger(this.game, this, spawn.properties);
            if (trigger.properties.id !== null) {
              (_base = this.signals)[_name = trigger.properties.id] || (_base[_name] = trigger.signal);
            }
            this.triggers.push(trigger);
            break;
          case "object":
            layer = this.entities;
            o = (function() {
              switch (spawn.properties.type) {
                case "sheep":
                  return new Sheep(this.game, this);
                case "boulder":
                  return new Boulder(this.game, this);
                case "skeleton":
                  return new Skeleton(this.game, this);
                default:
                  return alert("missing definition for type: " + spawn.properties.type);
              }
            }).call(this);
            o.sprite.x = spawn.x;
            o.sprite.y = spawn.y - o.sprite.height;
            this.objects.push(o);
            o.add_to_group(layer);
            if (o instanceof Walker) {
              this.walkers.push(o);
            }
            if (o instanceof Boulder) {
              this.boulders.push(o);
            }
            if (o instanceof Sheep) {
              this.sheep.push(o);
            }
            if (o instanceof Skeleton) {
              this.skeletons.push(o);
            }
        }
      }
      random_sheep = 30;
      while (random_sheep > 0) {
        this.spawn_dude(true);
        random_sheep -= 1;
      }
      _ref5 = this.triggers;
      for (_m = 0, _len2 = _ref5.length; _m < _len2; _m++) {
        trigger = _ref5[_m];
        this.signals[trigger.properties.event].addOnce(trigger.handle);
      }
      this.pain = this.game.add.sound('pain');
      return this.fadein();
    };

    Level.prototype.fadein = function() {
      var timer;
      this.game.add.tween(this.render_order).to({
        alpha: 1
      }, 1000, Phaser.Easing.Linear.None, true);
      timer = this.game.time.create(false);
      timer.add(1000, this.endfade);
      return timer.start();
    };

    Level.prototype.endfade = function() {
      this.signals['finish'].addOnce(this.fadeout);
      this.signals['start'].dispatch();
      return this.started = true;
    };

    Level.prototype.fadeout = function() {
      var timer;
      this.game.add.tween(this.render_order).to({
        alpha: 0
      }, 1000, Phaser.Easing.Linear.None, true);
      timer = this.game.time.create(false);
      timer.add(1000, this.next);
      return timer.start();
    };

    Level.prototype.render = function() {};

    Level.prototype.spawn_shark = function() {
      var s;
      console.log('spawned shark');
      s = new Skeleton(this.game, this);
      s.sprite.x = Math.random() * 850.0;
      s.sprite.y = Math.random() * 300.0;
      this.objects.push(s);
      s.add_to_group(this.entities);
      this.walkers.push(s);
      return this.skeletons.push(s);
    };

    Level.prototype.spawn_sharks = function() {
      this.shark_spawn_time -= this.game.time.elapsed;
      if (this.skeletons.length === 0) {
        return this.spawn_shark();
      } else if (this.shark_spawn_time < 0) {
        if (Math.random() < 0.3) {
          this.spawn_shark();
        }
        return this.shark_spawn_time = 8000.0;
      }
    };

    Level.prototype.spawn_dude = function(on_land) {
      var s;
      console.log('spawned dude');
      s = new Sheep(this.game, this);
      if (on_land) {
        s.sprite.x = 50 + (Math.random() * (this.game.width - 50));
        s.sprite.y = 420 + (Math.random() * (this.game.height - 420));
      } else {
        s.sprite.x = 20 + (Math.random() * (this.game.width - 40));
        s.sprite.y = 20 + (Math.random() * (this.game.height - 40));
      }
      this.objects.push(s);
      s.add_to_group(this.entities);
      this.walkers.push(s);
      return this.sheep.push(s);
    };

    Level.prototype.remove_dude = function() {
      var dude, index, the_dude, _i, _len, _ref1;
      the_dude = null;
      _ref1 = this.sheep;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        dude = _ref1[_i];
        if (!dude.alive) {
          the_dude = dude;
          break;
        }
      }
      if (the_dude) {
        console.log('removed dude');
        index = this.sheep.indexOf(the_dude);
        if (index > -1) {
          this.sheep.splice(index, 1);
        }
        index = this.objects.indexOf(the_dude);
        if (index > -1) {
          this.objects.splice(index, 1);
        }
        index = this.walkers.indexOf(the_dude);
        if (index > -1) {
          this.walkers.splice(index, 1);
        }
        return the_dude.destroy();
      }
    };

    Level.prototype.spawn_dudes = function() {
      var alive_dudes, dude;
      this.dude_spawn_time -= this.game.time.elapsed;
      alive_dudes = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.sheep;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          dude = _ref1[_i];
          if (dude.alive) {
            _results.push(dude);
          }
        }
        return _results;
      }).call(this);
      if (alive_dudes.length < 25) {
        return this.spawn_dude(true);
      } else if (this.dude_spawn_time < 0) {
        if (Math.random() < 0.4) {
          this.spawn_dude(true);
        }
        this.dude_spawn_time = 6000.0;
        if ((this.sheep.length - alive_dudes.length) > 60) {
          return this.remove_dude();
        }
      }
    };

    Level.prototype.spawn_emperor = function() {
      var e;
      if (!this.spawned_emperor) {
        this.emperor_time -= this.game.time.elapsed;
        if (this.emperor_time < 0) {
          e = new Emperor(this.game, this);
          e.sprite.x = 0;
          e.sprite.y = 600;
          e.crosshair.x = e.sprite.x;
          e.crosshair.y = e.sprite.y;
          this.objects.push(e);
          e.add_to_group(this.entities);
          return this.spawned_emperor = true;
        }
      }
    };

    Level.prototype.update = function() {
      var alive_walkers, controller, non_sheep_walkers, object, player, walker, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref1, _ref2, _ref3;
      if (!this.started) {
        return;
      }
      this.pad.update();
      _ref1 = this.players;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        player = _ref1[_i];
        player.update();
      }
      _ref2 = this.objects;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        object = _ref2[_j];
        object.update();
      }
      while (this.sharks_to_kill.length > 0) {
        this.actually_kill_shark(this.sharks_to_kill.pop());
      }
      alive_walkers = (function() {
        var _k, _len2, _ref3, _results;
        _ref3 = this.walkers;
        _results = [];
        for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
          walker = _ref3[_k];
          if (!walker.ignore) {
            _results.push(walker);
          }
        }
        return _results;
      }).call(this);
      for (_k = 0, _len2 = alive_walkers.length; _k < _len2; _k++) {
        walker = alive_walkers[_k];
        walker.collide(alive_walkers, this.walkers_collided);
      }
      non_sheep_walkers = (function() {
        var _l, _len3, _results;
        _results = [];
        for (_l = 0, _len3 = alive_walkers.length; _l < _len3; _l++) {
          walker = alive_walkers[_l];
          if (!(walker instanceof Sheep)) {
            _results.push(walker);
          }
        }
        return _results;
      })();
      for (_l = 0, _len3 = non_sheep_walkers.length; _l < _len3; _l++) {
        walker = non_sheep_walkers[_l];
        walker.collide(this.walls);
      }
      _ref3 = this.controllers;
      for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
        controller = _ref3[_m];
        controller.update();
      }
      this.entities.sort('y', Phaser.Group.SORT_ASCENDING);
      this.spawn_emperor();
      if (this.spawned_emperor) {
        this.spawn_sharks();
      }
      return this.spawn_dudes();
    };

    Level.prototype.walkers_collided = function(p1, p2) {};

    Level.prototype.kill_shark = function(shark) {
      return this.sharks_to_kill.push(shark);
    };

    Level.prototype.actually_kill_shark = function(shark) {
      var blood, index;
      index = this.skeletons.indexOf(shark);
      if (index > -1) {
        this.skeletons.splice(index, 1);
      }
      index = this.objects.indexOf(shark);
      if (index > -1) {
        this.objects.splice(index, 1);
      }
      index = this.walkers.indexOf(shark);
      if (index > -1) {
        this.walkers.splice(index, 1);
      }
      blood = new Phaser.Sprite(this.game, shark.sprite.x, shark.sprite.y, 'blood');
      this.floor_group.add(blood);
      return shark.destroy();
    };

    Level.prototype.on_dry_land = function(posx, posy) {
      if (posy > 420) {
        return true;
      }
      if (posx < 50 && posy > 340) {
        return true;
      }
      if (posx < 113 && posy > 365) {
        return true;
      }
      if (posx < 208 && posy > 398) {
        return true;
      }
      if (posx > 656 && posy > 398) {
        return true;
      }
      if (posx > 753 && posy > 365) {
        return true;
      }
      if (posx > 818 && posy > 340) {
        return true;
      }
      return false;
    };

    return Level;

  })(Scene);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Level = Level;

}).call(this);
(function() {
  var Splash, root, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Splash = (function(_super) {
    __extends(Splash, _super);

    function Splash() {
      this.finish = __bind(this.finish, this);
      this.fadeout = __bind(this.fadeout, this);
      this.begin = __bind(this.begin, this);
      this.startup = __bind(this.startup, this);
      this.init = __bind(this.init, this);
      _ref = Splash.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Splash.prototype.init = function() {
      var message, style;
      this.zoom = 0.1;
      this.game.stage.backgroundColor = '#FFF';
      message = "Click To Play";
      style = {
        font: "20px Arial",
        fill: "#000000",
        align: "center"
      };
      this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, message, style);
      this.text.anchor.setTo(0.5, 0.5);
      return this.game.input.onDown.addOnce(this.startup);
    };

    Splash.prototype.startup = function() {
      var timer;
      this.faders = this.game.add.group();
      this.labs = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'labs');
      this.labs.anchor.setTo(0.5, 0.5);
      this.labs.scale.setTo(this.zoom, this.zoom);
      this.labs.alpha = 0;
      this.faders.add(this.labs);
      this.game.add.tween(this.text).to({
        alpha: 0
      }, 500, Phaser.Easing.Linear.None, true);
      timer = this.game.time.create(false);
      timer.add(1000, this.begin);
      return timer.start();
    };

    Splash.prototype.begin = function() {
      var timer;
      this.game.add.tween(this.labs).to({
        alpha: 1
      }, 1000, Phaser.Easing.Linear.None, true);
      this.game.add.tween(this.labs.scale).to({
        x: 2,
        y: 2
      }, 4000, Phaser.Easing.Quadratic.None, true);
      timer = this.game.time.create(false);
      timer.add(1000, this.fadeout);
      return timer.start();
    };

    Splash.prototype.fadeout = function() {
      this.game.add.tween(this.labs).to({
        alpha: 0
      }, 1000, Phaser.Easing.Linear.None, true);
      return this.finish();
    };

    Splash.prototype.finish = function() {
      return this.director.init('level');
    };

    return Splash;

  })(Scene);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Splash = Splash;

}).call(this);
(function() {
  var Main, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Main = (function(_super) {
    __extends(Main, _super);

    function Main(fullscreen, scene) {
      this.render = __bind(this.render, this);
      this.update = __bind(this.update, this);
      this.gofull = __bind(this.gofull, this);
      this.create = __bind(this.create, this);
      this.preload = __bind(this.preload, this);
      Main.__super__.constructor.apply(this, arguments);
      this.starting_scene = scene;
      this.start_fullscreen = fullscreen;
    }

    Main.prototype.preload = function() {
      var message, style;
      this.game.stage.backgroundColor = '#000000';
      this.game.stage.scale.pageAlignHorizontally = true;
      this.game.stage.scale.refresh();
      message = "Loading...";
      style = {
        font: "20px Arial",
        fill: "#FFFFFF",
        align: "center"
      };
      this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, message, style);
      this.text.anchor.setTo(0.5, 0.5);
      this.game.load.image('logo', 'assets/logo.png');
      this.game.load.image('labs', 'assets/labs.png');
      this.game.load.spritesheet('boat', 'assets/boat.png', 32, 32);
      this.game.load.spritesheet('sharksprite', 'assets/shark.png', 32, 32);
      this.game.load.spritesheet('manswim', 'assets/manswim.png', 32, 32);
      this.game.load.spritesheet('world', 'assets/world.png', 32, 32);
      this.game.load.spritesheet('emperor', 'assets/emperor.png', 64, 96);
      this.game.load.image('crosshair', 'assets/crosshair.png');
      this.game.load.image('boulder', 'assets/boulder.png');
      this.game.load.image('blood', 'assets/blood.png');
      this.game.load.tilemap('beach', 'maps/beach.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.audio('themetune', 'songs/music.mp3');
      this.game.load.audio('pain', 'sounds/pain.wav');
      this.game.load.audio('crazy', 'sounds/CrazyTime.mp3');
      this.game.load.audio('collect', 'sounds/Collect.mp3');
      this.game.load.audio('baa1', 'sounds/SheepBaa1.mp3');
      this.game.load.audio('baa2', 'sounds/SheepBaa2.mp3');
      this.game.load.audio('baa3', 'sounds/SheepBaa3.mp3');
      this.game.load.audio('button1', 'sounds/Button1.mp3');
      this.game.load.audio('button2', 'sounds/Button2.mp3');
      this.game.load.audio('bones', 'sounds/SkeletonBones.mp3');
      this.game.load.audio('coin1', 'sounds/Coin1.mp3');
      this.game.load.audio('coin2', 'sounds/Coin2.mp3');
      this.game.load.audio('coin3', 'sounds/Coin3.mp3');
      this.game.load.audio('coin4', 'sounds/Coin4.mp3');
      this.game.load.audio('burp', 'sounds/Burp.mp3');
      this.game.world.remove(this.text);
      return this.text.destroy();
    };

    Main.prototype.create = function() {
      this.music = this.game.add.audio('themetune');
      this.game.physics.gravity.y = 0;
      this.game.stage.fullScreenScaleMode = Phaser.StageScaleMode.SHOW_ALL;
      this.scene_manager = new SceneManager();
      this.scene_manager.add('splash', new Splash(this.game, this.scene_manager));
      this.scene_manager.add('level', new Level(this.game, this.scene_manager));
      this.scene_manager.init(this.starting_scene);
      if (this.start_fullscreen) {
        return this.game.input.onDown.add(this.gofull);
      }
    };

    Main.prototype.gofull = function() {
      return this.game.stage.scale.startFullScreen();
    };

    Main.prototype.update = function() {
      return this.scene_manager.update();
    };

    Main.prototype.render = function() {
      return this.scene_manager.render();
    };

    return Main;

  })(Phaser.State);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Main = Main;

}).call(this);
(function() {
  window.Main = Main;

}).call(this);
