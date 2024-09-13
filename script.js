var $ = jQuery.noConflict();
		$(document).ready(function(){
			
			/*create the canvas*/	
			//var canvas = document.createElement("canvas");
			var canvas = document.getElementById('game-canvas');
			var ctx = canvas.getContext("2d");
			var touchable = 'createTouch' in document;
			var mouseX, mouseY, touches = []; // array of touch vectors
			
			canvas.width = 500;
			canvas.height = 700;
			canvas.id = 'game-canvas';
			
			// Game Constants
			var gravity = 0.35;
			var friction = 0.9;
			
			// Game Controller
			if(touchable) {
				canvas.addEventListener( 'touchstart', onTouchStart, false );
				canvas.addEventListener( 'touchmove', onTouchMove, false );
				canvas.addEventListener( 'touchend', onTouchEnd, false );
			} else {
				canvas.addEventListener( 'mousemove', onMouseMove, false );
			}
			
			function onTouchStart(e) {
				//touch
				//jump
				touches = e.touches; 
				heroJump();
			}
			 
			function onTouchMove(e) {
				event.preventDefault();
				touches = e.touches; 
			}
			 
			function onTouchEnd(e) { 
				//stoptouch
				touches = e.touches; 
			}
			function onMouseMove(e) {
				mouseX = e.offsetX;
				mouseY = e.offsetY;
			}

			
			//Images // Sprites
			// Background image
			var bgReady = false;
			var bgImage = new Image();
			bgImage.src = 'http://opalgames.com/games/towerjump/images/sprite-tile.png';
			bgImage.onload = function(){
				bgReady = true;
			}
			
			// Hero image
			var heroReady = false;
			var heroImage = new Image();
			heroImage.onload = function () {
				heroReady = true;
			};
			heroImage.src = "http://opalgames.com/games/towerjump/images/sprite-hero.png";
			
			// Portal image
			var portalReady = false;
			var portalImage = new Image();
			portalImage.onload = function () {
				portalReady = true;
			};
			portalImage.src = "http://opalgames.com/games/towerjump/images/sprite-portal.png";
			
			// Game objects
			
			//HERO
			var hero = {
				speed: 10, // movement in pixels per second
				width: 40,
				height: 40,
				velx: 0,
				vely: 0,
				x: 0,
				y: 0,
				jumping : false,
				grounded : false
			};
			
			//PORTAL
			var portal = {
				x: 0,
				y: 0,
				speed: 5, // movement in pixels per second
				width: 150,
				height: 150,
				velx: 0,
				vely: 0,
				force: 3.5
			};
			
			var level = 1;
			
			// Handle keyboard controls
			var keysDown = {};
			
			//towers
			var tower = function(width,height,x,y,type){
				var width = width;
				var height = height;
				var x = x;
				var y = y;
				var type = type;
				var falling = false;
				var floating = false;
				return{
					width: width,
					height: height,
					x: x,
					y: y,
					type: type,
					falling: falling,
					floating: floating
				}
			}
			var towers = new Array();
			var makeTower = function(width,height,x,y,type){
				var temp = tower(width,height,x,y,type);
				towers.push(temp);
			}
			
			//Key Listeners
			
			addEventListener("keydown", function (e) {
				keysDown[e.keyCode] = true;
			}, false);
			
			addEventListener("keyup", function (e) {
				delete keysDown[e.keyCode];
			}, false);
			
			// Reset the game when the player catches a portal
			var reset = function () {
				// Throw the portal somewhere on the screen randomly
				portal.x = 0 + (Math.random() * (canvas.width - 150));
				portal.y = 0 + (Math.random() * (canvas.height / 2 - 250));
				hero.x = 0;
				hero.y = 0;
				hero.velx = 0;
				hero.vely = canvas.height;
				towers = new Array();
				if( level == 1){
					//Make Level
					makeTower(50,100,100,600,'');
					makeTower(80,140,220,500,'fallable');
					makeTower(100,50,370,400,'');
					makeTower(40,50,450,300,'floating');
					makeTower(800,10,0,690,'floor');	
				}else if( level == 3){
					//Make Level
					makeTower(50,100,100,600,'fallable');
					makeTower(80,140,220,500,'fallable');
					makeTower(100,50,370,400,'fallable');
					makeTower(40,50,450,300,'fallable');
					makeTower(800,10,0,690,'floor');
				}else if( level == 2){
					//Make Level
					makeTower(100,100,100,600,'fallable');
					makeTower(50,50,250,500,'floating');
					makeTower(130,50,100,350,'');
					makeTower(130,50,300,350,'');
					makeTower(300,20,100,250,'');
					makeTower(50,50,0,320,'');
					makeTower(800,10,0,690,'floor');
				}else{
					makeTower(80,40,220,600,'floating');
					makeTower(800,10,0,690,'floor');
				}
			};
			
			var init = function(){
				//hero.x = canvas.width / 2;
				hero.y = canvas.height;
				hero.x = 0;
				reset();
			};
			
			function heroJump(){
					if (!hero.jumping && hero.grounded) {
						console.log('jump!');
						hero.jumping = true;
						hero.grounded = false; // We're not on the ground anymore!!
						hero.vely = -hero.speed * 1;
					}
			}

			
			// Update game objects
			// Check inputs for how to update sprites
			var update = function (modifier) {
				
				//Jumping
				if (38 in keysDown || 32 in keysDown ) { // Player holding up or space
					// up arrow or space
					heroJump();
				
				}
				
				if (37 in keysDown) { // Player holding left
					if (hero.velx > -hero.speed) {
						hero.velx--;
					}
				}
				if (39 in keysDown) { // Player holding right
					if (hero.velx < hero.speed) {
						hero.velx++;
					}
				}
				
				if (40 in keysDown) { // Player holding down
					//hero.height = 5;	
				}
				
				if (27 in keysDown) {
					level = 1;
					hero.y = canvas.height;
					hero.x = 0;
					reset();
				}
				
				
				//slow down the hero
				hero.velx *= friction;
				if( hero.velx < .01 && hero.velx > -.01 ){
					hero.velx = 0;
				}
				
				//add gravity
				hero.vely += gravity;
				
				//move the portal
				portal.x += portal.speed * portal.force;
				
				//change the portal{
				if(portal.x > canvas.width - portal.width){
					portal.force = -1;
				}
				if(portal.x <= 0){
					portal.force = 1;
				}				
				
				//Enter the Portal!!
				if (
					hero.x + hero.width >= portal.x
					&& portal.x + portal.width >= hero.x
					&& hero.y <= portal.y + portal.height
					//&& portal.y + portal.height <= hero.y
				) {
					console.log('next level!');
					++level;
					reset();
				}
				
				// stop hero on screen edge
				if (hero.x >= canvas.width - heroImage.width) {
					hero.x = canvas.width - heroImage.width;
				}else if (hero.x <= 0) {
					hero.x = 0;
				}
				
				// stop hero on the floor
				if (hero.y >= canvas.height - heroImage.height) {
					hero.y = canvas.height - heroImage.height;
					hero.vely = 0;
				}else if (hero.y <= 0) {
					hero.y = 0;
				}
				
				//check towers
				hero.grounded = false;
				for(i=0;i<towers.length;i++){
					
					var dir = colCheck(hero, towers[i]);
					if (dir === "l" || dir === "r") {
						hero.velx = 0;
						hero.jumping = false;
					} else if (dir === "b") {
						hero.grounded = true;
						hero.jumping = false;
						//towers fall when you land on them
						if(towers[i].type == 'fallable'){
							towers[i].falling = true;
						}
						if(towers[i].type == 'floating'){
							towers[i].floating = true;
						}
					} else if (dir === "t") {
						hero.vely *= -1;
					}
					
					if( towers[i].falling == true ){
						towers[i].y += 1;
					}
					if( towers[i].floating == true ){
						towers[i].y -= 1;
					}
					
				}
				
				if(hero.grounded){
					 hero.vely = 0;
				}				 
				
				hero.x += hero.velx;
				hero.y += hero.vely;
				
			};
			
			// check tower hits			
			function colCheck(shapeA, shapeB) {
				// get the vectors to check against
				var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
					vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
					// add the half widths and half heights of the objects
					hWidths = (shapeA.width / 2) + (shapeB.width / 2),
					hHeights = (shapeA.height / 2) + (shapeB.height / 2),
					colDir = null;
								 
				// if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
				if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
					var oX = hWidths - Math.abs(vX), oY = hHeights - Math.abs(vY);
					if (oX >= oY) {
						if (vY > 0) {
							colDir = "t";
							shapeA.y += oY;
						} else {
							colDir = "b";
							shapeA.y -= oY;
						}
					} else {
						if (vX > 0) {
							colDir = "l";
							shapeA.x += oX;
						} else {
							colDir = "r";
							shapeA.x -= oX;
						}
					}
				}
				return colDir;
			}
			
			// Draw everything
			var render = function () {
				ctx.clearRect(0,0,canvas.width, canvas.height);
				if (bgReady) {
					//ctx.drawImage(bgImage, 0, 0);
					var ptrn = ctx.createPattern(bgImage, 'repeat'); // Create a pattern with this image, and set it to "repeat".
					ctx.fillStyle = ptrn;
					ctx.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);
				}
				
				if (heroReady) {
					ctx.drawImage(heroImage, hero.x, hero.y);
				}
			
				if (portalReady) {
					ctx.drawImage(portalImage, portal.x, portal.y);
				}
				
				//controller
				/*
				if(touchable) {
					for(var i=0; i<touches.length; i++)
					{
						var touch = touches[i]; 
						ctx.beginPath(); 
						ctx.fillStyle = "white";
						ctx.fillText("touch id : "+touch.identifier+" x:"+touch.clientX+" y:"+touch.clientY, touch.clientX+30, touch.clientY-30); 
						
						ctx.beginPath(); 
						ctx.strokeStyle = "cyan";
						ctx.lineWidth = "6";
						ctx.arc(touch.clientX, touch.clientY, 40, 0, Math.PI*2, true); 
						ctx.stroke();
					}
				} else {
					ctx.fillStyle	 = "white"; 
					ctx.fillText("mouse : "+mouseX+", "+mouseY, mouseX, mouseY);
				}
				*/
				//ctx.fillText("hello", 0,0);

				
				//draw towers
				for(i=0; i < towers.length; i++){
					if(towers[i].type == 'floor'){
						ctx.fillStyle = "rgb(25,25,25)";
					}else if(towers[i].type == 'floating'){
						ctx.fillStyle = "rgb(50,100,50)";
					}else if(towers[i].type == 'fallable'){
						ctx.fillStyle = "rgb(100,50,50)";
					}else{
						ctx.fillStyle = "rgb(50,50,50)";
					}
					ctx.fillRect(towers[i].x,towers[i].y,towers[i].width,towers[i].height);
				}
				
				// Score
				ctx.fillStyle = "rgb(10, 10, 10)";
				ctx.font = "18px Helvetica";
				ctx.textAlign = "left";
				ctx.textBaseline = "top";
				//ctx.fillText("x: " + parseFloat(hero.x).toFixed(2) + " y: " + parseFloat(hero.y).toFixed(2), 10, 10);
				//ctx.fillText("velx: " + parseFloat(hero.velx).toFixed(2) + " vely: " + parseFloat(hero.vely).toFixed(2), 10, 30);
				ctx.fillText("Level " + level , 10 , 10);
				
			};
			
			// The main game loop
			var main = function () {
				var now = Date.now();
				var delta = now - then;
			
				update(delta / 1000);
				render();
			
				then = now;
			
				// Request to do this again ASAP
				requestAnimationFrame(main);
			};
			
			// Cross-browser support for requestAnimationFrame
			var w = window;
			requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
			
			/*
			// sample save game state function
			function saveState(state) {
				window.localStorage.setItem("gameState", JSON.stringify(state));
			}
			
			function restoreState() {
				var state = window.localStorage.getItem("gameState");
				if (state) {
					return JSON.parse(state);
				} else {
					return null;
				}
			}
			*/
			
			//JS game resize for full screen
			function resizeGame() {
				var gameArea = document.getElementById('game-area');
				var widthToHeight = 3 / 2;
				var newWidth = window.innerWidth;
				var newHeight = window.innerHeight;
				var newWidthToHeight = newWidth / newHeight;
				
				if (newWidthToHeight > widthToHeight) {
					// window width is too wide relative to desired game width
					newWidth = newHeight * widthToHeight;
					gameArea.style.height = newHeight + 'px';
					gameArea.style.width = newWidth + 'px';
				} else { // window height is too high relative to desired game height
					newHeight = newWidth / widthToHeight;
					gameArea.style.width = newWidth + 'px';
					gameArea.style.height = newHeight + 'px';
				}
				
				gameArea.style.marginTop = (-newHeight / 2) + 'px';
				gameArea.style.marginLeft = (-newWidth / 2) + 'px';
				gameArea.style.fontSize = (newWidth / 400) + 'em';
				
				canvas.width = newWidth;
				canvas.height = newHeight;
			}
			//resizeGame();
			//window.addEventListener('resize', resizeGame, false);
			//window.addEventListener('orientationchange', resizeGame, false);
			//END JS RESIZE
			
			// Let's play this game!
			var then = Date.now();
			init();
			main();
			
		});