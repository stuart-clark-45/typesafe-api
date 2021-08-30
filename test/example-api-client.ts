import {
  CreateDogEndpointDef,
  GetDogEndpointDef,
  getDogRoute,
  GetDogsEndpointDef,
  getDogsRoute,
  postDogRoute,
} from './example-routes';
import { AbstractApiClient, createRouteRequest } from '../src';

export class DogApiClient extends AbstractApiClient {
  public createDog = createRouteRequest<CreateDogEndpointDef>(this, postDogRoute);
  public getDog = createRouteRequest<GetDogEndpointDef>(this, getDogRoute);
  public getDogs = createRouteRequest<GetDogsEndpointDef>(this, getDogsRoute);
}
