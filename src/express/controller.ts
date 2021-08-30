import { NextFunction, Request, Response } from 'express';
import { AbstractEndpointDef, StandardEndpointDef } from '@src/endpoint';

export type TRequest<T extends AbstractEndpointDef> = Request<
  T['requestOptions']['params'],
  T['responseBody'],
  T['requestOptions']['body'],
  T['requestOptions']['query']
>;

export type TResponse<T extends AbstractEndpointDef> = Response<T['responseBody'] | T['errorType']>;

export type Controller<T extends AbstractEndpointDef> = (
  req: TRequest<T>,
  res: TResponse<T>,
  next?: NextFunction
) => void;

export const sendError = <T extends StandardEndpointDef>(res: TResponse<T>, errorType: T['errorType']): void => {
  res.status(errorType.status).send(errorType);
};
