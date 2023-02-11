import { ZodError } from "zod";
import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";
import { cacheData } from "../utils/cache";
import { getRecord } from "../utils/cloudflare";

export async function GetDNS(request: ParsedRequest<{ Params: { id: string } }>, response: CraftedResponse, context: Context) {
  try {
    const record = await Storage.get(`ddns-by-id:${context.user.id}/${request.params.id}`, 'json');
    if (!record) return response.status(500).send({ code: 'invalid_record_id' });

    const cfRecord = await getRecord(request.params.id);
    const data = await cacheData(`cf-ddns/${cfRecord.result.id}`, cfRecord.result);

    return response.status(200).send({
      id: data.id,
      name: data.name,
      type: data.type,
      ttl: data.ttl,
      content: data.type != 'SRV' ? data.content : undefined,
      data: data.type == 'SRV' ? data.data : undefined,
    });
  } catch (error: any) {
    if (error instanceof ZodError)
      return response.status(500).send({ code: 'validation_error', error });

    if ('code' in error)
      return response.status(400).send(error);

    console.error(error);
    return response.status(500).send({ code: 'internal_error' });
  }
}
