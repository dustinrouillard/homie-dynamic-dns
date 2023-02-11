import { DiscordMember, DiscordUser } from '../types/Discord';

export async function convertDiscordTokens(code: string): Promise<string> {
  const tokens: { access_token: string; error?: string } = await fetch(`https://discord.com/api/oauth2/token`, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: DISCORD_REDIRECT_URI
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(r => r.json());

  if (tokens.error) throw { code: tokens.error };
  if (!tokens.access_token) throw { code: 'invalid_auth_state' };

  return tokens.access_token;
}

export async function getDiscordUser(token: string): Promise<DiscordUser> {
  const req = await fetch('https://discord.com/api/v9/users/@me', {
    headers: { authorization: `Bearer ${token}` }
  }).then(r => r.json());

  return req as DiscordUser;
}

export async function getMember(id: string) {
  const req = await fetch(`https://discord.com/api/v9/guilds/${DISCORD_GUILD_ID}/members/${id}`, {
    headers: {
      authorization: `Bot ${DISCORD_TOKEN}`
    }
  }).then(r => r.json<DiscordMember | { code: number }>());

  if ('code' in req)
    if (req.code == 10007) throw { code: 'user_not_in_guild' };
    else throw { code: 'failed_to_check_guild' };
  else return req;
}