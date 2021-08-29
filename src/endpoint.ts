export interface ReqOptions {
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  body?: any;
  headers?: Record<string, unknown>;
}

export interface EndpointDef<ReqOpt extends ReqOptions, RespT> {
  requestOptions: ReqOpt;
  responseBody: RespT;
}

export type AbstractEndpointDef = EndpointDef<any, any>;
