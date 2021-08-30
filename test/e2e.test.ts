import { clearDogDB, scoobyDoo } from './dog';
import { startApp } from './example-express';
import { GetDogEndpointDef, GetDogErrorType } from './example-routes';
import { AxiosError } from 'axios';
import { ErrorHandlers, handleError } from '../src';
import { DogApiClient } from './example-api-client';

export const OBJECT_ID_STRING = /^[a-f\d]{24}$/i;

let baseUrl: string;
let server: any;
beforeAll(async () => {
  const appStarted = await startApp();
  baseUrl = appStarted.baseUrl;
  server = appStarted.server;
  clearDogDB();
});

const getDogErrorHandlers: ErrorHandlers<GetDogEndpointDef> = {
  404: jest.fn(),
  500: jest.fn(),
};

afterAll(async () => {
  clearDogDB();
  server.close();
});

it('Test API', async () => {
  const client = new DogApiClient(baseUrl);

  // Create a dog
  const createResp = await client.createDog({
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
  const getOneResp = await client.getDog({
    params: {
      _id,
    },
  });
  expect(getOneResp).toStrictEqual(dogWithId);

  // Get all the dogs
  const getAllResp = await client.getDogs({});
  expect(getAllResp).toStrictEqual([dogWithId]);

  // Try to get a dog that doesn't exist
  const fakeId = 'not-a-real-dog';
  try {
    await client.getDog({
      params: {
        _id: fakeId,
      },
    });
  } catch (err) {
    // Check the error is returned as expected
    const e: AxiosError<GetDogErrorType> = err;
    const expectedError: GetDogErrorType = {
      status: 404,
      msg: `No dog with _id ${fakeId} could be found`,
    };
    expect(e.response.data).toStrictEqual(expectedError);

    // Test handle error works correctly
    handleError(e, getDogErrorHandlers);
    expect(getDogErrorHandlers['404']).toBeCalled();
    expect(getDogErrorHandlers['500']).toBeCalledTimes(0);
  }
});
