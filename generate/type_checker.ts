import fs = require("fs");
import path = require("path");
import resolve = require("resolve");
import ono from "@jsdevtools/ono";
import { Definition, MessageDefinition } from "./definition";

export let PRIMITIVE_TYPE_STRING = "string";
export let PRIMITIVE_TYPE_NUMBER = "number";
export let PRIMITIVE_TYPE_BOOLEAN = "boolean";

export class TypeChecker {
  private currentDir: string;
  private currentModuleBase: string;
  private cachedPathToNameToMessages = new Map<
    string,
    Map<string, MessageDefinition>
  >();

  public constructor(currentModulePath: string) {
    let pathObj = path.parse(currentModulePath);
    this.currentDir = pathObj.dir;
    this.currentModuleBase = "./" + pathObj.base;
  }

  public getMessage(
    typeName: string,
    importPath?: string
  ): MessageDefinition | undefined {
    if (!importPath) {
      importPath = this.currentModuleBase;
    }
    let filePath = resolve.sync(importPath, {
      basedir: this.currentDir,
      extensions: [".json"],
    });
    let nameToMessages = this.cachedPathToNameToMessages.get(filePath);
    if (!nameToMessages) {
      nameToMessages = new Map<string, MessageDefinition>();
      this.cachedPathToNameToMessages.set(filePath, nameToMessages);

      let jsonStr = fs.readFileSync(filePath).toString();
      let definitions: Array<Definition>;
      try {
        definitions = JSON.parse(jsonStr) as Array<Definition>;
      } catch (e) {
        throw ono(e, `Failed to parse JSON read from "${filePath}".`);
      }
      for (let definition of definitions) {
        if (definition.message) {
          nameToMessages.set(definition.message.name, definition.message);
        }
      }
    }
    return nameToMessages.get(typeName);
  }

  public categorizeType(
    typeName: string,
    importPath?: string
  ): {
    isPrimitive?: boolean;
    isEnum?: boolean;
    isMessage?: boolean;
  } {
    if (
      typeName === PRIMITIVE_TYPE_STRING ||
      typeName === PRIMITIVE_TYPE_NUMBER ||
      typeName === PRIMITIVE_TYPE_BOOLEAN
    ) {
      return {
        isPrimitive: true,
      };
    }
    if (this.getMessage(typeName, importPath)) {
      return { isMessage: true };
    } else {
      return { isEnum: true };
    }
  }
}
