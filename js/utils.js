function log(msg) {
  terminal.innerHTML += `\n> ${msg}`;
  terminal.scrollTop = terminal.scrollHeight;
}

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function crptyString(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) + i);
  }
  return result;
}

function checkTemperatureEffects() {
  const temp = player.temperature;

  if (temp < 15) {
    let damage = 5 + (15 - temp) * 2;
    if (player.leviathanEye) {
      damage = 10
    }
    player.hp -= damage;
    saveState();
    damageSound.play();
    log("You're freezing!");
    if (player.hp <= 0 || temp <= 0) {
      log("You froze to death!");
      player.hp = 0;
      updateHUD();
      return;
    }
  }

  if (temp > 80) {
    let damage = 5 + (temp - 80) * 2;
    if (player.leviathanEye) {
      damage = 10
    }
    player.hp -= damage;
    saveState();
    damageSound.play();
    log("You're burning!");
    if (player.hp <= 0 || temp >= 100) {
      log("You burned to death!");
      player.hp = 0;
      updateHUD();
      return;
    }
  }

  updateHUD();
}

function clearActiveEffects() {
  if (player.hasteningActive) {
    player.hasteningActive = false;
    player.hasteningRemainingTime = null; 
  }

  if (player.healingInterval) {
    clearInterval(player.healingInterval);
    player.healingInterval = null;
  }

  if (player.healthDrainInterval) {
    clearInterval(player.healthDrainInterval);
    player.healthDrainInterval = null;
  }
}

function checkToxicity() {
  if (player.turpin) {
    return;
  } 

  if (player.toxicity >= 100) {
    log("Your toxicity has reached critical levels.");
    player.hp = 0;
    clearActiveEffects();
    updateHUD();
    saveState();
  }
}

function pumpkinJumpscare() {
  const pumpkin = document.createElement("img");
  pumpkin.src = "media/images/pumpkin.png";
  pumpkin.alt = "Pumpkin Jumpscare";
  pumpkin.style.position = "fixed";
  pumpkin.style.top = "50%";
  pumpkin.style.left = "50%";
  pumpkin.style.transform = "translate(-50%, -50%)";
  pumpkin.style.zIndex = "9999";
  pumpkin.style.width = "100vw";
  pumpkin.style.height = "100vh";
  pumpkin.style.objectFit = "cover";
  pumpkin.style.opacity = "1";
  pumpkin.style.transition = "opacity 0.5s ease";
  soundPumpkin.play();

  document.body.appendChild(pumpkin);

  setTimeout(() => {
    pumpkin.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(pumpkin);
    }, 500);
  }, 1000);
}