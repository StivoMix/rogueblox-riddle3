function processCommand(command) {
  const commands = command.split(/(&&|\|\|)/).map(c => c.trim());
  let lastResult = true;
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd === "&&") {
      if (!lastResult) {
        i++;
      }
      continue;
    } else if (cmd === "||") {
      if (lastResult) {
      }
      continue;
    }
    const parts = cmd.split(" ");
    const baseCmd = parts[0];
    const args = parts.slice(1);
    lastResult = executeCommand(baseCmd, args);
  }
}

function executeCommand(cmd, args) {
  if (player.awaitingCoyoteDecision) {
    if (cmd === "accept") {
      terminalLocked = true;
      log("Blaster added to your inventory.");
      player.inventory.push("blaster");
      updateInventoryDisplay();
      player.awaitingCoyoteDecision = false;
      saveState();
      updateHUD();
      terminalLocked = false;
    } else if (cmd === "deny") {
      terminalLocked = true;
      log("You have denied the power of the coyote. Starrk is displeased.");
      player.hp = 0;
      player.awaitingCoyoteDecision = false;
      saveState();
      updateHUD();
      terminalLocked = false;
    } else {
      const confusedResponses = [
        "What...?",
        "I don't understand. Do you accept or deny my power?",
        "Speak clearly, mortal. Accept or deny.",
        "Your hesitation is unbecoming. Accept or deny my power.",
        "ts pmo icl"
      ];
      const randomResponse = confusedResponses[Math.floor(Math.random() * confusedResponses.length)];
      log(`Starrk: ${randomResponse}`);
    }
    return true;
  }

  if (args.includes("-h")) {
    switch (cmd) {
      case "scan":
        log("Usage: scan [location]\nScans a specified location for items or events.");
        return true;
      case "read":
        log("Usage: read [file]\nReads the content of a specified file in the current directory.");
        return true;
      case "prwlcrypt":
        log("Usage: prwlcrypt [text]\nEncrypts the specified text using the Prowlercryptor.");
        return true;
      case "cd":
        log("Usage: cd [path]\nChanges the current directory to the specified path.");
        return true;
      case "submit":
        log("Usage: submit [code]\nSubmits a code for an objective.");
        return true;
      case "craft":
        log("Usage: craft [item]\nCrafts the specified item.");
        return true;
      case "brew":
        log("Usage: brew [ingredient1] + [ingredient2] + ...\nBrews a potion using the specified ingredients.");
        return true;
      case "use":
        log("Usage: use [item]\nUses the specified item.");
        return true;
      default:
        log("No usage information available for this command.");
        return true;
    }
  }

  switch (cmd) {
    case "help":
      log("Available Commands:");
      Object.entries(commandDescriptions).forEach(([command, description]) => {
        log(`- ${command}: ${description}`);
      });
      log("\nNote: Add '-h' to any command to see its usage (e.g., 'scan -h').");
      return true;

    case "locations":
      log("Scannable Locations:");
      Object.keys(scannableLocations).forEach(location => {
        log(`- ${location}`);
      });
      return true;

    case "scan":
      if (!args.length) {
        log("Usage: scan [location]");
        return false;
      }
    
      const area = args.join(" ").toLowerCase();
      const locationData = scannableLocations[area];
      const parent = locationData.parent;
    
      if (area === "deep tundra" && player.coyote && player.ribcage && !player.watch) {
        const targetHour = player.watchTime?.hour;
        const targetMinute = player.watchTime?.minute;
    
        if (gameTime.hours === targetHour && gameTime.minutes === targetMinute) {
          terminalLocked = true;
          soundScan.play();
          log("Scanning deep tundra...");
          setTimeout(() => {
            soundScan.pause();
            log("You encounter Orion, The Timekeeper.");
            log(`"You are not early. You are not late."`);
            log(`"You are *precisely when* you were meant to be."`);
            log(`"Take this, Walker of Frozen Hours."`);
            log("You have received: Timekeeper’s Watch.");
            player.watch = true;
            saveState();
            updateHUD();
            terminalLocked = false;
          }, 3000);
        } else {
          log("The Timekeeper is not here. Try again at the correct time.");
        }
        return true;
      }
    
      if (!locationData) {
        log(`Cannot scan ${area}. Location not found.`);
        return false;
      }
    
      if (area === "deep desert" && player.orbs.length === 6 && !player.coyote && !player.blaster) {
        terminalLocked = true;
        soundScan.play();
        log("Scanning deep desert...");
        setTimeout(() => {
          soundScan.pause();
          log("You encounter Starrk, the Coyote Trainer.");
          log(`"Impressive, you've collected my plasma orbs. Now you're truly worthy of my power. Do you deny it or accept the power of the coyote?"`);
          log("Type 'accept' to gain the power of the coyote or 'deny' to refuse it.");
          player.awaitingCoyoteDecision = true;
          saveState();
          terminalLocked = false;
        }, 3000);
        return true;
      }

      if (area === "graveyard") {
        if (isOnCooldown(area)) {
          log(`You cannot scan ${area} yet. Please wait.`);
          return false;
        }
        let scanDuration = 3000;
        if (player.hasteningActive) {
          scanDuration = Math.floor(scanDuration / 2);
        }
        soundScan.play();
        log(`Scanning ${area} in ${parent}...`);
        terminalLocked = true;
      
        setTimeout(() => {
          soundScan.pause();
          const lurkerAttack = Math.random() < 0.25;
          if (lurkerAttack) {
            soundLurkerAttack.play();
            log("A lurker attacks you!");
            if (player.leviathanEye) {
              player.hp = Math.max(0, player.hp - 10);
            } else {
              player.hp = Math.max(0, player.hp - 40);
            }
            if (player.hp <= 0) {
              log("You have been eaten by the lurker...");
            } else {
              damageSound.play();
              log("You managed to escape, but you're injured.");
            }
            updateHUD();
          } else {
            const items = spawnedItems[area] || [];
            if (items.length > 0) {
              items.forEach(item => {
                if (!player.inventory.includes(item.name)) {
                  player.inventory.push(item.name);
                  updateInventoryDisplay();
                  log(`You found ${item.name} in the graveyard.`);
                } else {
                  log(`You found ${item.name}, but you already have it.`);
                }
              });
              spawnedItems[area] = [];
            } else {
              log("You found nothing in the graveyard.");
            }
          }
          const cooldownDuration = player.hasteningActive ? Math.floor(5000 / 2) : 5000;
          setCooldown(area, cooldownDuration);
          terminalLocked = false;
        }, 3000);
      
        return true;
      }
    
      const extremeAreas = ["tundra", "deep tundra", "volcano", "deep desert", "frostfalls"];
      const extremeCooldownKey = "extreme_areas";
    
      let scanDuration = 3000;
      let tempShift = 0;
    
      if (extremeAreas.includes(area) || (parent && extremeAreas.includes(parent))) {
        if (isOnCooldown(extremeCooldownKey)) {
          log(`You cannot scan ${area} yet. Extreme areas are on cooldown. Please wait.`);
          return false;
        }
    
        switch (area) {
          case "tundra":
            scanDuration = 7000;
            tempShift = -10;
            break;
          case "frostfalls":
            scanDuration = 7500;
            tempShift = -15;
            break;
          case "deep tundra":
            scanDuration = 8500;
            tempShift = -20;
            break;
          case "deep desert":
            scanDuration = 7000;
            tempShift = 10;
            break;
          case "volcano":
            scanDuration = 10000;
            tempShift = 25;
            break;
        }
    
        if (player.hasteningActive) {
          scanDuration = Math.floor(scanDuration / 2);
        }
    
        terminalLocked = true;
        soundScan.play();
        soundScan.addEventListener("ended", function repeatScanSound() {
          soundScan.currentTime = 0;
          soundScan.play();
        });
        log(`Scanning ${area}${parent ? ` in ${parent}` : ""}... This will take longer due to extreme conditions.`);
        setTimeout(() => {
          soundScan.pause();
          player.temperature += tempShift;
          player.temperature = Math.max(0, Math.min(100, player.temperature));
          const items = spawnedItems[area] || [];
          if (items.length > 0) {
            items.forEach(item => {
              if (!player.inventory.includes(item.name)) {
                player.inventory.push(item.name);
                updateInventoryDisplay();
                log(`You found ${item.name} in ${area}${parent ? ` in ${parent}` : ""}.`);
              } else {
                log(`You found ${item.name}, but you already have it.`);
              }
            });
            spawnedItems[area] = [];
          } else {
            log(`You found nothing in ${area}.`);
          }
          log(`Your temperature has shifted to ${player.temperature}°.`);
          saveState();
          updateHUD();
          terminalLocked = false;
        }, scanDuration);
    
        const cooldownDuration = player.hasteningActive ? Math.floor(60000 / 2) : 60000;
        setCooldown(extremeCooldownKey, cooldownDuration);
        return true;
      }
    
      if (isOnCooldown(area)) {
        log(`You cannot scan ${area} yet. Please wait.`);
        return false;
      }
    
      if (player.hasteningActive) {
        scanDuration = Math.floor(scanDuration / 2);
      }
      
      soundScan.play();
      log(`Scanning ${area}${parent ? ` in ${parent}` : ""}...`);
      terminalLocked = true;
      setTimeout(() => {
        soundScan.pause();
        const items = spawnedItems[area] || [];
        if (items.length > 0) {
          items.forEach(item => {
            if (!player.inventory.includes(item.name)) {
              player.inventory.push(item.name);
              updateInventoryDisplay();
              log(`You found ${item.name} in ${area}${parent ? ` in ${parent}` : ""}.`);
            } else {
              log(`You found ${item.name}, but you already have it.`);
            }
          });
          spawnedItems[area] = [];
        } else {
          log(`You found nothing in ${area}.`);
        }
        terminalLocked = false;
      }, scanDuration);
    
      const cooldownDuration = player.hasteningActive ? Math.floor(5000 / 2) : 5000;
      setCooldown(area, cooldownDuration);
      return true;

    case "status":
      log(`HP: ${player.hp} | Lives: ${player.lives} | Temp: ${player.temperature} | Tox: ${player.toxicity}`);
      return true;

    case "brew":
      if (!args.length) {
        log("Usage: brew [ingredient1] + [ingredient2] + ...");
        return false;
      }
    
      const ingredients = args.join(" ").split("+").map(item => item.trim().toLowerCase());
    
      if (ingredients.length === 0) {
        log("You must specify at least one ingredient.");
        return false;
      }
    
      const missingItems = ingredients.filter(item => !player.inventory.includes(item));
      if (missingItems.length > 0) {
        log(`You are missing the following ingredients: ${missingItems.join(", ")}.`);
        return false;
      }
    
      const potionRecipes = {
        "potion of healing": ["mushroom", "mushroom", "mushroom"],
        "melting potion": ["lava flower"],
        "freezing potion": ["winterleaf"],
        "hastening elixir": ["crystal", "crystal"],
        "neutralizing potion": ["solar bloom"]
      };
    
      let matchedPotion = null;
      for (const [potion, requiredIngredients] of Object.entries(potionRecipes)) {
        const sortedIngredients = [...ingredients].sort();
        const sortedRequired = [...requiredIngredients].sort();
    
        if (JSON.stringify(sortedIngredients) === JSON.stringify(sortedRequired)) {
          matchedPotion = potion;
          break;
        }
      }
    
      if (matchedPotion) {
        if (!player.unlockedRecipes.includes(matchedPotion.replace(/ /g, " "))) {
          log("The brew failed. The recipe is unknown to you.");
          return handleFailedBrew(ingredients);
        }
    
        log(`Brewing ${matchedPotion}...`);
        setTimeout(() => {
          const requiredIngredients = potionRecipes[matchedPotion];
          requiredIngredients.forEach(item => {
            const index = player.inventory.indexOf(item);
            if (index !== -1) {
              player.inventory.splice(index, 1);
            }
          });
          updateInventoryDisplay();
    
          player.inventory.push(matchedPotion);
          updateInventoryDisplay();
          saveState();
          log(`${matchedPotion} brewed successfully!`);
          soundBrewing.play();
          updateHUD();
        }, 2000);
        return true;
      } else {
        log("The brew failed. The ingredients did not match any known recipe.");
        return handleFailedBrew(ingredients);
      }

    case "craft":
      if (!args.length) {
        log("Usage: craft [item]");
        return false;
      }
    
      const craftItemToCraft = args.join(" ").toLowerCase();
    
      if (craftItemToCraft === "ribcage") {
        if (player.ribs.length === 6 && player.heart && !player.ribcage) {
          log("Crafting the ribcage...");
          setTimeout(() => {
            player.ribcage = true;
            saveState();
            log("Ribcage crafted successfully! You now possess its power.");
            soundCrafting.play();
            updateHUD();
            checkWatchObtainment();
          }, 2000);
        } else if (player.ribcage) {
          log("You already possess the ribcage.");
        } else {
          log("You need all 6 ribs and the heart to craft the ribcage.");
        }
        return true;
      }
    
      log(`Unknown item: ${craftItemToCraft}.`);
      return false;

    case "music":
      if (!soundBackgroundMusic.paused) {
        soundBackgroundMusic.pause();
        log("Background music has been turned off.");
      } else {
        soundBackgroundMusic.play();
        log("Background music has been turned on.");
      }
      return true;

    case "recipe":
      if (player.unlockedRecipes.length === 0) {
        log("You have no unlocked recipes.");
      } else {
        log("Unlocked Recipes:");
        player.unlockedRecipes.forEach(recipeKey => {
          const recipe = spawnableItems.find(item => item.name === `${recipeKey} recipe`);
          if (recipe) {
            log(`- ${recipeKey.replace(/_/g, " ")}: ${recipe.text}`);
          }
        });
      }
      return true;

      case "checklist":
        log("Checklist:");
        if (player.orbs.length > 0) {
          log("Collected Orbs:");
          player.orbs.forEach((orb) => {
            log(`- Orb ${orb.key}: ${orb.code}`);
          });
        } else {
          log("No orbs collected yet.");
        }
        if (player.ribs.length > 0) {
          log("Collected Ribs:");
          player.ribs.forEach((rib) => {
            log(`- Rib ${rib.key}: ${rib.code}`);
          });
        } else {
          log("No ribs collected yet.");
        }
        return true;

    case "cd":
      if (!args.length) {
        log("Usage: cd [path]");
        return false;
      }
      const targetDir = args[0];
      if (targetDir === ".") {
        player.currentDir = "/home";
        log(`Directory: ${player.currentDir}`);
        return true;
      } else if (targetDir === "..") {
        const parentDir = player.currentDir.split("/").slice(0, -1).join("/") || "/home";
        player.currentDir = parentDir;
        log(`Directory: ${player.currentDir}`);
        return true;
      } else if (locations[targetDir]) {
        player.currentDir = targetDir;
        log(`Directory: ${player.currentDir}`);
        return true;
      } else {
        log("Invalid path.");
        return false;
      }

    case "cls":
      terminal.innerHTML = "";
      log("Welcome to Prowler OS Terminal. Type 'read terminaltutorial.txt' to get started.");
      return true;

    case "tree":
      Object.keys(locations).forEach(dir => {
        log(`${dir}/`);
        locations[dir].forEach(f => log(`  - ${f}`));
      });
      return true;

    case "read":
      if (!args.length) {
        log("Specify a file.");
        return false;
      }
      const file = args.join(" ");
      if (locations[player.currentDir]?.includes(file)) {
        soundReadCommand.play();
        log(`-- ${file} --\n${files[file] || "(empty)"}`);
        return true;
      } else {
        log("File not found.");
        return false;
      }

    case "prwlcrypt":
      if (!args.length) {
        log("Usage: prwlcrypt [text]");
        return false;
      }
      log(crptyString(args.join(" ")));
      return true;

    case "submit":
      handleSubmit(args.join(" "));
      return true;

    case "use":
      if (!args.length) {
        log("Usage: use [item]");
        return false;
      }
    
      const item = args.join(" ").toLowerCase();
      if (!player.inventory.includes(item)) {
        log(`You don't have ${item} in your inventory.`);
        return false;
      }

      if (item.endsWith(" potion") || item.endsWith(" elixir") || item.startsWith("potion") && !item.endsWith(" recipe")) {
        usePotion(item);
        return true;
      }

      if (item.endsWith(" recipe")) {
        const recipeKey = item.replace(" recipe", "");
        if (!player.unlockedRecipes.includes(recipeKey)) {
          soundInstallFile.play();
          player.unlockedRecipes.push(recipeKey);
          log(`You have unlocked the recipe for ${recipeKey}.`);
          const index = player.inventory.indexOf(item);
          if (index !== -1) {
            player.inventory.splice(index, 1);
          }
          updateInventoryDisplay();
          saveState();
          updateHUD();
        } else {
          log(`You already have the recipe for ${recipeKey}.`);
        }
        return true;
      }

      if (item === "blaster") {
        log("Using the Blaster...");
        setTimeout(() => {
          player.coyote = true;
          saveState();
            const wasMusicPlaying = !soundBackgroundMusic.paused;
            if (wasMusicPlaying) {
            soundBackgroundMusic.pause();
            }
            videoAttainCoyote.style.position = "fixed";
            videoAttainCoyote.style.top = "0";
            videoAttainCoyote.style.left = "0";
            videoAttainCoyote.style.width = "100vw";
            videoAttainCoyote.style.height = "100vh";
            videoAttainCoyote.style.zIndex = "1000";
            videoAttainCoyote.style.opacity = "1";
            videoAttainCoyote.style.display = "block";
            videoAttainCoyote.play();
            videoAttainCoyote.onended = () => {
            videoAttainCoyote.style.display = "none";
            videoAttainCoyote.style.position = "";
            videoAttainCoyote.style.top = "";
            videoAttainCoyote.style.left = "";
            videoAttainCoyote.style.width = "";
            videoAttainCoyote.style.height = "";
            videoAttainCoyote.style.zIndex = "";
            videoAttainCoyote.style.opacity = "";

            if (wasMusicPlaying) {
              soundBackgroundMusic.play();
            }
            };
          log("You and the blaster are one.");
          const index = player.inventory.indexOf("blaster");
          if (index !== -1) {
            player.inventory.splice(index, 1);
          }
          updateInventoryDisplay();
          updateHUD();
          checkWatchObtainment();
        }, 2000);
        return true;
      }
    
      const hint = spawnableItems.find(i => i.name === item && i.name.includes("hint"));
      if (hint) {
        const fileName = `${item}.txt`;
        if (!locations["/home/docs"].includes(fileName)) {
          soundInstallFile.play();
          locations["/home/docs"].push(fileName);
          files[fileName] = hint.text;
          log(`${item} has been installed into /home/docs as ${fileName}.`);
          const index = player.inventory.indexOf(item);
          if (index !== -1) {
            player.inventory.splice(index, 1);
          }     
          updateInventoryDisplay();
          saveState();
          updateHUD();
        } else {
          log(`${item} is already installed in /home/docs.`);
        }
        return true;
      }

      const relics = ["life crystal", "lihzahrd's soul", "leviathan eye", "all seeing eye", "moonshine"];
      if (relics.includes(item)) {
        log(`Using ${item}...`);
        setTimeout(() => {
          if (item === "life crystal") {
            if (player.lives >= 3) {
              log("You already have the maximum number of lives.");
              return false;
            } else {
              player.lives += 1;
              log("You have gained a life.");
            }
          } else if (item === "lihzahrd's soul") {
            if (player.hasteningActive) {
              log("You already have the power of the Lihzahrd's Soul (or you're under the effect of a hastening elixir).");
              return false;
            } else {
              player.hasteningActive = true;
              log("You have gained the power of the Lihzahrd's Soul. You're now twice as fast.");
            }
          } else if (item === "leviathan eye") {
            if (player.leviathanEye) {
              log("You already have the power of the Leviathan Eye.");
              return false;
            } else {
              player.leviathanEye = true;
              log("You have gained the power of the Leviathan Eye. All damage you take will now be set to 10.");
            }
          } else if (item === "all seeing eye") {
            if (player.ase) {
              log("You already have the power of the All Seeing Eye.");
              return false;
            } else {
              player.ase = true;
              player.aseActive = true;
              commandDescriptions["ase"] = "Toggles the All Seeing Eye, revealing item spawns in the terminal.";
              log("You have gained the power of the All Seeing Eye. You can now see item spawns in the terminal. (use command ase to toggle.)");
            }

          } else if (item === "moonshine") {
            const chooseableRelics = ["life crystal", "lihzahrd's soul", "leviathan eye", "all seeing eye"];
            while (true) {
              const relicChoice = prompt("Choose a relic:\n- life crystal\n- lihzahrd's soul\n- leviathan eye\n- all seeing eye").toLowerCase();
              if (chooseableRelics.includes(relicChoice)) {
                player.inventory.push(relicChoice);
                log(`You have chosen ${relicChoice}.`);
                break;
              }
            }
          }
      
          const index = player.inventory.indexOf(item);
          if (index !== -1) {
            player.inventory.splice(index, 1);
          }
      
          updateInventoryDisplay();
          saveState();
          updateHUD();
        }, 2000);
        return true;
      }

    case "reset":
      terminalLocked = true;
      localStorage.clear();

      player.hp = 100;
      player.lives = 3;
      player.toxicity = 0;
      player.temperature = 50;
      player.inventory = [];
      player.currentDir = "/home";
      player.orbs = [];
      player.ribs = [];
      player.heart = false;
      player.ribcage = false;
      player.watch = false;
      player.blaster = false;
      player.coyote = false;
      player.hints = {
        orb: {},
        rib: {}
      };
      player.watchTime = {};
      player.unlockedRecipes = [];
      player.awaitingCoyoteDecision = false;
      player.hasteningActive = false;
      player.hasteningRemainingTime = null;
      player.turpin = false;
      player.ase = false;
      player.aseActive = false;
      player.leviathanEye = false;

      gameTime.hours = 7;
      gameTime.minutes = 0;

      Object.assign(files, {
        "terminaltutorial.txt": `
╔══════════════════════════════════════════════╗
║        Welcome to Prowler OS Terminal         ║
╚══════════════════════════════════════════════╝

Welcome, Roguebloxer.

You have been granted access to Prowler OS — a lightweight, secure terminal environment designed for deep-scan reconnaissance, encrypted file management, and multi-layered exploration across the world of Terra.

➤ Best Viewed in Fullscreen Mode
To ensure maximum immersion and functionality, we recommend playing in full screen.

─────────────────────────────────────── > Getting Started

Type help to display a full list of available commands. Most commands accept arguments — learn to use them. For example:

scan whispering woods
cd /home/docs
read terminaltutorial.txt
Arguments are passed after the command name. Spaces and case matter.

─────────────────────────────────────── > Directories and Navigation

In order to read files, you need to navigate to the correct directory. Use the cd command to change directories.
Use cd [path] to enter a directory.
Use cd .. to go back to the parent directory.
Use cd . to go back to the home directory.
Use read [filename] to open and read a file.
Use tree to view all available directories and the substructure in a clean tree-like display.

─────────────────────────────────────── > Logical Chaining

You can chain commands:

&& runs the current command only if the previous command succeeds.

|| runs the current command even if the previous one fails.

Example:

scan Tundra || cd /home/docs && read orb4hint1.txt
─────────────────────────────────────── > For everything else, use the help command. Trust the system. It wants you to learn.

Instead of repeating commands, you can use your arrow keys to scroll through your command history.
I recommend you read the files in the /home/docs directory. They contain valuable information about your mission and the world of Terra.
Especially the game.txt file.
`,
        "game.txt": `
╔════════════════════════════════════════════╗ 
║      Prowler OS: Survival Protocols         ║ 
╚════════════════════════════════════════════╝

Welcome, Roguebloxer.

You have been dropped into an unstable world where frost bites harder than death, relics breathe, and old technologies whisper secrets long lost.

─────────────────────────────────────── > What is your goal?

Survive. Discover. Awaken something long forgotten.

The OS will not tell you your purpose directly — it is something you must infer through action.

You are tasked with gathering:

6 Plasma Orbs – to prove yourself worthy of something greater.

6 Rib Fragments and a Heart – to reconstruct a forbidden relic.

A Watch – a timebound artifact whose method of obtainment is... cryptic.

─────────────────────────────────────── > Scanning & Exploration

Use scan [area] to investigate an environment. Occasionally, items will be added to your inventory after scanning.

There are different types of items you can find:
- Hints for the Orbs and Ribs (e.g., orb1hint1, rib1hint1) which can be installed into /home/docs by using the "use [item]" command.
- Ingredients for brewing potions (e.g., mushroom, crystal, lava flower) by using the "brew [ingredients]" command.
- Potion Recipes (e.g., potion of healing recipe, melting potion recipe) which can be added to your unlocked recipes by using the "use [item]" command.
- Relics (e.g., life crystal, moonshine) which can be used to enhance your abilities or grant you new powers by using the "use [item]" command.
- Potions (e.g., hastening elixir, freezing potion) which can be used to gain temporary advantages by using the "use [item]" command.

Each area and subarea may yield different results. Some are empty. Some are fatal.

─────────────────────────────────────── > Locations?

Type locations to view all known places and their respective subzones. Each area holds keys to progress — lore, ingredients, danger, and opportunity.

─────────────────────────────────────── > Systems to Monitor

HP: You die if it hits 0. Simple.

Toxicity: Increases when consuming potions. Decreases slowly over time. Overdose = death.

Temperature: Cold and heat affect survival in Tundra/Volcano zones. Craft warming or cooling potions.

Inventory: Items you carry. Some are relics, some are tools.

You have 3 lives total. Lose them all and the OS resets your memory. You can get them back by using a life crystal.

─────────────────────────────────────── > Submitting Findings

Found a hint and thought of a possible code? Use submit [code] to log it.

Each orb has a unique code. Each rib fragment too. Submit them to progress.

─────────────────────────────────────── > What Happens When…

All 6 Orbs collected? You become Worthy of the Coyote, you might want to scan the deep desert.

All 6 Ribs + Heart collected? You may Craft the Ribcage using craft ribcage.

Once both are achieved... something stirs.

─────────────────────────────────────── > The Watch...

Some say time bends for those who have nothing left to prove. That's all we can say.

─────────────────────────────────────── > And then... OSric.

Once everything is gathered — the Orbs, the Ribcage, the Watch — and submitted, you may find a new option waiting in your BIOS menu.

Its name... is OSric. But entry is not granted easily.  

─────────────────────────────────────── > Additional Information

You can use the help command to view all available commands and their descriptions.
You read all the current files in the /home/docs directory. They contain valuable information about your mission and the world of Terra.
`,
        "hintstut.txt": `
╔════════════════════════════════════════════╗
║       Understanding the Hint System         ║
╚════════════════════════════════════════════╝

Welcome, Roguebloxer.

The world you traverse is riddled with secrets — none of which are spoken plainly.

To uncover them, you must harness hints and knowledge.

─────────────────────────────────────── > How It Works

The path to codes (Orbs, Ribs) lies in knowledge, not guessing.

You do not simply submit a code.
You must unlock its hint first.
─────────────────────────────────────── > Unlocking Hints

Hints occasionaly spawn in the wild. They are not guaranteed.
They are not always easy to find.

When you scan an area, you may find a hint. It will be added to your inventory.
In order to install and read the hint, you must use the "use" command followed by the hint name and number.
Hints are named in the format "orbXhintY" or "ribXhintY".
Some orbs and ribs have multiple hints, so make sure to check your inventory for all available hints.
(Though, in order to submit a code, you only need to unlock one hint for that object.)
After installing a hint, you may find it within /home/docs, in a file named "orbXhintY.txt" or "ribXhintY.txt".
Within the files, you will find clues to the codes you need to submit.

─────────────────────────────────────── > Example

scan tundra
"You found orb1hint1 in tundra."
use orb1hint1
"Installing orb1hint1..."
"orb1hint1.txt added to your /home/docs directory."
read orb1hint1.txt

─────────────────────────────────────── > Hints ≠ Solutions

Hints are clues. You must interpret them. Sometimes they reference people, classes, or lore.
Search /home/docs for pre-installed knowledge files — lorebooks and recovered data. Use these to decode the truth behind the hints.

─────────────────────────────────────── > You Cannot Submit Without Hints

The OS only allows you to submit [code] after you've unlocked at least one hint for that object.
Why? This prevents brute force. Knowledge must come first.

─────────────────────────────────────── > Knowledge is power. Interpretation is survival.

Install your hints. Study them. Then submit what you believe is true.
`,
        "relics.txt": `
╔══════════════════════════════════════════╗
║              Relic Catalogue              ║
╚══════════════════════════════════════════╝

Some relics are whispered of in lore — forgotten artifacts said to bend the rules of mortality.

Here are the few confirmed to exist:

───────────────────────────────────────
• Life Crystal  
  ➤ Restores 1 lost life upon use.  
  ➤ Can't give you an extra life.
  ➤ “A heart-shaped crystal that grants you a life.”

───────────────────────────────────────
• Lihzahrd’s Soul  
  ➤ An ancient essence gotten within a great lihzahrd.
  ➤ Doubles player movement and scan speed.  
  ➤ “Who needs this when we have wsage? - idk”

───────────────────────────────────────
• Moonshine  
  ➤ The ultimate relic.  
  ➤ Once used, you may obtain any relic of your choice at will.  
  ➤ One use. One choice. Use wisely.

───────────────────────────────────────
• Leviathan Eye  
  ➤ Sets all incoming damage to a flat 10% of total health.
  ➤ Effective against high damage enemies and environmental hazards.
  ➤ Uneffective against tick damage (closely an instant death in most cases).

───────────────────────────────────────
• All-Seeing Eye  
  ➤ Reveals every item spawn across the map and their exact location.  
  ➤ Relays this information upon scanning.  
  ➤ Vital for efficient play, tracking, and hoarding.
  ➤ Can be toggled at any time using the unlocked "ase" command.

───────────────────────────────────────
Handle relics with reverence.  
Some may save you.  
Others may *change* you.
NOTE: Once you equip a relic, it cannot be removed. Choose wisely.
`,
        "riddlehistory.txt": `
╔═════════════════════════════════════════════════════╗
║        THE HISTORY OF THE ROGUEBLOX RIDDLES          ║
╚═════════════════════════════════════════════════════╝

The tale of the Rogueblox Riddles is not simply a history...  
It's a legacy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RIDDLE 1: "The Encrypting Prowler"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The first recorded riddle was cryptic, raw, and largely ignored.  
A simple file passed around anonymously. Few opened it.  
Fewer trusted it.

It told the story of a rogue Prowler, 
who diverged from his bloodline’s ways to master the art of encryption.

This Prowler, known only as “the encrypting one,”  
created a method of scrambling strings:  
an algorithm based on character positions.  

He encrypted his own Rogueblox account’s password twice,
and left the result hidden inside his digital trail.

The encryption method, now called Prowlercrypting,
adds the index of each character's position in a string to its ASCII value.  
For example:  
  abc becomes ace

This logic is now built into modern systems as:  
➤ prwlcrypt [string]

Few solved this first trial. Most didn’t even try.  
But one did:  
  ──── machi11hero
  Solved in under a minute. A legend born in silence.

The answer was:
IloveCOYOTE2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RIDDLE 2: "Collect My Plasma Orbs"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

One day later, StivoMix returned.  
This time: prepared.  
This time: ready.

The second riddle was born as a glowing page filled with six green plasma orbs.  
The task:  
"Collect my plasma orbs."

Each orb required a unique code to unlock —  
obtained through hints, logic, lore... and mystery.

• Orb 1 was different.  
  A trick orb. Clicking it 10 times revealed the code.  
  Players had to think outside the orb.

• Orbs 2–6 were deeper.  
  Referencing Rogueblox classes, lore figures, and environmental details.  
  Each hint narrowed the path.  
  Each orb: a fragment of the truth.

Once all orbs were collected, the final challenge arrived:

  → Take the orbs’ final characters.  
  → Reverse their order.  
  → Encrypt the result using the Prowlercryptor.

Only then would access be granted.
To which the answer was:
ene[Wz'3M

Riddle 2's success was highly dependant on the players whom believed they would get tester for it,
but when they found out the truth, they weren't disappointed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The riddles became more than puzzles.  
They became trials of knowledge, insight, and legacy.

And for those just beginning...

  The riddles await.  
`,
        "races.txt": `
╔════════════════════════════════════════════╗
║           AN INTRODUCTION TO RACES          ║
╚════════════════════════════════════════════╝

In the world of Rogueblox, each adventurer is born with a race.  
Your race determines more than your looks —  
it defines your ancestry, your strengths, and in some cases... your destiny.

• Human – The most intelligent and adaptable race.
• Apex – Monkey-like beings with primal instincts, climb walls twice as fast.
• Elf – Graceful beings with sharp ears and mana affinity.  
• Florian – Plant-like humanoids, often peaceful, yet mysterious.  
• Goblin – Green-skinned greedy tricksters with clever minds.  
• Cactorian – Thorn-covered and desert-born. Tough and spiky.  
• Lihzahrd – Agile reptilians whom run on all 4's.
• Avian – Feathered folk.
• Phantom – Biggest earrapists in existance, they also get an extra life.  
• Robokid – Tech-born beings made of gears and wires. Rare and precise.  
• Nomad – Share a common ancestor with the Avian race, weird birds.  
• Hylotl – Pk infinite glide...
• Dwarf – 4'9 feet short creatures who have crazy drip.  
• Kaioshin – BOOGIE WOOGIE.  
• Orc – Brutal warriors. Thick-skinned and fearsome.  
• Novakid – Sunborn creatures whom gain advantage in sunlight.
• Turpin – The only race unobtainable through regular means, a pumpkin race 
obtained through drinking the hallow potion.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REROLLING YOUR RACE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your race is decided at birth... but change is possible.  
There are 3 ways to reroll your race:

  1. Race Reroll – Occasionally given out through codes.  
  2. Robux Purchase – Reroll directly via purchasing for 75 robux.  
  3. ROPLEK –  
     Seek him under the broken bridge, left of the Tundra entrance.  
     For 1000 silver, he’ll spin fate again.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 
Some races grant power.  
Some grant story.
All grant identity.
`,
        "classes.txt": `
╔══════════════════════════════════════════════════╗
║             ✦ CLASS DATABASE - ARCHIVED ✦        ║
╚══════════════════════════════════════════════════╝

Classes in Rogueblox are more than power...  
They are a reflection of path, ideology, and sacrifice.

Each class is divided into three tiers:
BASE → SUPER → ULTRA  
Some paths branch. Some betray.

━━━━━━━━━━━━━━━━━━━━━━━
⚔ BASE CLASSES
━━━━━━━━━━━━━━━━━━━━━━━

• Fighter (Fists)
  ➥ Balanced melee specialist. Basic fighter.
  
• Swordsman (Sword)
  ➥ The path of steel and honor. Standard sword-wielder.
  
• Rogue (Dagger)
  ➥ Quick, stealthy, and silent. Uses speed over strength.

• Gunman (Gun)
  ➥ Long-range class. Primitive firearms and quick shots.

• Mage (Magic)
  ➥ Wields raw mana energy. Fragile but destructive.

• Alchemist (Alchemy)
  ➥ Masters of potions and mixtures.

• Spearsman (Spear)
  ➥ Distance melee fighter. Swift and piercing.

• Bard (Music)
  ➥ Uses instruments to support allies or hinder enemies.

━━━━━━━━━━━━━━━━━━━━━━━
✪ FIST PATHS
━━━━━━━━━━━━━━━━━━━━━━━

Fighter →  
    • Brawler (Chaotic Super) → Superhuman (Chaotic Ultra)  
    • Sage (Orderly Super) → Worldsage (Orderly Ultra)  
        ↳ Tortured (Chaotic Ultra via Orderly betrayal (and suffering))

━━━━━━━━━━━━━━━━━━━━━━━
✪ SWORD PATHS
━━━━━━━━━━━━━━━━━━━━━━━

Swordsman →  
    • White Knight (Orderly Super) → Grand Knight (Orderly Ultra)  
        ↳ Fallen Knight (Chaotic Ultra via Orderly betrayal)  
    • Executioner (Chaotic Super) → Destroyer (Chaotic Ultra)  
        ↳ Shogun (Orderly Ultra via Chaotic betrayal)  
    • Daemon Proselyte (Chaotic Super Hybrid) → Daemonsmith (Chaotic Ultra Hybrid)  
        (Hybrid of Swordsman + Mage)

━━━━━━━━━━━━━━━━━━━━━━━
✪ DAGGER PATHS
━━━━━━━━━━━━━━━━━━━━━━━

Rogue →  
    • Assassin (Chaotic Super) → Kingslayer (Chaotic Ultra)  
        ↳ Shinobi (Orderly Ultra via Chaotic betrayal)  
    • Seeker (Orderly Super) → World Seeker (Orderly Ultra)  
        ↳ Wraith (Chaotic Ultra Dagger/Fist via Orderly betrayal)

━━━━━━━━━━━━━━━━━━━━━━━
✪ GUN PATHS
━━━━━━━━━━━━━━━━━━━━━━━

Gunman →  
    • Duelist (Chaotic Super) → Coyote Starrk (Chaotic Ultra, uses blaster)
        ↳ Hitman (Orderly Ultra via Chaotic betrayal)  
        (Weapons: Sniper, Shotgun, Pistol)

━━━━━━━━━━━━━━━━━━━━━━━
✪ MAGIC PATHS
━━━━━━━━━━━━━━━━━━━━━━━

Mage →  
    • Cleric (Orderly Super) → Priest (Orderly Ultra)  
    • Necromancer (Chaotic Super)

━━━━━━━━━━━━━━━━━━━━━━━
✪ ALCHEMY PATHS
━━━━━━━━━━━━━━━━━━━━━━━

Alchemist →  
    • Druid (Orderly Super)

━━━━━━━━━━━━━━━━━━━━━━━
✪ SPEAR PATHS
━━━━━━━━━━━━━━━━━━━━━━━

Spearsman →  
    • Sea Knight (Orderly Super) → Poseidon Knight (Orderly Ultra)  
        ↳ Prowler Rider (Chaotic Ultra via Orderly betrayal)  
    • Gladiator (Chaotic Super) → Spartan (Chaotic Ultra)

━━━━━━━━━━━━━━━━━━━━━━━

Each class walks a path:  
— Order or Chaos.  
— Loyalty or Betrayal.  
— Power or Purpose.

To choose is to define yourself.
`,
        "shrines.txt": `
╔═════════════════════════════════════════════╗
║             ✦ SHRINES OF BALANCE ✦          ║
╚═════════════════════════════════════════════╝

Throughout the world of Terra lie ancient shrines.
They do not grant blessings freely — only deals.  
Every boon comes with a burden. Every strength a price.

To kneel before a shrine is to gamble with fate.

━━━━━━━━━━━━━━━━━━━━━━━
☼ Shrine of Life
━━━━━━━━━━━━━━━━━━━━━━━

Location: Whispering Woods
→ Effect: You receive reduced damage from all sources.  
→ Cost: Your outgoing damage is also reduced.  
A shrine favored by tanks, guardians, and cautious adventurers.  
You live longer — but kill slower.

━━━━━━━━━━━━━━━━━━━━━━━
⚡ Shrine of Dexterity
━━━━━━━━━━━━━━━━━━━━━━━

Location: Evergreen
→ Effect: Your movement speed is increased.  
→ Cost: Your attack damage is reduced.  
Favored by scouts, rogues, and runners.  
You gain speed — but lose bite.

━━━━━━━━━━━━━━━━━━━━━━━
⛓ Shrine of Doom
━━━━━━━━━━━━━━━━━━━━━━━

Locaiton: Deep Desert
→ Effect: You deal increased damage.  
→ Cost: Your movement speed is decreased.  
A shrine favored by berserkers and destroyers.  
Strike harder — but crawl toward your enemies.

━━━━━━━━━━━━━━━━━━━━━━━
⚖ Shrine of Salvation
━━━━━━━━━━━━━━━━━━━━━━━

Location: Tundra
→ Effect: You gain double orderly reputation when acting orderly.  
→ Cost: You also gain double chaotic reputation when acting chaotically.  
A dangerous pact — one that swings like a pendulum.  
Walk the line — or fall on either side.

━━━━━━━━━━━━━━━━━━━━━━━
☠ Shrine of Ferocity
━━━━━━━━━━━━━━━━━━━━━━━

Location: i forgor
→ Effect: Your attack damage is increased.  
→ Cost: You receive increased damage from all sources.  
For glass cannons and fearless warriors.  
High risk. High reward. One mistake — and you're gone.

━━━━━━━━━━━━━━━━━━━━━━━

Currently, you can't undo a shrine's effect.
There is no “undo.” Only consequence.
`,
        "kingsgambit.log": `
Location: Swamp → Fight Club

Discovered what the locals whisper about — “The King’s Gambit.”  
No signage. No guards. Just a crooked hatch beneath the moss and mud.

Inside: Gretz, a candle, and two names scratched into the wall:  
Jim & John.

Locals place silver on either fighter.
No rules. No armor. No mercy.  
Only one walks out.

Winnings scale based on bet size and on the amount of betters.
Lose? You lose everything.  
Win? You walk out heavier — or so they say.

No formal record. No fairness. Just fists and fate.

Recommend: Bring coin. And a cold heart.
`,
        "volcano.log": "Lava flows, be careful.",
        "tundra.log": "Temperatures below freezing, exposure dangerous.",
        "graveyard.log": "Lurkers respond to movement. Avoid scanning unecesarilly.",
        "deepdesert.log": "Starrk was here.",
      });

      locations["/home"] = ["docs", "logs", "terminaltutorial.txt"];
      locations["/home/docs"] = ["game.txt", "hintstut.txt", "relics.txt", "riddlehistory.txt", "races.txt", "classes.txt", "shrines.txt"];
      locations["/home/logs"] = ["kingsgambit.log", "tundra.log", "graveyard.log", "deepdesert.log", "volcano.log"];

      for (const key in spawnedItems) {
        delete spawnedItems[key];
      }
      for (const key in cooldowns) {
        delete cooldowns[key];
      }
      timeSpeed = 1;
      localStorage.setItem("timeSpeed", timeSpeed);

      updateHUD();
      input.value = `Roguebloxer@Terra:${player.currentDir}$ `;
      location.reload();
      terminalLocked = false;
      return true;

    case "ase":
      if (!player.ase) {
        log("Unknown command, try again.");
        return false;
      }
      if (player.aseActive) {
        player.aseActive = false;
        log("All Seeing Eye deactivated.");
      } else {
        player.aseActive = true;
        log("All Seeing Eye activated.");
      }
      saveState();
      updateHUD();
      return true;

    default:
      log(`Unknown command, try again.`);
      return false;
  }
}

