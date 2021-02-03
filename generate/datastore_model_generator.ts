import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { DatastoreDefinition, MessageFieldDefinition } from "./definition";
import { Importer } from "./importer";
import { PRIMITIVE_TYPE_STRING, TypeChecker } from "./type_checker";
import { generateComment, toCapitalized, toUpperSnaked } from "./util";

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
    this.datastoreQuery = {
      filters: new Array<DatastoreFilter>(),
      orderings: [`);
      for (let property of index.properties) {
        if (property.descending !== undefined) {
          contentList.push(`
        {
          fieldName: "${property.fieldName}",
          descending: ${property.descending}
        },`);
        }
      }
      contentList.push(`
      ]
    }
  }
  public start(cursor: string): this {
    this.datastoreQuery.startCursor = cursor;
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
        let { isEnum, isMessage } = typeChecker.categorizeType(
          fieldDefinition.type,
          fieldDefinition.import
        );
        if (isMessage) {
          throw new Error(
            `${fieldDefinition.type} cannot be used as a filter in Datastore.`
          );
        }
        if (isEnum) {
          importer.importFromPath(fieldDefinition.import, fieldDefinition.type);
        }
        excludedIndexes.delete(property.fieldName);

        contentList.push(`
  public filterBy${toCapitalized(
    property.fieldName
  )}(operator: Operator, value: ${fieldDefinition.type}): this {
    this.datastoreQuery.filters.push({
      fieldName: "${property.fieldName}",
      fieldValue: value,
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
  if (keyDefinition.type !== PRIMITIVE_TYPE_STRING) {
    throw new Error(
      `Datastore key can only be a string, but it is ` +
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
