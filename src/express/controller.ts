import { NextFunction, Request, Response } from 'express';
import { AbstractEndpointDef, ResponseBody, StandardEndpointDef } from '../endpoint';

export type TRequest<T extends AbstractEndpointDef> = Request<
  T['requestOptions']['params'],
  ResponseBody<T>,
  T['requestOptions']['body'],
  T['requestOptions']['query']
>;

export type TResponse<T extends AbstractEndpointDef> = Response<ResponseBody<T> | T['errorType']>;

export type Controller<T extends AbstractEndpointDef> = (
  req: TRequest<T>,
  res: TResponse<T>,
  next?: NextFunction
) => void;

export const sendError = <T extends StandardEndpointDef>(res: TResponse<T>, errorType: T['errorType']): void => {
  res.status(errorType.status).send(errorType);
};

export const parseHeaders = <T extends AbstractEndpointDef>(req: TRequest<T>): T['requestOptions']['headers'] => {
  return req.headers;
};
