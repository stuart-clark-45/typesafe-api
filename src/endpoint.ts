export interface ReqOptions {
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  body?: any;
  /**
   * keys should be lowercase
   */
  headers?: Record<string, unknown>;
}

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
