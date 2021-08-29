import { Controller } from '@src/express/controller';
import { RequestHandler, Router } from 'express';
import { Route } from '@src/route';
import { AbstractEndpointDef } from '@src/endpoint';

export interface ExpressRoute<T extends AbstractEndpointDef> extends Route {
  middleware: RequestHandler[];
  controller: Controller<T>;
}

export const addRoutes = (r: Router, routes: ExpressRoute<any>[]): void => {
  for (const route of routes) {
    addRoute(r, route);
  }
};

export const addRoute = (r: Router, route: ExpressRoute<any>): void => {
  const { method, path, middleware, controller } = route;
  r[method](path, middleware, controller);
};
