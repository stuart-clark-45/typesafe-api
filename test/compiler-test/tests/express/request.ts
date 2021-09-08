import { Controller, TRequest, TResponse } from '../../../../src/express';
import { CreateDogEndpointDef } from '../../../example-routes';

export const reqTest: Controller<CreateDogEndpointDef> = (
  req: TRequest<CreateDogEndpointDef>,
  res: TResponse<CreateDogEndpointDef>
) => {
  // Valid header
  req.get('myheader');

  // Invalid valid header
  req.get('not-a-valid-header');

  // Invalid query param
  req.query.badQuery;

  // Invalid body param
  req.body.badBody;

  // Invalid param
  req.params.badParam;
};

// @expected-compiler-errors-start
// (12,11): error TS2769: No overload matches this call.
// (15,13): error TS2339: Property 'badQuery' does not exist on type '{}'.
// (18,12): error TS2339: Property 'badBody' does not exist on type 'Dog'.
// (21,14): error TS2339: Property 'badParam' does not exist on type '{}'.
