
import {
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  SchemaObject,
} from '@loopback/openapi-v3-types';

import {
  ShotRequestOptions,
  expect,
  stubExpressContext,
} from '@loopback/testlab';

import {
  PathParameterValues,
  Request,
  Route,
  createResolvedRoute,
  parseOperationArgs,
  ResolvedRoute,
} from '../../..';

export function givenOperationWithParameters(params?: ParameterObject[]) {
  return <OperationObject>{
    'x-operation-name': 'testOp',
    parameters: params,
    responses: {},
  };
}

export function givenRequest(options?: ShotRequestOptions): Request {
  return stubExpressContext(options).request;
}

export function givenResolvedRoute(
  spec: OperationObject,
  pathParams: PathParameterValues = {},
): ResolvedRoute {
  const route = new Route('get', '/', spec, () => {});
  return createResolvedRoute(route, pathParams);
}

export async function testCoercion<T>(
  schemaSpec: SchemaObject, 
  valueFromReq: string,
  expectedResult: T,
  caller: string
) {
  try {
  const req = givenRequest();
  const spec = givenOperationWithParameters([{
    name: 'aparameter',
    in: 'path',
    schema: schemaSpec
  }]);
  const route = givenResolvedRoute(spec, {aparameter: valueFromReq});
  const args = await parseOperationArgs(req, route);
  expect(args).to.eql([expectedResult]);
  } catch (err) {
    throw new Error(`${err} \n Failed ${caller}`);
  }
}