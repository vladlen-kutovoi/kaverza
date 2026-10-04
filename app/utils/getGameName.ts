import type { GameType } from "../interfaces/api/game";

export function getGameName(gameType: GameType) {
  switch (gameType) {
    case "duel":
      return "Дуель";
    case "team":
      return "Командна";
    case "ffa":
      return "Усі проти всіх";
    default:
      return "Невідомий формат гри";
  }
};