import { clearDogDB, scoobyDoo } from './dog';
import { startApp } from './example-express';
import { DefaultReqOptions, GetDogEndpointDef, GetDogErrorType, HeaderTestReq, HeaderTestResp } from './example-routes';
import { AxiosError } from 'axios';
import { ErrorHandlers, handleError } from '../src';
import { RootApiClient } from './example-api-client';

export const OBJECT_ID_STRING = /^[a-f\d]{24}$/i;

const defaultReqOptions: DefaultReqOptions = {
  headers: {
    myheader: 'default-header-value',
  },
};

const defaultHeaderTestResp: HeaderTestResp = {
  headerValue: defaultReqOptions.headers.myheader,
};

let baseUrl: string;
let server: any;
let rootApiClient: RootApiClient;

beforeAll(async () => {
  const appStarted = await startApp();
  baseUrl = appStarted.baseUrl;
  server = appStarted.server;
  clearDogDB();

  const apiParams = { baseUrl, defaultReqOptions };
  rootApiClient = new RootApiClient(apiParams);
});

const getDogErrorHandlers: ErrorHandlers<GetDogEndpointDef> = {
  404: jest.fn(),
  500: jest.fn(),
};

afterAll(async () => {
  clearDogDB();
  server.close();
});

it('Test Root API (headers and default params)', async () => {
  const hitEndpont = async (options: HeaderTestReq) => {
    return await rootApiClient.headerTest(options);
  };

  // Test with no options
  expect(await hitEndpont({})).toStrictEqual(defaultHeaderTestResp);

  // Test headers object but not key-values
  expect(await hitEndpont({ headers: {} })).toStrictEqual(defaultHeaderTestResp);

  // Test with custom value
  const customValue = 'custom-value';
  const expectedCustom: HeaderTestResp = {
    headerValue: customValue,
  };
  expect(await hitEndpont({ headers: { myheader: customValue } })).toStrictEqual(expectedCustom);
});

it('Test full response', async () => {
  const resp = await rootApiClient.headerTest({}, true);
  expect(resp.data).toStrictEqual(defaultHeaderTestResp);
});

it('Dog API', async () => {
  const dogClient = rootApiClient.dog();

  // Create a dog
  const createResp = await dogClient.createDog({
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
  const getOneResp = await dogClient.getDog({
    params: {
      _id,
    },
  });
  expect(getOneResp).toStrictEqual(dogWithId);

  // Get all the dogs
  const getAllResp = await dogClient.getDogs({});
  expect(getAllResp).toStrictEqual([dogWithId]);

  // Try to get a dog that doesn't exist
  const fakeId = 'not-a-real-dog';
  try {
    await dogClient.getDog({
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
