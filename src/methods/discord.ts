import { convertDiscordTokens, getDiscordUser, getMember } from "../utils/discord";
import { DiscordUser } from "../types/Discord";
import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";
import { random } from "../utils/strings";

export async function RequestAuthentication(request: ParsedRequest<{ Query: { code?: string } }>, response: CraftedResponse, context: Context) {
  if (request.query.code) return CallbackAuthentication(request, response, context);
  const url = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${DISCORD_REDIRECT_URI}&scope=identify`;
  return response.status(200).send({ url });
}

export async function CallbackAuthentication(request: ParsedRequest<{ Query: { code?: string } }>, response: CraftedResponse, context: Context) {
  try {
    const token = await convertDiscordTokens(request.query.code ?? '');
    const user = await getDiscordUser(token);

    if (typeof DISCORD_GUILD_ID != 'undefined') {
      const member = await getMember(user.id);

      if (typeof DISCORD_ROLE_ID != 'undefined' && !member.roles.includes(DISCORD_ROLE_ID))
        throw { code: 'member_missing_role' };
    }

    // Check if the user is in the database
    let dbUser = await Storage.get<DiscordUser & { token: string }>(`user/${user.id}`, { type: 'json', cacheTtl: 60 });
    const userToken = dbUser?.token || `session_${random(64)}`;
    if (!dbUser) {
      dbUser = { ...user, token: userToken };
      await Storage.put(`user/${user.id}`, JSON.stringify(dbUser));
      await Storage.put(`tokens/${userToken}`, user.id.toString());
    }

    response = response.header('set-cookie', `dns_session=${userToken}; HttpOnly; Expires=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}`);

    return response.status(201).send({ id: user.id, token: userToken });
  } catch (error: any) {
    if (error && error.code) return response.status(400).send({ code: error.code });
    console.error('error', error);
  }
}