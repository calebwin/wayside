var gameState = {preload: preload, create: create, update: update};

var debugText;
var SCALE = 1;
var A_TO_R = Math.PI/180;

var blocks;
var lvl;
var map;
var BLOCK_SIZE = 45;
var mapX, mapY;

var player;

var levelText, helperText, outOfPowerText, gameOverText, gameOverSubtitleText, restartHelpText;
var levelEndEmitter;
var power = 1;
var toPower = 1;
var powerMeter;
var powerStep;
var levelComplete = false, levelReload = false;

var aimDots;
var outOfPower = false;

var angleTo = 0;
var lastLevel = false;
var timer;

var spawnX, spawnY;

var currLevel = 0;

var points = 1.0;
var pointsCount, pointsBar;
var stagePointStep;

function preload() {
    loadingBar = this.add.sprite(0,0,"block");
    loadingBar.scale.setTo(width/500,0.1);
    this.load.setPreloadSprite(loadingBar,0);
    game.load.image('plants1', 'img/plants1.png');
    game.load.image('plants2', 'img/plants2.png');
    game.load.image('plants3', 'img/plants3.png');
    game.load.image('plants4', 'img/plants4.png');
    game.load.image('plants5', 'img/plants5.png');
    game.load.image('downSpike', 'img/downSpike.png');
    game.load.image('leftSpike', 'img/leftSpike.png');
    game.load.image('rightSpike', 'img/rightSpike.png');
    game.load.image('powerMeter', 'img/powerMeter3.png');
    game.load.image("floatingBlockThin", "img/floatingBlockThin.png");
    lvl = 0;
    loadLoop("track1","track1");
    loadLoop("track2","track2");
    loadLoop("track3","track3");
    loadLoop("track4","track4");
    loadLoop("track5","track5");
    game.stage.backgroundColor = '#d1cda6';
    //lvl = 17;
}
var track1, track2, track3, track4, track5;
var music, currentTrack;
function loadLoop(key, file) {	
	if (game.device.iOS || game.device.macOS) {
		game.load.audio(key, ['audio/' + file + '.m4a']);	
	} else {		
		// Firefox and Chrome will use OGG		
		// IE11 will fall back to MP3, which will have a small gap at the end before replaying		
		game.load.audio(key, ['audio/' + file + '.ogg', 'audio/' + file + '.mp3']);	
	}
}
function create() {
    game.world.setBounds(0, 0, width, height);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.physics.arcade.gravity.y = 100;
    
    track1 = game.add.audio('track1');
    track2 = game.add.audio('track2');
    track3 = game.add.audio('track3');
    track4 = game.add.audio('track4');
    track5 = game.add.audio('track5');
    music=[track1,track2,track4,track3,track5];
    //music.loopFull();
    //music.play();
    
    timer = game.time.create(false);
    
    //player.body.collideWorldBounds=true;

    levelEndEmitter = game.add.emitter(0, 0, 250);
    levelEndEmitter.makeParticles('block',0,20,true,true);
    levelEndEmitter.minParticleScale = 0.010;
    levelEndEmitter.maxParticleScale = 0.015;
    levelEndEmitter.gravity=0;
    levelEndEmitter.minParticleSpeed.setTo(-20, -0);
    levelEndEmitter.maxParticleSpeed.setTo(20, -70);
    
    blocks = game.add.group();

    currLevel = levelData[stg].stageMaps[lvl];
    map = currLevel.map;
    helperText = game.add.text(width/2,height/2+(map.length-0.9)*BLOCK_SIZE/2, currLevel.message, {
        font: "17px monospace",
        fill: "#d1cda6",
        align: "center",
        fontWeight: "bold",
    });
    helperText.anchor.setTo(0.5,0.5);
    mapX = width/2-map[0].length*BLOCK_SIZE/2;
    mapY = height/2-map.length*BLOCK_SIZE/2;
    
    powerMeter = game.add.sprite(width/2,height/2+map.length*BLOCK_SIZE/2+50,"powerMeter");
    powerMeter.anchor.setTo(0.5,0.5);
    powerMeter.scale.setTo(1.2,1.2);
    powerMeter.inputEnabled = true;
    powerMeter.input.useHandCursor = true; 
    powerMeter.events.onInputUp.add(restartLevel, this);

    
    restartHelpText = game.add.text(game.world.centerX, height/2+map.length*BLOCK_SIZE/2+53, "Press here to restart a level", {
        font: "17px monospace",
        fill: "#bab79a",
        align: "center",
        fontWeight: "bold",
    });
    restartHelpText.anchor.setTo(0.5, 0.5);
    
    outOfPowerText = game.add.text(width/2,height/2+map.length*BLOCK_SIZE/2+50+4, "OUT OF POWER", {
        font: "24px monospace",
        fill: "#2a2e43",
        align: "center",
        fontWeight: "bold",
    });
    outOfPowerText.anchor.setTo(0.5,0.5);
    outOfPowerText.alpha=0;
    
    loadMap();
    powerStep = currLevel.powerStep;
    
    player = game.add.sprite(width/2,height/8,"player");
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.anchor.set(0.5,0.5);
    player.body.gravity.y = 900;
    player.scale.setTo(BLOCK_SIZE/40);
    var distFromMid = (spawnX+BLOCK_SIZE/2)-width/2;
    var spawnOffset = BLOCK_SIZE/10;
    player.x=width/2+(distFromMid)+((distFromMid>BLOCK_SIZE/2)?spawnOffset:-spawnOffset);
    player.y=spawnY-BLOCK_SIZE*3/2;
    
    player.body.onCollide = new Phaser.Signal();
    player.body.onCollide.add(checkBlock, this);
    
    aimDots = game.add.group();
    for(var i = 0; i < 6; i++) {
        var aimDot = game.add.sprite(width/2,height/2,"block");
        aimDot.scale.setTo(0.01,0.01);
        aimDot.anchor.setTo(0.5,0.5);
        aimDot.alpha=0.3;
        aimDots.add(aimDot);
    }
    //game.input.onDown.add(showAimDots,this);
    game.input.onUp.add(jump,this);
    
    
    gameOverText = game.add.text(game.world.centerX, game.world.centerY-150,"You made it!", {
        font: "85px monospace",
        fill: "#2a2e43",
        align: "center",
        fontWeight: "bold",
        stroke: "#2a2e43",
        strokeThickness : 4,
    });
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverSubtitleText = game.add.text(game.world.centerX, game.world.centerY-80, "hop over to the portal to play another stage", {
        font: "25px monospace",
        fill: "#2a2e43",
        align: "center",
        fontWeight: "bold",
        stroke: "#2a2e43",
        strokeThickness : 1,
    });
    gameOverSubtitleText.anchor.setTo(0.5, 0.5);
    gameOverText.alpha=0;
    gameOverSubtitleText.alpha=0;
    
    pointsCount = game.add.text(20,height-50,points*1000.0, {
        font: "25px monospace",
        fill: "#2a2e43",
        align: "center",
        fontWeight: "bold",
        stroke: "#2a2e43",
        strokeThickness : 1,
    });
    
    pointsBar = game.add.sprite(0,height-7,"powerMeter");
    pointsBar.scale.setTo(width/pointsBar.width,7/pointsBar.height);
    
    game.sound.setDecodedCallback(music, startMusic, this);
    
    stagePointStep=levelData[stg].stagePointStep;
}