function crptyString(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) + i);
  }
  return result;
}

async function handleSubmit(code) {
  const hashedCode = await sha256(code);

  const orbPasswords = {
    "554c1ddca94a0bd4fa5aa18907647e8981279939230af9d9b160be21e7f532ce": { key: "1", hints: ["orb1hint1.txt"] },
    "9bba5c53a0545e0c80184b946153c9f58387e3bd1d4ee35740f29ac2e718b019": { key: "2", hints: ["orb2hint1.txt"] },
    "2961c5a0feb2a8c962decf37230d10a42a74a0b8ca7a38bd0a596f751157845a": { key: "3", hints: ["orb3hint1.txt"] },
    "6fdde36d65f8df40d1f4c4ca54ce909e6de7b63b5a56ccb892a9cf1bbdc2e83e": { key: "4", hints: ["orb4hint1.txt", "orb4hint2.txt"] },
    "b9c7b2bf9bbea503abfa98acff6bfe1322abda6919daccef91363191f61ffc0c": { key: "5", hints: ["orb5hint1.txt"] },
    "59a2418c9dc64bf646bacc8b72bfa64536610abac11535777d669cb94d32fb24": { key: "6", hints: ["orb6hint1.txt", "orb6hint2.txt"] }
  };

  const ribPasswords = {
    "a8cfcd74832004951b4408cdb0a5dbcd8c7e52d43f7fe244bf720582e05241da": { key: "1", hints: ["rib1hint1.txt", "rib1hint2.txt"] },
    "6bf710ee6b23f08117f7f08ca197d56e221152e37308fb41be710bc3a18595b5": { key: "2", hints: ["rib2hint1.txt"] },
    "85e451106fb409544d0edca70f030bbe905ed7b7d1de93ca20e5390a0a7f3fd5": { key: "3", hints: ["rib3hint1.txt"] },
    "79af599a9e5b4d800b02191bae4b42a007996876f074d5686156b319f43d39e0": { key: "4", hints: ["rib4hint1.txt"] },
    "d4c17077619075cf3c573b053a8d00b0c5d9f3216f11bb9b9c5888d57979dcc6": { key: "5", hints: ["rib5hint1.txt", "rib5hint2.txt"] },
    "90cf76537942621cb6a1582c7969718ce50db400fa6f6fa0de331f71fb368acd": { key: "6", hints: ["rib6hint1.txt", "rib6hint2.txt"] }
  };

  if (orbPasswords[hashedCode]) {
    const { key: orbKey, hints } = orbPasswords[hashedCode];
    if (!hints.some(hint => locations["/home/docs"].includes(hint))) {
      const hintList = hints.map(hint => `hint (${hint})`).join(" or ");
      log(`You must install the ${hintList} before submitting the code for Orb ${orbKey}.`);
      return;
    }
    if (!player.orbs.some(orb => orb.key === orbKey)) {
      player.orbs.push({ key: orbKey, code });
      soundSubmitPassword.play();
      log(`Orb ${orbKey} accepted.`);
    } else {
      log("Already submitted.");
    }
  } else if (ribPasswords[hashedCode]) {
    if (player.ribcage) {
      log("You already possess the ribcage. You cannot submit ribs anymore.");
      return;
    }

    const { key: ribKey, hints } = ribPasswords[hashedCode];
    if (!hints.some(hint => locations["/home/docs"].includes(hint))) {
      const hintList = hints.map(hint => `hint (${hint})`).join(" or ");
      log(`You must install the ${hintList} before submitting the code for Rib ${ribKey}.`);
      return;
    }
    if (!player.ribs.some(rib => rib.key === ribKey)) {
      player.ribs.push({ key: ribKey, code });
      soundSubmitPassword.play();
      log(`Rib fragment ${ribKey} accepted.`);

      if (player.ribs.length === 6) {
        if (player.lives > 1) {
          log("Now that all ribs are collected, you must suffer to obtain the heart.");
        } else {
          if (!locations["/home/docs"].includes("heart.txt")) {
            locations["/home/docs"].push("heart.txt");
            files["heart.txt"] = "Follow the instructions of the 2nd riddle's 1st orb. Look for what relates to a heart on the screen.";
            log("heart.txt has been installed into /home/docs.");
          }
        }
      }
    } else {
      log("Already submitted.");
    }
  } else {
    log("Invalid code. Please try again.");
  }

  saveState();
}

