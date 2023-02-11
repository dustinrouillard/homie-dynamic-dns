export { };

declare global {
  // ENVIRONMENT
  const CLOUDFLARE_API_KEY: string;
  const CLOUDFLARE_ZONE_ID: string;
  const DISCORD_CLIENT_ID: string;
  const DISCORD_CLIENT_SECRET: string;
  const DISCORD_REDIRECT_URI: string;
  const DISCORD_TOKEN: string;
  const DISCORD_ROLE_ID: string;
  const DISCORD_GUILD_ID: string;

  // KV
  const Storage: KVNamespace;
}