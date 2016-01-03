var SuperMario = SuperMario || {};

SuperMario.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

SuperMario.game.state.add('boot', SuperMario.Boot);
SuperMario.game.state.add('preload', SuperMario.Preload);
SuperMario.game.state.add('game', SuperMario.Game);

SuperMario.game.state.start('boot');