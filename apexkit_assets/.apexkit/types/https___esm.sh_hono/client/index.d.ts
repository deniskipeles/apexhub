/**
 * @module
 * The HTTP Client for Hono.
 */
export { hc } from './client.d.ts';
export { parseResponse, DetailedError } from './utils.d.ts';
export type { InferResponseType, InferRequestType, Fetch, ClientRequestOptions, ClientRequest, ClientResponse, ApplyGlobalResponse, PickResponseByStatusCode, } from './types.d.ts';
