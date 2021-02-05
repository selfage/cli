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
  // Resolves import path as a relative path, the same way as Node. Do not
  // include '.json'.
  import?: string;
  comment?: string;
}

export interface MessageExtendDefinition {
  name: string;
  // Resolves import path as a relative path, the same way as Node. Do not
  // include '.json'.
  import?: string;
}

export interface MessageDefinition {
  // Must be of CamelCase, which will be the name of a class or interface.
  name: string;
  fields: Array<MessageFieldDefinition>;
  extends?: Array<MessageExtendDefinition>;
  isObservable?: true;
  comment?: string;
}

export interface IndexProperty {
  // The name of `MessageFieldDefinition`.
  fieldName: string;
  descending?: boolean;
}

export interface IndexDefinition {
  // Recommended to be CamelCase, which will be part of the name of a class.
  name: string;
  fields: Array<IndexProperty>;
}

export interface DatastoreDefinition {
  // The name of `MessageDefinition`.
  messageName: string;
  // Resolves import path as a relative path, the same way as Node. Do not
  // include '.json'.
  import?: string;
  key: string;
  indexes?: Array<IndexDefinition>;
  comment?: string;
}

export interface Definition {
  enum?: EnumDefinition;
  message?: MessageDefinition;
  datastore?: DatastoreDefinition;
}