function handleFailedBrew(ingredients) {
  ingredients.forEach(item => {
    const index = player.inventory.indexOf(item);
    if (index !== -1) {
      player.inventory.splice(index, 1);
    }
  });
  updateInventoryDisplay();

  const outcome = Math.random();

  if (outcome < 0.25) {
    const potion = Math.random() < 0.99 ? "awkward potion" : "hallow potion";
    if (potion === "awkward potion") {
      soundFailedBrewAwkward.play();
      log("You have brewed an awkward potion.");
    } else {
      soundHallowPotion.play();
      log("You have brewed a hallow potion.");
    }
    player.inventory.push(potion);
    updateInventoryDisplay();
  } else if (outcome < 0.5) {
    soundFailedBrewWasted.play();
    log("The brewing failed, and the ingredients were wasted.");
  } else if (outcome < 0.75) {
    soundFailedBrewExplosion.play();
    log("The brewing exploded! You lost 20 HP.");
    if (player.leviathanEye) {
      player.hp = Math.max(0, player.hp - 10);
    } else {
      player.hp = Math.max(0, player.hp - 20);
    }
    updateHUD();
  } else {
    soundFailedBrewAwkward.play();
    log("You have brewed a health potion.");
    player.inventory.push("health potion");
    updateInventoryDisplay();
  }

  saveState();
  updateHUD();
  return true;
}

