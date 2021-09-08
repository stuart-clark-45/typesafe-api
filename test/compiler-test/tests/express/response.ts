import { Controller, TRequest, TResponse } from '../../../../src/express';
import { GetDogEndpointDef } from '../../../example-routes';

export const reqTest: Controller<GetDogEndpointDef> = (
  req: TRequest<GetDogEndpointDef>,
  res: TResponse<GetDogEndpointDef>
) => {
  // Invalid body supplied
  res.send({ somethingElse: 1 });

  // Invalid header
  res.set('myheader', 'hi');
};

// @expected-compiler-errors-start
// (9,14): error TS2345: Argument of type '{ somethingElse: number; }' is not assignable to parameter of type 'BodyOrError<GetDogEndpointDef>'.
// (12,11): error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
