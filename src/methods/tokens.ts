import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";
import { random } from "../utils/strings";

export async function GenerateToken(request: ParsedRequest, response: CraftedResponse, context: Context) {
  if (context.token_type == 'at') return response.status(400).send({ code: 'access_token_cannot_regenerate_token' });

  const token = `at_${random(32)}`;

  const existingToken = await Storage.get(`ddns-access-token-by-user/${context.user.id}`);
  if (existingToken) await Storage.delete(`ddns-access-token/${token}`);
  await Storage.put(`ddns-access-token-by-user/${context.user.id}`, token);
  await Storage.put(`tokens/${token}`, context.user.id);

  return response.status(200).send({ id: context.user.id, token });
}
