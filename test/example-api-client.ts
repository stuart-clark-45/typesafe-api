import {
  CreateDogEndpointDef,
  DefaultReqOptions,
  GetDogEndpointDef,
  getDogRoute,
  GetDogsEndpointDef,
  getDogsRoute,
  HeaderTestEndpointDef,
  headerTestRoute,
  postDogRoute,
} from './example-routes';
import { AbstractApiClient, createRouteRequest } from '../src';

class DogApiClient extends AbstractApiClient<DefaultReqOptions> {
  public createDog = createRouteRequest<CreateDogEndpointDef>(this, postDogRoute);
  public getDog = createRouteRequest<GetDogEndpointDef>(this, getDogRoute);
  public getDogs = createRouteRequest<GetDogsEndpointDef>(this, getDogsRoute);
}

export class RootApiClient extends AbstractApiClient<DefaultReqOptions> {
  public dog = (): DogApiClient => new DogApiClient(this.getChildParams());
  public headerTest = createRouteRequest<HeaderTestEndpointDef>(this, headerTestRoute);
}
