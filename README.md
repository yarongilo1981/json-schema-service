
# json-schema-service

`json-schema-service` is a TypeScript library that handles TypeScript types and JSON schemas using decorators or a declarative approach. It allows you to define JSON schemas with minimal boilerplate and provides powerful schema validation capabilities.

## Installation

Install the package via npm:

\`\`\`sh
npm install json-schema-service
\`\`\`

## Usage

### Defining Schemas

Use decorators to define your schema:

\`\`\`typescript
import { JsonSchemaObject, JsonSchemaProperty } from 'json-schema-service';

@JsonSchemaObject({ description: 'A sample user object' })
class User {
  @JsonSchemaProperty({ required: true, description: 'User name' })
  name: string;

  @JsonSchemaProperty({ required: true, description: 'User age' })
  age: number;
}
\`\`\`

### Creating and Validating JSON Schemas

You can create a JSON schema from your TypeScript classes:

\`\`\`typescript
import { JsonSchemaService } from 'json-schema-service';

const schemaService = new JsonSchemaService();
const userSchema = schemaService.createJsonSchema(User);

// Validate data
const { valid, errors } = schemaService.validate(userSchema, { name: 'John', age: 30 });

if (valid) {
  console.log('Data is valid');
} else {
  console.error('Data is invalid', errors);
}
\`\`\`

## Features

- **Decorators** for defining JSON schemas directly in TypeScript.
- **Validation** using [Ajv](https://ajv.js.org/), a fast JSON schema validator.
- **Support for `oneOf`** and complex schema types.
- **Flexible** schema generation for various use cases.

## Contributing

Contributions are welcome! Please check the [issues](https://github.com/yarongilo1981/json-schema-service/issues) and feel free to submit a pull request.

## License

This project is licensed under the ISC License.