function startMusic() {
    if(stg>0) {
        currentTrack.stop();
    }
    music[stg].loopFull();
    currentTrack=music[stg];
    //track1.onLoop.add(nextMusic,this);
}

function checkBlock(player, block) {
    var blockName = block.name;
    if(blockName=="danger") {
        restartLevel();
        player.alive=false;
    }/* else if(blockName=="levelEnd") {
        alert(5);
        if(lvl<levelData.length) {
            loadLevel(lvl+1);
        }
    }*/
}
var helperTextAlphaTo = 1;
function update() {
    pointsCount.setText(Math.round(points*1000.0)+" points");
    gameOverText.setText( Math.round(points*1000) + " points");
    if(!lastLevel) {
        points-=stagePointStep;
        //pointsBar.scale.setTo(points*widt,1);
        pointsBar.width=points*width;
    }
    loadingBar.alpha+=(0-loadingBar.alpha)/5;
    //if(angleTo<player.angle)
    //player.angle+=((angleTo%360)-180-player.angle)/10;
    if(game.input.activePointer.isDown) {
        aimDots.alpha+=(1-aimDots.alpha)/10;
    } else {
        aimDots.alpha+=(0-aimDots.alpha)/10;
    }
    var pX = player.x;
    var pY = player.y;
    var mX = game.input.x;
    var mY = game.input.y;
    powerMeter.scale.setTo(power,0.6);
    power+=(toPower-power)/8;
    levelEndEmitter.forEachAlive(function(p) {
        p.alpha= p.lifespan / levelEndEmitter.lifespan;	
    });
    game.physics.arcade.collide(player, blocks);
    player.body.velocity.x/=1.05;
    player.body.velocity.y/=1.05;
    if(toPower<=0) {
        player.body.velocity.x/=1.2;
        player.body.velocity.y/=1.2;
    }
    if(player.y>height) {
        restartLevel();
    }
    if(toPower<0) {
        toPower=0;
        restartLevel();
        outOfPower=true;
    }
    game.physics.arcade.collide(player, levelEndEmitter , nextLevel, null, this);
    if(levelComplete) {
        blocks.alpha+=(0-blocks.alpha)/10;
        levelEndEmitter.alpha+=(0-levelEndEmitter.alpha)/10;
        player.alpha+=(0-player.alpha)/10;
        if(player.alpha<0.01) {
            levelComplete=false;
            loadNextLevel();
        }
    } else if(!levelReload) {
        blocks.alpha+=(1-blocks.alpha)/10;
        levelEndEmitter.alpha+=(1-levelEndEmitter.alpha)/10;
        player.alpha+=(1-player.alpha)/10;
    }
    if(levelReload) {
        if(outOfPower) {
            outOfPowerText.alpha+=(1-outOfPowerText.alpha)/10;
            if(outOfPowerText.alpha>0.9999) {
                //blocks.alpha+=(0-blocks.alpha)/10;
                levelEndEmitter.alpha+=(0-levelEndEmitter.alpha)/10;
                player.alpha+=(0-player.alpha)/10;
                if(player.alpha<0.01) {
                    levelReload=false;
                    reloadLevel();
                }
            }
            //alert(5);
        } else {
            //blocks.alpha+=(0-blocks.alpha)/10;
            levelEndEmitter.alpha+=(0-levelEndEmitter.alpha)/10;
            player.alpha+=(0-player.alpha)/10;
            if(player.alpha<0.01) {
                levelReload=false;
                reloadLevel();
            }
        }
    } else if(!levelComplete) {
        //blocks.alpha+=(1-blocks.alpha)/10;
        levelEndEmitter.alpha+=(1-levelEndEmitter.alpha)/10;
        player.alpha+=(1-player.alpha)/10;
        outOfPowerText.alpha+=(0-outOfPowerText.alpha)/3;
    }
    if(player.body.touching.down) {
        var i = 1;
        aimDots.forEach(function(dot) {
            newX=pX-(i*(mX-pX)/6);
            newY=pY-(i*(mY-pY)/6);
            dot.x+=(newX-dot.x)/3;
            dot.y+=(newY-dot.y)/3;
            i++;
        });
    }
    if(toPower<1) {
        if(helperText.alpha<0.01) {
            helperText.setText("This is level "+(lvl+1));
            helperTextAlphaTo=1;
        } else if(helperText.text!=="This is level "+(lvl+1)) {
            helperTextAlphaTo=0;
        }
    }
    helperText.alpha+=(helperTextAlphaTo-helperText.alpha)/10;
    if(lastLevel) {
        gameOverText.alpha+=(1-gameOverText.alpha)/10;
        gameOverSubtitleText.alpha+=(1-gameOverSubtitleText.alpha)/10;
        //toPower=0;
    } else {
        gameOverText.alpha+=(0-gameOverText.alpha)/10;
        gameOverSubtitleText.alpha+=(0-gameOverSubtitleText.alpha)/10;
    }
}

