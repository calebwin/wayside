var selectState = {preload: preload, create: create, update: update};

var debugText;
var width, height;
var SCALE = 1;
var A_TO_R = Math.PI/180;

var player;
var titleText, subtitleText;
var playBtn;
var music;

var loadingBar;

function preload() {
    loadingBar = this.add.sprite(0,0,"block");
    loadingBar.scale.setTo(width/500,0.1);
    this.load.setPreloadSprite(loadingBar,0);
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.load.image('player', 'img/player.png');
    game.load.image('block', 'img/block.png');
    game.load.image('spike', 'img/spike.png');
    game.load.image('gear', 'img/gear.png');
    game.load.image('playBtn', 'img/playBtn.png');
    width = game.width;
    height = game.height;
}
function create() {
    game.stage.backgroundColor = '#d1cda6';
    game.world.setBounds(0, 0, width, height);
    //game.physics.startSystem(Phaser.Physics.ARCADE);
    
    titleText = game.add.text(game.world.centerX, game.world.centerY-80, "OUTBACK", {
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
    loadingBar.alpha+=(0-loadingBar.alpha)/5;
}
function openGame() {
    game.state.start("game");
}