import { NextFunction, Request, Response } from 'express';
import { AbstractEndpointDef, ResponseBody, ResponseHeaders, StandardEndpointDef } from '../endpoint';

export interface TRequest<T extends AbstractEndpointDef>
  extends Request<
    T['requestOptions']['params'],
    ResponseBody<T>,
    T['requestOptions']['body'],
    T['requestOptions']['query']
  > {
  get<K extends keyof T['requestOptions']['headers']>(name: K): T['requestOptions']['headers'][K];
}

type BodyOrError<T extends AbstractEndpointDef> = ResponseBody<T> | T['errorType'];

type SetFnc<T extends AbstractEndpointDef, R> = {
  <K extends keyof ResponseHeaders<T>>(field: K): R;
  <K extends keyof ResponseHeaders<T>>(field: K, value: ResponseHeaders<T>[K]): R;
  (headers: Partial<ResponseHeaders<T>>): R;
};

export interface TResponse<T extends AbstractEndpointDef> extends Response<BodyOrError<T>> {
  set: SetFnc<T, this>;
}

export type Controller<T extends AbstractEndpointDef> = (
  req: TRequest<T>,
  res: TResponse<T>,
  next?: NextFunction
) => void;

export const sendError = <T extends StandardEndpointDef>(res: TResponse<T>, errorType: T['errorType']): void => {
  res.status(errorType.status).send(errorType);
};
