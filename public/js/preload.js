var SuperMario = SuperMario || {};

//loading the game assets
SuperMario.Preload = function(){};

SuperMario.Preload.prototype = {
  preload: function() {
    //show loading screen
    //load game assets
    this.load.tilemap('level1', 'asset/tilemap/super_mario_level_1.json', 
    	null, Phaser.Tilemap.TILED_JSON);
    this.load.image('background', 'asset/image/background-01.png');
    this.load.image('ground', 'asset/image/ground.png');
    this.load.image('block-01', 'asset/image/block-01.png');
    this.load.image('block-02', 'asset/image/block-02.png');
    this.load.image('block-03', 'asset/image/block-03.png');
    this.load.image('pipe', 'asset/image/pipe.png');
    this.load.spritesheet('kinoko', '/asset/image/kinoko_frame.png', 32, 32);
    this.load.image('bigMarshroom', '/asset/image/big_marshroom.png');
    this.load.image('deadMario', 'asset/image/dead.png');
    this.load.spritesheet('smallMario', 'asset/image/mario_small_frame.png', 32, 32);
    this.load.spritesheet('bigMario', 'asset/image/mario_big_frame.png', 32, 64);
  },
  create: function() {
    this.state.start('game');
  }
};