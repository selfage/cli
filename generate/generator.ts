import fs = require("fs");
import { stripFileExtension, writeFileSync } from "../io_helper";
import { Definition } from "./definition";
import { generateEnumDescriptor } from "./enum_generator";
import { Importer } from "./importer";
import { generateMessageDescriptor } from "./message_generator";
import { generateObservableDescriptor } from "./observable_generator";
import { TypeChecker } from "./type_checker";

export function generate(
  file: string,
  dryRun: boolean
): void {
  let modulePath = stripFileExtension(file);
  let definitions = JSON.parse(
    fs.readFileSync(modulePath + ".json").toString()
  ) as Array<Definition>;
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
    } else {
      throw new Error("Unsupported new definition.");
    }
  }

  let content = [...importer.toStringList(), ...contentList].join("");
  writeFileSync(modulePath + ".ts", content, dryRun);
}
