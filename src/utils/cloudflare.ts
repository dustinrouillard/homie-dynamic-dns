import { CFError, CFRecord } from "../types/Cloudflare";
import { CreateRecord, SRVRecord, UpdateRecord } from "../types/DNS";

export async function createRecord(record: CreateRecord | (CreateRecord & SRVRecord), comment: string) {
  if (!record.ttl) record.ttl = 1; // 1 = Auto

  let cfRecord: any = record;
  if (record.type == 'SRV' && 'service' in record) {
    cfRecord = {
      type: "SRV",
      data: {
        service: record.service,
        proto: record.proto == 'TCP' ? '_tcp' : '_udp',
        name: record.name,
        priority: record.priority,
        weight: record.weight,
        port: record.port,
        target: record.content
      }
    }
  }

  const req = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${CLOUDFLARE_API_KEY}`
    },
    body: JSON.stringify({
      comment,
      ...cfRecord
    })
  });

  if (req.status != 200) {
    const { errors: [error] } = await req.json<CFError>();
    if (error.code == 81057) throw { code: 'name_already_taken' };
    throw { code: 'unknown_error' };
  }

  const json = await req.json<CFRecord>();
  return json;
}

export async function deleteRecord(id: string) {
  const req = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${id}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${CLOUDFLARE_API_KEY}` },
  });

  if (req.status != 200)
    return console.log('req failed to delete dns record');

  const json = await req.json();
  console.log(json);
}

export async function getRecord(id: string) {
  const req = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${id}`, {
    headers: { authorization: `Bearer ${CLOUDFLARE_API_KEY}` }
  });

  if (req.status != 200) {
    const { errors: [error] } = await req.json<CFError>();
    console.log(error, 'cf error');
    throw { code: 'unknown_error' };
  }

  const json = await req.json<CFRecord>();
  return json;
}

export async function updateRecord(id: string, existing: CFRecord, record: UpdateRecord | (UpdateRecord & SRVRecord)) {
  if (!record.ttl) record.ttl = existing.result.ttl || 1; // 1 = Auto

  let cfRecord: any = record;
  if (existing.result.type == 'SRV') {
    cfRecord = {
      type: "SRV",
      name: cfRecord.name,
      data: {
        service: cfRecord.service,
        proto: cfRecord.proto ? cfRecord.proto == 'TCP' ? '_tcp' : '_udp' : undefined,
        name: cfRecord.name,
        priority: cfRecord.priority,
        weight: cfRecord.weight,
        port: cfRecord.port,
        target: cfRecord.content
      }
    }
  }

  const req = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${id}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${CLOUDFLARE_API_KEY}`
    },
    body: JSON.stringify(cfRecord)
  });

  if (req.status != 200) {
    const { errors: [error] } = await req.json<CFError>();
    if (error.code == 81057) throw { code: 'name_already_taken' };
    else if (error.code == 81058) throw { code: 'name_already_taken' };
    console.log(error, 'cf error');
    throw { code: 'unknown_error' };
  }

  const json = await req.json<CFRecord>();
  return json;
}