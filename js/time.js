let isClockPaused = false;

function updateClock() {
  if (isClockPaused) return;
  
  saveState();
  for (let i = 0; i < timeSpeed; i++) {
    gameTime.minutes += 1;
    if (gameTime.minutes >= 60) {
      gameTime.minutes = 0;
      gameTime.hours += 1;
    }
    if (gameTime.hours >= 24) {
      gameTime.hours = 0;
    }
  }

  const isPM = gameTime.hours >= 12;
  const displayHours = gameTime.hours % 12 || 12;
  const formattedTime = `${String(displayHours).padStart(2, "0")}:${String(gameTime.minutes).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
  clock.textContent = formattedTime;
}

speedTimeButton.addEventListener("click", () => {
  if (timeSpeed === 1) {
    timeSpeed = 10;
    speedTimeButton.textContent = "x10";
  } else if (timeSpeed === 10) {
    timeSpeed = 20;
    speedTimeButton.textContent = "x20";
  } else if (timeSpeed === 20) {
    timeSpeed = 30;
    speedTimeButton.textContent = "x30";
  } else if (timeSpeed === 30) {
    timeSpeed = 60;
    speedTimeButton.textContent = "x60";
  } else {
    timeSpeed = 1;
    speedTimeButton.textContent = "x1";
  }
  localStorage.setItem("timeSpeed", timeSpeed);
});

clockContainer.addEventListener("mouseenter", () => {
  if (locations["/home/docs"].includes("watch_hint.txt")) {
    speedTimeButton.style.display = "inline";
  }
});

clockContainer.addEventListener("mouseleave", () => {
  speedTimeButton.style.display = "none";
});

function reduceToxicityOverTime() {
  if (player.toxicity > 0) {
    player.toxicity = Math.max(0, player.toxicity - 5);
    updateHUD();
    saveState();
  }
}