const commandDescriptions = {
  help: "Displays a list of all commands and their descriptions.",
  scan: "Scans a specified location. Use '-h' for usage details.",
  read: "Reads the content of a file in the current directory. Use '-h' for usage details.",
  prwlcrypt: "Encrypts a string using the Prowlercryptor. Use '-h' for usage details.",
  cd: "Changes the current directory. Use '-h' for usage details.",
  cls: "Clears the terminal screen.",
  tree: "Displays the directory structure.",
  locations: "Displays a list of all scannable locations.",
  status: "Displays the player's current status (HP, temperature, etc.).",
  checklist: "Displays the player's progress checklist.",
  submit: "Submits a code for an objective. Use '-h' for usage details.",
  craft: "Crafts an item. Use '-h' for usage details.",
  brew: "Brews a potion using specified ingredients. Use '-h' for usage details.",
  use: "Uses an item. Use '-h' for usage details.",
  recipe: "Displays crafting recipes.",
  reset: "Resets the game and clears all progress.",
  music: "Plays or stops the background music."
};

const locations = {
  "/home": ["docs", "logs", "terminaltutorial.txt"],
  "/home/docs": ["game.txt", "hintstut.txt", "relics.txt", "riddlehistory.txt", "races.txt", "classes.txt", "shrines.txt"],
  "/home/logs": ["kingsgambit.log", "tundra.log", "graveyard.log", "deepdesert.log", "volcano.log"],
};

const scannableLocations = {
  "whispering woods": { parent: null },
  "ritherhelm": { parent: "whispering woods" },
  "graveyard": { parent: "whispering woods" },
  "desert": { parent: null },
  "mawstone": { parent: "desert" },
  "deep desert": { parent: "desert" },
  "badlands": { parent: "desert" },
  "swamp": { parent: null },
  "evergreen": { parent: "swamp" },
  "tundra": { parent: null },
  "the expeditioners keep": { parent: "tundra" },
  "frostfalls": { parent: "tundra" },
  "tintagels castle": { parent: "tundra" },
  "deep tundra": { parent: "tundra" },
  "beach": { parent: null },
  "wavebreaker cove": { parent: "beach" },
  "volcano": { parent: "beach" },
  "fort atlas": { parent: "beach" },
  "atlas sewers": { parent: "beach" },
  "sky dojo": { parent: null }
};