function loadMap() {
    for(var i = 0, len1 = map.length; i < len1; i++) {
        for(var j = 0, len2 = map[i].length; j < len2; j++) {
            var val = map[i][j];
            if(val==-2) {
                spawnX = mapX+j*BLOCK_SIZE;
                spawnY = mapY+i*BLOCK_SIZE;
            } else if(val==-1) {
                levelEndEmitter.x=mapX+(j+0.5)*BLOCK_SIZE;
                levelEndEmitter.y=mapY+(i+1.0)*BLOCK_SIZE;
                levelEndEmitter.start(false, 1000, 35);
                levelEndEmitter.name="levelEnd";
            } else if(val==0) {
                if(map[i+1][j]&&map[i+1][j]==1) {
                    var chance = game.rnd.integerInRange(0,100);
                    if(chance>92) {
                        var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+i*BLOCK_SIZE,"plants1");
                        blocks.add(block);
                        block.scale.setTo(BLOCK_SIZE/500,BLOCK_SIZE/500);
                    } else if(chance>84) {
                        var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+i*BLOCK_SIZE,"plants2");
                        blocks.add(block);
                        block.scale.setTo(BLOCK_SIZE/500,BLOCK_SIZE/500);
                    } else if(chance>76) {
                        var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+i*BLOCK_SIZE,"plants3");
                        blocks.add(block);
                        block.scale.setTo(BLOCK_SIZE/500,BLOCK_SIZE/500);
                    } else if(chance>68) {
                        var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+i*BLOCK_SIZE,"plants4");
                        blocks.add(block);
                        block.scale.setTo(BLOCK_SIZE/500,BLOCK_SIZE/500);
                    } else if(chance>60) {
                        var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+i*BLOCK_SIZE,"plants5");
                        blocks.add(block);
                        block.scale.setTo(BLOCK_SIZE/500,BLOCK_SIZE/500);
                    }
                }
            } else if(val==1) {
                var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+i*BLOCK_SIZE,"block");
                blocks.add(block);
                game.physics.enable(block, Phaser.Physics.ARCADE);
                block.body.immovable=true;
                block.body.collideWorldBounds = true;
                block.body.bounce.y = 0.8;
                block.scale.setTo(BLOCK_SIZE/500,BLOCK_SIZE/500);
            } else if(val == 2) {
                var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+(i+3/4)*BLOCK_SIZE,"spike");
                blocks.add(block);
                game.physics.enable(block, Phaser.Physics.ARCADE);
                block.body.immovable=true;
                block.body.collideWorldBounds = true;
                block.body.bounce.y = 0.8;
                block.scale.setTo(BLOCK_SIZE/500,BLOCK_SIZE/500);
                block.name="danger";
            } else if(val == 3) {
                var block = game.add.sprite(mapX+(j+0.5)*BLOCK_SIZE,mapY+(i+0.5)*BLOCK_SIZE,"gear");
                blocks.add(block);
                game.physics.enable(block, Phaser.Physics.ARCADE);
                block.body.immovable=true;
                block.body.collideWorldBounds = true;
                block.body.bounce.y = 0.8;
                block.body.angularVelocity = 50;
                block.scale.setTo(BLOCK_SIZE/500,BLOCK_SIZE/500);
                block.anchor.set(0.5,0.5);
                block.name="danger";
            } else if(val == 4) {
                var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+(i)*BLOCK_SIZE,"downSpike");
                blocks.add(block);
                game.physics.enable(block, Phaser.Physics.ARCADE);
                block.body.immovable=true;
                block.body.collideWorldBounds = true;
                block.body.bounce.y = 0.8;
                block.scale.setTo(BLOCK_SIZE/500,(BLOCK_SIZE*(4/4))/500);
                block.name="danger";
            } else if(val == 5) {
                var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+(i)*BLOCK_SIZE,"rightSpike");
                blocks.add(block);
                game.physics.enable(block, Phaser.Physics.ARCADE);
                block.body.immovable=true;
                block.body.collideWorldBounds = true;
                block.body.bounce.y = 0.8;
                block.scale.setTo(BLOCK_SIZE/500,(BLOCK_SIZE)/500);
                block.name="danger";
            } else if(val == 6) {
                var block = game.add.sprite(mapX+(j+3/4)*BLOCK_SIZE,mapY+(i)*BLOCK_SIZE,"leftSpike");
                blocks.add(block);
                game.physics.enable(block, Phaser.Physics.ARCADE);
                block.body.immovable=true;
                block.body.collideWorldBounds = true;
                block.body.bounce.y = 0.8;
                block.scale.setTo(BLOCK_SIZE/500,(BLOCK_SIZE*(4/4))/500);
                block.name="danger";
            } else if(val == 7) {
                var block = game.add.sprite(mapX+j*BLOCK_SIZE,mapY+(i)*BLOCK_SIZE,"floatingBlockThin");
                blocks.add(block);
                game.physics.enable(block, Phaser.Physics.ARCADE);
                block.body.immovable=true;
                block.body.collideWorldBounds = true;
                block.body.bounce.y = 0.8;
                block.scale.setTo(BLOCK_SIZE/500,(BLOCK_SIZE)/500);
                block.body.checkCollision.down = false;
            }
        }
    }
}

