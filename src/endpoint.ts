import { Deepmerge } from './type/deepmerge';
import { AxiosRequestConfig } from 'axios';

/* eslint-disable @typescript-eslint/ban-types */
// We need to use the {} type here or merging default and endpoint request options doesn't work
export interface ReqOptions {
  query?: {};
  params?: {};
  body?: any;
  /**
   * keys should be lowercase
   */
  headers?: {};
  axiosConfig?: AxiosRequestConfig;
}

export interface ResOptions {
  body: any;
  headers: {};
}
/* eslint-enable @typescript-eslint/ban-types */

export interface ErrorType<S extends number = 500> {
  status: S;
  msg: string;
}

export interface EndpointDef<
  DefaultReqOpt extends ReqOptions,
  ReqOpt extends ReqOptions,
  ResOpt extends ResOptions,
  E = ErrorType
> {
  requestOptions: Deepmerge<DefaultReqOpt, ReqOpt>;
  defaultReqOptions: DefaultReqOpt;
  // These are the parameters that will be required by the API client
  clientReqOptions: ReqOpt;
  responseOptions: ResOpt;
  errorType: E;
}

export type ResponseBody<T extends AbstractEndpointDef> = T['responseOptions']['body'];

export type ResponseHeaders<T extends AbstractEndpointDef> = T['responseOptions']['headers'];

export type StandardEndpointDef = EndpointDef<any, any, any, ErrorType<any>>;

export type AbstractEndpointDef = EndpointDef<any, any, any, any>;
