import 'reflect-metadata';

/**
 * Options for defining a JSON schema object.
 */
interface JsonSchemaObjectOptions {
  /** A description of the JSON schema object. */
  description?: string;
}

/**
 * Options for defining a JSON schema property.
 */
interface JsonSchemaPropertyOptions {
  /** A description of the JSON schema property. */
  description?: string;
  /** Specifies if the property is required. */
  required?: boolean;
  /** The type of items in an array property. */
  itemType?: any;
  /** The allowed enumeration values for the property. */
  enum?: string[];
  /** Specifies multiple possible types for the property. */
  oneOf?: any[];
}

const SCHEMA_OBJECT_METADATA_KEY = Symbol('jsonObjectSchema');
const SCHEMA_PROPERTY_METADATA_KEY = Symbol('jsonPropertySchema');

/**
 * Class decorator to define JSON schema metadata for a TypeScript class.
 * 
 * @param {JsonSchemaObjectOptions} [options] - Options to describe the JSON schema object.
 * @returns {ClassDecorator} - The class decorator function.
 */
function JsonSchemaObject(options?: JsonSchemaObjectOptions): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(SCHEMA_OBJECT_METADATA_KEY, options, target);
  };
}

/**
 * Property decorator to define JSON schema metadata for a TypeScript class property.
 * 
 * @param {JsonSchemaPropertyOptions} [options] - Options to describe the JSON schema property.
 * @returns {PropertyDecorator} - The property decorator function.
 */
function JsonSchemaProperty(
  options?: JsonSchemaPropertyOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    if (!Reflect.hasMetadata(SCHEMA_PROPERTY_METADATA_KEY, target)) {
      Reflect.defineMetadata(SCHEMA_PROPERTY_METADATA_KEY, {}, target);
    }
    const properties = Reflect.getMetadata(SCHEMA_PROPERTY_METADATA_KEY, target);
    properties[propertyKey] = options;
    Reflect.defineMetadata(SCHEMA_PROPERTY_METADATA_KEY, properties, target);
  };
}

export {
  JsonSchemaObjectOptions,
  JsonSchemaPropertyOptions,
  JsonSchemaObject,
  JsonSchemaProperty,
  SCHEMA_OBJECT_METADATA_KEY,
  SCHEMA_PROPERTY_METADATA_KEY,
};
