//json-schema-service/src/json-schema.service.ts

import Ajv, { JSONSchemaType } from 'ajv';
import {
  JsonSchemaPropertyOptions,
  SCHEMA_OBJECT_METADATA_KEY,
  SCHEMA_PROPERTY_METADATA_KEY,
} from './json-schema.decorators';

type JsonSchema = Record<string, unknown>;

export class JsonSchemaService {
  private ajv = new Ajv();

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
    const classOptions = Reflect.getMetadata(
      SCHEMA_OBJECT_METADATA_KEY,
      ClassRef,
    );
    if (classOptions && classOptions.description) {
      schema.description = classOptions.description;
    }
    const properties = Reflect.getMetadata(
      SCHEMA_PROPERTY_METADATA_KEY,
      ClassRef.prototype,
    );
    Object.keys(properties).forEach((propertyKey) => {
      const type = Reflect.getMetadata(
        'design:type',
        ClassRef.prototype,
        propertyKey,
      );
      const options = properties[propertyKey];
      this.addPropertyToJsonSchema(schema, propertyKey, type, options);
    });
    return schema;
  }

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

  validate(schema: JsonSchema, data: any): { valid: boolean, errors?: any } {
    const validate = this.ajv.compile(schema as JSONSchemaType<any>);
    const valid = validate(data);
    return { valid, errors: validate.errors };
  }

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

  private initializeOneOfProperty(property: JsonSchema) {
    if (!Array.isArray(property.oneOf)) {
      property.oneOf = [];
      if (property.type) {
        (property.oneOf as Array<any>).push({ type: property.type });
        delete property.type;
      }
    }
  }

  addTypeOneOf(
    schema: JsonSchema,
    path: string[],
    newClassRef: any
  ): JsonSchema {
    if (path.length === 0) {
      throw new Error('Path cannot be empty');
    }

    const lastSegment = path.pop();
    if (!lastSegment) {
      throw new Error('Invalid path');
    }

    const parent = this.navigateToPath(schema, path);

    if (!parent.properties) {
      parent.properties = {};
    }

    if (!(parent.properties as any)[lastSegment]) {
      (parent.properties as any)[lastSegment] = this.createJsonSchema(newClassRef);
    } else {
      this.initializeOneOfProperty((parent.properties as any)[lastSegment]);
      (parent.properties as any)[lastSegment].oneOf.push(this.createJsonSchema(newClassRef));
    }

    return schema;
  }
}
