import { routeRequestCreator } from '../src';
import {
  CreateDogEndpointDef,
  GetDogEndpointDef,
  getDogRoute,
  GetDogsEndpointDef,
  getDogsRoute,
  postDogRoute,
} from './example-routes';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createApiClient = (baseUrl: string) => {
  const createRequest = routeRequestCreator(baseUrl);
  return {
    createDog: createRequest<CreateDogEndpointDef>(postDogRoute),
    getDog: createRequest<GetDogEndpointDef>(getDogRoute),
    getDogs: createRequest<GetDogsEndpointDef>(getDogsRoute),
  };
};
