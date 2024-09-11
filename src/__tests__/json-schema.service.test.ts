// json-schema-service/src/__tests__/json-schema.service.test.ts

import { JsonSchemaService,} from '../json-schema.service';
import {JsonSchemaObject, JsonSchemaProperty} from '../json-schema.decorators'

describe('JsonSchemaService', () => {
  const schemaService = new JsonSchemaService();

  @JsonSchemaObject({ description: 'A sample user object' })
  class User {
      @JsonSchemaProperty({ required: true, description: 'User name' })
      name: string;
      
      @JsonSchemaProperty({ required: true, description: 'User age' })
      age: number;
      
      constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
      }
  }

  test('should create a JSON schema from a TypeScript class', () => {
    const schema = schemaService.createJsonSchema(User);
    expect(schema).toEqual({
      type: 'object',
      description: 'A sample user object',
      properties: {
        name: { type: 'string', description: 'User name' },
        age: { type: 'number', description: 'User age' }
      },
      required: ['name', 'age']
    });
  });

  test('should validate a valid object against the schema', () => {
    const schema = schemaService.createJsonSchema(User);
    const result = schemaService.validate(schema, { name: 'John Doe', age: 30 });
    expect(result.valid).toBe(true);
    expect(result.errors).toBeFalsy();
  });

  test('should invalidate an invalid object against the schema', () => {
    const schema = schemaService.createJsonSchema(User);
    const result = schemaService.validate(schema, { name: 'John Doe' }); // Missing age
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });
});
