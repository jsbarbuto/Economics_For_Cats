const player = document.getElementById("player");
const game = document.getElementById("game");
const moneyDisplay = document.getElementById("money");

let money = 100;
let playerY = 0;
let isJumping = false;
let jumpVelocity = 0;
let gravity = 2;
let jumpStrength = 20;

let obstacles = [];

// Space bar jump
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !isJumping) {
        isJumping = true;
        jumpVelocity = jumpStrength;
    }
});

function createObstacle() {
    const obs = document.createElement("div");
    obs.classList.add("obstacle");

    let rand = Math.random();
    if (rand < 0.5) {
        // Regular house
        obs.classList.add("house");
        obs.speed = 5;        // pixels per frame
        obs.value = 5;        // money for landing
    } else if (rand < 0.8) {
        // Regular hotel
        obs.classList.add("hotel");
        obs.speed = 5;
        obs.value = 5;
    } else {
        // High-value obstacle (fast)
        obs.classList.add("hotel");
        obs.speed = 12;       // faster than normal
        obs.value = 15;       // more money
        obs.style.background = "orange";  // visually different
        obs.style.borderTop = "5px solid darkorange";
    }

    obs.style.left = game.offsetWidth + "px";
    game.appendChild(obs);
    obstacles.push(obs);
}



function updatePlayer() {
    if (isJumping) {
        playerY += jumpVelocity;
        jumpVelocity -= gravity;
        if (playerY <= 0) {
            playerY = 0;
            isJumping = false;
        }
    }
    player.style.bottom = 50 + playerY + "px";
}

function updateObstacles() {
    obstacles.forEach((obs, index) => {
        let obsX = parseInt(obs.style.left);
        obsX -= obs.speed;   // use speed property
        obs.style.left = obsX + "px";

        // Collision detection
        let playerRect = player.getBoundingClientRect();
        let obsRect = obs.getBoundingClientRect();

        if (
            playerRect.right > obsRect.left &&
            playerRect.left < obsRect.right &&
            playerRect.bottom > obsRect.top &&
            playerRect.top < obsRect.bottom
        ) {
            // Landing check
            const playerBottom = playerRect.bottom;

            if (playerBottom <= obsRect.top + obsRect.height * 0.5 && jumpVelocity < 0) {
                // Landed successfully
                money += obs.value;
                game.removeChild(obs);
                obstacles.splice(index, 1);
            } else {
                // Hit from side or bottom
                money -= 10;
            }
            moneyDisplay.innerText = `💰 Money: ${money}`;
        }

        // Remove if off screen
        if (obsX + obs.offsetWidth < 0) {
            game.removeChild(obs);
            obstacles.splice(index, 1);
        }
    });
}

function gameLoop() {
    updatePlayer();
    updateObstacles();
    requestAnimationFrame(gameLoop);
}

// Spawn obstacles every 2 seconds
setInterval(createObstacle, 2000);

gameLoop();
