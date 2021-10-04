# typesafe-api 

### Let your compiler tell you if your API is broken.

We have typesafe frontends and typesafe backends, why not typesafe APIs?

This library will enable you to define your API spec in pure TS, easily create an API client to 
consume it, and implement routes, handlers and middleware on the server side.

This makes for speedy integration and oh so easy maintenance, you'll never miss a parameter in a request again!

#### Recommended Repo Architecture

The following dependency diagram show the suggested project architecture you should use to 
define your API. 

![alt text](docs/images/repo-archetecture.png "Repo architecture diagram")

This can be implemented using either:

Polyrepo

* Publish your API spec as a npm module then import it into backend and consuming services. Use 
[npm link](https://docs.npmjs.com/cli/v7/commands/npm-link) during development it will save you tones of time!


Monorepo

* [NX](https://nx.dev/) is a great way to implement this and solves a lot of the issues
  associated with monorepo. This works really well with `typesafe-api` as it saves quite a bit of dependency wrangling but obviously 
it's not for everyone. 

## Getting started

Here is a minimal example to get you started...

* N.B. this example implements some dummy authentication. Just in case... please don't
implement authentication like this in a production app you will have a bad time!  

### API Spec 

We are going to define an basic API with just one endpoint.

When defining an API endpoint there are two main concepts we need to think about.

1)  `EndpointDef`
    
    You need to create an custom `EndpointDef` for each endpoint in your API. This type represents
    the interface for the API endpoint e.g.
     * URL params
     * Query params, 
     * The request body 
     * Any headers that must be set
     * The expected response type
     * What error codes can be expected to be returned by the endpoint
 
2) `Route`
    
    This is an object that represents the API path and method that should be used when calling the 
    endpoint
    
First let's define some useful interfaces for our API

```ts
// ../nx-typesafe-api-example/libs/api-spec/src/api.ts

import {EndpointDef, ErrorType, ReqOptions, ResOptions} from 'typesafe-api';

// These are the options that will be sent with every request to our API. In this example
// we are going to implement some dummy authentication for our API using the
// "authorization" header. If you don't have any default parameters then just use {@link ReqOptions}
// instead of defining a custom interface
export interface DefaultReqOpts extends ReqOptions {
  headers: {
    // If using express these headers keys must always be lowercase
    authorization: string;
  }
}

// Here we define the standard error codes we expect to see. All API should expect a 500
// (nothing is perfect). As we are implementing authentication let's add 403 as well
// You can add error codes to specific endpoints later
export type DefaultErrorCodes = 500 | 403;

// Create an interface to help us build our endpoints, this just saves adding {@code DefaultReqOpts}
// and {@code DefaultErrorType} to every endpoint we create
export interface ExampleApiEndpoint<
  ReqOpt extends ReqOptions,
  RespOpt extends ResOptions,
  E = ErrorType<DefaultErrorCodes>,
  > extends EndpointDef<DefaultReqOpts, ReqOpt, RespOpt, E> {}

```

Now let's define an endpoint...
 
```ts
// ../nx-typesafe-api-example/libs/api-spec/src/routes/hello-world.ts

import {ErrorType, ReqOptions, ResOptions, Route} from 'typesafe-api';
import {DefaultErrorCodes, ExampleApiEndpoint} from '../api';


// Define the route at which the endpoint belongs
export const helloWoldRoute: Route = {
  method: 'get',
  path: '/hello-world'
};

// Define the all parameters that are required to make the request
export interface HelloWorldReq extends ReqOptions {
  query: {
    yourName: string;
  }
}

// Define the response type we wil receive for the request
export interface HelloWorldResp extends ResOptions {
  body: {
    msg: string;
    date: Date;
  }
  headers: {
    example: string;
  }
}

// Define any error that may be thrown by the endpoint, the default is just `500`
export type HelloWorldErrors = ErrorType<DefaultErrorCodes|400>

// Create the endpoint definition this type encapsulates the full endpoint spec
export type HelloWorldEndpointDef = ExampleApiEndpoint<HelloWorldReq, HelloWorldResp, HelloWorldErrors>

```

Now we have our route and endpoint defined we can very easily create an `ApiClient` for it.

