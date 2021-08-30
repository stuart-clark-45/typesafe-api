import express from 'express';
import findFreePorts from 'find-free-ports';
import { addRoute, addRoutes, ExpressRoute } from '../src/express';
import {
  CreateDogEndpointDef,
  GetDogEndpointDef,
  getDogRoute,
  GetDogsEndpointDef,
  getDogsRoute,
  postDogRoute,
} from './example-routes';
import { createDogController, getDogController, getDogsController } from './dog-controller';

const app = express();

const middleware = [express.json()];

const routes: ExpressRoute<any>[] = [];

const ePostDogRoute: ExpressRoute<CreateDogEndpointDef> = {
  ...postDogRoute,
  middleware,
  controller: createDogController,
};
routes.push(ePostDogRoute);

const eGetDogRoute: ExpressRoute<GetDogEndpointDef> = {
  ...getDogRoute,
  middleware,
  controller: getDogController,
};
routes.push(eGetDogRoute);

const eGetDogsRoute: ExpressRoute<GetDogsEndpointDef> = {
  ...getDogsRoute,
  middleware,
  controller: getDogsController,
};
routes.push(eGetDogsRoute);

addRoutes(app, routes);

export const startApp = async (): Promise<{ server: any; baseUrl: string }> => {
  const [port] = await findFreePorts();
  const baseUrl = `http://localhost:${port}`;

  const server = app.listen(port, () => {
    console.log(`Example app listening at ${baseUrl}`);
  });

  return {
    server,
    baseUrl,
  };
};
