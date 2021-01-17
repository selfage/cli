export interface EnumValue {
  name: string;
  value: number;
  comment?: string;
}

export interface EnumDefinition {
  name: string;
  values: Array<EnumValue>;
  comment?: string;
}

export interface MessageFieldDefinition {
  name: string;
  type: string;
  isArray?: true;
  import?: string;
  comment?: string;
}

export interface MessageExtendDefinition {
  name: string;
  import?: string;
}

export interface MessageDefinition {
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
