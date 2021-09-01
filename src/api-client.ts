import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { RequireExactlyOne } from 'type-fest';
import { urlJoin } from 'url-join-ts';
import { AbstractEndpointDef, ReqOptions, StandardEndpointDef } from './endpoint';
import { Route } from './route';
import deepMerge from 'deepmerge';

export type ApiClientParams<DefaultReqOpt extends ReqOptions> = RequireExactlyOne<{
  baseUrl: string;
  parent: AbstractApiClient<DefaultReqOpt>;
}> & { defaultReqOptions: DefaultReqOpt };

export abstract class AbstractApiClient<T extends ReqOptions> {
  constructor(private params: ApiClientParams<T>) {}

  public getBaseUrl(): string {
    const { parent, baseUrl } = this.params;
    return parent?.getBaseUrl() || baseUrl;
  }

  public getDefaultReqOptions(): T {
    return this.params.defaultReqOptions;
  }

  public getChildParams(): ApiClientParams<T> {
    return {
      parent: this,
      defaultReqOptions: this.params.defaultReqOptions,
    };
  }
}

/**
 * e.g.
 *
 * params = {a: 1, b: 2}
 * path = "/something/:a/:b"
 * return value would be "/something/1/2"
 *
 * @param path
 * @param params
 */
export const replaceUrlParams = (path: string, params: Record<string, unknown>): string => {
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      const pattern = new RegExp(`(:${key})(/|$)`);
      path = path.replace(pattern, `${value}$2`);
    }
  }

  return path;
};

type RouteRequestCallable<T extends AbstractEndpointDef> = (
  options: T['clientReqOptions']
) => Promise<T['responseBody']>;

const getRequestOpts = <E extends AbstractEndpointDef, DefaultReqOpt extends ReqOptions>(
  apiClient: AbstractApiClient<DefaultReqOpt>,
  reqOptions: E['clientReqOptions']
) => {
  const mergeOptions: deepMerge.Options = {
    arrayMerge: (destinationArray: any[], sourceArray: any[]) => sourceArray,
  };
  return deepMerge(apiClient.getDefaultReqOptions(), reqOptions, mergeOptions);
};

const callRoute = async <E extends AbstractEndpointDef>(
  apiClient: AbstractApiClient<E['defaultReqOptions']>,
  route: Route,
  options: ReqOptions
): Promise<E['responseBody']> => {
  const { params, query, body, headers } = getRequestOpts(apiClient, options);
  const { method } = route;

  // Build the url
  const routePath = replaceUrlParams(route.path, params);
  const url = urlJoin(apiClient.getBaseUrl(), routePath);

  // Make the request
  const config: AxiosRequestConfig = {
    method,
    url,
    params: query,
    data: body,
    headers,
    validateStatus: (status) => status >= 200 && status < 300,
  };
  const response = await axios.request<E['responseBody']>(config);
  return response.data;
};

export const createRouteRequest = <T extends AbstractEndpointDef>(
  apiClient: AbstractApiClient<T['defaultReqOptions']>,
  route: Route
): RouteRequestCallable<T> => {
  return async (options: T['clientReqOptions']): Promise<T['responseBody']> => {
    return callRoute<T>(apiClient, route, options);
  };
};

/*
 * Error handling
 */

type ErrorStatuses<T extends StandardEndpointDef> = T['errorType']['status'];

type ErrorHandlerFnc<T extends StandardEndpointDef> = (err: AxiosError<T['errorType']>) => void | Promise<void>;

export type ErrorHandlers<T extends StandardEndpointDef> = {
  [key in ErrorStatuses<T>]: ErrorHandlerFnc<T>;
};

export const handleError = <T extends StandardEndpointDef>(
  err: AxiosError<T['errorType']>,
  handlers: ErrorHandlers<T>
): void | Promise<void> => {
  // Double check the right error has been given here, {@code err} is unlikely to be typed
  // when given as parameter due to the nature of "try catch"
  const isAxiosError = err?.isAxiosError;

  // Check to see if we have a status
  const status = isAxiosError && err?.response?.status;

  // Try to get a handler
  const handler = status && handlers[status as keyof ErrorHandlers<T>];
  if (!handler) {
    throw err;
  }

  return handler(err);
};
