import { Controller, TRequest, TResponse } from '../../../../src/express';
import { GetDogEndpointDef } from '../../../example-routes';

export const sendTest: Controller<GetDogEndpointDef> = (
  req: TRequest<GetDogEndpointDef>,
  res: TResponse<GetDogEndpointDef>
) => {
  res.send({ somethingElse: 1 });
};

// @expected-compiler-errors-start
// TS2345: Argument of type '{ somethingElse: number; }' is not assignable to parameter of type 'BodyOrError<GetDogEndpointDef>'.
