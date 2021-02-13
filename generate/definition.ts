export interface EnumValue {
  // Recommended to be SNAKE_CASE.
  name: string;
  value: number;
  comment?: string;
}

export interface EnumDefinition {
  // Must be of CamelCase.
  name: string;
  values: Array<EnumValue>;
  comment?: string;
}

export interface MessageFieldDefinition {
  // Recommended to be camelCase.
  name: string;
  // Can be 'number', 'string', 'boolean' or the name of a message or enum.
  type: string;
  isArray?: true;
  // Resolves import path the same way as Node. Do not include '.json'.
  import?: string;
  comment?: string;
}

export interface IndexField {
  // The name of a `MessageFieldDefinition`.
  fieldName: string;
  descending?: boolean;
}

export interface IndexDefinition {
  // Recommended to be CamelCase, which will be part of the name of a class.
  name: string;
  fields: Array<IndexField>;
}

export interface DatastoreDefinition {
  // The path to output the generated Datastore definition, relative to the
  // current definition JSON file. It should be separated from its message
  // definition. Do not include '.ts'.
  output: string;
  key: string;
  indexes?: Array<IndexDefinition>;
  comment?: string;
}

export interface MessageDefinition {
  // Must be of CamelCase, which will be the name of a class or interface.
  name: string;
  fields: Array<MessageFieldDefinition>;
  isObservable?: true;
  comment?: string;
  // Requires package `@selfage/datastore_client`.
  datastore?: DatastoreDefinition;
}

export interface ServiceDefinition {
  // Must be of CamelCase, which will be the name for the descriptor.
  name: string;
  // The pathname of a url. Must start with "/".
  path: string;
  // The name of a `MessageFieldDefinition` used for request.
  request: string;
  // Resolves import path the same way as Node. Do not include '.json'.
  importRequest?: string;
  // The name of a `MessageFieldDefinition` used for response.
  response: string;
  // Resolves import path the same way as Node. Do not include '.json'.
  importResponse?: string;
  // The name of a `MessageFieldDefinition` used for session. Specify only when 
  // the service requires authorization.
  session?: string;
  // Resolves import path the same way as Node. Do not include '.json'.
  importSession?: string;
}

// Requires package `@selfage/message`.
export interface Definition {
  // One of the below.
  enum?: EnumDefinition;
  message?: MessageDefinition;
  service?: ServiceDefinition;
}
