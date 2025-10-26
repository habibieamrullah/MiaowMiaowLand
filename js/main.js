//ZK App Data
var appData = { title : "MiaowMiaowLand" };
appData.level = 1;
appData.selectedLevel = 1;

if(localStorage.getItem(appData.title) !== null){
	appData = JSON.parse(localStorage.getItem(appData.title));
}

function saveData(){
	localStorage.setItem(appData.title, JSON.stringify(appData));
}

//SCREEN VARS
var baseWidth = 1280;
var screenRatio = window.innerWidth/window.innerHeight;
var gameHeight = baseWidth/screenRatio;

//PHASER VAR
var game = new Phaser.Game(baseWidth, gameHeight, Phaser.AUTO);

var movingLeft = false;
var movingRight = false;
var level;
var keys;
var curKeys;
var Android;

var ZKGame = {};

ZKGame.LogoIntro = {
	preload : function(){
		game.load.image("logo", "assets/zkcs.png");
	},
	create : function(){
		game.stage.backgroundColor = "#ffffff";
		game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
		var zkLogo = game.add.sprite(game.world.centerX, game.world.centerY, "logo");
		zkLogo.anchor.setTo(.5, .5);
		game.camera.flash(0x000000, 1000);
		setTimeout(function(){
			game.state.start("SelectLevel");
		}, 4000);
	}
}

ZKGame.SelectLevel = {
	preload : function(){
		game.load.spritesheet("arrow", "assets/arrow.png", 80, 80);
		game.load.spritesheet("button", "assets/button.png", 128, 32);
		game.load.image("bg", "assets/bg.jpg");
		game.load.image("title", "assets/title.png");
	},
	create : function(){
		game.stage.backgroundColor = "#000000";
		
		this.bgpaper = game.add.tileSprite(0, 0, game.width, game.height, "bg");
		
		this.prevButton = game.add.button(100, game.height/2, "arrow", goPrev, this, 1, 0, 1, 0);
		this.prevButton.anchor.setTo(.5);
		this.nextButton = game.add.button(game.width-100, game.height/2, "arrow", goNext, this, 1, 0, 1, 0);
		this.nextButton.anchor.setTo(.5);
		this.nextButton.angle = 180;
		
		this.title = game.add.image(game.world.centerX, game.world.centerY, "title");
		this.title.anchor.setTo(.5);
		
		this.selectedLevel = game.add.text(this.title.x, this.title.y+150, "Level " + appData.selectedLevel, { font : "30px Arial", fill : "#f88c00" });
		this.selectedLevel.anchor.setTo(.5);
		
		this.playButton = game.add.button(game.world.centerX, game.height - 150, "button", playLevel, this, 1, 0, 1, 0);
		this.playButton.anchor.setTo(.5);
		
		function goPrev(){
			if(appData.selectedLevel > 1){
				appData.selectedLevel -= 1;
				this.selectedLevel.setText("Level " + appData.selectedLevel);
				saveData();
			}
		}
		function goNext(){
			if(appData.selectedLevel < appData.level && appData.selectedLevel < 10){
				appData.selectedLevel += 1;
				this.selectedLevel.setText("Level " + appData.selectedLevel);
				saveData();
			}
		}
		function playLevel(){
			game.state.start("Main");
		}
	},
	update : function(){
		
	}
}

