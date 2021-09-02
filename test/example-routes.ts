import { EndpointDef, ErrorType, ReqOptions, Route } from '../src';
import { Dog, DogWithId } from './dog';

export interface DefaultReqOptions extends ReqOptions {
  headers: {
    myheader: string;
  };
}

// Post dog route
export const postDogRoute: Route = {
  method: 'post',
  path: '/dog',
};

// Create dog endpoint
export interface CreateDogReq extends ReqOptions {
  body: Dog;
}
export type CreateDogEndpointDef = EndpointDef<DefaultReqOptions, CreateDogReq, DogWithId>;

// Get dogs route
export const getDogsRoute: Route = {
  method: 'get',
  path: '/dog',
};

// Get dogs endpoint
export type GetDogsEndpointDef = EndpointDef<DefaultReqOptions, ReqOptions, DogWithId[]>;

// Get dog route
export const getDogRoute: Route = {
  method: 'get',
  path: '/dog/:_id',
};

// Get dogs endpoint
export interface GetDogReq extends ReqOptions {
  params: {
    _id: string;
  };
}

export type GetDogErrorType = ErrorType<500 | 404>;

export type GetDogEndpointDef = EndpointDef<DefaultReqOptions, GetDogReq, DogWithId, GetDogErrorType>;

// Header test endpoint
export const headerTestRoute: Route = {
  method: 'get',
  path: '/header-tst',
};

// Header test endpoint
export interface HeaderTestReq extends ReqOptions {
  headers?: {
    myheader?: string;
  };
}

export interface HeaderTestResp {
  headerValue: string;
}

export type HeaderTestEndpointDef = EndpointDef<DefaultReqOptions, ReqOptions, HeaderTestResp>;
