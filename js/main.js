let biosOptions = ["Prowler OS", "OSric", "Empty 1", "Empty 2", "Save & Exit"];
let selectedOption = 0;
let selectedOS = null;
loadState();

function handleBIOSInput(e) {
  if (biosMenu.style.display === "block") {
    if (e.key === "ArrowUp") {
      selectedOption = (selectedOption - 1 + biosOptions.length) % biosOptions.length;
      showBIOSMenu();
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      selectedOption = (selectedOption + 1) % biosOptions.length;
      showBIOSMenu();
      e.preventDefault();
    } else if (e.key === "Enter") {
      const currentOption = biosOptions[selectedOption];
      soundBiosSelect.play();

      if (currentOption === "Save & Exit") {
        if (selectedOS) {
          biosMenu.style.display = "none";
          clockContainer.style.display = "flex";
          if (selectedOS === "Prowler OS") {
            startBootSequence();
          } else if (selectedOS === "OSric") {
            if (player.coyote && player.ribcage && player.watch) {
              showOsricLogin();
            } else {
              showOsricDenied();
            }
          } else {
            showNoOSFound();
          }
        } else {
          alert("Please select an OS before saving and exiting.");
        }
      } else {
        selectedOS = currentOption;
        showBIOSMenu();
      }
      e.preventDefault();
    }
  }
}

function showBIOSMenu() {
  biosOptionsContainer.innerHTML = "";

  biosOptions.forEach((option, index) => {
    const optionElement = document.createElement("div");
    optionElement.className = "bios-option";
    optionElement.textContent = option;

    if (index === selectedOption) {
      optionElement.classList.add("selected");
    }

    if (option === selectedOS) {
      optionElement.classList.add("highlighted");
    }

    optionElement.addEventListener("click", () => {
      soundBiosSelect.play();
      suppressHoverSound = true;
      if (option === "Save & Exit") {
        if (selectedOS) {
          biosMenu.style.display = "none";
          clockContainer.style.display = "flex";
          if (selectedOS === "Prowler OS") {
            startBootSequence();
          } else if (selectedOS === "OSric") {
            if (player.coyote && player.ribcage && player.watch) {
              showOsricLogin();
            } else {
              showOsricDenied();
            }
          } else {
            showNoOSFound();
          }
        } else {
          alert("Please select an OS before saving and exiting.");
        }
      } else {
        selectedOS = option;
        selectedOption = index;
        showBIOSMenu();
      }
    });

    biosOptionsContainer.appendChild(optionElement);
  });

  biosMenu.style.display = "block";
  clockContainer.style.display = "none";
  isClockPaused = true;

  setTimeout(() => {
    suppressHoverSound = false;
  }, 100);
}

function startBootSequence() {
  if (selectedOS === "Prowler OS") {
    bootSplash.style.display = "flex";
    crtFlick.play();
    bootAmbient.play();
    typeLine();
  } else {
    bootSplash.style.display = "flex";
    crtFlick.play();
    bootAmbient.play();
    typeLine();
  }
}

function showNoOSFound() {
  soundNoOsFound.play();
  clockContainer.style.display = "none";
  noOSMessage.style.display = "block";

  function returnToBIOSMenu() {
    noOSMessage.style.display = "none";
    clockContainer.style.display = "flex";
    showBIOSMenu();
    document.removeEventListener("keydown", returnToBIOSMenu);
  }

  document.addEventListener("keydown", returnToBIOSMenu);
}

document.addEventListener("DOMContentLoaded", () => {
  showBIOSMenu();
  document.addEventListener("keydown", handleBIOSInput);
});

function showOsricLogin() {
  soundOsricBackgroundMusic.play();
  osricOS.classList.add("fade-in");
  osricOS.style.display = "block";
}

function toggleOsricHint() {
  const hint = document.getElementById("osric-hint");
  hint.style.display = hint.style.display === "none" ? "block" : "none";
}

function runEncrypt() {
  const input = document.getElementById("cryptInput").value.trim();
  const result = crptyString(input);
  document.getElementById("cryptOutput").textContent = result || "Encrypted result will appear here.";
}

