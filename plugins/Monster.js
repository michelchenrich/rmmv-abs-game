patch(Game_Map, {
  setupEvents: original => function() {
    original.apply(this, arguments);
    Monster.spawn(8, 9, 300);
  }
});

class Monster extends Game_Event {
  static spawn(x, y, healthPoints) {
    let newEventId = $dataMap.events.length;
    $dataMap.events.push(this.makeMetadata(newEventId, x, y));
    let monster = new Monster($gameMap.id, newEventId, healthPoints);
    $gameMap._events.push(monster);
  }

  static makeMetadata(id, x, y) {
    return {
      id: id,
      name: "EV" + id,
      note: "",
      pages: [
        {
          conditions: {},
          directionFix: false,
          image: {
            tileId: 0,
            characterName: "Monster",
            direction: 2,
            pattern: 1,
            characterIndex: 2
          },
          list: [],
          moveFrequency: 0,
          moveSpeed: 3,
          moveType: 0,
          priorityType: 1,
          stepAnime: false,
          through: false,
          trigger: 0,
          walkAnime: true
        }
      ],
      x: x,
      y: y,
      meta: {}
    };
  }

  constructor(mapId, eventId, healthPoints) {
    super(mapId, eventId);
    this.attackCooldown = 60;
    this.attackCooldownCount = 0;
    this.healthPoints = healthPoints;
  }

  isAttackable() {
    return this.isAlive();
  } 

  start() {
    this.takeDamage(30);
    this.requestAnimation(121);
  }

  takeDamage(amount) {
    this.healthPoints -= amount;

    if (!this.isAlive())
      this.clearPageSettings();
  }

  isAlive() {
    return this.healthPoints > 0;
  }

  updateSelfMovement() {
    if (!this.isAlive()) 
      return;

    if (this.isNearThePlayer())
      this.moveAggresively();
  }

  moveAggresively() {
    if (this.isTouchingPlayer() && this.canAttack())
      this.attack();
    else
      this.moveTowardPlayer();

    this.attackCooldownCount -= 1;
  }

  isTouchingPlayer() {
    let nextX = $gameMap.roundXWithDirection(this._x, this._direction);
    let nextY = $gameMap.roundYWithDirection(this._y, this._direction);
    return $gamePlayer.pos(nextX, nextY)
  }

  canAttack() {
    return this.attackCooldownCount <= 0; 
  }

  attack() {
    $gamePlayer.getActor().takeDamage(30);
    $gamePlayer.requestAnimation(1);
    this.attackCooldownCount = this.attackCooldown;
  }
}
