/* The profile pictures a player may choose from. Three portraits per
   character, named `<character>-<n>` after the files in
   app/assets/images/profile-pictures - the key is what the db stores,
   without an extension, because the set is split between .png and .jpg.

   This list is the canonical one: the picker offers it, the api
   validates against it and the backfill picks out of it. The art is
   still bundled by glob (see Avatar.vue), so the key is the only thing
   the two sides have to agree on. */
const AVATAR_CHARACTERS = {
  alisa: "Аліса",
  "chorna-boroda": "Чорна Борода",
  chupacabra: "Чупакабра",
  "korol-artur": "Король Артур",
  loki: "Локі",
  medusa: "Медуза",
  pandora: "Пандора",
  sinbad: "Сінбад",
} as const;

const AVATAR_VARIANTS = [1, 2, 3] as const;

const AVATARS = Object.keys(AVATAR_CHARACTERS).flatMap((character) =>
  AVATAR_VARIANTS.map((variant) => `${character}-${variant}`),
);

/** The character a key belongs to, for the picker's label. */
function avatarLabel(avatar: string): string {
  const character = avatar.slice(0, avatar.lastIndexOf("-"));

  return (
    AVATAR_CHARACTERS[character as keyof typeof AVATAR_CHARACTERS] ?? avatar
  );
}

/** Used for players who never picked one - every row ends up with art. */
function randomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]!;
}

export { AVATARS, AVATAR_CHARACTERS, avatarLabel, randomAvatar };