async function submitOsricPassword() {
  const entered = document.getElementById("osricPassword").value.trim();
  const hashed = await sha256(entered);
  const correctHash = "7e9c10a067d4e5aa49966e31c6a05a6b870101685401cce466b4a4bcd25239df";

  if (hashed === correctHash) {
    osricOS.classList.add("fade-out");
    setTimeout(() => {
      osricOS.style.display = "none";
      soundOsricBackgroundMusic.pause();
      soundOsricCorrectPassword.play();
      showVictoryScreen();
    }, 1500);
  } else {
    soundOsricWrongPassword.play();
    alert("Wrong password. Try again.");
  }
}

function showVictoryScreen() {
  soundRiddle3BackgroundMusic.play();
  const victoryScreen = document.createElement("div");
  victoryScreen.id = "victory-screen";
  victoryScreen.innerHTML = `
  <h1>Congratulations!</h1>
  <p>You've solved Rogueblox Riddle 3!</p>
  <div class="credits">
    <h2>Credits</h2>
    <ul>
      <li><strong>Game Design:</strong> StivoMix</li>
      <li><strong>Programming:</strong> StivoMix</li>
      <li><strong>Animations:</strong> StivoMix</li>
      <li><strong>Sound Effects:</strong> StivoMix</li>
      <li><strong>Music:</strong> StivoMix</li>
      <li><strong>Story:</strong> StivoMix</li>
      <li><strong>Art:</strong> StivoMix</li>
      <li><strong>Testing:</strong> StivoMix</li>
      <li><strong>lucilucid:</strong> lucilucid</li>
      <li><strong>Everything Else:</strong> StivoMix</li>
    </ul>
  </div>
  <div class="flying-images">
    <img src="media/images/prowler.png" class="flying-image" alt="Flying Image 1">
    <img src="media/images/osrichimself.png" class="flying-image" alt="Flying Image 2">
    <img src="media/images/OSRIC.png" class="flying-image" alt="Flying Image 3">
    <img src="media/images/ceromozarella.gif" class="flying-image" alt="Flying Image 4">
    <img src="media/images/fly.png" class="flying-image" alt="Flying Image 5">
    <img src="media/images/togif.gif" class="flying-image" alt="Flying Image 6">
    <img src="media/images/miccat.gif" class="flying-image" alt="Flying Image 7">
    <img src="media/images/alsoosric.png" class="flying-image" alt="Flying Image 8">
    <img src="media/images/collectmyorbs.gif" class="flying-image" alt="Flying Image 9">
    <img src="media/images/stivomix.jpg" class="flying-image" alt="Flying Image 10">
  </div>
`;

  document.body.appendChild(victoryScreen);
  const flyingImages = document.querySelectorAll(".flying-image");
  flyingImages.forEach((img) => {
    let currentX = Math.random() * window.innerWidth;
    let currentY = Math.random() * window.innerHeight;
    let velocityX = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 5 + 5);
    let velocityY = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 5 + 5);

    img.style.left = `${currentX}px`;
    img.style.top = `${currentY}px`;

    function moveImage() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      currentX += velocityX;
      currentY += velocityY;
      if (currentX <= 0 || currentX >= screenWidth - img.offsetWidth) {
        velocityX *= -1;
        currentX = Math.max(0, Math.min(currentX, screenWidth - img.offsetWidth));
      }
      if (currentY <= 0 || currentY >= screenHeight - img.offsetHeight) {
        velocityY *= -1;
        currentY = Math.max(0, Math.min(currentY, screenHeight - img.offsetHeight));
      }
      img.style.left = `${currentX}px`;
      img.style.top = `${currentY}px`;
      requestAnimationFrame(moveImage);
    }
    moveImage();
  });
  victoryScreen.style.display = "flex";
  victoryScreen.classList.add("fade-in");
}

function showOsricDenied() {
  clockContainer.style.display = "none";
  osricDenied.style.display = "block";

  setTimeout(() => {
    soundNoOsFound.play();
    osricDenied.classList.add("fade-in");
  }, 50);

  function returnToBIOSMenu() {
    osricDenied.style.display = "none";
    osricDenied.classList.remove("fade-in");
    clockContainer.style.display = "flex";
    showBIOSMenu();
    document.removeEventListener("keydown", returnToBIOSMenu);
  }

  document.addEventListener("keydown", returnToBIOSMenu);
}

