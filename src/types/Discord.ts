export interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  verified: boolean;
}

// Bare minimum for the role/guild check
export interface DiscordMember {
  roles: string[],
  user: {
    id: string
  }
}