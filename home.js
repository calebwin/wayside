var homeState = {preload: preload, create: create, update: update};

var debugText;
var width, height;
var SCALE = 1;
var A_TO_R = Math.PI/180;

var player;
var titleText, subtitleText;
var playBtn;
var music;

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.load.image('player', 'assets/player.png');
    game.load.image('block', 'assets/block.png');
    game.load.image('spike', 'assets/spike.png');
    game.load.image('gear', 'assets/gear.png');
    game.load.image('playBtn', 'assets/playBtn.png');
    loadLoop("track1","track1");
    loadLoop("track2","track2");
    loadLoop("track3","track3");
    loadLoop("track4","track4");
    loadLoop("track5","track5");
    width = game.width;
    height = game.height;
}

function loadLoop(key, file) {	
	if (game.device.iOS || game.device.macOS) {
		game.load.audio(key, ['assets/' + file + '.m4a']);	
	} else {		
		// Firefox and Chrome will use OGG		
		// IE11 will fall back to MP3, which will have a small gap at the end before replaying		
		game.load.audio(key, ['assets/' + file + '.ogg', 'assets/' + file + '.mp3']);	
	}
}
function create() {
    game.stage.backgroundColor = '#d1cda6';
    game.world.setBounds(0, 0, width, height);
    //game.physics.startSystem(Phaser.Physics.ARCADE);
    
    titleText = game.add.text(game.world.centerX, game.world.centerY-80, "WAYSIDE", {
        font: "155px monospace",
        fill: "#2a2e43",
        align: "center",
        fontWeight: "bold",
        stroke: "#2a2e43",
        strokeThickness : 4,
    });
    titleText.anchor.setTo(0.5, 0.5);
    subtitleText = game.add.text(game.world.centerX, game.world.centerY+20, "a little robot's journey in search of an end", {
        font: "25px monospace",
        fill: "#2a2e43",
        align: "center",
        fontWeight: "bold",
        stroke: "#2a2e43",
        strokeThickness : 1,
    });
    subtitleText.anchor.setTo(0.5, 0.5);
    playBtn = game.add.button(width/2,height/2+100,"playBtn",openGame,this);
    playBtn.scale.setTo(0.05,0.05);
    playBtn.anchor.setTo(0.5,0.5);
}
function update() {
}
function openGame() {
    game.state.start("game");
}
