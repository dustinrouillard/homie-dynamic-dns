import { ZodError } from "zod";

import { CreateRecord, KVRecord, srvRecordParams, updatableDnsRecord } from "../types/DNS";
import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";
import { getRecord, updateRecord } from "../utils/cloudflare";

export async function UpdateDNS(request: ParsedRequest<{ Body: CreateRecord, Params: { id: string } }>, response: CraftedResponse, context: Context) {
  try {
    let validation = await updatableDnsRecord.parseAsync(request.body);

    const existingCheck = await Storage.get<KVRecord>(`ddns-by-id:${context.user.id}/${request.params.id}`, 'json');
    if (!existingCheck) return response.status(400).send({ code: 'cannot_find_record' });
    if (existingCheck.record.type == 'SRV') validation = { ...validation, ...await srvRecordParams.parseAsync(request.body) };

    const cfRecord = await getRecord(existingCheck.id);
    const existingName = (cfRecord.result.type == 'SRV' ? cfRecord.result.data.name : cfRecord.result.name).split(`.${cfRecord.result.zone_name}`)[0];

    if (typeof validation.name != 'undefined' && validation.name != existingName) {
      await Storage.delete(`ddns/${existingName}`);
      await Storage.put(`ddns/${validation.name}`, JSON.stringify({ user: context.user.id, record: { ...existingCheck.record, ...validation }, id: cfRecord.result.id }));
    }

    await Storage.put(`ddns-record-value:${cfRecord.result.id}`, validation.content);

    const record = await updateRecord(existingCheck.id, cfRecord, validation);
    await Storage.put(`ddns-by-id:${context.user.id}/${request.params.id}`, JSON.stringify({ user: context.user.id, record: { ...existingCheck.record, ...validation }, id: record.result.id }));

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

    console.error(error);
    return response.status(500).send({ code: 'internal_error' });
  }
}
