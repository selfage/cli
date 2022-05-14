export interface EnumValue {
  // Recommended to be SNAKE_CASE.
  name: string;
  value: number;
  comment?: string;
}

export interface EnumDefinition {
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

export interface DatastoreFilterTemplate {
  // The name of a `MessageFieldDefinition`.
  fieldName: string;
  // One of "=", ">", "<", ">=" and "<=".
  operator: string;
}

export interface DatastoreOrdering {
  // The name of a `MessageFieldDefinition`.
  fieldName: string;
  descending: boolean;
}

export interface DatastoreQueryTemplate {
  // Recommended to be CamelCase, which will be part of the name of a class.
  name: string;
  filters?: Array<DatastoreFilterTemplate>;
  orderings?: Array<DatastoreOrdering>
  comment?: string;
}

export interface DatastoreDefinition {
  // The path to output the generated Datastore definition, relative to the
  // current definition JSON file. It should be separated from its message
  // definition. Do not include '.ts'.
  output: string;
  key: string;
  queries?: Array<DatastoreQueryTemplate>;
  comment?: string;
}

export interface MessageDefinition {
  fields: Array<MessageFieldDefinition>;
  isObservable?: true;
  comment?: string;
  // Requires package `@selfage/datastore_client`.
  datastore?: DatastoreDefinition;
}

export interface ServiceDefinition {
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
}

export interface SpannerVariable {
  name: string;
  // Supports the following types: string, bool, int53, float, timestamp, and
  // bytes.
  // float maps to float64 in Spanner and number in JS/TS.
  // timestamp maps to timestamp in Spanner and number in milliseconds in JS/TS.
  // string and bool are the same in Spanner and JS/TS.
  // bytes maps to bytes in Spanner and Nodejs Buffer in JS/TS.
  // int53 maps to int64 in Spanner and number in JS/TS. By specifying int53,
  // it means that you can guarantee the number stored won't exceed the max
  // number in JS which is 2^53 - 1.
  // int64 is left out here until bigint is better supported in all browsers.
  // Other types, including struct and array of array, are not supported.
  type: string;
  isArray?: boolean;
}

export interface SpannerSqlDefinition {
  // Following Spanner SQL syntax, optionally with params.
  sql: string;
  // Must match the params specified in SQL statements.
  params?: Array<SpannerVariable>;
  // Must match the output columns, if the SQL statement is a query statement.
  outputColumns?: Array<SpannerVariable>;
}

export interface Definition {
  // Must be of CamelCase.
  name: string;
  // One of the below.
  // Generated code requires package `@selfage/message`.
  enum?: EnumDefinition;
  // Generated code requires package `@selfage/message`.
  message?: MessageDefinition;
  // Generated code requires package `@selfage/service_descriptor`.
  service?: ServiceDefinition;
  // Generated code requires package `@google-cloud/spanner`.
  spannerSql?: SpannerSqlDefinition;
}
