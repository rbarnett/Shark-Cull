(function() {
  var SceneManager, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SceneManager = (function() {
    function SceneManager() {
      this.get_current = __bind(this.get_current, this);
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
      this.sprite.body.height = 16;
      this.sprite.body.width = 20;
      this.sprite.body.offset.x = 6;
      this.sprite.body.offset.y = 18;
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
  var Carryable, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Carryable = (function(_super) {
    __extends(Carryable, _super);

    function Carryable(game, level, properties) {
      this.stepped_on = __bind(this.stepped_on, this);
      this.update = __bind(this.update, this);
      this.move_to = __bind(this.move_to, this);
      Carryable.__super__.constructor.call(this, game);
      this.level = level;
      this.properties = properties;
      this.carried_by = false;
    }

    Carryable.set_physics = function() {
      return Carryable.__super__.constructor.set_physics.apply(this, arguments);
    };

    Carryable.prototype.move_to = function(x, y, facing) {
      if (facing === Pad.RIGHT) {
        x += this.sprite.width;
      } else if (facing === Pad.LEFT) {
        x -= this.sprite.width;
      } else if (facing === Pad.DOWN) {
        y += this.sprite.height / 2;
      } else if (facing === Pad.UP) {
        y -= this.sprite.height / 2;
      }
      this.sprite.x = x;
      return this.sprite.y = y;
    };

    Carryable.prototype.update = function() {
      if (this.carried_by) {
        return this.move_to(this.carried_by.sprite.x, this.carried_by.sprite.y, this.carried_by.facing);
      } else if (this.level.pad.enabled) {
        return this.collide(this.level.players, this.stepped_on);
      }
    };

    Carryable.prototype.stepped_on = function(us, player) {
      if (player.exited) {
        return;
      }
      if (player.maybe_pickup(this)) {
        this.carried_by = player;
        if (this.on_pickup) {
          return on_pickup(player);
        }
      }
    };

    return Carryable;

  }).call(this, Actor);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Carryable = Carryable;

}).call(this);
(function() {
  var Key, root, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Key = (function(_super) {
    __extends(Key, _super);

    function Key() {
      this.create_sprite = __bind(this.create_sprite, this);
      _ref = Key.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Key.prototype.create_sprite = function() {
      return this.sprite = this.game.add.sprite(0, 0, 'key');
    };

    return Key;

  })(Carryable);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Key = Key;

}).call(this);
(function() {
  var Dwarf, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dwarf = (function(_super) {
    __extends(Dwarf, _super);

    function Dwarf(game, level, i) {
      this.maybe_pickup = __bind(this.maybe_pickup, this);
      this.on_remove_from_group = __bind(this.on_remove_from_group, this);
      this.on_add_to_group = __bind(this.on_add_to_group, this);
      this.on_update = __bind(this.on_update, this);
      this.show_arrow = __bind(this.show_arrow, this);
      this.notify = __bind(this.notify, this);
      this.say = __bind(this.say, this);
      this.create_sprite = __bind(this.create_sprite, this);
      Dwarf.__super__.constructor.call(this, game, level, i);
      this.num = i;
      this.carrying = null;
      this.signal = new Phaser.Signal();
      this.chat_colour = ['#FF0000', '#FFFF88', '#8888FF', '#88FF88'][this.num - 1];
      this.shadow_colour = ['#000000', '#000000', '#000000', '#000000'][this.num - 1];
      this.sprite.body.friction = 2500;
    }

    Dwarf.prototype.create_sprite = function() {
      var arrow, _i, _len, _ref, _results;
      Dwarf.__super__.create_sprite.apply(this, arguments);
      this.sprite = this.game.add.sprite(0, 0, 'boat');
      this.arrows = [this.game.add.sprite(0, 0, 'arrow'), this.game.add.sprite(0, 0, 'arrow'), this.game.add.sprite(0, 0, 'arrow'), this.game.add.sprite(0, 0, 'arrow')];
      _ref = this.arrows;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arrow = _ref[_i];
        _results.push(arrow.alpha = 0);
      }
      return _results;
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

    Dwarf.prototype.show_arrow = function(dir, own) {
      this.arrows[dir].animations.frame = own * 4 + dir;
      return this.arrows[dir].alpha = 1;
    };

    Dwarf.prototype.on_update = function() {
      var arrow, _i, _len, _ref, _results;
      this.arrows[0].x = this.sprite.x + 8;
      this.arrows[0].y = this.sprite.y + 32;
      this.arrows[1].x = this.sprite.x - 16;
      this.arrows[1].y = this.sprite.y + 8;
      this.arrows[2].x = this.sprite.x + 8;
      this.arrows[2].y = this.sprite.y - 16;
      this.arrows[3].x = this.sprite.x + 32;
      this.arrows[3].y = this.sprite.y + 8;
      _ref = this.arrows;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arrow = _ref[_i];
        _results.push(arrow.alpha *= 0.9);
      }
      return _results;
    };

    Dwarf.prototype.on_add_to_group = function(group) {
      var arrow, _i, _len, _ref, _results;
      _ref = this.arrows;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arrow = _ref[_i];
        _results.push(group.add(arrow));
      }
      return _results;
    };

    Dwarf.prototype.on_remove_from_group = function(group) {
      var arrow, _i, _len, _ref;
      _ref = this.arrows;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arrow = _ref[_i];
        group.remove(arrow);
      }
      if (this.carrying) {
        return this.carrying.remove_from_group(group);
      }
    };

    Dwarf.prototype.maybe_pickup = function(entity) {
      if (this.carrying === null) {
        return this.carrying = entity;
      }
    };

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
      this.sprite.body.height = 16;
      this.sprite.body.width = 24;
      this.sprite.body.offset.x = 4;
      this.sprite.body.offset.y = 16;
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
      if (this.state[3][Pad.UP] && this.kb.isDown(Phaser.Keyboard.UP)) {
        if (this.enabled[3]) {
          this.state[3][Pad.UP](3);
        }
      }
      if (this.state[3][Pad.DOWN] && this.kb.isDown(Phaser.Keyboard.DOWN)) {
        if (this.enabled[3]) {
          this.state[3][Pad.DOWN](3);
        }
      }
      if (this.state[3][Pad.LEFT] && this.kb.isDown(Phaser.Keyboard.LEFT)) {
        if (this.enabled[3]) {
          this.state[3][Pad.LEFT](3);
        }
      }
      if (this.state[3][Pad.RIGHT] && this.kb.isDown(Phaser.Keyboard.RIGHT)) {
        if (this.enabled[3]) {
          return this.state[3][Pad.RIGHT](3);
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
      this.update = __bind(this.update, this);
      this.fini = __bind(this.fini, this);
      this.init = __bind(this.init, this);
      this.game = game;
      this.director = director;
    }

    Scene.prototype.init = function() {};

    Scene.prototype.fini = function() {};

    Scene.prototype.update = function() {};

    return Scene;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Scene = Scene;

}).call(this);
(function() {
  var Exit, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Exit = (function(_super) {
    __extends(Exit, _super);

    function Exit(game, level, properties) {
      this.walker_entered = __bind(this.walker_entered, this);
      this.on_update = __bind(this.on_update, this);
      this.set_physics = __bind(this.set_physics, this);
      this.create_sprite = __bind(this.create_sprite, this);
      var _base;
      Exit.__super__.constructor.call(this, game);
      this.level = level;
      this.properties = properties;
      this.count = 0;
      this.collect_sound = this.game.add.sound("collect");
      (_base = this.properties).accepts || (_base.accepts = "Dwarf");
    }

    Exit.prototype.create_sprite = function() {
      this.sprite = this.game.add.sprite(0, 0, 'objects');
      return this.sprite.animations.frame = 8;
    };

    Exit.prototype.set_physics = function() {
      Exit.__super__.set_physics.apply(this, arguments);
      this.sprite.body.immovable = true;
      this.sprite.body.height = 32;
      this.sprite.body.width = 32;
      this.sprite.body.offset.x = 0;
      return this.sprite.body.offset.y = 0;
    };

    Exit.prototype.on_update = function() {
      if (this.level.pad.enabled) {
        return this.collide(this.level.walkers, this.walker_entered);
      }
    };

    Exit.prototype.walker_entered = function(door, walker) {
      if (walker.exited) {
        return;
      }
      if (this.properties['accepts'] === walker.constructor.name) {
        if (this.properties.relocates !== void 0 && this.properties.relocates) {
          walker.sprite.x = this.sprite.x;
          walker.sprite.y = this.sprite.y - 50;
        } else {
          walker.remove_from_group(this.level.entities);
          walker.ignore = true;
        }
        walker.exited = true;
        this.count += 1;
        this.collect_sound.play('', 0, 1);
        if (this.count === +this.properties['count']) {
          return this.level.signals[this.properties['id']].dispatch();
        }
      }
    };

    return Exit;

  })(Actor);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Exit = Exit;

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
          return this.level.pad.enable_player(0);
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
      this.sprite.body.height = 16;
      this.sprite.body.width = 24;
      this.sprite.body.offset.x = 4;
      this.sprite.body.offset.y = 16;
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
        if (dist < 30.0) {
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
  var Door, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Door = (function(_super) {
    __extends(Door, _super);

    function Door(game, level, properties) {
      this.player_touching = __bind(this.player_touching, this);
      this.on_update = __bind(this.on_update, this);
      this.close = __bind(this.close, this);
      this.open = __bind(this.open, this);
      this.set_physics = __bind(this.set_physics, this);
      this.targeted = __bind(this.targeted, this);
      this.create_sprite = __bind(this.create_sprite, this);
      this.set_animations = __bind(this.set_animations, this);
      Door.__super__.constructor.call(this, game);
      this.level = level;
      this.properties = properties;
      this.count = 0;
      if (properties.locked === void 0) {
        properties.locked = true;
      }
      this.is_open = properties.locked !== 'y';
      this.set_animations();
      this.open_sfx = this.game.add.sound("button1");
      this.close_sfx = this.game.add.sound("button2");
    }

    Door.prototype.set_animations = function() {
      this.sprite.animations.add("closed", [1], 1, true);
      this.sprite.animations.add("open", [2], 1, true);
      return this.sprite.animations.play("open");
    };

    Door.prototype.create_sprite = function() {
      return this.sprite = this.game.add.sprite(0, 0, 'objects');
    };

    Door.prototype.targeted = function(msg) {
      if (msg) {
        return this.open();
      } else {
        return this.close();
      }
    };

    Door.prototype.set_physics = function() {
      Door.__super__.set_physics.apply(this, arguments);
      this.sprite.body.immovable = true;
      this.sprite.body.height = 32;
      this.sprite.body.width = 32;
      this.sprite.body.offset.x = 0;
      return this.sprite.body.offset.y = 0;
    };

    Door.prototype.open = function() {
      if (!this.is_open) {
        this.is_open = true;
        return this.open_sfx.play();
      }
    };

    Door.prototype.close = function() {
      if (this.is_open) {
        this.is_open = false;
        return this.close_sfx.play();
      }
    };

    Door.prototype.on_update = function() {
      if (!this.is_open) {
        this.sprite.animations.play("closed");
        if (this.level.pad.enabled) {
          return this.collide(this.level.walkers, this.player_touching);
        }
      } else {
        return this.sprite.animations.play("open");
      }
    };

    Door.prototype.player_touching = function(door, player) {
      var key;
      if (!(player instanceof Dwarf)) {
        return;
      }
      if (player.exited) {
        return;
      }
      if (!(player.carrying && (player.carrying instanceof Key))) {
        return;
      }
      key = player.carrying;
      if (this.properties.id === void 0 || this.properties.id === key.properties.target) {
        return this.open();
      }
    };

    return Door;

  })(Actor);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Door = Door;

}).call(this);
(function() {
  var Switcher, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Switcher = (function(_super) {
    __extends(Switcher, _super);

    function Switcher(game, level, properties) {
      this.player_touching = __bind(this.player_touching, this);
      this.on_update = __bind(this.on_update, this);
      this.set_physics = __bind(this.set_physics, this);
      this.create_sprite = __bind(this.create_sprite, this);
      this.set_animations = __bind(this.set_animations, this);
      var _base;
      Switcher.__super__.constructor.call(this, game);
      this.level = level;
      this.properties = properties;
      (_base = this.properties).action || (_base.action = 'momentary');
      this.set_animations();
      this.on = false;
    }

    Switcher.prototype.set_animations = function() {
      this.sprite.animations.add("up", [10], 1, true);
      this.sprite.animations.add("down", [11], 1, true);
      return this.sprite.animations.play("up");
    };

    Switcher.prototype.create_sprite = function() {
      return this.sprite = this.game.add.sprite(0, 0, 'objects');
    };

    Switcher.prototype.set_physics = function() {
      Switcher.__super__.set_physics.apply(this, arguments);
      this.sprite.body.immovable = true;
      this.sprite.body.width = 22;
      this.sprite.body.height = 22;
      this.sprite.body.offset.x = 5;
      return this.sprite.body.offset.y = 5;
    };

    Switcher.prototype.on_update = function() {
      var was_on;
      was_on = this.on;
      if (this.properties.action === 'momentary') {
        this.on = false;
        this.collide(this.level.walkers, null, this.player_touching);
        this.collide(this.level.boulders, null, this.player_touching);
      } else {
        alert("" + this.properties.action + " action switch not supported");
      }
      if (this.on) {
        this.sprite.animations.play("down");
      } else {
        this.sprite.animations.play("up");
      }
      if (this.was_on !== this.on) {
        return this.activate_target(this.on);
      }
    };

    Switcher.prototype.player_touching = function(sw, player) {
      if (player.exited) {
        return;
      }
      this.on = true;
      return false;
    };

    return Switcher;

  })(Actor);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Switcher = Switcher;

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
      this.sprite.body.height = 25;
      this.sprite.body.offset.x = 5;
      this.sprite.body.offset.y = 20;
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
  var Treasure, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Treasure = (function(_super) {
    __extends(Treasure, _super);

    function Treasure(game, level, properties) {
      this.player_touching = __bind(this.player_touching, this);
      this.on_update = __bind(this.on_update, this);
      this.set_physics = __bind(this.set_physics, this);
      this.create_sprite = __bind(this.create_sprite, this);
      Treasure.__super__.constructor.call(this, game);
      this.level = level;
      this.properties = properties;
      this.sound = this.game.add.sound("coin" + Phaser.Math.getRandom([1, 2, 3, 4]));
    }

    Treasure.prototype.create_sprite = function() {
      Treasure.__super__.create_sprite.apply(this, arguments);
      this.sprite = this.game.add.sprite(0, 0, 'world');
      this.sprite.animations.add("idle", [Phaser.Math.getRandom([32, 33, 34])], 1, true);
      return this.sprite.animations.play("idle");
    };

    Treasure.prototype.set_physics = function() {
      Treasure.__super__.set_physics.apply(this, arguments);
      this.sprite.body.immovable = true;
      this.sprite.body.width = 22;
      this.sprite.body.height = 22;
      this.sprite.body.offset.x = 5;
      return this.sprite.body.offset.y = 5;
    };

    Treasure.prototype.on_update = function() {
      return this.collide(this.level.players, null, this.player_touching);
    };

    Treasure.prototype.player_touching = function(sw, player) {
      var message, object, treasures;
      if (player.exited) {
        return;
      }
      this.sound.play();
      this.destroy();
      if (Phaser.Math.chanceRoll(15)) {
        message = Phaser.Math.getRandom(["Aahll be Teaking Thaaat!!", "Ooohh Shiny!", "Aull Mah Dreams Ah Coming True!", "Eets Jes Like Christmas!"]);
        player.set_caption(message, 3.0, 20);
      }
      treasures = (function() {
        var _i, _len, _ref, _results;
        _ref = this.level.objects;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          object = _ref[_i];
          if ((object instanceof Treasure) && !object.dead) {
            _results.push(object);
          }
        }
        return _results;
      }).call(this);
      if (treasures.length === 0) {
        this.level.signals['finish'].dispatch();
      }
      return false;
    };

    return Treasure;

  })(Actor);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Treasure = Treasure;

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
      this.walkers_collided = __bind(this.walkers_collided, this);
      this.update = __bind(this.update, this);
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
      this.levels = ['beach', 'intro', 'level03', 'level_skeletons', 'treasure_room'];
      this.pad = new Pad(this.game);
      return this.next();
    };

    Level.prototype.next = function() {
      var background, controller, i, index, layer, level_group, map, o, player, random_sheep, roof, s, scenery, spawn, tile, trigger, x, y, _base, _i, _j, _k, _l, _len, _len1, _len2, _m, _name, _ref1, _ref2, _ref3, _ref4, _ref5;
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
                case "exit":
                  return new Exit(this.game, this, spawn.properties);
                case "treasure":
                  return new Treasure(this.game, this, spawn.properties);
                case "key":
                  return new Key(this.game, this, spawn.properties);
                case "door":
                  layer = this.floor_group;
                  return new Door(this.game, this, spawn.properties);
                case "switch":
                  layer = this.floor_group;
                  return new Switcher(this.game, this, spawn.properties);
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
        s = new Sheep(this.game, this);
        s.sprite.x = 20 + (Math.random() * (this.game.width - 40));
        s.sprite.y = 20 + (Math.random() * (this.game.height - 40));
        this.objects.push(s);
        s.add_to_group(this.entities);
        this.walkers.push(s);
        this.sheep.push(s);
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
      return this.entities.sort('y', Phaser.Group.SORT_ASCENDING);
    };

    Level.prototype.walkers_collided = function(p1, p2) {};

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
      this.game.load.spritesheet('sheep', 'assets/sheep.png', 32, 32);
      this.game.load.spritesheet('manswim', 'assets/manswim.png', 32, 32);
      this.game.load.spritesheet('arrow', 'assets/arrows.png', 16, 16);
      this.game.load.spritesheet('objects', 'assets/objects.png', 32, 32);
      this.game.load.image('key', 'assets/key.png');
      this.game.load.spritesheet('world', 'assets/world.png', 32, 32);
      this.game.load.image('boulder', 'assets/boulder.png');
      this.game.load.tilemap('beach', 'maps/beach.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('level01', 'maps/level01.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('level02', 'maps/level02.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('level03', 'maps/level03.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('treasure_room', 'maps/treasure_room.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('level_skeletons', 'maps/level_skeletons.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('intro', 'maps/intro.json', null, Phaser.Tilemap.TILED_JSON);
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

    return Main;

  })(Phaser.State);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Main = Main;

}).call(this);
(function() {
  window.Main = Main;

}).call(this);