ZKGame.Main = {
	preload : function(){
		game.load.spritesheet("buttonSmall", "assets/buttonSmall.png", 32, 32);
		game.load.spritesheet("arrow", "assets/arrow.png", 80, 80);
		game.load.spritesheet("player", "assets/player.png", 58, 32);
		game.load.spritesheet("flag", "assets/flag.png", 32, 32);
		game.load.spritesheet("ocean", "assets/ocean.png", 32, 32);
		game.load.spritesheet("foodIkan", "assets/foodIkan.png", 28, 18);
		game.load.spritesheet("foodTulang", "assets/foodTulang.png", 28, 18);
		game.load.spritesheet("movingKillerSinga", "assets/movingKillerSinga.png", 48, 49);
		game.load.image("movable", "assets/movable.png");
		game.load.image("wall", "assets/wall.png");
		game.load.image("floor", "assets/floor.png");
		game.load.image("tree", "assets/tree.png");
		game.load.image("stillKiller", "assets/stillKiller.png");
		game.load.image("bg", "assets/bg.jpg");
	},
	create : function(){		
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.world.enableBody = true;	
		
		this.bgpaper = game.add.tileSprite(0, 0, game.width, game.height, "bg");
		
		this.cursor = game.input.keyboard.createCursorKeys();
		
		this.pfBG = game.add.group();
		this.pfHard = game.add.physicsGroup();
		this.pfHardBG = game.add.physicsGroup();
		this.pfMovable = game.add.physicsGroup();
		this.pfTrigger = game.add.group();
		this.pfStillKiller = game.add.group();
		this.pfMovingKiller = game.add.physicsGroup();
		this.pfFood = game.add.group();
		
		level = loadLevel(appData.selectedLevel);
		keys = 0;
		curKeys = 0;
		
		for(var i = 0; i < level.length; i++){
			for(var j = 0; j < level[i].length; j++){
				if(level[i][j] == "t"){
					var itschild = game.add.sprite(32*j, 32*i, "tree");
					this.pfBG.add(itschild);
					itschild.anchor.setTo(.5, 1);
				}
				else if(level[i][j] == "1"){
					var itschild = game.add.sprite(32*j, 32*i, "foodIkan");
					this.pfFood.add(itschild);
					itschild.anchor.setTo(.5, 1);
					itschild.animations.add("shake", [0, 1], 5, true);
					itschild.animations.play("shake");
					keys += 1;
				}
				else if(level[i][j] == "2"){
					var itschild = game.add.sprite(32*j, 32*i, "foodTulang");
					this.pfFood.add(itschild);
					itschild.anchor.setTo(.5, 1);
					itschild.animations.add("shake", [0, 1], 5, true);
					itschild.animations.play("shake");
					keys += 1;
				}
				else if(level[i][j] == "w"){
					var itschild = game.add.sprite(32*j, 32*i, "wall");
					this.pfHard.add(itschild);	
					itschild.body.immovable = true;
					itschild.anchor.setTo(.5, 1);
				}
				else if(level[i][j] == "x"){
					var itschild = game.add.sprite(32*j, 32*i, "floor");
					this.pfHard.add(itschild);	
					itschild.body.immovable = true;
					itschild.anchor.setTo(.5, 1);
				}
				else if(level[i][j] == "h"){
					var itschild = game.add.sprite(32*j, 32*i, "tree");
					this.pfHardBG.add(itschild);	
					itschild.body.immovable = true;
					itschild.anchor.setTo(.5, 1);
				}
				else if(level[i][j] == "o"){
					var itschild = game.add.sprite(32*j, 32*i, "movable");
					this.pfMovable.add(itschild);
					itschild.body.drag.x = 100;
					itschild.body.gravity.y = 300;
					itschild.body.collideWorldBounds = true;
					itschild.anchor.setTo(.5, 1);
				}
				else if(level[i][j] == "f"){
					var itschild = game.add.sprite(32*j, 32*i, "flag");
					this.pfTrigger.add(itschild);
					itschild.anchor.setTo(.5, 1);
					itschild.animations.add("move", [0, 1, 2, 3], 10, true);
					itschild.animations.play("move");
				}
				else if(level[i][j] == "m"){
					var itschild = game.add.sprite(32*j, 32*i, "movingKillerSinga");
					this.pfMovingKiller.add(itschild);
					itschild.anchor.setTo(.5, 1);
					itschild.direction = -69;
					itschild.body.setSize(15, 15, 15, 15);
					itschild.health = 5;
					itschild.animations.add("walk", [0, 1, 2, 3], 5, true);
					itschild.animations.play("walk");
				}
				else if(level[i][j] == "s"){
					var itschild = game.add.sprite(32*j, 32*i, "stillKiller");
					this.pfStillKiller.add(itschild);
					itschild.anchor.setTo(.5, 1);
				}
			}
		}
		
		this.ocean = game.add.tileSprite(0, game.height-30, game.width, game.height, "ocean");
		this.ocean.animations.add("waving", [0, 1, 2], 5, true);
		this.ocean.play("waving");
		
		this.player = game.add.sprite(100, game.world.centerY, "player");
		this.player.anchor.setTo(.5, 1);
		this.player.body.gravity.y = 500;
		this.player.body.collideWorldBounds = true;
		this.player.body.setSize(25, 32, 12, 0);
		this.player.animations.add("move", [1, 2, 3], 10, true);
 	
        // Keyboard input handlers
game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP]);

this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);

this.leftKey.onDown.add(function(){
    movingLeft = true;
    movingRight = false;
    this.arrowleft.frame = 1;
}, this);

this.leftKey.onUp.add(function(){
    movingLeft = false;
    this.arrowleft.frame = 0;
}, this);

this.rightKey.onDown.add(function(){
    movingRight = true;
    movingLeft = false;
    this.arrowright.frame = 1;
}, this);

this.rightKey.onUp.add(function(){
    movingRight = false;
    this.arrowright.frame = 0;
}, this);

