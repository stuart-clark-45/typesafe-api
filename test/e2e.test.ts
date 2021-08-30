import { clearDogDB, scoobyDoo } from './dog';
import { startApp } from './example-express';
import { createApiClient } from './example-api-client';

export const OBJECT_ID_STRING = /^[a-f\d]{24}$/i;

let baseUrl: string;
let server: any;
beforeAll(async () => {
  const appStarted = await startApp();
  baseUrl = appStarted.baseUrl;
  server = appStarted.server;
  clearDogDB();
});

afterAll(async () => {
  clearDogDB();
  server.close();
});

it('Test API', async () => {
  const apiClient = createApiClient(baseUrl);

  // Create a dog
  const createResp = await apiClient.createDog({
    body: scoobyDoo,
  });
  const { _id } = createResp;
  expect(_id).toMatch(OBJECT_ID_STRING);
  const dogWithId = {
    ...scoobyDoo,
    _id,
  };
  expect(createResp).toStrictEqual(dogWithId);

  // Try to get the same dog
  const getOneResp = await apiClient.getDog({
    params: {
      _id,
    },
  });
  expect(getOneResp).toStrictEqual(dogWithId);

  // Get all the dogs
  const getAllResp = await apiClient.getDogs({});
  expect(getAllResp).toStrictEqual([dogWithId]);
});
