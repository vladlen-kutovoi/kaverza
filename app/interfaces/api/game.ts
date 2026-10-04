type GameType = "duel" | "team" | "ffa";

interface GameCharacter {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface GameTeamPlayer {
  id: number;
  name: string;
  slug: string;
  avatar: string | null;
  character: GameCharacter;
}

interface GameTeam {
  teamNumber: number;
  winner: boolean;
  players: GameTeamPlayer[];
}

interface Game {
  id: number;
  type: GameType;
  createdAt: string | Date;
  teams: GameTeam[];
}

export type { Game, GameType };
