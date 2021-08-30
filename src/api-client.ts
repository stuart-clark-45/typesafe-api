import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { urlJoin } from 'url-join-ts';
import { AbstractEndpointDef, ReqOptions, StandardEndpointDef } from './endpoint';
import { Route } from './route';

export abstract class AbstractApiClient {
  constructor(private baseUrl: string | null, private parent?: AbstractApiClient) {}

  public getBaseUrl(): string {
    return this.parent?.getBaseUrl() || this.baseUrl;
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

type RouteRequestCallable<T extends AbstractEndpointDef> = (options: T['requestOptions']) => Promise<T['responseBody']>;

const callRoute = async <T extends AbstractEndpointDef>(
  apiClient: AbstractApiClient,
  route: Route,
  options: ReqOptions
): Promise<T['responseBody']> => {
  const { params, query, body, headers } = options;
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
  const response = await axios.request<T['responseBody']>(config);
  return response.data;
};

export const createRouteRequest = <T extends AbstractEndpointDef>(
  apiClient: AbstractApiClient,
  route: Route
): RouteRequestCallable<T> => {
  return async (options: T['requestOptions']): Promise<T['responseBody']> => {
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
  if (!err?.isAxiosError) {
    throw err;
  }

  const status = err.response.data.status;
  const handler = handlers[status as keyof ErrorHandlers<T>];
  if (!handler) {
    throw err;
  }
  return handler(err);
};
