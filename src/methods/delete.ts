import { ZodError } from "zod";

import { KVRecord } from "../types/DNS";
import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";
import { deleteRecord } from "../utils/cloudflare";

export async function DeleteDNS(request: ParsedRequest<{ Params: { id: string } }>, response: CraftedResponse, context: Context) {
  try {
    const existingCheck = await Storage.get<KVRecord>(`ddns-by-id:${context.user.id}/${request.params.id}`, 'json');
    if (!existingCheck) return response.status(400).send({ code: 'cannot_find_record' });

    await Storage.delete(`ddns-by-id:${context.user.id}/${request.params.id}`);
    await Storage.delete(`ddns/${existingCheck.record.name}`);
    await deleteRecord(existingCheck.id);

    return response.status(204).send();
  } catch (error: any) {
    if ('code' in error)
      return response.status(400).send(error);

    console.error(error);
    return response.status(500).send({ code: 'internal_error' });
  }
}
