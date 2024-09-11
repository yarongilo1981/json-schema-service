// json-schema-service/src/json-schema.decorators.ts

import 'reflect-metadata';

interface JsonSchemaObjectOptions {
  description?: string;
}

interface JsonSchemaPropertyOptions {
  description?: string;
  required?: boolean;
  itemType?: any;
  enum?: string[];
  oneOf?: any[];
}

const SCHEMA_OBJECT_METADATA_KEY = Symbol('jsonObjectSchema');

const SCHEMA_PROPERTY_METADATA_KEY = Symbol('jsonPropertySchema');

function JsonSchemaObject(options?: JsonSchemaObjectOptions): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(SCHEMA_OBJECT_METADATA_KEY, options, target);
  };
}

function JsonSchemaProperty(
  options?: JsonSchemaPropertyOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    if (!Reflect.hasMetadata(SCHEMA_PROPERTY_METADATA_KEY, target)) {
      Reflect.defineMetadata(SCHEMA_PROPERTY_METADATA_KEY, {}, target);
    }
    const properties = Reflect.getMetadata(
      SCHEMA_PROPERTY_METADATA_KEY,
      target,
    );
    properties[propertyKey] = options;
    Reflect.defineMetadata(SCHEMA_PROPERTY_METADATA_KEY, properties, target);
  };
}

export {
  JsonSchemaPropertyOptions,
  JsonSchemaObject,
  JsonSchemaProperty,
  SCHEMA_OBJECT_METADATA_KEY,
  SCHEMA_PROPERTY_METADATA_KEY,
};