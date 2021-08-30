import {
  CreateDogEndpointDef,
  GetDogEndpointDef,
  getDogRoute,
  GetDogsEndpointDef,
  getDogsRoute,
  HeaderTestEndpointDef,
  headerTestRoute,
  postDogRoute,
} from './example-routes';
import { AbstractApiClient, createRouteRequest } from '../src';

class DogApiClient extends AbstractApiClient {
  public createDog = createRouteRequest<CreateDogEndpointDef>(this, postDogRoute);
  public getDog = createRouteRequest<GetDogEndpointDef>(this, getDogRoute);
  public getDogs = createRouteRequest<GetDogsEndpointDef>(this, getDogsRoute);
}

export class RootApiClient extends AbstractApiClient {
  public dog = (): DogApiClient => new DogApiClient(null, this);
  public headerTest = createRouteRequest<HeaderTestEndpointDef>(this, headerTestRoute);
}
