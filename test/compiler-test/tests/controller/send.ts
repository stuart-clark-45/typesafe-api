import { Controller, TRequest, TResponse } from '../../../../src/express';
import { GetDogEndpointDef } from '../../../example-routes';

export const sendTest: Controller<GetDogEndpointDef> = (
  req: TRequest<GetDogEndpointDef>,
  res: TResponse<GetDogEndpointDef>
) => {
  res.send({ somethingElse: 1 });
  req.send({});
};

// @compiler-errors-start
//
//
