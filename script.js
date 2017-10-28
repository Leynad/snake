window.onload = function() //Event = quand la fenetre charge -> instruction du code
{
	var canvasWidth = 900;
	var canvasHeight = 600;
	var blockSize = 30;
	var ctx;
	var delay = 100; // milliseoncde
	var snakee;
	var applee;
	var widthInBlocks = canvasWidth / blockSize;
	var heightInBlocks = canvasHeight / blockSize;
	var score;
	var timeout;
	
	init();
	
	function init()
	{
		var canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.border = "30px solid gray";
		canvas.style.margin = "50px auto"; //haut & bas=50px ; gauche & droite=auto
		canvas.style.display = "block";
		canvas.style.backgroundColor = "#ddd";
		document.body.appendChild(canvas); //Accrocher le tag canvas au body de l'HTML	
		ctx = canvas.getContext('2d'); //Dessiner en 2D
		snakee = new Snake([[6,4],[5,4],[4,4], [3,4], [2,4]], "down"); //corps du serpent. Tete 1er elem.
		applee = new Apple([10,10]);
		score = 0;
		refreshCanvas();
	}
	
	function refreshCanvas()
	{
		snakee.advance();
		
		if(snakee.checkCollision())
		{
			gameOver();
		}
		else
		{
			if(snakee.isEatingApple(applee))
			{
				score++;
				
				snakee.ateApple = true;
				do
				{
					applee.setNewPosition();
				}
				while(applee.isOnSnake(snakee))// Verifie si la pomme est sur le serpent
					//Tant que c'est vrai on repete le "do"
			}
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			//ctx.fillStyle = "#ff0000";
			//ctx.fillRect(xCoord, yCoord, 100, 50); //Coord(x,y) et Taille(h,w)
			drawScore();
			snakee.draw(); //L'ordre d'affichage a son importance !
			applee.draw();
			timeout = setTimeout(refreshCanvas, delay); //call function every delay
		}
	}
	
	function gameOver()
	{
		ctx.save(); //Enregistre les param de config du canvas comme il était avant(couleurs...) 
		//on fait nos changement et on remet comme celui d'avant.
		ctx.font = "bold 70px sans-serif";
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		var centreX = canvasWidth / 2;
		var centreY = canvasHeight / 2;
		ctx.strokeText("Game Over !", centreX, centreY - 180);
		ctx.fillText("Game Over !", centreX, centreY - 180);
		
		ctx.font = "bold 30px sans-serif";
		ctx.strokeText("Press space to replay", centreX, centreY - 115);
		ctx.fillText("Press space to replay", centreX, centreY - 115);
		ctx.restore(); 
		
	}
	
	function restart()
	{
		snakee = new Snake([[6,4],[5,4],[4,4], [3,4], [2,4]], "down"); //corps du serpent. Tete 1er elem.
		applee = new Apple([10,10]);
		score = 0;
		clearTimeout(timeout);
		refreshCanvas();	
	}
	
	function drawScore()
	{
		ctx.save();
		ctx.font = "bold 200px sans-serif";
		ctx.fillStyle = "gray";//Choisir la couleur avec laquelle on va écrire
		ctx.textAlign = "center";
		ctx.textBaseline = "middle"; //Afficher le text par rapport a son milieu
		var centreX = canvasWidth / 2;
		var centreY = canvasHeight / 2;
		
		ctx.fillText(score.toString(), centreX, centreY);
		ctx.restore();
	}
	
	function drawBlock(ctx, position)//prend le contexte et la position
	{//le ctx est un carré et les x et y sont par rapport au canvas
		
		// posX du block * taille du block (en px)
		var x = position[0] * blockSize; //Le 1er elem d'Array position
		var y = position[1] * blockSize; //Le 2e elem d'Array position 
		ctx.fillRect(x ,y , blockSize, blockSize); // Remplir un rectangle avec les coord x,y et de largeeur et hauteur de taille 30px;
	}
	
	function Snake(body, direction)
	{
		this.body=body;
		this.direction=direction;
		this.ateApple = false;
		this.draw=function()
		{
			ctx.save(); //Sauvegarder son contenu comme
						//avant de rentrer dans la fonction
			ctx.fillStyle = "#ff0000";
			for(var i=0; i<this.body.length; i++){
				drawBlock(ctx, this.body[i]);
			}
			ctx.restore(); 

		};
	
		this.advance=function()
		{
			//slice() permet de recopier l'elem
			//NextPosition = [6,4]
			//body[0] = 6
			var nextPosition = this.body[0].slice();
			//nextPosition[0] ++;

			switch(this.direction)
			{	
				case "right":
					nextPosition[0] ++;
					break;
				case "left":
					nextPosition[0] --;
					break;
				case "up":
					nextPosition[1] --;
					break;
				case "down":
					nextPosition[1] ++;
					break;
				default:
					throw("Invalid Direction");
			}
			//Rajouter nexPosition qui est [7,4] au body
			this.body.unshift(nextPosition);
			
			if(!this.ateApple)
			{
				this.body.pop();//Supprimer la queue du snake
			}
			else
			{
				this.ateApple = false;
			}
		};
		
		this.setDirection = function(newDirection)
		{
			var allowedDirection;
			switch(this.direction)
			{
				case "left":
				case "right":
					allowedDirection = ["up", "down"];
					break;
				case "up":
				case "down":
					allowedDirection = ["right", "left"];
					break;
				default:
					throw("Invalid Direction");
			}
			if(allowedDirection.indexOf(newDirection) > -1)
			{ //indexOf retourne l'indexe de allowedDirection
			// Il retourne donc 0 ou 1 si la direction est permise.
				this.direction = newDirection;
			}
		};
		
		this.checkCollision = function()
		{
			var wallCollision = false;
			var snakeCollision = false;
			var head = this.body[0];
			var rest = this.body.slice(1);
			var snakeX = head[0];
			var snakeY = head[1];
			var minX = 0;
			var minY = 0;
			var maxX = widthInBlocks - 1;
			var maxY = heightInBlocks - 1;
			var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
			var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
			
			if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
			{
				wallCollision = true; 
			}
			
			for(var i=0; i<rest.length; i++)
			{
				if(snakeX === rest[i][0] && snakeY === rest[i][1])
				{
					snakeCollision = true;
				}
				
			}
			return wallCollision || snakeCollision;
		};
		
		this.isEatingApple = function(appleToEat)//appleToEat en arg pour vérifier si on a plusieurs pommes
		{//permet de verifier une pomme en particulier
			
			var head = this.body[0];
			if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
			{
				return true;
			}
			else
			{
				return false;
			}
		};
		
	} 
	
	function Apple(position) 
	{
		this.position = position;
		this.draw = function()
		{
			ctx.save();
			ctx.fillStyle = "#33cc33";
			ctx.beginPath();
			var radius = blockSize / 2; // Rayon = taille du block /2
			var x = this.position[0]* blockSize + radius;
			var y = this.position[1]* blockSize + radius;
			ctx.arc(x,y, radius, 0, Math.PI*2, true);
			ctx.fill();
			ctx.restore();
		};
		
		this.setNewPosition = function()
		{
			var newX = Math.round(Math.random() * (widthInBlocks -1));	
			var newY = Math.round(Math.random() * (heightInBlocks -1));
			this.position = [newX, newY];
		};
		
		this.isOnSnake = function(snakeToCheck)
		{
			var isOnSnake = false;
			for(var i=0; i<snakeToCheck.body.length; i++)
			{
				if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1])
				{
					isOnSnake = true;
				}
			}
			return isOnSnake;
		};
	}
	
	document.onkeydown = function handleKeyDown(e)
	{
		var key = e.keyCode; //Rend le code de la touche qui a été appuyé
		var newDirection;
		switch(key)
		{
			case 37:
				newDirection = "left";
				break;
			case 38:
				newDirection = "up";
				break;
			case 39:
				newDirection = "right";
				break;
			case 40:
				newDirection = "down";
				break;
			case 32: //touche espace
				restart();
				return;
			default:
				return;
		}
		snakee.setDirection(newDirection);
	}
	
}