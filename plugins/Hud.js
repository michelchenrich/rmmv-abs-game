extend(Game_Character, {
  isAttackable: function() {
    return false;
  }
});

patch(Scene_Map, {
  createDisplayObjects: original => function() {
    original.apply(this, arguments);
    this.hud = new Hud();
    this.hud.addSelfTo(this);
  },

  update: original => function() {
    original.apply(this, arguments);
    this.hud.update(); 
  }
});

patch(Game_Actor, {
  initialize: original => function(actorId) {
    original.apply(this, arguments);
    this.hpListeners = [];
  },

  gainHp: original => function(amount) {
    original.apply(this, arguments);
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
  },

  canPerformAttack: function() {
    let nextX = $gameMap.roundXWithDirection(this.x, this.direction());
    let nextY = $gameMap.roundYWithDirection(this.y, this.direction());
    return $gameMap.eventsXy(nextX, nextY).filter(e => e.isAttackable()).length > 0;
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

class ActionButton {
  constructor() {
    this.sprite = new Sprite(new Bitmap(100, 100));
    this.sprite.move(240, 4);
    this.drawButtonBorder();
  }

  addSelfTo(scene) {
    scene.addChild(this.sprite);
  }

  drawButtonBorder() {
    this.sprite.bitmap.drawCircle(50, 50, 50, "black");
    this.sprite.bitmap.drawCircle(50, 50, 49, "white");
    this.sprite.bitmap.drawCircle(50, 50, 46, "black");
  }

  setToAttack() {
    this.sprite.bitmap.drawCircle(50, 50, 45, "darkred");
    this.sprite.bitmap.drawText("Attack", 10, 10, 80, 80, "center");
  }

  setToNothing() {
    this.sprite.bitmap.drawCircle(50, 50, 45, "black");
    this.sprite.bitmap.drawText("Nothing", 10, 10, 80, 80, "center");
  }
}

class Hud {
  constructor() {
    this.player = $gamePlayer;
    this.lastPossibleAction = "";

    let actor = this.player.getActor();
    this.bars = [
      new StatusBar(1, "green", "darkred", actor.getHealthPercentage()),
      new StatusBar(2, "purple", "midnightblue", actor.getMagicPercentage())
    ];
    actor.addHealthListener(this);

    this.actionButton = new ActionButton();
  }

  addSelfTo(scene) {
    this.bars.forEach(bar => bar.addSelfTo(scene));
    this.actionButton.addSelfTo(scene);
  }

  update() {
    let possibleAction = this.determineCurrentPossibleAction();
    if (this.lastPossibleAction !== possibleAction)
      if (possibleAction === "attack")
        this.actionButton.setToAttack();
      else
        this.actionButton.setToNothing();
    this.lastPossibleAction = possibleAction;
  }

  determineCurrentPossibleAction() {
    if (this.player.canPerformAttack())
      return "attack";
    else
      return "";
  }

  onHealthChange(actor) {
    this.bars[0].setPercentage(actor.getHealthPercentage());
  }
}
