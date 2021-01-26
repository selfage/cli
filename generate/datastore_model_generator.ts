import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { DatastoreDefinition, MessageFieldDefinition } from "./definition";
import { Importer } from "./importer";
import { TypeChecker } from "./type_checker";
import {
  PRIMITIVE_TYPE_NUMBER,
  PRIMITIVE_TYPE_STRING,
  flattenFieldType,
  generateComment,
  toCapitalized,
  toUpperSnaked,
} from "./util";

// `contentList`, `indexBuilder` and `importer` are expected to be modified.
export function generateDatastoreModel(
  datastoreDefinition: DatastoreDefinition,
  typeChecker: TypeChecker,
  importer: Importer,
  indexBuilder: DatastoreIndexBuilder,
  contentList: Array<string>
): void {
  let messageName = datastoreDefinition.messageName;
  let messageDefinition = typeChecker.getMessage(
    messageName,
    datastoreDefinition.import
  );
  if (!messageDefinition) {
    let importPath = datastoreDefinition.import;
    if (!importPath) {
      importPath = "the same file";
    }
    throw new Error(
      `Message definition of ${messageName} is not found at ${importPath}.`
    );
  }

  let fieldToDefinitions = new Map<string, MessageFieldDefinition>();
  let excludedIndexes = new Set<string>();
  for (let field of messageDefinition.fields) {
    fieldToDefinitions.set(field.name, field);
    excludedIndexes.add(field.name);
  }
  if (datastoreDefinition.indexes) {
    indexBuilder.addIndex(datastoreDefinition);
    for (let index of datastoreDefinition.indexes) {
      importer.importFromDatastoreModelDescriptor(
        "DatastoreQuery",
        "DatastoreFilter",
        "DatastoreOrdering",
        "Operator"
      );
      contentList.push(`
export class ${index.name}QueryBuilder {
  private datastoreQuery: DatastoreQuery<${messageName}>;

  public constructor() {
    let filters = new Array<DatastoreFilter>();
    let orderings = new Array<DatastoreOrdering>();`);
      for (let property of index.properties) {
        if (property.descending !== undefined) {
          contentList.push(`
    orderings.push({
      indexName: "${property.fieldName}",
      descending: ${property.descending}
    });`);
        }
      }
      contentList.push(`
    this.datastoreQuery = {filters: filters, orderings: orderings};
  }
  public start(token: string): this {
    this.datastoreQuery.startToken = token;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }`);
      for (let property of index.properties) {
        if (!fieldToDefinitions.has(property.fieldName)) {
          throw new Error(
            `Indexed field ${property.fieldName} is not defined from ` +
              `${messageName}.`
          );
        }

        let fieldDefinition = fieldToDefinitions.get(property.fieldName);
        let { enumTypeName, messageTypeName } = flattenFieldType(
          typeChecker,
          fieldDefinition.type,
          fieldDefinition.import
        );
        if (messageTypeName) {
          throw new Error(
            `${messageTypeName} cannot be used as a filter in Datastore.`
          );
        }
        if (enumTypeName) {
          importer.importFromPath(fieldDefinition.import, enumTypeName);
        }
        excludedIndexes.delete(property.fieldName);
        contentList.push(`
  public filterBy${toCapitalized(
    property.fieldName
  )}(operator: Operator, value: ${fieldDefinition.type}): this {
    this.datastoreQuery.filters.push({
      indexName: "${property.fieldName}",
      indexValue: value,
      operator: operator,
    });
    return this;
  }`);
      }
      contentList.push(`
  public build(): DatastoreQuery<${messageName}> {
    return this.datastoreQuery;
  }
}
`);
    }
  }

  let keyDefinition = fieldToDefinitions.get(datastoreDefinition.key);
  if (!keyDefinition) {
    throw new Error(
      `Datastore key ${datastoreDefinition.key} is not found from ` +
        `${messageName}.`
    );
  }
  if (
    keyDefinition.type !== PRIMITIVE_TYPE_STRING &&
    keyDefinition.type !== PRIMITIVE_TYPE_NUMBER
  ) {
    throw new Error(
      `Datastore key can only be a string or a number, but it is ` +
        `${keyDefinition.type}.`
    );
  }
  if (keyDefinition.isArray) {
    throw new Error(`Datastore key cannot be an array.`);
  }
  let messageDescriptorName = toUpperSnaked(messageName);
  importer.importFromPath(
    datastoreDefinition.import,
    messageName,
    messageDescriptorName
  );
  importer.importFromDatastoreModelDescriptor("DatastoreModelDescriptor");
  contentList.push(`${generateComment(datastoreDefinition.comment)}
export let ${messageDescriptorName}_MODEL: DatastoreModelDescriptor<${messageName}> = {
  name: "${messageName}",
  key: "${datastoreDefinition.key}",
  excludedIndexes: ["${Array.from(excludedIndexes).join(`", "`)}"],
  valueDescriptor: ${messageDescriptorName},
}
`);
}
