// --- Types -----------------------------------------------------------
export type RatingParticipant = {
  playerId: number;
  teamNumber: number;
  rating: number;
};

export type RatingChange = {
  playerId: number;
  ratingBefore: number;
  ratingChange: number;
  ratingAfter: number;
};

// --- Variables -------------------------------------------------------
const ELO_K_FACTOR = 20;

// --- Methods -------------------------------------------------------
export function calculateEloChanges(
  playerRating: number,
  opponentRating: number,
  playerWon: boolean,
) {
  const expectedScore = 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));

  const actualScore = playerWon ? 1 : 0;

  const rawChange = ELO_K_FACTOR * (actualScore - expectedScore);

  const change = Math.ceil(Math.abs(rawChange));

  return {
    playerChange: rawChange >= 0 ? change : -change,
    opponentChange: rawChange >= 0 ? -change : change,
  };
}

export function calculateDuelRatingChanges(
  participants: RatingParticipant[],
  winningTeamNumber: number,
): RatingChange[] {
  const winner = participants.find(
    (participant) => participant.teamNumber === winningTeamNumber,
  );

  const loser = participants.find(
    (participant) => participant.teamNumber !== winningTeamNumber,
  );

  if (!winner || !loser) {
    throw new Error("Некоректні учасники дуелі");
  }

  const eloChanges = calculateEloChanges(winner.rating, loser.rating, true);

  return [
    {
      playerId: winner.playerId,
      ratingBefore: winner.rating,
      ratingChange: eloChanges.playerChange,
      ratingAfter: winner.rating + eloChanges.playerChange,
    },
    {
      playerId: loser.playerId,
      ratingBefore: loser.rating,
      ratingChange: eloChanges.opponentChange,
      ratingAfter: loser.rating + eloChanges.opponentChange,
    },
  ];
}

export function calculateTeamEloChanges(
  team1Ratings: number[],
  team2Ratings: number[],
  team1Won: boolean,
) {
  const team1Average =
    team1Ratings.reduce((sum, rating) => sum + rating, 0) / team1Ratings.length;

  const team2Average =
    team2Ratings.reduce((sum, rating) => sum + rating, 0) / team2Ratings.length;

  const eloChanges = calculateEloChanges(team1Average, team2Average, team1Won);

  return {
    team1Change: eloChanges.playerChange,
    team2Change: eloChanges.opponentChange,
  };
}

export function calculateTeamRatingChanges(
  participants: RatingParticipant[],
  winningTeamNumber: number,
): RatingChange[] {
  const team1 = participants.filter(
    (participant) => participant.teamNumber === 1,
  );

  const team2 = participants.filter(
    (participant) => participant.teamNumber === 2,
  );

  const eloChanges = calculateTeamEloChanges(
    team1.map((participant) => participant.rating),
    team2.map((participant) => participant.rating),
    winningTeamNumber === 1,
  );

  return participants.map((participant) => {
    const ratingChange =
      participant.teamNumber === 1
        ? eloChanges.team1Change
        : eloChanges.team2Change;

    return {
      playerId: participant.playerId,
      ratingBefore: participant.rating,
      ratingChange,
      ratingAfter: participant.rating + ratingChange,
    };
  });
}

export function calculateFfaRatingChanges(
  participants: RatingParticipant[],
  winningTeamNumber: number,
): RatingChange[] {
  const winner = participants.find(
    (participant) =>
      participant.teamNumber === winningTeamNumber,
  );

  const losers = participants.filter(
    (participant) =>
      participant.teamNumber !== winningTeamNumber,
  );

  if (!winner || losers.length === 0) {
    throw new Error("Некоректні учасники FFA");
  }

  const ratingChanges = new Map<number, number>();

  ratingChanges.set(winner.playerId, 0);

  for (const loser of losers) {
    const eloChanges = calculateEloChanges(
      winner.rating,
      loser.rating,
      true,
    );

    ratingChanges.set(
      winner.playerId,
      (ratingChanges.get(winner.playerId) ?? 0) +
        eloChanges.playerChange,
    );

    ratingChanges.set(
      loser.playerId,
      eloChanges.opponentChange,
    );
  }

  return participants.map((participant) => {
    const ratingChange =
      ratingChanges.get(participant.playerId) ?? 0;

    return {
      playerId: participant.playerId,
      ratingBefore: participant.rating,
      ratingChange,
      ratingAfter: participant.rating + ratingChange,
    };
  });
}

export function calculateGameRatingChanges(
  type: "duel" | "team" | "ffa",
  participants: RatingParticipant[],
  winningTeamNumber: number,
): RatingChange[] {
  switch (type) {
    case "duel":
      return calculateDuelRatingChanges(participants, winningTeamNumber);

    case "team":
      return calculateTeamRatingChanges(participants, winningTeamNumber);

      case "ffa":
        return calculateFfaRatingChanges(participants, winningTeamNumber);
  }
}
