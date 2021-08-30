import { createRouteRequest, replaceUrlParams, RouteRequestType } from '../src/api-client';
import { Route } from '../src/route';
import nock from 'nock';
import {
  CreateDogEndpointDef,
  GetDogEndpointDef,
  getDogRoute,
  GetDogsEndpointDef,
  getDogsRoute,
  postDogRoute,
} from './example-routes';

it('replaceUrlParams(..)', async () => {
  const params = { a: 1, b: 2 };
  const path = '/something/:a/:b';
  expect(replaceUrlParams(path, params)).toBe('/something/1/2');
});

describe('Test creating API client', () => {
  const baseUrl = 'http://not-real';
  const interceptor = nock(baseUrl);
  const createRequest = <T extends RouteRequestType>(route: Route) => createRouteRequest<T>(route, baseUrl);
  const client = {
    createDog: createRequest<CreateDogEndpointDef>(postDogRoute),
    getDog: createRequest<GetDogEndpointDef>(getDogRoute),
    getDogs: createRequest<GetDogsEndpointDef>(getDogsRoute),
  };

  const dog = {
    name: 'Scooby Doo',
    breed: 'Great Dane',
  };

  const dogWithId = {
    ...dog,
    _id: 'fakeId',
  };

  const createDogOpts = {
    body: dog,
  };

  it('createDog(..) 200', async () => {
    interceptor.post(postDogRoute.path, dog).reply(200, dogWithId);

    const resp = await client.createDog(createDogOpts);

    expect(resp).toStrictEqual(dogWithId);
  });

  it('createDog(..) 500', async () => {
    interceptor.post(postDogRoute.path, dog).reply(500, { msg: 'failed' });
    expect(client.createDog(createDogOpts)).rejects.toThrow(/Request failed with status code 500/);
  });
});
