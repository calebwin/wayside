var selectState = {preload: preload, create: create, update: update};

var debugText;
var width, height;
var SCALE = 1;
var A_TO_R = Math.PI/180;

var stg;
var stageButtons;

function preload() {
    game.load.image('stageButton', 'img/block.png');
    game.load.image('leftArrow', 'img/leftArrow.png');
    game.load.image('rightArrow', 'img/rightArrow.png');
    width = game.width;
    height = game.height;
    stageButtons = game.add.group();
    game.load.image('stageLock', 'img/stageLock.png');
    if(localStorage.getItem("outbackLevelData")&&!changesUnSaved) {
        var newLevelData = JSON.parse(localStorage.getItem("outbackLevelData"));
        for(var i = 0; i < newLevelData.length; i++) {
            levelData[i].locked=newLevelData[i].locked;
            levelData[i].stageHiScore=newLevelData[i].stageHiScore;
        }
    } else {
        var newLevelData = [levelData.length];
        for(var i = 0; i < levelData.length; i++) {
            newLevelData[i]={};
            newLevelData[i].locked=levelData[i].locked;
            newLevelData[i].stageHiScore=levelData[i].stageHiScore;
        }
        localStorage.setItem("outbackLevelData",JSON.stringify(newLevelData));
        changesUnSaved=false;
    }
    game.stage.backgroundColor = '#d1cda6';
}
function create() {
    //playBtn = game.add.button(width/2,height/2+100,"playBtn",openGame,this);
    var lastX = 0;
    for(var i = 0; i < levelData.length; i++) {
        var stageButton;
        if(levelData[i].locked) {
            stageButton = game.add.sprite(width/2,height/2,"stageLock");
        } else {
            stageButton = game.add.button(width/2,height/2,"stageButton", stageSelected, this);
        }
        stageButton.anchor.setTo(0.5,0.5);
        stageButton.scale.setTo(0.5*SCALE,0.5*SCALE);
        var stageButtonWidth = stageButton.width;
        stageButton.position.x=stageButtonWidth/1+(stageButtonWidth+10)*i;
        stageButton.stageNum = i;
        if(!levelData[i].locked) {
            var stageButtonText = game.add.text(stageButtonWidth/1+(stageButtonWidth+10)*i, height/2, i+1, {
                font: "195px monospace",
                fill: "#d1cda6",
                align: "center",
                fontWeight: "bold",
                stroke: "#d1cda6",
                strokeThickness : 4,
            });
            stageButtonText.anchor.setTo(0.5,0.5);
            var stageText = game.add.text(stageButtonWidth/1+(stageButtonWidth+10)*i, height/2+stageButton.height/2+35, Math.round(levelData[i].stageHiScore)+" POINTS", {
                font: "35px monospace",
                fill: "#2a2e43",
                align: "center",
                fontWeight: "bold",
                stroke: "#d1cda6",
                strokeThickness : 4,
            });
            stageText.anchor.setTo(0.5,0.5);
        } else {
            var stageText = game.add.text(stageButtonWidth/1+(stageButtonWidth+10)*i, height/2+stageButton.height/2+35, "STAGE " + (i+1), {
                font: "35px monospace",
                fill: "#2a2e43",
                align: "center",
                fontWeight: "bold",
                stroke: "#d1cda6",
                strokeThickness : 4,
            });
            stageText.anchor.setTo(0.5,0.5);
        }
        stageButtons.add(stageButton);
        if(i==levelData.length-1) {
            lastX = stageButtonWidth*2+20+(stageButtonWidth+10)*i;
        }
    }
    game.world.setBounds(0, 0, lastX, height);
}
function stageSelected(stageButton) {
    stg = stageButton.stageNum;
    openGame();
}
function update() {
    //loadingBar.alpha+=(0-loadingBar.alpha)/5;
    if(game.input.activePointer.isDown) {
        if(game.input.x>width/2) {
            game.camera.x+=4;
        } else {
            game.camera.x-=4;
        }
    }
}
function openGame() {
    game.state.start("game",Phaser.Plugin.StateTransition.Out.SlideBottom, Phaser.Plugin.StateTransition.In.SlideBottom);
}