this.upKey.onDown.add(function(){
    if(this.player.body.touching.down || this.player.body.y > game.height-20) {
        pussJump(this);
    }
}, this);



		
		this.arrowleft = game.add.sprite(100, game.height - 100, "arrow");
		this.arrowleft.anchor.setTo(.5);
		this.arrowleft.scale.setTo(2);
		this.arrowleft.inputEnabled = true;
		this.arrowleft.events.onInputDown.add(function(){ 
			movingLeft = true 
			this.arrowleft.frame = 1;
		}, this);
		this.arrowleft.events.onInputUp.add(function(){ 
			movingLeft = false 
			this.arrowleft.frame = 0;
		}, this);
		
		this.arrowright = game.add.sprite(this.arrowleft.x + 200, game.height - 100, "arrow");
		this.arrowright.anchor.setTo(.5);
		this.arrowright.scale.setTo(2);
		this.arrowright.inputEnabled = true;
		this.arrowright.angle = 180;
		this.arrowright.events.onInputDown.add(function(){ 
			movingRight = true 
			this.arrowright.frame = 1;
		}, this);
		this.arrowright.events.onInputUp.add(function(){ 
			movingRight = false 
			this.arrowright.frame = 0;
		}, this);
		
		this.arrowup = game.add.button(game.width - 100, game.height - 100, "arrow", jump, this, 1, 0, 1, 0);
		this.arrowup.anchor.setTo(.5);
		this.arrowup.scale.setTo(2);
		this.arrowup.angle = 90;
		
		this.backButton = game.add.button(50, 50, "buttonSmall", goBack, this, 1, 0, 1, 0);
		this.backButton.anchor.setTo(.5);
		
		function goBack(){
			game.state.start("SelectLevel");
		}
		
		//jump for touch control
		function jump(){
			if(this.player.body.touching.down || this.player.body.y > game.height-20)
				pussJump(this);
		}
	},
	update : function(){
		game.physics.arcade.collide(this.pfHard, this.player);
		game.physics.arcade.collide(this.pfHardBG, this.player);
		game.physics.arcade.collide(this.pfMovable, this.player);
		game.physics.arcade.collide(this.pfMovable, this.pfHard);
		game.physics.arcade.collide(this.pfMovable);
		game.physics.arcade.collide(this.pfMovingKiller, this.pfHard);
		game.physics.arcade.collide(this.pfMovingKiller, this.pfMovable);
		game.physics.arcade.collide(this.pfMovingKiller, this.pfHardBG);
		
		game.physics.arcade.overlap(this.player, this.pfTrigger, win, null, this);
		game.physics.arcade.overlap(this.player, this.ocean, lose, null, this);
		game.physics.arcade.overlap(this.player, this.pfFood, nyam, null, this);
		game.physics.arcade.overlap(this.player, this.pfMovingKiller, lose, null, this);
		game.physics.arcade.overlap(this.player, this.pfStillKiller, lose, null, this);
		
		moveMovingKiller(this);
	
		if(movingLeft) pussLeft(this);
		else if(movingRight) pussRight(this);
		else pussIddle(this);
		
		//keyboard control
		/*
		if(this.cursor.left.isDown){
			movingLeft =  true;
			movingRight = false;
		}else if(this.cursor.right.isDown){
			movingRight = true;
			movingLeft = false;
		}else{
			movingRight = false;
			movingLeft = false;
		}
		if(this.cursor.up.isDown && (this.player.body.touching.down || this.player.body.y > game.height-20))
			pussJump(this);
		*/
		
		if(!this.player.body.touching.down)
			this.player.frame = 0;
	}
}

game.state.add("LogoIntro", ZKGame.LogoIntro);
game.state.add("SelectLevel", ZKGame.SelectLevel);
game.state.add("Main", ZKGame.Main);
game.state.start("LogoIntro");

function pussLeft(puss){
	puss.player.body.velocity.x = -100;
	puss.player.scale.setTo(-1, 1);
	puss.player.animations.play("move");
}

function pussRight(puss){
	puss.player.body.velocity.x = 100;
	puss.player.scale.setTo(1, 1);
	puss.player.animations.play("move");
}

function pussIddle(puss){
	puss.player.body.velocity.x = 0;
	puss.player.frame = 0;
}

function pussJump(puss){
	puss.player.body.velocity.y = -350;
}

function moveMovingKiller(zzz){
	for(var i = 0; i < zzz.pfMovingKiller.children.length; i++){
		if(zzz.pfMovingKiller.children[i].direction <= 0){
			if(zzz.pfMovingKiller.children[i].body.touching.left){
				zzz.pfMovingKiller.children[i].direction *= -1;
				zzz.pfMovingKiller.children[i].scale.setTo(-1, 1);
			}				
			zzz.pfMovingKiller.children[i].body.velocity.x = zzz.pfMovingKiller.children[i].direction;
		}
		else{
			if(zzz.pfMovingKiller.children[i].body.touching.right){
				zzz.pfMovingKiller.children[i].direction *= -1;
				zzz.pfMovingKiller.children[i].scale.setTo(1, 1);
			}
			zzz.pfMovingKiller.children[i].body.velocity.x = zzz.pfMovingKiller.children[i].direction;
		}
	}
}

