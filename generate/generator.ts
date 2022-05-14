import fs = require("fs");
import path = require("path");
import { stripFileExtension, writeFileSync } from "../io_helper";
import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { generateDatastoreModel } from "./datastore_model_generator";
import { Definition } from "./definition";
import { generateEnumDescriptor } from "./enum_generator";
import { generateMessageDescriptor } from "./message_generator";
import { generateObservableDescriptor } from "./observable_generator";
import { OutputContentBuilder } from "./output_content_builder";
import { generateServiceDescriptor } from "./service_generator";
import { TypeChecker } from "./type_checker";
import { getNodeRelativePath } from "./util";
import { generateSpannerSql } from "./spanner_sql_generator";

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
  let indexBuilder: DatastoreIndexBuilder;
  if (hasDatastoreDefinition) {
    let indexFile = inputIndexFile;
    if (!indexFile) {
      let packageIndexFile = JSON.parse(
        fs.readFileSync(packageJsonFile).toString()
      ).datastoreIndex;
      if (!packageIndexFile) {
        throw new Error(
          "An index file is required for generating datastore model."
        );
      }
      indexFile = path.join(path.dirname(packageJsonFile), packageIndexFile);
    }
    indexBuilder = DatastoreIndexBuilder.create(
      stripFileExtension(indexFile) + ".yaml"
    );
  }

  let typeChecker = new TypeChecker(modulePath);
  let contentMap = new Map<string, OutputContentBuilder>();
  for (let definition of definitions) {
    if (definition.enum) {
      generateEnumDescriptor(
        modulePath,
        definition.name,
        definition.enum,
        contentMap
      );
    } else if (definition.message) {
      if (!definition.message.isObservable) {
        generateMessageDescriptor(
          modulePath,
          definition.name,
          definition.message,
          typeChecker,
          contentMap
        );
      } else {
        generateObservableDescriptor(
          modulePath,
          definition.name,
          definition.message,
          typeChecker,
          contentMap
        );
      }
      if (definition.message.datastore) {
        generateDatastoreModel(
          modulePath,
          definition.name,
          definition.message,
          typeChecker,
          indexBuilder,
          contentMap
        );
      }
    } else if (definition.service) {
      generateServiceDescriptor(
        modulePath,
        definition.name,
        definition.service,
        typeChecker,
        contentMap
      );
    } else if (definition.spannerSql) {
      generateSpannerSql(
        modulePath,
        definition.name,
        definition.spannerSql,
        contentMap
      );
    }
  }

  if (indexBuilder) {
    indexBuilder.writeFileSync(dryRun);
  }
  for (let [outputModulePath, outputContentBuilder] of contentMap) {
    writeFileSync(
      outputModulePath + ".ts",
      outputContentBuilder.toString(),
      dryRun
    );
  }
}
