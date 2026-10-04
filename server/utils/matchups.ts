import { eq } from "drizzle-orm";

import { db } from "../db";
import { gamePlayers } from "../db/schema/game-players";
import { games } from "../db/schema/games";

/** What one character did against one opponent */
export type MatchupRecord = {
  games: number;
  wins: number;
};

/** characterId -> opponentId -> record. Both directions are filled, so
 *  a lookup reads the same whichever character is asking. */
export type MatchupTable = Map<number, Map<number, MatchupRecord>>;

type Side = {
  characterId: number;
  teamNumber: number;
  winningTeamNumber: number;
};

/** Every pair of characters that stood on opposite sides of a game.
 *
 *  A duel gives one pair, a team game every cross-team pair. An ffa is
 *  a pile of one-man teams, so only the pairs the winner took part in
 *  count: two losers never beat each other, and recording such a pair
 *  would leave the two halves of the matrix disagreeing on 100%. */
export async function loadMatchups(): Promise<MatchupTable> {
  const rows = await db
    .select({
      gameId: gamePlayers.gameId,
      characterId: gamePlayers.characterId,
      teamNumber: gamePlayers.teamNumber,
      winningTeamNumber: games.winningTeamNumber,
    })
    .from(gamePlayers)
    .innerJoin(games, eq(games.id, gamePlayers.gameId));

  const sidesByGame = new Map<number, Side[]>();

  for (const row of rows) {
    const sides = sidesByGame.get(row.gameId);

    if (sides) {
      sides.push(row);
    } else {
      sidesByGame.set(row.gameId, [row]);
    }
  }

  const table: MatchupTable = new Map();

  // Reaches for one cell of the table, creating the row and the cell on
  // first touch
  const cellOf = (characterId: number, opponentId: number) => {
    let opponents = table.get(characterId);

    if (!opponents) {
      opponents = new Map();
      table.set(characterId, opponents);
    }

    let cell = opponents.get(opponentId);

    if (!cell) {
      cell = { games: 0, wins: 0 };
      opponents.set(opponentId, cell);
    }

    return cell;
  };

  for (const sides of sidesByGame.values()) {
    for (let index = 0; index < sides.length; index++) {
      for (let other = index + 1; other < sides.length; other++) {
        const a = sides[index]!;
        const b = sides[other]!;

        // Team-mates, not opponents
        if (a.teamNumber === b.teamNumber) continue;

        const aWon = a.teamNumber === a.winningTeamNumber;
        const bWon = b.teamNumber === b.winningTeamNumber;

        // An ffa pair the game went past: a third player took it
        if (!aWon && !bWon) continue;

        const aCell = cellOf(a.characterId, b.characterId);
        const bCell = cellOf(b.characterId, a.characterId);

        aCell.games++;
        bCell.games++;

        if (aWon) aCell.wins++;
        if (bWon) bCell.wins++;
      }
    }
  }

  return table;
}

/** Win rate as a whole percentage */
export function matchupWinRate(record: MatchupRecord) {
  return record.games > 0 ? Math.round((record.wins / record.games) * 100) : 0;
}
