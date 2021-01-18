export interface EnumValue {
  name: string;
  value: number;
  comment?: string;
}

export interface EnumDefinition {
  // Must be of upper camel case.
  name: string;
  values: Array<EnumValue>;
  comment?: string;
}

export interface MessageFieldDefinition {
  name: string;
  // Can be 'number', 'string', 'boolean' or the name of a message or enum.
  type: string;
  isArray?: true;
  // Resolves import path the same way as Node. Do not include '.json'.
  import?: string;
  comment?: string;
}

export interface MessageExtendDefinition {
  name: string;
  // Resolves import path the same way as Node. Do not include '.json'.
  import?: string;
}

export interface MessageDefinition {
  // Must be of upper camel case.
  name: string;
  fields: Array<MessageFieldDefinition>;
  extends?: Array<MessageExtendDefinition>;
  isObservable?: true;
  comment?: string;
}

export interface IndexProperty {
  name: string;
  descending?: boolean;
}

export interface IndexDefinition {
  name: string;
  properties: Array<IndexProperty>;
}

export interface DatastoreDefinition {
  messageName: string;
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