```ts
// ../nx-typesafe-api-example/libs/api-spec/src/api-client.ts

import {AbstractApiClient, createRouteRequest} from 'typesafe-api';
import {helloWoldRoute, HelloWorldEndpointDef} from './routes';
import {DefaultReqOpts} from './api';

// Create custom class that we will use as the super class for all our client classes
// that support {@link DefaultReqOpts}
class CustomApiClient extends AbstractApiClient<DefaultReqOpts> {}

// Create a client for our endpoint
class HelloApiClient extends CustomApiClient {

  // Use createRouteRequest(..) to create a method to execute your request
  private _helloWorld = createRouteRequest<HelloWorldEndpointDef>(this, helloWoldRoute);

  // Abstract away the details of the request, devs writing calling code shouldn't need
  // to think about them
  public helloWorld = (yourName: string) => this._helloWorld({query: {yourName}});
}

// Depending how many endpoints you have you may want to start nesting your API clients like this
export class RootApiClient extends CustomApiClient {

  // You can also add a custom constructor to abstract away the details of your
  // default request options
  constructor(baseUrl: string, apiKey: string) {
    super({
      baseUrl,
      defaultReqOptions: {
        headers: {
          authorization: apiKey
        }
      }
    });
  }

  // Here we add the {@link HelloApiClient} as a child of {@link RootApiClient}
  public helloApi = (): HelloApiClient => new HelloApiClient(this.getChildParams());
}

```

Great that's our API spec all sorted. Now all that remains make sure __everything is exported__ in 
your entry point for your module e.g.

```ts
// ../nx-typesafe-api-example/libs/api-spec/src/index.ts

export * from './routes';
export * from './api-client';
export * from './api';
// Add this export so API consumers can use your client without having to install `typesafe-api`
export * from 'typesafe-api/dist/api-client'

```
 
Now publish your spec as an npm module. In this example we are using an [NX](https://nx.dev/) monorepo
so the spec is imported from `@nx-typesafe-api-example/api-spec`.

### Backend

Currently this is only fully implemented for `express` however if you dont use this (or something compatible)
you should still get a lot out of importing the `EndpointDef`s and `Routes` into your project. 

Contributions very welcome if you find a way to fully integrate with any other server frameworks :) 

#### Controller

So assuming you are using `express` we want to start out by creating a `Controller` to handle our requests...

```ts
// ../nx-typesafe-api-example/apps/backend/src/app/hello-world.ts

import {Controller, sendError, TRequest, TResponse} from 'typesafe-api';
import {HelloWorldEndpointDef} from '@nx-typesafe-api-example/api-spec';


export const helloWorldController: Controller<HelloWorldEndpointDef> = (
  req: TRequest<HelloWorldEndpointDef>,
  res: TResponse<HelloWorldEndpointDef>
) => {

  // `req.query` is typesafe so you know which keys have been set in the request
  const name = req.query.yourName;

  // As an example, let's return an error the name parameter is a number
  const isNumber = (s: string) => /^\d+$/.test(s);
  if (isNumber(name)) {

    // This error object is typesafe, including the status so you can only select from the
    // statuses given in the endpoint definition
    return sendError(res, {
      status: 400,
      msg: "Surely your name isn't a number?? 😵"
    });

  }

  // No surprises, this body is typesafe too!
  res.send({
    msg: `Hello ${name}!`,
    date: new Date()
  })

};

``` 

#### Middleware

Creating middleware for our app is easy too as long as it relies on our default request options.
Here's a simple example...

```ts
// ../nx-typesafe-api-example/apps/backend/src/app/authorize.ts

import {NextFunction, RequestHandler} from 'express';
import {ExampleApiEndpoint} from '@nx-typesafe-api-example/api-spec';
import {ReqOptions, ResOptions, sendError, TRequest, TResponse} from 'typesafe-api';

// Create a type that can be used to represent any endpoint in our API
type AnyEndpointDef = ExampleApiEndpoint<ReqOptions, ResOptions>

const handler: RequestHandler = (req: TRequest<AnyEndpointDef>, res: TResponse<AnyEndpointDef>, next: NextFunction) => {

  // Use {@code req.get(..)} to get headers in a typesafe way
  // Naive implementation of authentication
  // DONT TRY THIS AT HOME
  if (req.get('authorization') === "my-api-key") {
    return next()
  }

  // This error object is typesafe, including the status so you can only select from the
  // statuses given in {@link DefaultErrorCodes} (defined in the app spec)
  sendError(res, {
    status: 403,
    msg: 'Unauthorized'
  })

};

export const authorize = (): RequestHandler => handler;

``` 

