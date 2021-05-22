import path = require("path");
import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { MessageDefinition, MessageFieldDefinition } from "./definition";
import { OutputContent } from "./output_content";
import { PRIMITIVE_TYPE_STRING, TypeChecker } from "./type_checker";
import {
  generateComment,
  getNodeRelativePath,
  toCapitalized,
  toUpperSnaked,
} from "./util";

export function generateDatastoreModel(
  modulePath: string,
  messageDefinition: MessageDefinition,
  typeChecker: TypeChecker,
  indexBuilder: DatastoreIndexBuilder,
  contentMap: Map<string, OutputContent>
): void {
  let outputPath = getNodeRelativePath(
    path.join(path.dirname(modulePath), messageDefinition.datastore.output)
  );
  let outputContent = OutputContent.get(contentMap, outputPath);
  let importMessagePath = reverseImport(modulePath, outputPath);
  let messageName = messageDefinition.name;
  let messageDescriptorName = toUpperSnaked(messageName);

  let fieldToDefinitions = new Map<string, MessageFieldDefinition>();
  let excludedIndexes = new Set<string>();
  for (let field of messageDefinition.fields) {
    fieldToDefinitions.set(field.name, field);
    excludedIndexes.add(field.name);
  }

  let indexContentList = new Array<string>();
  if (messageDefinition.datastore.indexes) {
    indexBuilder.addIndex(messageName, messageDefinition.datastore.indexes);
    for (let index of messageDefinition.datastore.indexes) {
      outputContent.importFromDatastoreModelDescriptor(
        "DatastoreQuery",
        "DatastoreFilter",
        "Operator"
      );
      indexContentList.push(`
export class ${index.name}QueryBuilder {
  private datastoreQuery: DatastoreQuery<${messageName}>;

  public constructor() {
    this.datastoreQuery = {
      modelDescriptor: ${messageDescriptorName}_MODEL,
      filters: new Array<DatastoreFilter>(),
      orderings: [`);
      for (let property of index.fields) {
        if (property.descending !== undefined) {
          indexContentList.push(`
        {
          fieldName: "${property.fieldName}",
          descending: ${property.descending}
        },`);
        }
      }
      indexContentList.push(`
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
      for (let property of index.fields) {
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
          outputContent.importFromPath(
            transitImport(importMessagePath, fieldDefinition.import),
            fieldDefinition.type
          );
        }
        excludedIndexes.delete(property.fieldName);

        indexContentList.push(`
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
      indexContentList.push(`
  public build(): DatastoreQuery<${messageName}> {
    return this.datastoreQuery;
  }
}
`);
    }
  }

  let keyDefinition = fieldToDefinitions.get(messageDefinition.datastore.key);
  if (!keyDefinition) {
    throw new Error(
      `Datastore key ${messageDefinition.datastore.key} is not found from ` +
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
  outputContent.importFromPath(
    importMessagePath,
    messageName,
    messageDescriptorName
  );
  outputContent.importFromDatastoreModelDescriptor("DatastoreModelDescriptor");
  outputContent.push(`${generateComment(messageDefinition.datastore.comment)}
export let ${messageDescriptorName}_MODEL: DatastoreModelDescriptor<${messageName}> = {
  name: "${messageName}",
  key: "${messageDefinition.datastore.key}",
  excludedIndexes: ["${Array.from(excludedIndexes).join(`", "`)}"],
  valueDescriptor: ${messageDescriptorName},
}
`);
  outputContent.push(...indexContentList);
}

// Both paths are relative path, where `basePath` is relative to CWD and
// outputPath is relative to `basePath`. Return the relative path to import
// `basePath` from `outputPath`.
function reverseImport(basePath: string, outputPath: string): string {
  let absoluteOutputPath = path.resolve(outputPath);
  return getNodeRelativePath(
    path.relative(path.dirname(absoluteOutputPath), basePath)
  );
}

// Both imports are relative path, where `firstImport` is relative to some base
// module and `secondImport` is relative to `firstImport`. Return the relative
// path to import `secondImport` from the base module. When `secondImport` is
// `undefined`, it means to import `firstImport`.
function transitImport(
  firstImport: string,
  secondImport: string | undefined
): string | undefined {
  let importPath: string;
  if (secondImport) {
    importPath = getNodeRelativePath(
      path.join(path.dirname(firstImport), secondImport)
    );
  } else {
    importPath = firstImport;
  }
  return importPath;
}
