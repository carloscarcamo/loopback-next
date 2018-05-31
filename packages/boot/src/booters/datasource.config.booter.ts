// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {AppWithRepository, juggler, DataSource} from '@loopback/repository';
import {inject, BindingKey} from '@loopback/context';
import {relative} from 'path';
import {ArtifactOptions} from '../interfaces';
import {BaseArtifactBooter} from './base-artifact.booter';
import {BootBindings} from '../keys';

/**
 * A class that extends BaseArtifactBooter to boot the 'DataSource' config JSON
 * files. Discovered DataSources Configs are bound using
 * `app.bind(key).to(config)` where key is `datasources.config.${config.name}`
 *
 * Supported phases: configure, discover, load
 *
 * @param app Application instance
 * @param projectRoot Root of User Project relative to which all paths are resolved
 * @param [bootConfig] DataSource Config Artifact Options Object
 */
export class DataSourceConfigBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: AppWithRepository,
    @inject(BootBindings.PROJECT_ROOT) public projectRoot: string,
    @inject(`${BootBindings.BOOT_OPTIONS}#datasourcesConfig`)
    public datasourceConfig: ArtifactOptions = {},
    @inject(`${BootBindings.BOOT_OPTIONS}#datasourcesOverride`)
    public dsOverride: {[prop: string]: DataSource} = {},
  ) {
    super();
    // Set DataSource Booter Options if passed in via bootConfig
    this.options = Object.assign(
      {},
      DatasourceConfigDefaults,
      datasourceConfig,
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    this.discovered.forEach(file => {
      const ds = require(file);
      if (!ds.name) {
        console.error(
          `Property 'name' must be defined in ${relative(
            this.projectRoot,
            file,
          )}`,
        );
      } else {
        const key = BindingKey.create<DataSource>(
          `datasources.config.${ds.name}`,
        );

        /**
         * TODO: Add support for loading config from ENV?
         */
        if (this.dsOverride[ds.name]) {
          this.app.bind(key).to(this.dsOverride[ds.name]);
        } else {
          this.app.bind(key).to(ds);
        }
      }
    });
  }
}

/**
 * Default ArtifactOptions for DataSourceConfigBooter.
 */
export const DatasourceConfigDefaults: ArtifactOptions = {
  dirs: ['datasources'],
  extensions: ['.datasource.json'],
  nested: true,
};
