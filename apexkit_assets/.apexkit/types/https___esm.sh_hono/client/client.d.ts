import type { Hono } from '../hono.d.ts';
import type { UnionToIntersection } from '../utils/types.d.ts';
import type { Client, ClientRequestOptions } from './types.d.ts';
export declare const hc: <T extends Hono<any, any, any>, Prefix extends string = string>(baseUrl: Prefix, options?: ClientRequestOptions) => UnionToIntersection<Client<T, Prefix>>;
