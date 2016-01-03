var SuperMario = SuperMario || {};

//size
var MapSize = {
  height : 21,
  width : 100,
  size : 32
};

var SmallMario = {
  sprite : 'smallMario',
  width : 28,
  height : 32,
  offsetX : 2,
  offsetY : 0,
};

var BigMario = {
  sprite : 'bigMario',
  width : 28,
  height : 64,
  offsetX : 2,
  offsetY : 0,
};

var FlowerMario = {

};

//status
var Movement = {
  idle : 1,
  jumping : 2,
  dropping : 3,
  running : 4,
  dead : 5,
};

var Direction = {
  right : 1,
  left : 2
};

//title screen
SuperMario.Game = function(){
  this.velocityOffset = 10;
  this.maxXSpeed = 220;
};

SuperMario.Game.prototype = {

  create: function() {
    this.map = this.game.add.tilemap('level-1-1');

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('background', 'background');
    this.map.addTilesetImage('ground', 'ground');

    //create layer
    this.backgroundlayer = this.map.createLayer('background');
    this.groundLayer = this.map.createLayer('ground');
    this.map.setCollisionByExclusion([], true, this.groundLayer, false);
    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();

    //create groups
    //not enable body there ps: make sure that tool under the blocks group
    this.tools = this.game.add.group();
    this.blocks = this.game.add.group();
    this.blocks.enableBody = true;
    this.monsters = this.game.add.group();
    this.monsters.enableBody = true;
    this.pipes = this.game.add.group();
    this.pipes.enableBody = true;

    //create objects
    this.createBlocks();
    this.createPipe();
    this.createPlayer(SmallMario);
    this.createMonster();

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.upCursorCounter = Utils.createCounter();

  },

  createPlayer : function(mario){
    mario = mario || SmallMario;
    //create player
    var result = this.findObjectsByType('playerStart', this.map, 'player');
    this.player = this.game.add.sprite(result[0].x, result[0].y, mario.sprite);
    this.player.animations.add('runningLeft', [0, 1, 2], 10, true);
    this.player.animations.add('runningRight', [11, 10, 9], 10, true);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(mario.width, mario.height, 
      mario.offsetX, mario.offsetY);
    this.player.movement = Movement.idle;
    this.player.direction = Direction.right;
    this.player.type = mario.sprite;
    this.player.invincible = false;
    this.player.xSpeed = 0;
    this.player.allowToJump = false;
    this.player.onGround = false;
  },


  createPipe : function(){
    var result = this.findObjectsByType('pipe', this.map, 'pipe');
    var i = 0;
    var pipe;
    for(i = 0; i < result.length; i++){
      pipe = this.pipes.create(result[i].x, result[i].y, 'pipe');
      pipe.body.immovable = true;
    }
  },

  createBlocks : function(){
    var result = this.findObjectsByType('block', this.map, 'block');
    var i = 0;
    var block;
    for(i = 0; i < result.length; i++){
      block = this.createFromTiledObject(result[i], this.blocks);
      block.body.immovable = true;
    }

    result = this.findObjectsByType('toolblock', this.map, 'block');
    for(i = 0; i < result.length; i++){
      block = this.createFromTiledObject(result[i], this.blocks);
      block.body.immovable = true;
    }
  },

  createTool : function(block){
    var tween;
    var self = this;
    var result = this.tools.create(block.x, block.y, block.tool);
    result.tool = block.tool;

    if(block.tool === 'coin'){

    }else{
      tween = this.game.add.tween(result).to({y:'-32'}, 300, 
        Phaser.Easing.Linear.None, false, 0, 0, false);

      tween.onComplete.addOnce(function(){
        self.game.physics.arcade.enable(result);
        //init the speed of the moving tool
        result.direction = Direction.left;
        result.outOfBoundsKill = true;
      });

      tween.start();
    }
  },

  createMonster : function(){
    var result = null;
    var i = 0;
    var monster;
    result = this.findObjectsByType('kinoko', this.map, 'monster');
    for(i = 0; i < result.length; i++){
      monster = this.monsters.create(result[i].x, result[i].y, 'kinoko');
      monster.type = 'kinoko';
      monster.outOfBoundsKill = true;
      monster.animations.add('walk', [0, 1], 5, true);
      monster.animations.play('walk');
      monster.direction = Direction.left;
    }
  },

  

  update: function() {
    //collision
    this.updateCollision();
    this.updateOverlap();

    //camera
    this.updateCameraX();

    //monster
    this.updateGroupVelocity(this.monsters);
    //tool
    this.updateGroupVelocity(this.tools);
    //player
    this.updatePlayerVelocity();

    this.updateAnimation();
    this.checkDroppingDead();
  },

  updateCollision : function(){

    if(!this.player.alive){
      return;
    }

    //monster collision
    this.game.physics.arcade.collide(this.monsters, this.groundLayer, 
      null, null, this);

    this.game.physics.arcade.collide(this.monsters, this.pipes, 
      function(monster, pipe){
        if(monster.body.touching.right){
          monster.direction = Direction.left;
        }else if(monster.body.touching.left){
          monster.direction = Direction.right;
        }
      },
    null, this);

    this.game.physics.arcade.collide(this.monsters, this.blocks,      
      function(monster, block){
        if(monster.body.touching.right){
          monster.direction = Direction.left;
        }else if(monster.body.touching.left){
          monster.direction = Direction.right;
        }
      },
    null, this);

    //tool collision
    this.game.physics.arcade.collide(this.tools, this.groundLayer, 
      null, null, this);
    this.game.physics.arcade.collide(this.tools, this.blocks, 

      function(tool, block){
        if(tool.body.touching.right){
          tool.direction = Direction.left;
        }else if(tool.body.touching.left){
          tool.direction = Direction.right;
        }
      }, 
    null, this);

    this.game.physics.arcade.collide(this.tools, this.pipes, 
      function(tool, pipe){
        if(tool.body.touching.right){
          tool.direction = Direction.left;
        }else if(tool.body.touching.left){
          tool.direction = Direction.right;
        }
      }, 
    null, this);

    //player collision
    this.game.physics.arcade.collide(this.player, this.groundLayer, 
      function(player, ground){
        if(player.body.blocked.down){
          this.player.onGround = true;
        }
      }, 
    null, this);

    this.game.physics.arcade.collide(this.player, this.pipes, 
      function(player, pipe){
        if(player.body.touching.down){
          this.player.onGround = true;
        }
      }, 
    null, this);

    this.game.physics.arcade.collide(this.player, this.blocks, 
      function(player, block){
        if(this.player.body.touching.up){
          if(block.type === 'blankblock'){
            return;
          }
          this.playBlockTween(block);
        }else if(this.player.body.touching.down){
          this.player.onGround = true;
        }
      }, 
    null, this);

    this.game.physics.arcade.collide(this.player, this.monsters, 
    
    function(player, monster){
      if(player.body.touching.down && player.y < monster.y){
        console.log('kill monster');
        this.player.allowToJump = false;
        this.player.movement = Movement.jumping;
        this.player.body.velocity.y = -200;
        this.monsterDead(monster);
      }else{
        if(this.player.type === 'bigMario'){
          this.gettingSmall();
        }else if(this.player.type === 'smallMario'){
          this.playerDead();
        }
      }
    },

    function(player, monster){
      if(monster.alive){
        if(monster.y - player.y < 32 && monster.y - player.y > 25){
          return true;
        }
      }
      if(monster.alive && !this.player.invincible){
        return true;
      }else{
        return false;
      }
    }, this);

    //player
    if(this.player.onGround){
      this.player.allowToJump = true;
      this.upCursorCounter.clear();
      this.player.movement = Movement.idle;
    }
  },

   updateOverlap : function(){
    this.game.physics.arcade.overlap(this.player, this.tools, 
      function(player, tool){
        tool.alive = false;
        this.tools.remove(tool);
        switch(tool.tool){
          case 'bigMarshroom':
            this.gettingBigger();
            break;
        }
      }, 
    null, this);
  },

  updatePlayerTexture : function(mario){
    this.player.y = this.player.y - mario.height + this.player.height;
    this.player.loadTexture(mario.sprite);
    this.player.body.setSize(mario.width, mario.height, 
      mario.offsetX, mario.offsetY);
    this.player.type = mario.sprite;
  },

  updateGroupVelocity : function(group){
    group.forEach(function(member){
      if(member.alive){
        if(member.body){
          member.body.gravity.y = 1200;
          member.body.velocity.x = member.direction === Direction.right ? 100 : -100;
        }
      }else{
        if(member.body){
          member.animations.stop();
          member.body.gravity.y = 0;
          member.body.velocity.x = 0;
          member.body.velocity.y = 0;
        }
      }
    }, this);
  },

  updatePlayerVelocity : function(){
    
    if(!this.player.alive){
      this.player.body.velocity.x = 0;
      this.player.body.gravity.y = 0;
      this.player.body.velocity.y = 0;
      return;
    }else{
      this.player.body.gravity.y = 1200;
    }

    if(this.player.body.velocity.y !== 0){
      this.player.onGround = false;
    }
    if(this.player.body.velocity.y > 0){
      console.log('dropping');
      this.player.movement = Movement.dropping;
    }

    //player movement
    //jumping
    if(this.cursors.up.isDown) {
      if(this.player.movement === Movement.dropping){
          return;
      }

      if(this.upCursorCounter.get() === 0 &&
        !this.player.allowToJump){
      }else{
        this.player.movement = Movement.jumping;
        if(this.upCursorCounter.get() <= 10){
          this.upCursorCounter.add();
          if(this.upCursorCounter.get() === 1){
            this.player.body.velocity.y -= 200;
          }
          this.player.body.velocity.y -= 20;
        }
      }
      this.player.allowToJump = false;
    }

    //running
    if (this.cursors.left.isDown) {

      if(!this.player.allowToJump){
        this.velocityOffset = 5;
      }else{
        this.velocityOffset = 10;
        this.player.movement = Movement.running;
        this.player.direction = Direction.left;
      }

      if(this.player.xSpeed <= -this.maxXSpeed){
        this.player.xSpeed = -this.maxXSpeed;
        this.player.body.velocity.x = this.player.xSpeed;
      }else{
        this.player.xSpeed -= this.velocityOffset;
        this.player.body.velocity.x = this.player.xSpeed;
      }

    //running right
    }else if(this.cursors.right.isDown) {

      if(!this.player.allowToJump){
        this.velocityOffset = 5;
      }else{
        this.velocityOffset = 10;
        this.player.movement = Movement.running;
        this.player.direction = Direction.right;
      }

      if(this.player.xSpeed >= this.maxXSpeed){
        this.player.xSpeed = this.maxXSpeed;
        this.player.body.velocity.x = this.player.xSpeed;
      }else{
        this.player.xSpeed += this.velocityOffset;
        this.player.body.velocity.x = this.player.xSpeed;
      }

    //don't press any key
    }else{
      // this.upCursorCounter.clear();
      this.velocityOffset = 10;
      if(this.player.xSpeed > 0){
        this.player.xSpeed -= this.velocityOffset + 5;
        this.player.body.velocity.x = this.player.xSpeed;
        if(this.player.xSpeed <= 0){
          this.player.xSpeed = 0;
          this.player.body.velocity.x = this.player.xSpeed;
          this.player.movement = Movement.idle;
        }
      }
      if(this.player.xSpeed < 0){
        this.player.xSpeed += this.velocityOffset + 5;
        this.player.body.velocity.x = this.player.xSpeed;
        if(this.player.xSpeed >= 0){
          this.player.xSpeed = 0;
          this.player.body.velocity.x = this.player.xSpeed;
          this.player.movement = Movement.idle;
        }
      }
    }
  },

  updateAnimation : function(){
    if(this.player.movement === Movement.running){
      if(this.player.direction === Direction.left){
        if(this.player.body.velocity.x > 0){
          this.player.animations.stop();
          this.player.frame = 3;
        }else{
          this.player.animations.play('runningLeft');
        }
      }else if(this.player.animations.play('runningRight')){
        if(this.player.body.velocity.x < 0){
          this.player.animations.stop();
          this.player.frame = 8;
        }else{
          this.player.animations.play('runningRight');
        }
      }
    }

    if(this.player.movement === Movement.idle){
      this.player.animations.stop();
      if(this.player.direction === Direction.left){
        this.player.frame = 5;
      }else if(this.player.direction === Direction.right){
        this.player.frame = 6;
      }
    }

    if(this.player.movement === Movement.jumping){
      this.player.animations.stop();
      if(this.player.direction === Direction.left){
        this.player.frame = 4;
      }else if(this.player.direction === Direction.right){
        this.player.frame = 7;
      }
    }

    if(this.player.movement === Movement.dropping){
      this.player.animations.stop();
    }
  },

  updateCameraX : function(){
    if(this.player.body.x - this.camera.x > this.game.width/2){
      this.camera.x += this.player.body.x - this.camera.x - this.game.width/2;
    }

    if(this.player.body.x - this.camera.x < this.game.width/2){
      this.camera.x += this.player.body.x - this.camera.x - this.game.width/2;
    }
  },

  restartGame : function(){
    var taskId;
    var self = this;
    taskId = setInterval(function(){
        self.state.start('game');
        clearInterval(taskId);
      }, 3000);
  },

  toggleWorld : function(){
    var flag;
    if(this.player.alive){
      flag = false;
    }else{
      flag = true;
    }
    this.tools.setAll('alive', flag);
    this.monsters.setAll('alive', flag);
    this.player.alive = flag;
  },

  checkDroppingDead : function(){
    if(this.player.alive && 
        this.player.y > MapSize.size*MapSize.height - 80){
      this.toggleWorld();
      this.restartGame();
    }
  },


  playBlockTween : function(block){
    var self = this;
    var tween = this.game.add.tween(block).to({y : '-10'}, 100, 
      Phaser.Easing.Linear.None, false, 0, 0, true);

    if(block.type === 'toolblock'){
      block.loadTexture('block-03');
    }
    tween.onComplete.addOnce(function(){
      if(block.type === 'toolblock'){
        self.createTool(block);
        block.type = 'blankblock';
      }
    });

    tween.start();
  },

  gettingBigger : function(){
    var tween;
    var self = this;
    this.toggleWorld();
    this.updatePlayerTexture(BigMario);
    tween = this.game.add.tween(this.player).to({alpha : 0}, 
      40, Phaser.Easing.Linear.None, false, 0, 3, true);
    tween.onComplete.addOnce(function(){
      self.toggleWorld(); 
    });
    tween.start();
  },

  gettingSmall : function(){
    var self = this;
    var gettingSmallTween;
    var invincibleTween;

    this.toggleWorld();
    this.updatePlayerTexture(SmallMario);
    
    gettingSmallTween = this.game.add.tween(this.player).to({alpha : 0}, 
      40, Phaser.Easing.Linear.None, false, 0, 3, true);
    invincibleTween = this.game.add.tween(this.player).to({alpha : 0}, 
        40, Phaser.Easing.Linear.None, false, 0, 35, true);

    gettingSmallTween.onComplete.addOnce(function(){
      self.toggleWorld();
      invincibleTween.start();
      self.player.invincible = true;
    });

    invincibleTween.onComplete.addOnce(function(){
      self.player.invincible = false;
    });

    gettingSmallTween.start();
  },

  playerDead : function(){
    var tween1;
    var tween2;
    this.player.loadTexture('deadMario');
    this.toggleWorld();
    tween1 = this.game.add.tween(this.player).to({y : '-20'}, 
      150, Phaser.Easing.Linear.None);
    tween2 = this.game.add.tween(this.player).to({y : '+800'}, 
      1800, Phaser.Easing.Linear.None, false, 500);
    tween1.chain(tween2);
    tween1.start();
    this.restartGame();
  },

  monsterDead : function(monster){
    var self = this;
    var taskId;
    monster.alive = false;
    monster.body.velocity.x = 0;
    monster.animations.stop();
    if(monster.type === 'kinoko'){
      monster.frame = 2;
      taskId = setInterval(function(){
        self.monsters.remove(monster);
        clearInterval(taskId);
      }, 500);
    }
  },

  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = [];
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  },

  //create a sprite from an object
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

    //copy all properties to the sprite
    Object.keys(element.properties).forEach(function(key){
      sprite[key] = element.properties[key];
    });

    return sprite;
  },

  render : function(){}
};