function nextLevel() {
    /*if(lvl+1<levelData.length) {
        loadLevel(lvl+1);
    } else {
        // game completed
    }*/
    //alert(5);
    //loadNextLevel();
    
    game.debug.text(50,50,"next");
    if(!outOfPower&&player.alive) {
        levelComplete=true;
    }
    
}

function loadNextLevel() {
    if(lvl+1<levelData[stg].stageMaps.length) {
        loadLevel(lvl+1);
        lvl++;
        if(lvl+2>levelData[stg].stageMaps.length&&!lastLevel) {
            lastLevel=true;
        }
    } else {
        lastLevel=false;
        // stage completed
        //loadLevel(0);
        lvl=0;
        if(points*1000.0>levelData[stg].stageHiScore) {
            levelData[stg].stageHiScore = points*1000.0;
        }
        if(levelData[stg+1]) {
            levelData[stg+1].locked=false;
        }
        points = 1;
        changesUnSaved=true;
        game.state.start("select",Phaser.Plugin.StateTransition.Out.SlideTop, Phaser.Plugin.StateTransition.In.SlideTop);
    }
}

function restartLevel() {
    /*if(lvl+1<levelData.length) {
        loadLevel(lvl+1);
    } else {
        // game completed
    }*/
    levelReload=true;
}

