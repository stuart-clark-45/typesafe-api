import { StandardEndpointDef } from '../endpoint';
import { AxiosError } from 'axios';

type ErrorStatuses<T extends StandardEndpointDef> = T['errorType']['status'];

type ErrorHandlerFnc<T extends StandardEndpointDef> = (err: AxiosError<T['errorType']>) => void | Promise<void>;

export type ErrorHandlers<T extends StandardEndpointDef> = {
  [key in ErrorStatuses<T>]: ErrorHandlerFnc<T>;
};

export const handleError = <T extends StandardEndpointDef>(
  err: AxiosError<T['errorType']>,
  handlers: ErrorHandlers<T>
): void | Promise<void> => {
  // Double check the right error has been given here, {@code err} is unlikely to be typed
  // when given as parameter due to the nature of "try catch"
  const isAxiosError = err?.isAxiosError;

  // Check to see if we have a status
  const status = isAxiosError && err?.response?.status;

  // Try to get a handler
  const handler = status && handlers[status as keyof ErrorHandlers<T>];
  if (!handler) {
    throw err;
  }

  return handler(err);
};
