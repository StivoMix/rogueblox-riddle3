function updateHUD() {
  const hpPercentage = Math.max(0, player.hp) / 100;
  const tempPercentage = player.temperature / 100;

    let hpRed, hpGreen;
  if (hpPercentage < 0.5) {
    hpRed = 255;
    hpGreen = Math.floor(hpPercentage * 2 * 255);
  } else {
    hpRed = Math.floor((1 - hpPercentage) * 2 * 255);
    hpGreen = 255;
  }
  const hpColor = `rgb(${hpRed}, ${hpGreen}, 0)`;
  hpBar.style.width = `${Math.max(0, player.hp)}%`;
  hpBar.style.backgroundColor = hpColor;
  toxBar.style.width = `${player.toxicity}%`;
  let tempRed, tempGreen, tempBlue;
  
  if (tempPercentage < 0.5) {
    tempRed = Math.floor(tempPercentage * 2 * 255);
    tempGreen = Math.floor(tempPercentage * 2 * 255);
    tempBlue = 255;
  } else {
    tempRed = 255;
    tempGreen = Math.floor((1 - tempPercentage) * 2 * 255);
    tempBlue = Math.floor((1 - tempPercentage) * 2 * 255);
  }
  const tempColor = `rgb(${tempRed}, ${tempGreen}, ${tempBlue})`;
  tempBar.style.width = `${player.temperature}%`;
  tempBar.style.backgroundColor = tempColor;

  updateInventoryDisplay();

  livesDisplay.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    if (i >= player.lives) {
      heart.classList.add("empty");
    }
    livesDisplay.appendChild(heart);

        if (i === player.lives - 1 && player.ribs.length === 6 && player.lives === 1 && !player.heart) {
      let clickCount = 0;
      heart.style.cursor = "pointer";
            heart.addEventListener("click", () => {
        clickCount++;
        if (clickCount >= 10) {
          player.heart = true;
          saveState();
          soundCollectHeart.play();
          log("Heart collected.");
          updateHUD();
        }
      });
    }
  }

    if (player.ribs.length === 6 && player.lives === 1 && !player.heart && !locations["/home/docs"].includes("heart.txt")) {
    locations["/home/docs"].push("heart.txt");
    files["heart.txt"] = "Follow the instructions of the 2nd riddle's 1st orb. Look for what relates to a heart on the screen.";
    log("heart.txt has been installed into /home/docs.");
  }

    if (player.hp <= 0) {
    soundDeath.play();
    log("You have died.");
    player.lives -= 1;
    clearActiveEffects();
    saveState();
    if (player.lives <= 0) {
      soundWipe.play();
      log("You have wiped. Restarting in 3 seconds...");
      setTimeout(() => {
        localStorage.clear();
        player = {
          hp: 100,
          lives: 3,
          toxicity: 0,
          temperature: 50,
          inventory: [],
          currentDir: "/home",
          orbs: [],
          ribs: [],
          heart: false,
          watch: false,
          hints: {
            orb: {},
            rib: {},
            heart: 3,
            watch: 3
          },
          watchTime: {},
          unlockedRecipes: [],
          hasteningActive : false,
          hasteningRemainingTime : null,
          turpin : false,
          ase : false,
          aseActive : false,
          leviathanEye : false
        };
        gameTime = { hours: 7, minutes: 0 };
        saveState();
        updateHUD();
        input.value = `Roguebloxer@Terra:${player.currentDir}$ `;
        location.reload();
      }, 3000);
    } else {
      log(`You have ${player.lives} lives left.`);
      player.hp = 100;
      player.temperature = 50;
      player.toxicity = 0;
      saveState();
      updateHUD();
    }
  }
}

function updateInputPlaceholder() {
  input.placeholder = `Roguebloxer@Terra:${player.currentDir}$`;
}

function updateInventoryDisplay() {
  const inventoryElement = document.getElementById("inventory");
  if (!inventoryElement) return;

  const itemCounts = {};
  player.inventory.forEach(item => {
    itemCounts[item] = (itemCounts[item] || 0) + 1;
  });

  if (Object.keys(itemCounts).length === 0) {
    inventoryElement.innerHTML = "Inventory: None";
  } else {
    inventoryElement.innerHTML = "<strong>Inventory:</strong><br>";
    Object.entries(itemCounts).forEach(([item, count]) => {
      inventoryElement.innerHTML += count > 1 ? `(${count}x) ${item}<br>` : `${item}<br>`;
    });
  }
}