const spawnableItems = [
  { name: "orb1hint1", chance: 0.1, locations: ["tundra"], text: "The Prowler has solved Riddle 2. He left behind its final password… but encrypted." },
  { name: "orb2hint1", chance: 0.1, locations: ["anywhere"], text: "The victor receives a title beyond titles. What honor might this riddle bestow?" },
  { name: "orb3hint1", chance: 0.1, locations: ["deep desert"], text: "A Coyote’s combat tool — loud, volatile, iconic." },
  { name: "orb4hint1", chance: 0.1, locations: ["tundra"], exclude: ["deep tundra"], text: "Beneath a bridge in the Tundra, I wait." },
  { name: "orb4hint2", chance: 0.1, locations: ["tundra"], exclude: ["deep tundra"], text: "Through me, even flesh may change." },
  { name: "orb5hint1", chance: 0.1, locations: ["ritherhelm", "swamp"], text: "Orange shell, carved smile… pumpkin." },
  { name: "orb6hint1", chance: 0.1, locations: ["deep tundra"], text: "To obtain me, you must suffer." },
  { name: "orb6hint2", chance: 0.1, locations: ["deep tundra"], text: "Collect my fingers." },
  { name: "rib1hint1", chance: 0.08, locations: ["swamp"], text: "I fight at the King’s Gambit." },
  { name: "rib1hint2", chance: 0.08, locations: ["swamp"], text: "I hate Jim. Who am I?" },
  { name: "rib2hint1", chance: 0.08, locations: ["anywhere"], text: "I am the answer to the first riddle, reversed and prowlercrypted." },
  { name: "rib3hint1", chance: 0.08, locations: ["anywhere"], text: "From G to A, I am the alphabet… prowlercrypted." },
  { name: "rib4hint1", chance: 0.08, locations: ["volcano", "desert"], text: "I was born of the sun." },
  { name: "rib5hint1", chance: 0.08, locations: ["anywhere"], text: "I am what I am…" },
  { name: "rib5hint2", chance: 0.08, locations: ["anywhere"], text: "Think simply." },
  { name: "rib6hint1", chance: 0.08, locations: ["tundra"], text: "A shrine within the tundra... the shrine of ______." },
  { name: "rib6hint2", chance: 0.08, locations: ["tundra"], text: "With me, your progress doubles." },
  { name: "lava flower", chance: 0.1, locations: ["volcano"], text: "A rare flower that thrives in volcanic heat." },
  { name: "winterleaf", chance: 0.1, locations: ["tundra"], text: "A frosty leaf found in the tundra." },
  { name: "crystal", chance: 0.1, locations: ["beach", "wavebreaker cove", "fort atlas"], exclude: ["volcano"], text: "A shimmering crystal found near the beach." },
  { name: "solar bloom", chance: 0.1, locations: ["desert", "deep desert", "badlands"], text: "A radiant flower that blooms under the desert sun." },
  { name: "mushroom", chance: 0.1, locations: ["whispering woods", "ritherhelm", "graveyard"], text: "A common mushroom found in the woods and its surrounding areas." },
  { name: "potion of healing recipe", chance: 0.02, locations: ["anywhere"], text: "3 Mushrooms" },
  { name: "melting potion recipe", chance: 0.02, locations: ["anywhere"], text: "1 Lava flower" },
  { name: "freezing potion recipe", chance: 0.02, locations: ["anywhere"], text: "1 Winterleaf" },
  { name: "hastening elixir recipe", chance: 0.02, locations: ["anywhere"], text: "2 Crystals" },
  { name: "neutralizing potion recipe", chance: 0.02, locations: ["anywhere"], text: "1 Solarbloom" },
  { name: "life crystal", chance: 0.005, locations: ["anywhere"], text: "A heart shaped crystal that grants you a life." },
  { name: "lihzahrd's soul", chance: 0.003, locations: ["anywhere"], text: "A soul that grants you permanent hastening." },
  { name: "leviathan eye", chance: 0.003, locations: ["anywhere"], text: "An eye that sets all damage taken to 10." },
  { name: "all seeing eye", chance: 0.001, locations: ["anywhere"], text: "An eye that reveals item spawns in the terminal." },
  { name: "moonshine", chance: 0.0005, locations: ["anywhere"], text: "A mystical relic that lets you choose any relic." }
];

const files = {
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

→ Effect: You receive reduced damage from all sources.  
→ Cost: Your outgoing damage is also reduced.  
A shrine favored by tanks, guardians, and cautious adventurers.  
You live longer — but kill slower.

━━━━━━━━━━━━━━━━━━━━━━━
⚡ Shrine of Dexterity
━━━━━━━━━━━━━━━━━━━━━━━

→ Effect: Your movement speed is increased.  
→ Cost: Your attack damage is reduced.  
Favored by scouts, rogues, and runners.  
You gain speed — but lose bite.

━━━━━━━━━━━━━━━━━━━━━━━
⛓ Shrine of Doom
━━━━━━━━━━━━━━━━━━━━━━━

→ Effect: You deal increased damage.  
→ Cost: Your movement speed is decreased.  
A shrine favored by berserkers and destroyers.  
Strike harder — but crawl toward your enemies.

━━━━━━━━━━━━━━━━━━━━━━━
⚖ Shrine of Salvation
━━━━━━━━━━━━━━━━━━━━━━━

→ Effect: You gain double orderly reputation when acting orderly.  
→ Cost: You also gain double chaotic reputation when acting chaotically.  
A dangerous pact — one that swings like a pendulum.  
Walk the line — or fall on either side.

━━━━━━━━━━━━━━━━━━━━━━━
☠ Shrine of Ferocity
━━━━━━━━━━━━━━━━━━━━━━━

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
  "graveyard.log": "Lurkers respond to movement. Avoid scanning unprotected.",
  "deepdesert.log": "Starrk was here."
};
