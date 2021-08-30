import {
  CreateDogEndpointDef,
  GetDogEndpointDef,
  getDogRoute,
  GetDogsEndpointDef,
  getDogsRoute,
  postDogRoute,
} from './example-routes';
import { ApiClientDef, apiClientBuilder, createRouteRequest } from '../src';

const clientDef: ApiClientDef = {
  createDog: createRouteRequest<CreateDogEndpointDef>(postDogRoute),
  getDog: createRouteRequest<GetDogEndpointDef>(getDogRoute),
  getDogs: createRouteRequest<GetDogsEndpointDef>(getDogsRoute),
};

export const apiClient = apiClientBuilder(clientDef);
