let player = {
    hp: 100,
    lives: 3,
    toxicity: 0,
    temperature: 50,
    inventory: [],
    currentDir: "/home",
    orbs: [],
    ribs: [],
    heart: false,
    ribcage: false,
    watch: false,
    blaster: false,
    coyote: false,
    awaitingCoyoteDecision: false,
    hints: {
      orb: {},
      rib: {}
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
  
  let gameTime = { hours: 7, minutes: 0 };
  let timeSpeed = 1;
  