import { ZodError } from "zod";
import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";

export async function ListDNS(request: ParsedRequest, response: CraftedResponse, context: Context) {
  try {
    const { keys } = await Storage.list({ prefix: `ddns-by-id:${context.user.id}` });

    return response.status(200).send(await Promise.all(keys.map(async ({ name }) => await Storage.get(name, 'json'))));
  } catch (error: any) {
    if (error instanceof ZodError)
      return response.status(500).send({ code: 'validation_error', error });

    if ('code' in error)
      return response.status(400).send(error);

    console.error(error);
    return response.status(500).send({ code: 'internal_error' });
  }
}
