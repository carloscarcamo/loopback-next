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

describe('coerce param from string to number', () => {
    it('string to float', async () => {
      const caller = new Error().stack!.split(/\n/)[1];
      await testCoercion<number>({type: 'number', format: 'float'}, '3.333333', 3.333333, caller);
    })

    it('string to double', async () => {
      const caller = new Error().stack!.split(/\n/)[1];
      await testCoercion<number>({type: 'number', format: 'double'}, '3.333333333', 3.333333333, caller);
    })
    
    it('string to integer', async() => {
      const caller = new Error().stack!.split(/\n/)[1];
      await testCoercion<number>({type: 'integer', format: 'int32'}, '100', 100, caller);
    })

    it('string to long', async()=> {
      const caller = new Error().stack!.split(/\n/)[1];
      await testCoercion<number>({type: 'integer', format: 'int64'}, '9223372036854775807', 9223372036854775807, caller);
    })
});
