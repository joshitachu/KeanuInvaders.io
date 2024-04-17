//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}


let shipImg;
let shipVelocityX = tileSize; //ship moving speed

//aliens
let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let backgroundIMG;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 1; //alien moving speed

//bullets
let bulletArray = [];
let bulletVelocityY = -10; //bullet moving speed

let alienBulletArray = [];
let alienBulletVelocityY = 5; // Positive for moving down

let score = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial ship
    // context.fillStyle="green";
    // context.fillRect(ship.x, ship.y, ship.width, ship.height);

    //load images
    backgroundIMG= new Image();
    backgroundIMG.src="360_F_206144911_YMXoTjdiJtItcguhyRLyotiZnJ2wkoa9.jpg"
    shipImg = new Image();
    shipImg.src = "./pixel_space_ship_by_freefag12_d9m9jgh-fullview-Photoroom.png-Photoroom.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./original.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    
    if (gameOver) {
        displayGameOver();
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //alien
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //if alien touches the borders
        
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;
                

                //move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;

            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);


        //bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                alienBulletSound.play(); // Add this line to play sound

                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;

            }

        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    alienBulletArray.forEach((bullet, index) => {
        bullet.y += alienBulletVelocityY;
        context.fillStyle = "red"; // Different color for distinction
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Check for collision with the ship
        if (detectCollision(bullet, ship)) {
            gameOver = true; // End the game or reduce the life of the ship
            alienBulletArray.splice(index, 1); // Remove the bullet
        }

        // Remove bullets that go off screen
        if (bullet.y > board.height) {
            alienBulletArray.splice(index, 1);
        }
    });

    

    //next level
    if (alienCount == 0) {
        //increase the number of aliens in columns and rows by 1
        score += alienColumns * alienRows * 100; //bonus points :)
        alienColumns = Math.min(alienColumns + 1, columns/2 -2); //cap at 16/2 -2 = 6
        alienRows = Math.min(alienRows + 1, rows-4);  //cap at 16-4 = 12
        if (alienVelocityX > 0) {
            alienVelocityX += 1; //increase the alien movement speed towards the right
        }
        else {
            alienVelocityX -= 1; //increase the alien movement speed towards the left
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score, 5, 20);
}

function moveShip(e) {
    if (gameOver) {
        if (e.code == "KeyR") {
            location.reload();
        } else if (e.code == "KeyH") {
            window.location.href = "/"; // Adjust URL as needed
        }
        return;
    }


    if ((e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) )  {
        ship.x -= shipVelocityX; //move left one tile

    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; //move right one tile
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
        
    }

    if (e.code == "Space") {     
        shipBulletSound.play(); // Add this line to play sound
        //shoot
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}


function   game(){
    confirm("Do you wish to try again...?");
    
    
}

function timer(){
    var sec = 30;
    var timer = setInterval(function(){
        document.getElementById('safeTimerDisplay').innerHTML='00:'+sec;
        sec--;
        if (sec < 0) {
            clearInterval(timer);
        }
    }, 1000);
}



function displayGameOver() {
    context.clearRect(0, 0, board.width, board.height); // Clear the canvas
    context.fillStyle = "white";
    context.font = "24px Arial";
    context.textAlign = "center";
    context.fillText("Game Over", board.width / 2, board.height / 2);
    context.font = "16px Arial";
    context.fillText("Press R to Retry or H to Go Home", board.width / 2, board.height / 2 + 30);
}

function alienShoot() {
    if (alienArray.length > 0) {
        let shootingAlien = alienArray[Math.floor(Math.random() * alienArray.length)];
        if (shootingAlien.alive) {
            let bullet = {
                x: shootingAlien.x + shootingAlien.width / 2,
                y: shootingAlien.y + shootingAlien.height,
                width: tileSize / 8,
                height: tileSize / 2,
                used: false // Might not be necessary for alien bullets
            };
            alienBulletArray.push(bullet);
        }
    }
}

// Call alienShoot at a regular interval
setInterval(alienShoot, 2000); // Adjust time as needed for game balance

// The rest of your game logic remains the same...



function loadSound(url) {
    let sound = new Audio(url);
    return sound;
}

// Load sounds
let shipBulletSound = loadSound("sounds_shoot.wav");
let alienBulletSound = loadSound('sounds_enemy-death.wav');


shipBulletSound.cloneNode(true).play();
alienBulletSound.cloneNode(true).play();



function left() {
    if (ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    }
}

function right() {
    if (ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

function fire(){

    shipBulletSound.play(); // Add this line to play sound
    //shoot
    let bullet = {
        x : ship.x + shipWidth*15/32,
        y : ship.y,
        width : tileSize/8,
        height : tileSize/2,
        used : false
    }
    bulletArray.push(bullet);
    

}
