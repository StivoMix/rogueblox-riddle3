const cooldowns = {};
const spawnedItems = {};

function saveState() {
  const state = {
    player: {
      hp: player.hp,
      lives: player.lives,
      toxicity: player.toxicity,
      temperature: player.temperature,
      inventory: player.inventory,
      currentDir: player.currentDir,
      orbs: player.orbs,
      ribs: player.ribs,
      heart: player.heart,
      ribcage: player.ribcage,
      watch: player.watch,
      blaster: player.blaster,
      coyote: player.coyote,
      hints: player.hints,
      watchTime: player.watchTime,
      unlockedRecipes: player.unlockedRecipes,
      hasteningActive: player.hasteningActive,
      hasteningRemainingTime: player.hasteningRemainingTime,
      turpin: player.turpin,
      ase: player.ase,
      aseActive: player.aseActive,
      leviathanEye: player.leviathanEye
    },
    gameTime: {
      hours: gameTime.hours,
      minutes: gameTime.minutes
    },
    installedFiles: locations["/home/docs"],
    fileContents: files
  };
  localStorage.setItem("rogueSave", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("rogueSave");
  if (saved) {
    const state = JSON.parse(saved);
    Object.assign(player, state.player);
    Object.assign(gameTime, state.gameTime);
    if (state.installedFiles) {
      locations["/home/docs"] = state.installedFiles;
    }
    if (state.fileContents) {
      Object.assign(files, state.fileContents);
    }
    if (state.player.watchTime) {
      player.watchTime = state.player.watchTime;
    }
    if (player.hasteningActive && player.hasteningRemainingTime > 0) {
      const hasteningTimer = setInterval(() => {
        player.hasteningRemainingTime -= 1000;
        if (player.hasteningRemainingTime <= 0) {
          clearInterval(hasteningTimer);
          player.hasteningActive = false;
          player.hasteningRemainingTime = null;
          log("The effects of the hastening elixir have worn off.");
          saveState();
        }
      }, 1000);
    }
    updateInventoryDisplay();
  }
}

function loadTimeSpeed() {
  const savedTimeSpeed = localStorage.getItem("timeSpeed");
  if (savedTimeSpeed) {
    timeSpeed = parseInt(savedTimeSpeed, 10);
    speedTimeButton.textContent = `x${timeSpeed}`;
  }
}