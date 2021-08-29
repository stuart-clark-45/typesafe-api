import axios, { AxiosRequestConfig } from 'axios';
import { urlJoin } from 'url-join-ts';
import { EndpointDef, ReqOptions } from '@src/endpoint';
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
export const replaceUrlParams = (path: string, params: Record<string, unknown>) => {
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      const pattern = new RegExp(`(:${key})(/|$)`);
      path = path.replace(pattern, `${value}$2`);
    }
  }

  return path;
};

export type RouteRequestType = EndpointDef<ReqOptions, any>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createRouteRequest = <T extends RouteRequestType>(route: Route, baseUrl: string) => {
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
