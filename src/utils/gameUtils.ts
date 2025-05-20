import { GameState, Player, Territory, Card } from '../types/game';

export const INITIAL_OFFERINGS = 2000;

export const createInitialGameState = (playerNames: string[]): GameState => {
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index}`,
    name,
    pantheon: ['Greek', 'Norse', 'Egyptian', 'Roman', 'Celtic'][index % 5] as Player['pantheon'],
    position: 0,
    offerings: INITIAL_OFFERINGS,
    ownedTerritories: [],
    relics: [],
    powerCards: [],
    isActive: true,
  }));

  // Create territories for each region
  const territories: Record<string, Territory> = {};
  const regions: Territory['region'][] = ['Olympus', 'Asgard', 'Duat', 'Capitolium', 'Celtica'];
  
  regions.forEach((region, regionIndex) => {
    for (let i = 0; i < 4; i++) {
      const id = `${region.toLowerCase()}-${i}`;
      const baseValue = (regionIndex + 1) * 100 + (i * 25);
      
      territories[id] = {
        id,
        name: `${region} ${['I', 'II', 'III', 'IV'][i]}`,
        region,
        baseValue,
        currentLevel: 'Shrine',
        ownerId: null,
        rent: {
          Shrine: Math.floor(baseValue * 0.1),
          Temple: Math.floor(baseValue * 0.3),
          Monument: Math.floor(baseValue * 0.6),
        },
        upgradeCost: {
          Shrine: 0,
          Temple: baseValue * 0.5,
          Monument: baseValue * 1.5,
        },
      };
    }
  });

  // Define the board spaces in order (40 spaces total)
  const board: string[] = [
    // Corner spaces (0, 10, 20, 30)
    'start',
    
    // First row (1-8)
    'olympus-0', 'olympus-1', 'fate', 'olympus-2', 'olympus-3', 'relic-chest', 'asgard-0', 'asgard-1',
    
    // Right side (9)
    'chaos-portal',
    
    // Top row (10-18)
    'asgard-2', 'asgard-3', 'divine-rest', 'duat-0', 'duat-1', 'fate', 'duat-2', 'duat-3',
    
    // Bottom right corner (19)
    'trial-chamber',
    
    // Bottom row (20-28) - right to left
    'capitolium-3', 'capitolium-2', 'fate', 'capitolium-1', 'capitolium-0', 'relic-chest', 'celtica-3', 'celtica-2',
    
    // Left side (29)
    'pay-tribute',
    
    // Left row (30-38) - bottom to top
    'celtica-1', 'celtica-0', 'fate', 'olympus-0', 'olympus-1', 'relic-chest', 'asgard-0', 'asgard-1',
    
    // Back to start (39)
    'asgard-2'
  ];
  
  // Update territory names to match the board image
  const territoryUpdates: Record<string, {name: string, baseValue: number}> = {
    // Olympus territories
    'olympus-0': { name: 'Mount Olympus', baseValue: 200 },
    'olympus-1': { name: 'Delphi', baseValue: 180 },
    'olympus-2': { name: 'Athens', baseValue: 160 },
    'olympus-3': { name: 'Sparta', baseValue: 140 },
    
    // Asgard territories
    'asgard-0': { name: 'Valhalla', baseValue: 200 },
    'asgard-1': { name: 'Bifrost', baseValue: 180 },
    'asgard-2': { name: 'Yggdrasil', baseValue: 160 },
    'asgard-3': { name: 'Jotunheim', baseValue: 140 },
    
    // Duat territories
    'duat-0': { name: 'Duat', baseValue: 200 },
    'duat-1': { name: 'Thebes', baseValue: 180 },
    'duat-2': { name: 'Memphis', baseValue: 160 },
    'duat-3': { name: 'Heliopolis', baseValue: 140 },
    
    // Capitolium territories
    'capitolium-0': { name: 'Capitoline Hill', baseValue: 200 },
    'capitolium-1': { name: 'Roman Forum', baseValue: 180 },
    'capitolium-2': { name: 'Colosseum', baseValue: 160 },
    'capitolium-3': { name: 'Pantheon', baseValue: 140 },
    
    // Celtica territories
    'celtica-0': { name: 'Avalon', baseValue: 200 },
    'celtica-1': { name: 'Tara', baseValue: 180 },
    'celtica-2': { name: 'Stonehenge', baseValue: 160 },
    'celtica-3': { name: 'Beltane', baseValue: 140 },
  };
  
  // Update territories with new names and values
  Object.entries(territoryUpdates).forEach(([id, {name, baseValue}]) => {
    if (territories[id]) {
      territories[id] = {
        ...territories[id],
        name,
        baseValue,
        rent: {
          Shrine: Math.floor(baseValue * 0.1),
          Temple: Math.floor(baseValue * 0.3),
          Monument: Math.floor(baseValue * 0.6),
        },
        upgradeCost: {
          Shrine: 0,
          Temple: baseValue * 0.5,
          Monument: baseValue * 1.5,
        },
      };
    }
  });

  // Create initial decks
  const fateDeck: Card[] = [
    // Add sample fate cards
    {
      id: 'fate-1',
      type: 'Fate',
      title: 'Divine Favor',
      description: 'Gain 100 offerings from the bank.',
      effect: () => { /* Implement effect */ },
    },
    // Add more fate cards...
  ];


  const relicDeck: Card[] = [
    // Add sample relic cards
    {
      id: 'relic-1',
      type: 'Relic',
      title: 'Amulet of Protection',
      description: 'Pay 50 fewer offerings when paying rent.',
      effect: () => { /* Implement effect */ },
    },
    // Add more relic cards...
  ];

  return {
    players,
    currentPlayerIndex: 0,
    board,
    territories,
    fateDeck: shuffleDeck(fateDeck),
    relicDeck: shuffleDeck(relicDeck),
    gamePhase: 'roll',
    diceRoll: null,
  };
};

export const shuffleDeck = <T>(deck: T[]): T[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const rollDice = (): [number, number] => {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
};

export const rollFateDie = (): number => {
  return Math.floor(Math.random() * 4) + 1;
};
