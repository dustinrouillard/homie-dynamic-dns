import { z } from "zod";

export type DNSType = 'A' | 'AAAA' | 'CNAME' | 'SRV';
export const srvProtocols = ['TCP', 'UDP'] as const;
export const allowedTypes = ['A', 'AAAA', 'CNAME', 'SRV'] as const;

export const dnsRecord = z.object({
  name: z.string(),
  type: z.enum(allowedTypes),
  content: z.string(),
  ttl: z.number().optional(),
});

export type CreateRecord = z.infer<typeof dnsRecord>;

export const updatableDnsRecord = z.object({
  name: z.string(),
  content: z.string(),
  ttl: z.number().optional(),
  service: z.string().optional()
});

export type UpdateRecord = z.infer<typeof updatableDnsRecord>;

export const srvRecordParams = z.object({
  service: z.string(),
  proto: z.enum(srvProtocols),
  priority: z.number(),
  weight: z.number(),
  port: z.number(),
});

export type SRVRecord = z.infer<typeof srvRecordParams>;

export interface KVRecord {
  user: string;
  record: CreateRecord | (CreateRecord & SRVRecord);
  id: string
}