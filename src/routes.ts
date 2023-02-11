import Route from 'route-parser';

import { Base } from './methods/base';
import { FetchUser } from './methods/user';
import { DynamicUpdate, UpdateHost } from './methods/auto';
import { CreateDNS } from './methods/create';
import { UpdateDNS } from './methods/update';
import { ListDNS } from './methods/list';
import { DeleteDNS } from './methods/delete';
import { GenerateToken } from './methods/tokens';
import { CallbackAuthentication, RequestAuthentication } from './methods/discord';

import { Authentication } from './middleware';

import { RouteDefinition } from './types/Routes';
import { GetDNS } from './methods/get';

export const routes: RouteDefinition[] = [
  { route: new Route('/'), method: 'GET', handler: Base },
  { route: new Route('/list'), method: 'GET', handler: ListDNS, middlewares: [Authentication] },
  { route: new Route('/user'), method: 'GET', handler: FetchUser, middlewares: [Authentication] },
  { route: new Route('/create'), method: 'POST', handler: CreateDNS, middlewares: [Authentication] },
  { route: new Route('/token'), method: 'POST', handler: GenerateToken, middlewares: [Authentication] },

  { route: new Route('/nic/update'), method: 'GET', handler: DynamicUpdate, middlewares: [Authentication] },
  { route: new Route('/records/:id'), method: 'GET', handler: GetDNS, middlewares: [Authentication] },
  { route: new Route('/records/:id'), method: 'POST', handler: UpdateHost, middlewares: [Authentication] },
  { route: new Route('/records/:id'), method: 'PATCH', handler: UpdateDNS, middlewares: [Authentication] },
  { route: new Route('/records/:id'), method: 'DELETE', handler: DeleteDNS, middlewares: [Authentication] },

  { route: new Route('/authenticate'), method: 'GET', handler: RequestAuthentication },
  { route: new Route('/authenticate'), method: 'POST', handler: CallbackAuthentication },
];