function reloadLevel() {
    outOfPower=false;
    player.alive=true;
    loadLevel(lvl);
}

function jump(pointer) {
    if(!pointer.withinGame) {
        return;
    }
    if(player.body.touching.down) {
        //angleTo=(angleTo+90);//%360-180;
        toPower-=powerStep;
        player.body.velocity.x=(player.x-game.input.x)*5;
        player.body.velocity.y=(player.y-game.input.y)*6*5/4;
    } else if(player.body.touching.left||player.body.touching.right) {
        player.body.velocity.x*=2;
    }
}
function loadLevel(level) {
    currLevel = levelData[stg].stageMaps[lvl];
    map = levelData[stg].stageMaps[level].map;
    /*if(levelData[level].startX) {
        player.x=width/2+levelData[level].startX;
    } else {
        player.x=width/2;
    }
    player.y=height/8;*/
    player.body.velocity.x=0;
    player.body.velocity.y=0;
    blocks.forEach(function (b) { b.kill(); });
    //levelText.setText("LEVEL "+(level+1));
    //levelText.position.y=height/2+map.length*BLOCK_SIZE/2+50;
    helperText.setText(levelData[stg].stageMaps[level].message);
    helperText.position.y=height/2+(map.length-0.9)*BLOCK_SIZE/2;
    restartHelpText.position.y=height/2+map.length*BLOCK_SIZE/2+53;
    mapX = width/2-map[0].length*BLOCK_SIZE/2;
    mapY = height/2-map.length*BLOCK_SIZE/2;
    toPower=1;
    levelEndEmitter.destroy();
    levelEndEmitter = game.add.emitter(0, 0, 250);
    levelEndEmitter.makeParticles('block',0,250,true,true);
    levelEndEmitter.minParticleScale = 0.010;
    levelEndEmitter.maxParticleScale = 0.015;
    levelEndEmitter.gravity=0;
    levelEndEmitter.minParticleSpeed.setTo(-20, -0);
    levelEndEmitter.maxParticleSpeed.setTo(20, -70);
    loadMap();
    var distFromMid = (spawnX+BLOCK_SIZE/2)-width/2;
    var spawnOffset = BLOCK_SIZE/10;
    player.x=width/2+(distFromMid)+((distFromMid>BLOCK_SIZE/2)?spawnOffset:-spawnOffset);
    player.y=spawnY-BLOCK_SIZE*3/2;
    powerStep = levelData[stg].stageMaps[level].powerStep;
    powerMeter.position.y=height/2+map.length*BLOCK_SIZE/2+50;
    outOfPowerText.position.y=height/2+map.length*BLOCK_SIZE/2+50+4;
    helperTextAlphaTo=1;
}