import fs = require("fs");
import { stripFileExtension, writeFileSync } from "../io_helper";
import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { generateDatastoreModel } from "./datastore_model_generator";
import { Definition } from "./definition";
import { generateEnumDescriptor } from "./enum_generator";
import { Importer } from "./importer";
import { generateMessageDescriptor } from "./message_generator";
import { generateObservableDescriptor } from "./observable_generator";
import { TypeChecker } from "./type_checker";

export function generate(
  inputFile: string,
  dryRun?: boolean,
  inputIndexFile?: string
): void {
  let modulePath = stripFileExtension(inputFile);
  let definitions = JSON.parse(
    fs.readFileSync(modulePath + ".json").toString()
  ) as Array<Definition>;

  let hasDatastoreDefinition = false;
  for (let definition of definitions) {
    if (definition.datastore) {
      hasDatastoreDefinition = true;
      break;
    }
  }
  if (hasDatastoreDefinition && !inputIndexFile) {
    throw new Error(
      "An index file is required for generating datastore model."
    );
  }

  let indexBuilder = new DatastoreIndexBuilder();
  let typeChecker = new TypeChecker(modulePath);
  let importer = new Importer();
  let contentList = new Array<string>();
  for (let definition of definitions) {
    if (definition.enum) {
      generateEnumDescriptor(definition.enum, importer, contentList);
    } else if (definition.message) {
      if (!definition.message.isObservable) {
        generateMessageDescriptor(
          definition.message,
          typeChecker,
          importer,
          contentList
        );
      } else {
        generateObservableDescriptor(
          definition.message,
          typeChecker,
          importer,
          contentList
        );
      }
    } else if (definition.datastore) {
      generateDatastoreModel(
        definition.datastore,
        typeChecker,
        importer,
        indexBuilder,
        contentList
      );
    } else {
      throw new Error("Unsupported new definition.");
    }
  }

  if (hasDatastoreDefinition) {
    let indexFile = stripFileExtension(inputIndexFile) + ".yaml";
    let indexContent = indexBuilder.mergeIndexes(indexFile);
    writeFileSync(indexFile, indexContent, dryRun);
  }
  let content = [...importer.toStringList(), ...contentList].join("");
  writeFileSync(modulePath + ".ts", content, dryRun);
}
