import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";

export async function FetchUser(request: ParsedRequest, response: CraftedResponse, context: Context) {
  return response.status(200).send({
    id: context.user.id,
    username: context.user.username,
    avatar: context.user.avatar
  });
}
