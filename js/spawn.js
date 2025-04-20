function spawnItems() {
  spawnableItems.forEach(item => {
    if (item.name.startsWith("rib6hint") && player.ribs.length < 2) {
      return;
    }

    if (Math.random() < item.chance) {
      const location = item.locations.includes("anywhere")
        ? Object.keys(scannableLocations)[Math.floor(Math.random() * Object.keys(scannableLocations).length)]
        : item.locations[Math.floor(Math.random() * item.locations.length)];

      if (!item.exclude || !item.exclude.includes(location)) {
        if (!spawnedItems[location]) spawnedItems[location] = [];
        const existingItem = spawnedItems[location].find(spawned => spawned.name === item.name);
        if (!existingItem) {
          spawnedItems[location].push({ name: item.name, timestamp: Date.now() });
          if (player.aseActive) {
            log(`Item ${item.name} spawned at ${location}`)
          }
        }
      }
    }
  });
}

function despawnItems() {
  const currentTime = Date.now();
  Object.keys(spawnedItems).forEach(location => {
    spawnedItems[location] = spawnedItems[location].filter(item => {
      const isExpired = currentTime - item.timestamp > 120000;
      if (isExpired && player.aseActive) {
        log(`Item ${item.name} despawned from ${location}`);
      }
      return !isExpired;
    });
    if (spawnedItems[location].length === 0) {
      delete spawnedItems[location];
    }
  });
}

function isOnCooldown(location) {
  const onCooldown = cooldowns[location] && Date.now() < cooldowns[location];
  return onCooldown;
}

function setCooldown(location, duration) {
  cooldowns[location] = Date.now() + duration;
}