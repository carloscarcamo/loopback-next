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

describe('coerce param from string to boolean', () => {
    it('false - \'false\'', async () => {
      const caller = new Error().stack!.split(/\n/)[1];
      await testCoercion<boolean>({type: 'boolean'}, 'false', false, caller);
    })

    it('true - \'true\'', async () => {
      const caller = new Error().stack!.split(/\n/)[1];
      await testCoercion<boolean>({type: 'boolean'}, 'true', true, caller);
    })
});
