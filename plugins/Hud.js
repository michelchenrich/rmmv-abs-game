patch(Scene_Map, {
  createDisplayObjects: original => function() {
    original.call(this, arguments);
    new Hud().addSelfTo(this);
  }
});

patch(Game_Actor, {
  initialize: original => function(actorId) {
    original.call(this, actorId);
    this.hpListeners = [];
  },

  gainHp: original => function(amount) {
    original.call(this, amount);
    this.hpListeners.forEach(hpListener => hpListener.onHealthChange(this));
  }
});

extend(Game_Actor, {
  addHealthListener: function(hpListener) {
    this.hpListeners.push(hpListener);
  },

  takeDamage: function(amount) {
    if (!this.isAlive())
      return;

    this.gainHp(amount * -1);

    if (this.isDead())
        this.performCollapse();
  },

  getHealthPercentage: function() {
    return this.hp / this.mhp * 100.0; 
  },

  getMagicPercentage: function() {
    return this.mp / this.mmp * 100.0; 
  }
});

extend(Game_Player, {
  getActor: function() {
    return $gameActors._data[1];
  }
});

const barWidthMultiplier = 2;
const barWidth = 100 * barWidthMultiplier;
const barHeight = 20 * barWidthMultiplier;
class StatusBar {
  constructor(position, filledColor, emptyColor, percent) {
    this.emptyColor = emptyColor;
    this.filledColor = filledColor;
    this.sprite = new Sprite(new Bitmap(barWidth + 10, barHeight + 10));
    this.sprite.move(4, 4 + ((barHeight + 15) * (position - 1)));
    this.drawBorder();
    this.drawFilling(percent);
  }

  addSelfTo(scene) {
    scene.addChild(this.sprite);
  }

  setPercentage(percent) {
    this.drawFilling(percent);
  }

  drawBorder() {
    this.sprite.bitmap.fillRect(0, 0, barWidth + 10, barHeight + 10, "black"); // 1px width
    this.sprite.bitmap.fillRect(1, 1, barWidth + 8, barHeight + 8, "white"); // 3px width
    this.sprite.bitmap.fillRect(4, 4, barWidth + 2, barHeight + 2, "black"); // 1px width 
  }

  drawFilling(percent) {
    if (percent < 100)
      this.drawEmptyPart(percent);

    this.drawFilledPart(percent);
  }

  drawEmptyPart(percent) {
    let filledWidth = percent * barWidthMultiplier;
    this.sprite.bitmap.fillRect(5 + filledWidth, 5, 1, barHeight, "black");
    this.sprite.bitmap.fillRect(5 + filledWidth + 1, 5, barWidth - filledWidth, barHeight, this.emptyColor);
  }

  drawFilledPart(percent) {
    this.sprite.bitmap.fillRect(5, 5, percent * barWidthMultiplier, barHeight, this.filledColor);
    this.sprite.bitmap.drawText(Math.ceil(percent) + "%", 5, 5, barWidth, barHeight);
  }
}

class Hud {
  constructor() {
    let actor = $gamePlayer.getActor();
    this.bars = [
      new StatusBar(1, "green", "darkred", actor.getHealthPercentage()),
      new StatusBar(2, "purple", "midnightblue", actor.getMagicPercentage())
    ];
    actor.addHealthListener(this);
  }

  addSelfTo(scene) {
    this.bars.forEach(bar => bar.addSelfTo(scene));
  }

  onHealthChange(actor) {
    this.bars[0].setPercentage(actor.getHealthPercentage());
  }
}
