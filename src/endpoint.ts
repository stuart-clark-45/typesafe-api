
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
}
/* eslint-enable @typescript-eslint/ban-types */

export interface ErrorType<S extends number = 500> {
  status: S;
  msg: string;
}

export interface EndpointDef<ReqOpt extends ReqOptions, RespT, E = ErrorType> {
  requestOptions: ReqOpt;
  responseBody: RespT;
  errorType: E;
}

export type StandardEndpointDef = EndpointDef<any, any, ErrorType<any>>;

export type AbstractEndpointDef = EndpointDef<any, any, any>;
