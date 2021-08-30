import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { urlJoin } from 'url-join-ts';
import {
  AbstractEndpointDef,
  EndpointDef,
  ErrorType,
  ReqOptions,
  StandardEndpointDef
} from '@src/endpoint';
import { Route } from '@src/route';

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

export type RouteRequestType = EndpointDef<ReqOptions, any, any>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createRouteRequest = <T extends RouteRequestType>(route: Route, baseUrl: string) => {
  const { method } = route;

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

export const routeRequestCreator = (baseUrl: string) => {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  return <T extends RouteRequestType>(route: Route) => createRouteRequest<T>(route, baseUrl);
};

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
