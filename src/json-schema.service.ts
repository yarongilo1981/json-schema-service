import Ajv, { JSONSchemaType } from 'ajv';
import {
  JsonSchemaPropertyOptions,
  SCHEMA_OBJECT_METADATA_KEY,
  SCHEMA_PROPERTY_METADATA_KEY,
} from './json-schema.decorators';

/**
 * Represents a JSON schema as a key-value map.
 */
export type JsonSchema = Record<string, unknown>;

/**
 * Service for creating and validating JSON schemas from TypeScript classes.
 */
export class JsonSchemaService {
  private ajv = new Ajv();

  /**
   * Creates a JSON schema from a given TypeScript class reference.
   * 
   * @param {any} ClassRef - The TypeScript class reference.
   * @returns {JsonSchema} - The generated JSON schema.
   */
  createJsonSchema(ClassRef: any): JsonSchema {
    if (ClassRef === String) {
      return { type: 'string' };
    }
    if (ClassRef === Number) {
      return { type: 'number' };
    }
    if (ClassRef === Boolean) {
      return { type: 'boolean' };
    }
    if (ClassRef === Array) {
      return { type: 'array' };
    }
    if (Array.isArray(ClassRef)) {
      return { oneOf: ClassRef.map(cr => this.createJsonSchema(cr)) }
    }
    const schema: JsonSchema = { type: 'object' };
    const classOptions = Reflect.getMetadata(SCHEMA_OBJECT_METADATA_KEY, ClassRef);
    if (classOptions && classOptions.description) {
      schema.description = classOptions.description;
    }
    const properties = Reflect.getMetadata(SCHEMA_PROPERTY_METADATA_KEY, ClassRef.prototype);
    Object.keys(properties).forEach((propertyKey) => {
      const type = Reflect.getMetadata('design:type', ClassRef.prototype, propertyKey);
      const options = properties[propertyKey];
      this.addPropertyToJsonSchema(schema, propertyKey, type, options);
    });
    return schema;
  }

  /**
   * Adds a property to an existing JSON schema.
   * 
   * @param {JsonSchema} schema - The JSON schema to modify.
   * @param {string} propertyName - The name of the property to add.
   * @param {any} type - The TypeScript type of the property.
   * @param {JsonSchemaPropertyOptions} [options] - Additional options for the property.
   */
  addPropertyToJsonSchema(
    schema: JsonSchema,
    propertyName: string,
    type: any,
    options?: JsonSchemaPropertyOptions,
  ) {
    let property: JsonSchema;
    if (options?.oneOf) {
      property = this.createJsonSchema(options.oneOf);
    } else {
      property = this.createJsonSchema(type);
    }
    if (options?.description) {
      property.description = options.description;
    }
    if (options?.enum) {
      property.enum = options.enum;
    }
    if (options?.itemType) {
      property.items = this.createJsonSchema(options.itemType);
    }
    if (options?.required) {
      if (!schema.required) {
        schema.required = [];
      }
      (schema.required as Array<string>).push(propertyName);
    }
    if (!schema.properties) {
      schema.properties = {};
    }
    (schema.properties as Record<string, JsonSchema>)[propertyName] = property;
  }

  /**
   * Validates data against a given JSON schema.
   * 
   * @param {JsonSchema} schema - The JSON schema to validate against.
   * @param {any} data - The data to validate.
   * @returns {{ valid: boolean, errors?: any }} - Validation result and errors if invalid.
   */
  validate(schema: JsonSchema, data: any): { valid: boolean, errors?: any } {
    const validate = this.ajv.compile(schema as JSONSchemaType<any>);
    const valid = validate(data);
    return { valid, errors: validate.errors };
  }

  /**
   * Navigates to a specified path within a JSON schema.
   * 
   * @param {JsonSchema} schema - The JSON schema to navigate.
   * @param {string[]} path - The path to navigate within the schema.
   * @returns {JsonSchema} - The schema at the specified path.
   * @private
   */
  private navigateToPath(schema: JsonSchema, path: string[]): JsonSchema {
    let current: any = schema;
    for (const segment of path) {
      if (!current.properties) {
        current.properties = {};
      }
      if (!current.properties[segment]) {
        current.properties[segment] = { type: 'object', properties: {} };
      }
      current = current.properties[segment];
    }
    return current;
  }

  /**
   * Initializes the `oneOf` property for a JSON schema.
   * 
   * @param {JsonSchema} property - The property to initialize.
   * @private
   */
  private initializeOneOfProperty(property: JsonSchema) {
    if (!Array.isArray(property.oneOf)) {
      property.oneOf = [];
      if (property.type) {
        (property.oneOf as Array<any>).push({ type: property.type });
        delete property.type;
      }
    }
  }

}
