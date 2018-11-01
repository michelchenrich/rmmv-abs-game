(function() {
  var superInitialize = Scene_Map.prototype.initialize;
  Scene_Map.prototype.initialize = function() {
    superInitialize.call(this, arguments);
    this.hud = new Hud();
  };

  var superMapCreateDisplayObjects = Scene_Map.prototype.createDisplayObjects;
  Scene_Map.prototype.createDisplayObjects = function() {
    superMapCreateDisplayObjects.call(this, arguments);
    this.hud.addSelfTo(this);
  };

  var superUpdate = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    this.hud.update();
    superUpdate.call(this, arguments);
  };
})();

(function() {
  Game_Player.prototype.getHealthPercentage = function() {
    return $gameActors._data[1].hp / $gameActors._data[1].mhp * 100.0; 
  };

  Game_Player.prototype.getMagicPercentage = function() {
    return $gameActors._data[1].mp / $gameActors._data[1].mmp * 100.0; 
  };
})();

function define(name, methods) {
  window[name] = function() { this.initialize.apply(this, arguments); };
  window[name].prototype.constructor = window[name];
  for(let key in methods) 
    window[name].prototype[key] = methods[key];
}

define("StatusBar", {
  initialize: function(position, color, percentFunction) {
    this.color = color;
    this.percentFunction = percentFunction;
    this.sprite = new Sprite(new Bitmap(110, 30));
    this.sprite.move(4, 4 + (35 * (position - 1)));
    this.drawBorder();
  },

  addSelfTo: function(scene) {
    scene.addChild(this.sprite);
  },

  update: function() {
    let percent = this.percentFunction.call();

    if (this.oldValue == percent)
      return;

    this.drawFilling(percent);

    this.oldValue == percent;
  },

  drawBorder: function() {
    this.sprite.bitmap.fillRect(0, 0, 110, 30, "black"); // 1px width
    this.sprite.bitmap.fillRect(1, 1, 108, 28, "white"); // 3px width
    this.sprite.bitmap.fillRect(4, 4, 102, 22, "black"); // 1px width 
  },

  drawFilling: function(percent) {
    if (percent < 100)
      this.drawEmptyPart();

    this.drawFilledPart(percent);
  },

  drawEmptyPart: function() {
    this.sprite.bitmap.fillRect(5, 5, 100, 20, "dark-" + this.color);
  },

  drawFilledPart: function(percent) {
    this.sprite.bitmap.fillRect(5, 5, percent, 20, this.color);
  }
});

define("Hud", {
  initialize: function() {
    this.bars = [
      new StatusBar(1, "green", $gamePlayer.getHealthPercentage),
      new StatusBar(2, "purple", $gamePlayer.getMagicPercentage)
    ];
  },

  addSelfTo: function(scene) {
    this.bars.forEach(bar => bar.addSelfTo(scene));
  },

  update: function() {
    this.bars.forEach(bar => bar.update());
  }
});
