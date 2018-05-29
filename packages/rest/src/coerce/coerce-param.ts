import {
  SchemaObject,
  ReferenceObject,
  isReferenceObject,
} from '@loopback/openapi-v3-types';

import * as HttpErrors from 'http-errors';
type HttpError = HttpErrors.HttpError;

export function paramCoerce(data: string, schema?: SchemaObject | ReferenceObject): any {
  // ignore reference schema
  if (!schema || isReferenceObject(schema)) return data;

  let coercedResult;
  coercedResult = data;
  const type = schema.type;
  const format = schema.format;

  switch(type) {
    case 'string':
      if (format === 'byte') {
        coercedResult = Buffer.from(data, 'base64');
      } else if (format === 'date') {
        coercedResult = new Date(data);
      } else {
        coercedResult = data
      }
      break;
    case 'number':
      if (format === 'float' || 'double') {
        coercedResult = parseFloat(data);
      } else {
        throw new HttpErrors.NotImplemented('Type number with format ' + format + ' is not valid')
      }
      break;
    case 'integer':
      if (format === 'int32') {
        coercedResult = parseInt(data)
      } else if(format === 'int64') {
        coercedResult = Number(data)
      } else {
        throw new HttpErrors.NotImplemented('Type integer with format ' + format + ' is not valid');
      }
      break;
    case 'boolean':
      coercedResult = isTrue(data)? true: false;
    default: break;
  }
  return coercedResult;
}

function isTrue(data: string): boolean {
  const isTrueSet = ['true', '1', true, 1];
  return isTrueSet.includes(data);
}
