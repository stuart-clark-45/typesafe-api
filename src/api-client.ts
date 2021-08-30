import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { urlJoin } from 'url-join-ts';
import { AbstractEndpointDef, StandardEndpointDef } from './endpoint';
import { Route } from './route';

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

type RouteRequest<T extends AbstractEndpointDef> = (baseUrl: string) => RouteRequestCallable<T>;

export const createRouteRequest = <T extends AbstractEndpointDef>(route: Route): RouteRequest<T> => {
  const { method } = route;

  return (baseUrl: string): RouteRequestCallable<T> => {
    return async (options: T['requestOptions']): Promise<T['responseBody']> => {
      const { params, query, body, headers } = options;

      // Build the url
      const routePath = replaceUrlParams(route.path, params);
      const url = urlJoin(baseUrl, routePath);

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
  };
};

type ApiClientDef = {
  [key: string]: RouteRequest<AbstractEndpointDef>;
};

export type ApiClient<T extends ApiClientDef> = {
  [key in keyof T]: RouteRequestCallable<AbstractEndpointDef>;
};

export type ApiClientBuilder<T extends ApiClientDef> = (baseUrl: string) => ApiClient<T>;

export const apiClientBuilder = <T extends ApiClientDef>(apiDef: T): ApiClientBuilder<T> => {
  return (baseUrl: string): ApiClient<T> => {
    const apiClient: Partial<ApiClient<T>> = {};
    for (const [key, routeRequest] of Object.entries(apiDef)) {
      apiClient[key as keyof T] = routeRequest(baseUrl);
    }
    return apiClient as ApiClient<T>;
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
  const handler = handlers[err.response.data.status as keyof ErrorHandlers<T>];
  return handler(err);
};
