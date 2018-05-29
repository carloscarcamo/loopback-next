// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {SchemaObject} from '@loopback/openapi-v3-types';

import {
  expect
} from '@loopback/testlab';

import {
  parseOperationArgs,
} from '../../..';

import {givenOperationWithParameters, givenRequest, givenResolvedRoute, testCoercion} from './utils'

describe('coerce param from string to buffer', () => {
    it('base64', async () => {
      const base64 = Buffer.from("Hello World").toString('base64');
      const buffer = Buffer.from(base64, 'base64');
      const caller = new Error().stack!.split(/\n/)[1];
      await testCoercion<Buffer>({type: 'string', format: 'byte'}, base64, buffer, caller);
    })
});
