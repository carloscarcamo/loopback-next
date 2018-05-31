import {inject} from '@loopback/core';
import {juggler, DataSource} from '@loopback/repository';

export class DbDataSource extends juggler.DataSource {
  constructor(@inject('datasources.config.db') dsConfig: DataSource) {
    super(dsConfig);
  }
}
