import { EndpointDef, ReqOptions } from '../src/endpoint';
import { Route } from '../src/route';
import { createRouteRequest, RouteRequestType } from '../src/api-client';

interface Dog {
  name: string;
  breed: string;
}

interface DogWithId extends Dog {
  _id: string;
}

// Post dog route
export  const postDogRoute: Route = {
  method: 'post',
  path: '/dog',
};

// Create dog endpoint
interface CreateDogReq extends ReqOptions {
  body: Dog;
}
export type CreateDogEndpointDef = EndpointDef<CreateDogReq, DogWithId>;

// Get dog route
export  const getDogRoute: Route = {
  method: 'get',
  path: '/dog',
};

// Get dogs endpoint
export  type GetDogsEndpointDef = EndpointDef<ReqOptions, DogWithId[]>;

// Get dogs endpoint
interface GetDogReq extends ReqOptions {
  params: {
    _id: string;
  };
}
export  type GetDogEndpointDef = EndpointDef<GetDogReq, DogWithId>;
