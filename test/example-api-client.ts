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
import { AbstractApiClient, ApiClientParams, createRouteRequest } from '../src';
import { AxiosRequestConfig } from 'axios';

class DogApiClient extends AbstractApiClient<DefaultReqOptions> {
  public createDog = createRouteRequest<CreateDogEndpointDef>(this, postDogRoute);
  public getDog = createRouteRequest<GetDogEndpointDef>(this, getDogRoute);
  public getDogs = createRouteRequest<GetDogsEndpointDef>(this, getDogsRoute);
}

export const defaultReqOptions: DefaultReqOptions = {
  headers: {
    myheader: 'default-header-value',
  },
};

export class RootApiClient extends AbstractApiClient<DefaultReqOptions> {
  constructor(params: ApiClientParams<DefaultReqOptions>, private axiosConfig?: AxiosRequestConfig) {
    super(params);
  }

  public async getDefaultReqOptions(): Promise<DefaultReqOptions> {
    return {
      ...defaultReqOptions,
      axiosConfig: this.axiosConfig,
    };
  }

  public dog = (): DogApiClient => new DogApiClient(this.getChildParams());
  public headerTest = createRouteRequest<HeaderTestEndpointDef>(this, headerTestRoute);
}