#### Routes

Now we have a controller we just need to set up a route to it. `Controller`s are completely 
compatible with `express` so this stage is optional, tho advised as it guaranties your 
routes are correct.

Here is a very simple express app using our newly created `Controller`

```ts
// ../nx-typesafe-api-example/apps/backend/src/main.ts

import express, { RequestHandler } from 'express';
import { addRoute, ExpressRoute } from 'typesafe-api';
import { helloWorldController } from './app/hello-world';
import {
  helloWoldRoute,
  HelloWorldEndpointDef,
} from '@nx-typesafe-api-example/api-spec';
import cors from 'cors';
import { authorize } from './app/authorize';

const app = express();

app.use(cors(), express.json());

// Define the middleware we want for the route
const middleware: RequestHandler[] = [authorize()];

// Import the route from the api-spec then add the additional fields needed for an {@link ExpressRoute}
const eHelloWorldRoute: ExpressRoute<HelloWorldEndpointDef> = {
  ...helloWoldRoute,
  middleware,
  controller: helloWorldController,
};

// Add the route to the express app
addRoute(app, eHelloWorldRoute);

// Start the server
const port = 7809;
const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

```

### Frontend

Great so now we have a working endpoint we want to use it. In this example we will use  a simple 
react app. However, the steps are very similar for any backend systems you want to consume your API.

One you have your API spec installed you can define a component similar to this

```tsx
// ../nx-typesafe-api-example/apps/frontend/src/app/app.tsx

import React, { useState } from 'react';
import {
  ErrorHandlers,
  handleError,
  HelloWorldEndpointDef,
  RootApiClient
} from '@nx-typesafe-api-example/api-spec';
import { Box, Button, CardHeader, Container, TextField, Typography } from '@material-ui/core';

const baseUrl = 'http://localhost:7809';

export function App() {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [responseText, setResponseText] = useState('');

  // Init the API client
  const helloApi = new RootApiClient(baseUrl, apiKey).helloApi();

  // Set up error handlers in case the API call fails
  // (the compiler will tell you if you are missing any error codes)
  const errorHandlers: ErrorHandlers<HelloWorldEndpointDef> = {
    500: (err) => {
      alert('Something went wrong please check console logs');
      console.error(err);
    },
    403: () => alert('Your API key is not valid.'),
    400: (err) => {
      const response = err.response;
      if (!response) {
        throw err;
      }
      setResponseText(response.data.msg);
    },
  };

  // Define onClick function that calls the endpoint and handles any errors
  const onClick = async () => {
    try {
      const { data } = await helloApi.helloWorld(name);
      setResponseText(data.msg);
    } catch (err) {
      handleError(err as any, errorHandlers);
    }
  };

  const nameLabel = 'Enter your name';
  const apiKeyLabel = 'Enter your API key (it\'s "my-api-key")';
  const margin = 5;
  return (
    <Container style={{ width: '50%' }}>
      <CardHeader
        title="frontend using typesafe-api"
        variant="contained"
        style={{ textAlign: 'center' }}
      />
      <form noValidate autoComplete="off centre">
        <TextField
          label={nameLabel}
          fullWidth
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label={apiKeyLabel}
          fullWidth
          onChange={(e) => setApiKey(e.target.value)}
        />
      </form>
      <Typography align="center">
        <Box m={margin}>
          <Button variant="contained" color="primary" onClick={onClick}>
            Say hi
          </Button>
        </Box>
        <Box m={margin}>{responseText}</Box>
      </Typography>
    </Container>
  );
}

export default App;

```

And that's it you now have a typesafe API. The full source code for this example can be found
 [here](https://github.com/stuart-clark-45/nx-typesafe-api-example) if you want to try it for yourself.
 
## Feature Ideas / Improvements
* Create reference docs for `typesafe-api`
* Allow for clients in out languages to created (convert to json schema first?)
* Generate api docs from `Route`s and `EndpointDef`s
 
 
