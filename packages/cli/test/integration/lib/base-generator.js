// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('yeoman-assert');
const testUtils = require('../../test-utils');
const path = require('path');

module.exports = function(generator) {
  return function() {
    describe('usage', () => {
      it('prints lb4', () => {
        const gen = testUtils.testSetUpGen(generator);
        const helpText = gen.help();
        assert(helpText.match(/lb4 /));
        assert(!helpText.match(/loopback4:/));
      });
    });

    describe('exit', () => {
      it('does nothing if false is passed', () => {
        const gen = testUtils.testSetUpGen(generator);
        gen.exit(false);
        assert(gen.exitGeneration === undefined);
      });
      it('sets "exitGeneration" to true if called with no argument', () => {
        const gen = testUtils.testSetUpGen(generator);
        gen.exit();
        assert(gen.exitGeneration === true);
      });
      it('sets "exitGeneration" to the error passed to itself', () => {
        const gen = testUtils.testSetUpGen(generator);
        gen.exit(new Error('oh no'));
        assert(gen.exitGeneration instanceof Error);
        assert.equal(gen.exitGeneration.message, 'oh no');
      });
    });

    describe('config from json file', () => {
      it('accepts --config', async () => {
        const jsonFile = path.join(__dirname, 'base-config.json');
        const gen = testUtils.testSetUpGen(generator, {
          args: ['--config', jsonFile],
        });
        await gen.setOptions();
        assert.equal(gen.options['config'], jsonFile);
        assert.equal(gen.options.name, 'xyz');
      });

      it('options from json file do not override', async () => {
        const jsonFile = path.join(__dirname, 'base-config.json');
        const gen = testUtils.testSetUpGen(generator, {
          args: ['--name', 'abc', '--config', jsonFile],
        });
        await gen.setOptions();
        assert.equal(gen.options['config'], jsonFile);
        assert.equal(gen.options.name, 'abc');
        assert.equal(gen.options.description, 'Test');
      });
    });
  };
};
