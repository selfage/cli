import fs = require("fs");
import path = require("path");
import { stripFileExtension, writeFileSync } from "../io_helper";
import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { generateDatastoreModel } from "./datastore_model_generator";
import { Definition } from "./definition";
import { generateEnumDescriptor } from "./enum_generator";
import { generateMessageDescriptor } from "./message_generator";
import { generateObservableDescriptor } from "./observable_generator";
import { OutputContent } from "./output_content";
import { generateServiceDescriptr } from "./service_generator";
import { TypeChecker } from "./type_checker";
import { getNodeRelativePath } from "./util";

export function generate(
  inputFile: string,
  inputIndexFile?: string,
  dryRun?: boolean,
  packageJsonFile = "./package.json"
): void {
  let modulePath = getNodeRelativePath(stripFileExtension(inputFile));
  let definitions = JSON.parse(
    fs.readFileSync(modulePath + ".json").toString()
  ) as Array<Definition>;

  let hasDatastoreDefinition = definitions.some((definition) => {
    return definition.message && definition.message.datastore;
  });
  if (hasDatastoreDefinition && !inputIndexFile) {
    let packageIndexFile = JSON.parse(
      fs.readFileSync(packageJsonFile).toString()
    ).datastoreIndex;
    if (!packageJsonFile) {
      throw new Error(
        "An index file is required for generating datastore model."
      );
    }
    inputIndexFile = path.join(path.dirname(packageJsonFile), packageIndexFile);
  }

  let indexBuilder = new DatastoreIndexBuilder();
  let typeChecker = new TypeChecker(modulePath);
  let contentMap = new Map<string, OutputContent>();
  for (let definition of definitions) {
    if (definition.enum) {
      generateEnumDescriptor(modulePath, definition.enum, contentMap);
    } else if (definition.message) {
      if (!definition.message.isObservable) {
        generateMessageDescriptor(
          modulePath,
          definition.message,
          typeChecker,
          contentMap
        );
      } else {
        generateObservableDescriptor(
          modulePath,
          definition.message,
          typeChecker,
          contentMap
        );
      }
      if (definition.message.datastore) {
        generateDatastoreModel(
          modulePath,
          definition.message,
          typeChecker,
          indexBuilder,
          contentMap
        );
      }
    } else if (definition.service) {
      generateServiceDescriptr(
        modulePath,
        definition.service,
        typeChecker,
        contentMap
      );
    }
  }

  if (hasDatastoreDefinition) {
    let indexFile = stripFileExtension(inputIndexFile) + ".yaml";
    let indexContent = indexBuilder.mergeIndexes(indexFile);
    writeFileSync(indexFile, indexContent, dryRun);
  }
  for (let [outputModulePath, outputContent] of contentMap) {
    writeFileSync(outputModulePath + ".ts", outputContent.toString(), dryRun);
  }
}
