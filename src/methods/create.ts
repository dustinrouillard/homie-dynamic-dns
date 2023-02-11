import { ZodError } from "zod";
import { CreateRecord, dnsRecord, srvRecordParams } from "../types/DNS";
import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";
import { createRecord } from "../utils/cloudflare";

export async function CreateDNS(request: ParsedRequest<{ Body: CreateRecord }>, response: CraftedResponse, context: Context) {
  try {
    let validation = await dnsRecord.parseAsync(request.body);
    if (validation.type == 'SRV') validation = { ...validation, ...await srvRecordParams.parseAsync(request.body) };

    const existingCheck = await Storage.get(`ddns/${validation.name}`, 'json');
    if (existingCheck) return response.status(400).send({ code: 'name_already_taken' });

    const record = await createRecord(validation, `DDNS Entry for ${context.user.username} (${context.user.id})`);
    await Storage.put(`ddns/${validation.name}`, JSON.stringify({ user: context.user.id, record: validation, id: record.result.id }));
    await Storage.put(`ddns-by-id:${context.user.id}/${record.result.id}`, JSON.stringify({ user: context.user.id, record: validation, id: record.result.id }));

    return response.status(200).send({
      id: record.result.id,
      name: record.result.name,
      type: record.result.type,
      ttl: record.result.ttl,
      content: record.result.type != 'SRV' ? record.result.content : undefined,
      data: record.result.type == 'SRV' ? record.result.data : undefined,
    });
  } catch (error: any) {
    if (error instanceof ZodError)
      return response.status(500).send({ code: 'validation_error', error });

    if ('code' in error)
      return response.status(400).send(error);

    return response.status(500).send({ code: 'internal_error' });
  }
}
