/**
 * @module
 *
 * Hono - Web Framework built on Web Standards
 *
 * @example
 * ```ts
 * import { Hono } from 'hono'
 * const app = new Hono()
 *
 * app.get('/', (c) => c.text('Hono!'))
 *
 * export default app
 * ```
 */
import { Hono } from './hono.d.ts';
/**
 * Types for environment variables, error handlers, handlers, middleware handlers, and more.
 */
export type { Env, ErrorHandler, Handler, MiddlewareHandler, Next, NotFoundResponse, NotFoundHandler, ValidationTargets, Input, Schema, ToSchema, TypedResponse, } from './types.d.ts';
/**
 * Types for context, context variable map, context renderer, and execution context.
 */
export { Context } from './context.d.ts';
export type { ContextVariableMap, ContextRenderer, ExecutionContext } from './context.d.ts';
/**
 * Type for HonoRequest.
 */
export type { HonoRequest } from './request.d.ts';
/**
 * Types for inferring request and response types and client request options.
 */
export type { InferRequestType, InferResponseType, ClientRequestOptions } from './client/index.d.ts';
/**
 * Hono framework for building web applications.
 */
export { Hono };
