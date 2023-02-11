export interface CFError {
  success: boolean;
  result: any;
  message: string[];
  errors: { code: number, message: string }[];
}

export interface CFRecord {
  result: {
    id: string;
    zone_id: string;
    zone_name: string,
    name: string;
    type: string;
    content: string;
    priority: number;
    proxiable: boolean;
    proxied: boolean;
    ttl: number;
    locked: boolean;
    data: {
      name: string;
      port: number;
      priority: number;
      proto: string;
      service: string;
      target: string;
      weight: number;
    };
    meta: {
      auto_added: boolean;
      managed_by_apps: boolean;
      managed_by_argo_tunnel: boolean;
      source: string;
    };
    comment: string;
    tags: string[];
    created_on: string;
    modified_on: string;
  }
}
