let isGameOver = false;

function triggerGameOver() {
    isGameOver = true;

    // Pause the game and show overlay
    const overlay = document.createElement("div");
    overlay.id = "gameOverScreen";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.color = "white";
    overlay.style.fontSize = "48px";
    overlay.style.zIndex = "10000";

    overlay.innerHTML = `
        <div>Game Over</div>
        <button id="restartBtn" style="
            margin-top: 20px; 
            font-size: 24px; 
            padding: 10px 20px; 
            cursor: pointer;
            border-radius: 8px;
            border: none;
            background: #444;
            color: white;
        ">Restart</button>
    `;

    game.appendChild(overlay);

    document.getElementById("restartBtn").onclick = () => {
        // Reset game state
        money = 100;
        moneyDisplay.innerText = `💰 Money: ${money}`;
        playerY = 0;
        isJumping = false;
        jumpVelocity = 0;

        // Remove all obstacles
        obstacles.forEach(obs => game.removeChild(obs));
        obstacles = [];

        // Remove overlay
        game.removeChild(overlay);

        // Resume game
        isGameOver = false;
        gameLoop();
    };
}

let keys = {
    w: false,
    a: false,
    d: false
};

let playerX = 100; // starting horizontal position
let moveSpeed = 9; // horizontal movement speed



const player = document.getElementById("player");
const game = document.getElementById("game");
const moneyDisplay = document.getElementById("money");

let money = 100;
let playerY = 0;
let isJumping = false;
let jumpVelocity = 0;
let gravity = 2;
let jumpStrength = 35;

let obstacles = [];

document.addEventListener("keydown", (e) => {
    if (e.code === "KeyW" && !isJumping) {
        isJumping = true;
        jumpVelocity = jumpStrength;
    }
    if (e.code === "KeyA") keys.a = true;
    if (e.code === "KeyD") keys.d = true;
});

document.addEventListener("keyup", (e) => {
    if (e.code === "KeyA") keys.a = false;
    if (e.code === "KeyD") keys.d = false;
});


function createObstacle() {
    const obs = document.createElement("div");
    obs.classList.add("obstacle");

    let rand = Math.random();
    if (rand < 0.5) {
    // House
    obs.classList.add("house");
    obs.speed = 7;  // was 5
    obs.value = 5;
    } else if (rand < 0.8) {
        // Hotel
        obs.classList.add("hotel");
        obs.speed = 8;  // was 5
        obs.value = 5;
    } else {
        // High-value fast obstacle
        obs.classList.add("hotel");
        obs.speed = 12; // keep it fast
        obs.value = 15;
        obs.style.background = "orange";
        obs.style.borderTop = "5px solid darkorange";
    }


    obs.style.left = game.offsetWidth + "px";
    game.appendChild(obs);
    obstacles.push(obs);
}



function updatePlayer() {
    // Horizontal movement
    if (keys.a) {
        playerX -= moveSpeed;
        if (playerX < 0) playerX = 0; // prevent going off left edge
    }
    if (keys.d) {
        playerX += moveSpeed;
        if (playerX + player.offsetWidth > game.offsetWidth) {
            playerX = game.offsetWidth - player.offsetWidth; // prevent going off right
        }
    }

    // Jump / vertical movement
    if (isJumping) {
        playerY += jumpVelocity;
        jumpVelocity -= gravity;
        if (playerY <= 0) {
            playerY = 0;
            isJumping = false;
        }
    }

    player.style.bottom = 50 + playerY + "px";
    player.style.left = playerX + "px";
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

            // Update display
            moneyDisplay.innerText = `💰 Money: ${money}`;

            // Check for game over
            if (money <= -200) {
                triggerGameOver();
            }
        }

        // Remove if off screen
        if (obsX + obs.offsetWidth < 0) {
            game.removeChild(obs);
            obstacles.splice(index, 1);
        }
    });
}

function gameLoop() {
    if (!isGameOver) {
        updatePlayer();
        updateObstacles();
        requestAnimationFrame(gameLoop);
    }
}


// Spawn obstacles every 2 seconds
setInterval(createObstacle, 2000);

gameLoop();

// ----- STOCK MARKET SYSTEM -----
const canvas = document.getElementById("stockChart");
const ctx = canvas.getContext("2d");

let marketHistory = [100];
let marketValue = 100;
let cashInvested = 0;

function updatePortfolioText() {
    let portfolio = sharesOwned * marketValue;
    document.getElementById("portfolioValue").innerText =
        "Portfolio: $" + Math.round(portfolio);
}


function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw line
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "lime";  // SUPER visible
    for (let i = 0; i < marketHistory.length; i++) {
        let x = (i / (marketHistory.length - 1)) * canvas.width;
        let y = canvas.height - (marketHistory[i] / 200) * canvas.height;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

// Update every second
setInterval(() => {
    let change = (Math.random() - 0.5) * 10;
    marketValue = Math.max(20, marketValue + change);

    marketHistory.push(marketValue);
    if (marketHistory.length > 40) marketHistory.shift();

    updatePortfolioText();
    drawChart();
}, 1000);
let sharesOwned = 0;

document.getElementById("buyBtn").onclick = () => {
    let amountToBuy = Math.floor(money * 0.10); // 10% of cash

    if (amountToBuy > 0) {
        let shares = amountToBuy / marketValue;
        sharesOwned += shares;
        money -= amountToBuy;
        moneyDisplay.innerText = `💰 Money: ${money}`;

        // Check game over
        if (money <= -200) {
            triggerGameOver();
        }
        updatePortfolioText();
    }
};

document.getElementById("sellBtn").onclick = () => {
    if (sharesOwned > 0) {
        let sharesToSell = sharesOwned * 0.10;
        let cashReceived = sharesToSell * marketValue;

        sharesOwned -= sharesToSell;
        money += Math.round(cashReceived);
        moneyDisplay.innerText = `💰 Money: ${money}`;

        // Check game over
        if (money <= -200) {
            triggerGameOver();
        }

        updatePortfolioText();
    }
};


