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

type RouteRequestCallable<T extends AbstractEndpointDef> = {
  (options: T['clientReqOptions'], fullResponse: true, requestAxiosConfig?: AxiosRequestConfig): Promise<
    TAxiosResponse<T>
  >;
  (options: T['clientReqOptions'], fullResponse?: false, requestAxiosConfig?: AxiosRequestConfig): Promise<
    ResponseBody<T>
  >;
};

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
  reqOptions: ReqOptions,
  fullResponse?: boolean
): Promise<TAxiosResponse<E> | ResponseBody<E>> => {
  const { params, query, body, headers } = getRequestOpts(apiClient, reqOptions);
  const { method } = route;

  // Build the url
  const routePath = replaceUrlParams(route.path, params);
  const url = urlJoin(apiClient.getBaseUrl(), routePath);

  // Make the request
  const config: AxiosRequestConfig = {
    validateStatus: (status) => status >= 200 && status < 300,
    ...apiClient.getDefaultAxiosConfig(),
    method,
    url,
    // Just in case this has slipped in as part of the default axios config
    baseURL: undefined,
    params: query,
    data: body,
    headers,
    ...(reqOptions.axiosConfig || {}),
  };

  const resp = await axios.request<ResponseBody<E>>(config);
  return fullResponse ? resp : resp.data;
};

export const createRouteRequest = <T extends AbstractEndpointDef>(
  apiClient: AbstractApiClient<T['defaultReqOptions']>,
  route: Route
): RouteRequestCallable<T> => {
  return async (
    options: T['clientReqOptions'],
    fullResponse?: boolean
  ): Promise<TAxiosResponse<T> | ResponseBody<T>> => {
    return callRoute<T>(apiClient, route, options, fullResponse);
  };
};