function win(){
	if(curKeys == keys){
		if(appData.level == appData.selectedLevel){
			appData.level += 1;
			appData.selectedLevel = appData.level;
		}else{
			appData.selectedLevel += 1;
		}
		saveData();
		if(Android != undefined) Android.showAd();
		game.state.start("SelectLevel");
	}
}

function lose(){
	if(Android != undefined) Android.vibrate();
	game.state.start("Main");
}

function nyam(player, food){
	curKeys += 1;
	food.kill();
	saveData();
}

function loadLevel(x){
	var levelInfo;
	switch(x){
		case 1 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"       w          h       f             ",
				"  xxxxxxxxxxxxxxxxxxxxxxxxxxx           ",
				"                                        ",
			];
			break;
		case 2 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"       1           w                    ",
				"       w    h     ww      f             ",
				"  xxxxxxxxxxxxxxxxxxxxxxxxxxx           ",
				"                                        ",
			];
			break;
		case 3 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                           oo           ",
				"                   w       xx           ",
				"       w        wwww2s            f     ",
				"  xxxxxx   xxxxxxxxxxxxxx       xxxx    ",
				"                                        ",
			];
			break;
		case 4 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                h f     ",
				"                  ww           wwwww    ",
				"              w                         ",
				"       www   ww              oo         ",
				"      wwww    w    m  t   ooooo      1  ",
				"  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ",
				"                                        ",
			];
			break;
		case 5 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                f  s                    ",
				"               xxxxxxx                  ",
				"                        h               ",
				"                      xxxxx             ",
				"                              2         ",
				"                     w     xxxxx        ",
				"          w      o  xxxxxxx             ",
				"      h   w m  w ooo                    ",
				"  xxxxxxxxxxxxxxxxxx                    ",
				"                                        ",
			];
			break;
		case 6 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                  w                     ",
				"    2       f     w  t    s   o         ",
				"   xxx    xxxxxxxxxxxxxxxxxxxxx         ",
				"                                   xx   ",
				"                                  xx    ",
				"                                 xx     ",
				"                                xx      ",
				"                                        ",
				"            o            1  xxx         ",
				"    t      oo    w     xxx              ",
				"  xxxxx   xxx   xxx                     ",
				"                                        ",
			];
			break;
		case 7 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"       f                                ",
				"       w                                ",
				"       w    m w                         ",
				"       xxxxxxxx             o           ",
				"                  s         o           ",
				"                xxxxx    xxxxxx   w     ",
				"                                  w2    ",
				"                                xxxx    ",
				"              w1                        ",
				"           xxxxx                        ",
				"                                        ",
				"      ww                                ",
				"    xxxx                                ",
				"                 h         2            ",
				"xxxxxxxx     xxxxxxxx    xxx            ",
				"                                        ",
			];
			break;
		case 8 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"   x m  t 1  m  x                       ",
				"   xxxxxxxxxxxxxx                       ",
				"                     xx                 ",
				"                                        ",
				"                        xx   x   xx     ",
				"     o       x  xx  xx              2   ",
				"     o    x              s f       xxx  ",
				"   xxxx                  xxxxx          ",
				"                                        ",
				"                                        ",
			];
			break;
		case 9 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"              1                         ",
				"             xxx                        ",
				"                                        ",
				"                   x  m  t 1x           ",
				"          xxx      xxxxxxxxxx           ",
				"                                   s  f ",
				"              xx                xxxxxxxx",
				"                                        ",
				"                xxxx                    ",
				"        www                             ",
				"xxxxxxxxxxxxxxxxx                       ",
				"                                        ",
				"                                        ",
			];
			break;
		case 10 :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"         w   m   s   f    m  w          ",
				"         xxxxxxxxxxxxxxxxxxxxx          ",
				"     w                                  ",
				"     ww                                 ",
				"     xxxx    o    2                     ",
				"           xxxx                         ",
				"                  w  o                  ",
				"               o wwwoo1                 ",
				"             xxxxxxxxxx                 ",
				"                                        ",
				"         s  w                           ",
				"         xxxx                           ",
				"   xxxx                                 ",
				"                                        ",
			];
			break;
		default :
			levelInfo = [
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"                                        ",
				"               o                        ",
				"               o      o                 ",
				"  ttt    t ooh o t h ooo   tt    h th  t",
				"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
				"                                        ",
				"                                        ",
			];
	}
	return levelInfo;
}
