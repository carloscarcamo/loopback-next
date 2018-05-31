// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {AppWithRepository, juggler, DataSource} from '@loopback/repository';
import {inject} from '@loopback/context';
import {kebabCase} from 'lodash';
import {ArtifactOptions, DataSourceOptions} from '../interfaces';
import {BaseArtifactBooter} from './base-artifact.booter';
import {BootBindings} from '../keys';

/**
 * A class that extends BaseArtifactBooter to boot the 'DataSource' artifact type.
 * Discovered DataSources are bound using `app.controller()`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app Application instance
 * @param projectRoot Root of User Project relative to which all paths are resolved
 * @param [bootConfig] DataSource Artifact Options Object
 */
export class DataSourceBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) public app: AppWithRepository,
    @inject(BootBindings.PROJECT_ROOT) public projectRoot: string,
    @inject(`${BootBindings.BOOT_OPTIONS}#datasources`)
    public datasourceConfig: ArtifactOptions = {},
  ) {
    super();
    // Set DataSource Booter Options if passed in via bootConfig
    this.options = Object.assign({}, DatasourceDefaults, datasourceConfig);
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    await super.load();

    /**
     * If Repository Classes were discovered, we need to make sure RepositoryMixin
     * was used (so we have `app.repository()`) to perform the binding of a
     * Repository Class.
     */
    if (this.classes.length > 0) {
      if (!this.app.dataSource) {
        console.warn(
          'app.dataSource() function is needed for DataSourceBooter. You can add ' +
            'it to your Application using RepositoryMixin from @loopback/repository.',
        );
      } else {
        this.classes.forEach(cls => {
          const name = kebabCase(cls.name.replace('DataSource', ''));
          // tslint:disable-next-line:no-any
          this.app.dataSource((cls as any) as juggler.DataSource, name);
        });
      }
    }
  }
}

/**
 * Default ArtifactOptions for DataSourceBooter.
 */
export const DatasourceDefaults: ArtifactOptions = {
  dirs: ['datasources'],
  extensions: ['.datasource.js'],
  nested: true,
};
