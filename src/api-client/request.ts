import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { urlJoin } from 'url-join-ts';
import { AbstractEndpointDef, ReqOptions, ResponseBody, ResponseHeaders } from '../endpoint';
import { Route } from '../route';
import deepMerge from 'deepmerge';
import { AbstractApiClient } from './api-client';

export interface TAxiosResponse<T extends AbstractEndpointDef> extends AxiosResponse<ResponseBody<T>> {
  headers: ResponseHeaders<T>;
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

const getRequestOpts = async <E extends AbstractEndpointDef, DefaultReqOpt extends ReqOptions>(
  defaultReqOpt: DefaultReqOpt,
  reqOptions: E['clientReqOptions']
) => {
  const mergeOptions: deepMerge.Options = {
    arrayMerge: (destinationArray: any[], sourceArray: any[]) => sourceArray,
  };
  return deepMerge(defaultReqOpt, reqOptions, mergeOptions);
};

const callRoute = async <E extends AbstractEndpointDef>(
  apiClient: AbstractApiClient<E['defaultReqOptions']>,
  route: Route,
  reqOptions: ReqOptions
): Promise<TAxiosResponse<E>> => {
  const defaultReqOpt = await apiClient.getDefaultReqOptions();
  const { params, query, body, headers } = await getRequestOpts(defaultReqOpt, reqOptions);
  const { method } = route;

  // Build the url
  const routePath = replaceUrlParams(route.path, params);
  const url = urlJoin(apiClient.getBaseUrl(), routePath);

  // Make the request
  const defaultAxiosConfig = defaultReqOpt.axiosConfig ?? {};
  const config: AxiosRequestConfig = {
    validateStatus: (status) => status >= 200 && status < 300,
    ...defaultAxiosConfig,
    method,
    url,
    // Just in case this has slipped in as part of the default axios config
    baseURL: undefined,
    params: query,
    data: body,
    headers,
    ...(reqOptions.axiosConfig || {}),
  };

  return axios.request(config);
};

type RouteRequestCallable<T extends AbstractEndpointDef> = (
  options: T['clientReqOptions']
) => Promise<TAxiosResponse<T>>;

export const createRouteRequest = <T extends AbstractEndpointDef>(
  apiClient: AbstractApiClient<T['defaultReqOptions']>,
  route: Route
): RouteRequestCallable<T> => {
  return async (options: T['clientReqOptions']): Promise<TAxiosResponse<T>> => {
    return callRoute<T>(apiClient, route, options);
  };
};
