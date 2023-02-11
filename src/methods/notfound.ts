import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";

export function NotFound(request: ParsedRequest, response: CraftedResponse, context: Context) {
  return response.status(404).send({ error: true, code: 'not_found' });
}