const bootLines = [
  "[BOOT] Prowler OS Kernel v4.9.71-arch starting...",
  "[OK] Initializing Core Modules...",
  "[OK] Detecting Hardware Interfaces...",
  "[OK] Mounting /dev/sda1 (EXT4)...",
  "[OK] Loading System Configuration Files...",
  "[OK] Establishing Network Interfaces...",
  "[OK] Initializing Memory Modules: 8192MB Detected...",
  "[OK] Verifying System Integrity...",
  "[OK] Watchdog Timer: ENABLED",
  "[OK] Loading Device Drivers...",
  "[OK] Synchronizing System Clock...",
  "[WARN] Unauthorized memory access detected... bypassed.",
  "[OK] Decrypting Secure Storage...",
  "[OK] Environment: STABLE | Temp: 37.4°C | Humidity: 45%",
  "[OK] Loading User Profile Data...",
  "[OK] Initializing Health Monitoring Subsystem...",
  "[OK] Toxicity Management System: ACTIVE",
  "[OK] Temperature Regulation System: ACTIVE",
  "[OK] Loading Game World Assets...",
  "[OK] Establishing Player Connection...",
  "[DONE] Boot sequence completed."
];

let currentLine = 0;

bootAmbient.loop = true;
bootAmbient.volume = 0.6;
bootEnd.volume = 1;
crtFlick.volume = 0.8;

function typeLine() {
  const progressBar = document.getElementById("progress-bar");
  const welcomeMessage = document.getElementById("welcome-message");

  if (currentLine < bootLines.length) {
    const line = bootLines[currentLine];
    const color = line.startsWith("[OK]") ? "#00ff9f" : line.startsWith("[WARN]") ? "#ffff00" : line.startsWith("[ERROR]") ? "#ff4d4d" : "#ffffff";
    bootText.innerHTML += `<span style="color: ${color};">${line}</span>\n`;
    currentLine++;

    progressBar.style.width = `${(currentLine / (bootLines.length - 1)) * 100}%`;

    setTimeout(typeLine, 400 + Math.random() * 200);
  } else {
    cursor.style.display = "none";

    bootAmbient.pause();
    bootAmbient.currentTime = 0;
    bootEnd.play();

    setTimeout(() => {
      progressBar.style.width = "100%";
      welcomeMessage.style.display = "block";
      welcomeMessage.classList.add("fade-in");

      setTimeout(() => {
        bootSplash.classList.add("fade-out");

        setTimeout(() => {
          bootSplash.style.display = "none";
          terminal.style.display = "block";
          inputArea.style.display = "block";

          terminal.classList.add("fade-in");
          hud.classList.add("fade-in");
          clockContainer.classList.add("fade-in");
          inputArea.classList.add("fade-in");
          input.focus();
          isClockPaused = false;
          loadTimeSpeed();
          updateHUD();
          log("Welcome to Prowler OS Terminal. Type 'read terminaltutorial.txt' to get started.");
          setInterval(reduceToxicityOverTime, 20000);
          setInterval(updateClock, 5000);
          setInterval(checkTemperatureEffects, 5000);
          setInterval(spawnItems, 25000);
          setInterval(despawnItems, 120000);
          input.value = `Roguebloxer@Terra:${player.currentDir}$ `;
          soundBackgroundMusic.play();
        }, 1500);
      }, 3000);
    }, 1500);
  }
}

let commandHistory = [];
let historyIndex = -1;
let terminalLocked = false;

input.addEventListener("keydown", e => {
  if (terminalLocked) {
    e.preventDefault();
    return;
  }

  if (e.key === "Enter") {
    const val = input.value.replace(`Roguebloxer@Terra:${player.currentDir}$ `, "").trim();
    if (val) {
      log(`Roguebloxer@Terra:${player.currentDir}$ ${val}`);
      processCommand(val);
      commandHistory.push(val);
      historyIndex = commandHistory.length;
    }
    input.value = `Roguebloxer@Terra:${player.currentDir}$ `;
    saveState();
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = `Roguebloxer@Terra:${player.currentDir}$ ${commandHistory[historyIndex]}`;
    }
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = `Roguebloxer@Terra:${player.currentDir}$ ${commandHistory[historyIndex]}`;
    } else {
      historyIndex = commandHistory.length;
      input.value = `Roguebloxer@Terra:${player.currentDir}$ `;
    }
    e.preventDefault();
  }
});

input.addEventListener("input", () => {
  if (!input.value.startsWith(`Roguebloxer@Terra:${player.currentDir}$ `)) {
    input.value = `Roguebloxer@Terra:${player.currentDir}$ `;
  }
});