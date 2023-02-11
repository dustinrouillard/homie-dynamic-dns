import { CraftedResponse, ParsedRequest } from "./types/Routes";

export async function Authentication(request: ParsedRequest, response: CraftedResponse) {
  if (!request.headers.authorization) return response.status(403).send({ error: 'requires_authentication' });

  let record_id;
  if (!request.headers.authorization) return response.status(403).send({ error: 'requires_authentication' });

  const [token_type, token] = request.headers.authorization.split('_');
  if (!token) return response.status(403).send({ error: 'requires_authentication' });

  if (!['at', 'session'].includes(token_type)) return response.status(400).send({ error: 'invalid_token_type' });

  const id = await Storage.get(`tokens/${token_type}_${token}`);
  const rawUser = await Storage.get(`user/${id}`);
  if (!rawUser) return response.status(400).send({ error: 'invalid_user_with_authentication' });
  const user = JSON.parse(rawUser);
  if (user) delete user.token;

  return { user, token_type, record_id };
}