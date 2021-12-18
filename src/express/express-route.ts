import { Controller } from './controller';
import { RequestHandler, Router } from 'express';
import { AbstractEndpointDef } from '../endpoint';
import { Route } from '../route';

export interface ExpressRoute<T extends AbstractEndpointDef> extends Route {
  middleware: RequestHandler[];
  controller: Controller<T>;
}

export const addRoutes = (r: Router, routes: ExpressRoute<any>[]): void => {
  for (const route of routes) {
    addRoute(r, route);
  }
};

export const addRoute = <T extends AbstractEndpointDef>(r: Router, route: ExpressRoute<T>): void => {
  const { method, path, middleware, controller } = route;
  r[method](path, middleware, controller);
};
