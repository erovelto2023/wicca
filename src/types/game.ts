// Core game types for Mythic Realms: Divine Dominion

export type Player = {
  id: string;
  name: string;
  pantheon: 'Greek' | 'Norse' | 'Egyptian' | 'Roman' | 'Celtic';
  position: number;
  offerings: number;
  ownedTerritories: string[];
  relics: string[];
  powerCards: string[];
  isActive: boolean;
};

export type Territory = {
  id: string;
  name: string;
  region: 'Olympus' | 'Asgard' | 'Duat' | 'Capitolium' | 'Celtica';
  baseValue: number;
  currentLevel: 'Shrine' | 'Temple' | 'Monument';
  ownerId: string | null;
  rent: {
    Shrine: number;
    Temple: number;
    Monument: number;
  };
  upgradeCost: {
    Shrine: number;
    Temple: number;
    Monument: number;
  };
};

export type Card = {
  id: string;
  type: 'Fate' | 'Relic' | 'Power';
  title: string;
  description: string;
  effect: () => void;
};

export type GameState = {
  players: Player[];
  currentPlayerIndex: number;
  board: string[]; // Array of territory IDs
  territories: Record<string, Territory>;
  fateDeck: Card[];
  relicDeck: Card[];
  gamePhase: 'setup' | 'roll' | 'move' | 'action' | 'end';
  diceRoll: [number, number] | null;
};

export const REGIONS = ['Olympus', 'Asgard', 'Duat', 'Capitolium', 'Celtica'] as const;
export const TERRITORY_LEVELS = ['Shrine', 'Temple', 'Monument'] as const;
