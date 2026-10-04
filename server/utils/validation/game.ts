import { z } from "zod";

const gamePlayerSchema = z.object({
  playerId: z.number().int().positive(),
  characterId: z.number().int().positive(),
  teamNumber: z.number().int().positive(),
});

const duelGameSchema = z.object({
  type: z.literal("duel"),

  winningTeamNumber: z.literal(1).or(z.literal(2)),

  players: z
    .tuple([gamePlayerSchema, gamePlayerSchema])
    .refine((players) => players[0].playerId !== players[1].playerId, {
      message: "Один гравець не може грати сам проти себе",
    })
    .refine(
      (players) =>
        players[0].teamNumber !== players[1].teamNumber &&
        players.every((player) => player.teamNumber <= 2),
      {
        message: "У дуелі гравці повинні бути в різних командах",
      },
    )
    .refine((players) => players[0].characterId !== players[1].characterId, {
      message: "Один персонаж не може бути використаний двома гравцями",
    }),
});

const teamGameSchema = z.object({
  type: z.literal("team"),

  winningTeamNumber: z.literal(1).or(z.literal(2)),

  players: z
    .array(gamePlayerSchema)
    .min(4)
    .superRefine((players, context) => {
      const hasOnlyTwoTeams = players.every(
        (player) => player.teamNumber === 1 || player.teamNumber === 2,
      );

      if (!hasOnlyTwoTeams) {
        context.addIssue({
          code: "custom",
          path: ["players"],
          message: "У командній грі можуть бути лише дві команди",
        });
      }
      const team1Players = players.filter((player) => player.teamNumber === 1);

      const team2Players = players.filter((player) => player.teamNumber === 2);

      if (team1Players.length < 2 || team2Players.length < 2) {
        context.addIssue({
          code: "custom",
          message: "У кожній команді повинно бути щонайменше 2 гравці",
        });
      }

      if (team1Players.length !== team2Players.length) {
        context.addIssue({
          code: "custom",
          message: "Команди повинні мати однакову кількість гравців",
        });
      }

      const playerIds = players.map((player) => player.playerId);
      const uniquePlayerIds = new Set(playerIds);

      if (uniquePlayerIds.size !== playerIds.length) {
        context.addIssue({
          code: "custom",
          message: "Один гравець не може брати участь у грі двічі",
        });
      }

      const characterIds = players.map((player) => player.characterId);
      const uniqueCharacterIds = new Set(characterIds);

      if (uniqueCharacterIds.size !== characterIds.length) {
        context.addIssue({
          code: "custom",
          message: "Один персонаж не може використовуватися двічі",
        });
      }
    }),
});

const ffaGameSchema = z
  .object({
    type: z.literal("ffa"),

    winningTeamNumber: z.number().int().positive(),

    players: z.array(gamePlayerSchema).min(3),
  })
  .superRefine((data, context) => {
    const playerIds = data.players.map((player) => player.playerId);
    const uniquePlayerIds = new Set(playerIds);

    if (uniquePlayerIds.size !== playerIds.length) {
      context.addIssue({
        code: "custom",
        path: ["players"],
        message: "Один гравець не може брати участь у грі двічі",
      });
    }

    const characterIds = data.players.map((player) => player.characterId);
    const uniqueCharacterIds = new Set(characterIds);

    if (uniqueCharacterIds.size !== characterIds.length) {
      context.addIssue({
        code: "custom",
        path: ["players"],
        message: "Один персонаж не може використовуватися двічі",
      });
    }

    const teamNumbers = data.players.map((player) => player.teamNumber);
    const uniqueTeamNumbers = new Set(teamNumbers);

    if (uniqueTeamNumbers.size !== teamNumbers.length) {
      context.addIssue({
        code: "custom",
        path: ["players"],
        message: "У FFA кожен гравець повинен мати окремий номер",
      });
    }

    if (!uniqueTeamNumbers.has(data.winningTeamNumber)) {
      context.addIssue({
        code: "custom",
        path: ["winningTeamNumber"],
        message: "Переможця не знайдено серед учасників",
      });
    }
  });

const createGameSchema = z.discriminatedUnion("type", [
  duelGameSchema,
  teamGameSchema,
  ffaGameSchema,
]);

export { createGameSchema };