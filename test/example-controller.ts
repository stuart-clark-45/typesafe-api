import { Controller, sendError, TRequest, TResponse } from '../src/express';
import {
  CreateDogEndpointDef,
  GetDogEndpointDef,
  GetDogsEndpointDef,
  HeaderTestEndpointDef
} from './example-routes';
import { dogDB, DogWithId } from './dog';
import ObjectID from 'bson-objectid';

export const createDogController: Controller<CreateDogEndpointDef> = (
  req: TRequest<CreateDogEndpointDef>,
  res: TResponse<CreateDogEndpointDef>
) => {
  const _id = new ObjectID().toHexString();
  const dogWithId: DogWithId = {
    ...req.body,
    _id,
  };
  dogDB.set(_id, dogWithId);
  res.send(dogWithId);
};

export const getDogController: Controller<GetDogEndpointDef> = (
  req: TRequest<GetDogEndpointDef>,
  res: TResponse<GetDogEndpointDef>
) => {
  const { _id } = req.params;
  if (dogDB.has(_id)) {
    res.send(dogDB.get(_id));
  } else {
    sendError(res, {
      status: 404,
      msg: `No dog with _id ${_id} could be found`,
    });
  }
};

export const getDogsController: Controller<GetDogsEndpointDef> = (
  req: TRequest<GetDogsEndpointDef>,
  res: TResponse<GetDogsEndpointDef>
) => {
  res.send(Array.from(dogDB.values()));
};

export const headerTestController: Controller<HeaderTestEndpointDef> = (
  req: TRequest<HeaderTestEndpointDef>,
  res: TResponse<HeaderTestEndpointDef>
) => {
  const value = req.get('myheader');
  res.set('test-header', value);
  res.send({ headerValue: value });
};
