import { CreateRecord } from "../types/DNS";
import { Context, CraftedResponse, ParsedRequest } from "../types/Routes";
import { getRecord, updateRecord } from "../utils/cloudflare";

export async function UpdateHost(request: ParsedRequest<{ Params: { id: string } }>, response: CraftedResponse, context: Context) {
  const ip = request.headers['cf-connecting-ip'] || '8.8.8.8';
  const { id } = request.params;

  const authCheck = await Storage.get<{ user: string, record: CreateRecord }>(`ddns-by-id:${context.user.id}/${id}`, 'json');
  if (!authCheck || authCheck.user != context.user.id) return response.status(400).send({ code: 'not_permitted_for_name' });

  const cfRecord = await getRecord(id);
  if (!['A', 'AAAA'].includes(cfRecord.result.type)) return response.status(400).send({ code: 'invalid_auto_update_type' });

  const newRecord = { ...authCheck.record, content: ip };

  await updateRecord(id, cfRecord, newRecord);
  await Storage.put(`ddns-by-id:${context.user.id}/${request.params.id}`, JSON.stringify({ ...authCheck, record: newRecord, id }));
  await Storage.put(`ddns-record-value:${id}`, ip);

  return response.status(200).send({ id, user: context.user.id, ip });
}

export async function DynamicUpdate(request: ParsedRequest<{ Query: { ip: string } }>, response: CraftedResponse, context: Context) {
  const ip = request.query.ip || request.headers['cf-connecting-ip'] || '8.8.8.8';
  const { record_id: id } = context;

  const authCheck = await Storage.get<{ user: string, record: CreateRecord }>(`ddns-by-id:${context.user.id}/${id}`, 'json');
  if (!authCheck || authCheck.user != context.user.id) return response.status(400).send({ code: 'not_permitted_for_name' });

  const cfRecord = await getRecord(id);
  if (!['A', 'AAAA'].includes(cfRecord.result.type)) return response.status(400).send({ code: 'invalid_auto_update_type' });

  const newRecord = { ...authCheck.record, content: ip };

  await updateRecord(id, cfRecord, newRecord);
  await Storage.put(`ddns-by-id:${context.user.id}/${id}`, JSON.stringify({ ...authCheck, record: newRecord, id }));
  await Storage.put(`ddns-record-value:${id}`, ip);

  return response.status(200).send({ id, user: context.user.id, ip });
}
