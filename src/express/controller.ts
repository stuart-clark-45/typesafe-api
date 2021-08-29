import { NextFunction, Request, Response } from 'express';
import { AbstractEndpointDef } from '@src/endpoint';

export type TRequest<T extends AbstractEndpointDef> = Request<
  T['requestOptions']['params'],
  T['responseBody'],
  T['requestOptions']['body'],
  T['requestOptions']['query']
>;

export type TResponse<T extends AbstractEndpointDef> = Response<T['responseBody']>;

export type Controller<T extends AbstractEndpointDef> = (
  req: TRequest<T>,
  res: TResponse<T>,
  next?: NextFunction
) => void;