function usePotion(potion) {
  const toxicityEffects = {
    "potion of healing": 40,
    "melting potion": 40,
    "freezing potion": 40,
    "hastening elixir": 50,
    "luck potion": 50,
    "neutralizing potion": 60,
    "awkward potion": 20,
    "health potion": 40,
    "hallow potion": 0
  };

  if (potion === "hastening elixir" && player.hasteningActive) {
    log("You are already under the effects of a hastening elixir.");
    updateInventoryDisplay();
    return true;
  }

  if (potion === "hallow potion" && player.turpin) {
    log("You are already a turpin. The potion has no effect.");
    updateInventoryDisplay();
    return true;
  }

  player.toxicity = Math.min(100, player.toxicity + toxicityEffects[potion]);
  checkToxicity();
  if (player.hp <= 0) return false;
  updateHUD();

  switch (potion) {
    case "potion of healing":
      log("You feel your wounds slowly healing over time.");
      let ticks = 16;
      player.healingInterval = setInterval(() => {
        if (ticks > 0) {
          soundHeal.play();
          player.hp = Math.min(100, player.hp + 2.5);
          updateHUD();
          ticks--;
        } else {
          clearInterval(player.healingInterval);
          player.healingInterval = null;
        }
      }, 1250);
      break;
    case "melting potion":
      log("You feel a surge of heat coursing through your body.");
      player.temperature = Math.min(100, player.temperature + 30);
      updateHUD();
      break;
    case "freezing potion":
      log("A chilling sensation spreads through your veins.");
      player.temperature = Math.max(0, player.temperature - 30);
      updateHUD();
      break;
    case "hastening elixir":
      log("You feel a burst of energy, making everything faster.");
      player.hasteningActive = true;
      player.hasteningRemainingTime = 30000;
      saveState();

      const hasteningTimer = setInterval(() => {
        player.hasteningRemainingTime -= 1000;
        if (player.hasteningRemainingTime <= 0 || player.hp <= 0) {
          clearInterval(hasteningTimer);
          player.hasteningActive = false;
          player.hasteningRemainingTime = null;
          if (player.hp > 0) {
            log("The effects of the hastening elixir have worn off.");
          }
          saveState();
        }
      }, 1000);
      break;
    case "neutralizing potion":
      log("Your body feels perfectly balanced, as all things should be.");
      player.temperature = 50;
      updateHUD();
      break;
    case "awkward potion":
      log("Nothing seems to happen...");
      break;
    case "health potion":
      log("You feel a strange, draining sensation...");
      let ticks2 = 16;
      player.healthDrainInterval = setInterval(() => {
        if (ticks2 > 0) {
          if (player.leviathanEye) {
            player.hp = Math.max(0, player.hp - 10);
          } else {
            player.hp = Math.max(0, player.hp - 2.5);
          }
          damageSound.play();
          updateHUD();
          ticks2--;
        } else {
          clearInterval(player.healthDrainInterval);
          player.healthDrainInterval = null;
        }
      }, 1250);
      break;
    case "hallow potion":
      log("You feel an overwhelming sense of freedom. Toxicity no longer affects you. Also, you're a pumpkin.");
      player.turpin = true;
      saveState();
      pumpkinJumpscare();
      break;
    default:
      log("The potion has no effect.");
  }

  soundDrinkPotion.play();
  const index = player.inventory.indexOf(potion);
  if (index !== -1) {
    player.inventory.splice(index, 1);
  }
  updateInventoryDisplay();
  saveState();
  return true;
}

function checkWatchObtainment() {
  if (player.coyote && player.ribcage && !player.watch && !locations["/home/docs"].includes("watch_hint.txt")) {
    const currentHour = gameTime.hours;
    const currentMinute = gameTime.minutes;
    player.watchTime = { hour: currentHour, minute: currentMinute };
    const isPM = currentHour >= 12;
    const displayHour = currentHour % 12 || 12;
    const formattedHour = String(displayHour).padStart(2, "0");
    const formattedMinute = String(currentMinute).padStart(2, "0");
    const period = isPM ? "PM" : "AM";
    const formattedTime = `${formattedHour}:${formattedMinute} ${period}`;
    log("You feel a strange presence... A new file has been added to /home/docs: watch_hint.txt");
    locations["/home/docs"].push("watch_hint.txt");
    files["watch_hint.txt"] = `
      The Timekeeper watches over the frozen hours.
      At exactly ${formattedTime}, scan the Deep Tundra.
      If you miss this opportunity, you will have countless others every day at the same time.
      The Timekeeper has given you a special tool, but hasn't left instruction on its use.
      You must figure it out yourself.
    `;
    saveState();
  }
}
