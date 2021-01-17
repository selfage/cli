import { TypeChecker } from "./type_checker";

export let PRIMITIVE_TYPE_STRING = "string";
export let PRIMITIVE_TYPE_NUMBER = "number";
export let PRIMITIVE_TYPE_BOOLEAN = "boolean";
let UPPER_CASES_REGEXP = /[A-Z]/;

export function flattenFieldType(
  typeChecker: TypeChecker,
  typeName: string,
  importPath?: string
): {
  primitiveTypeName?: string;
  enumTypeName?: string;
  messageTypeName?: string;
} {
  if (
    typeName === PRIMITIVE_TYPE_STRING ||
    typeName === PRIMITIVE_TYPE_NUMBER ||
    typeName === PRIMITIVE_TYPE_BOOLEAN
  ) {
    return {
      primitiveTypeName: typeName,
    };
  }
  if (typeChecker.isMessage(typeName, importPath)) {
    return {
      messageTypeName: typeName,
    };
  } else {
    return {
      enumTypeName: typeName,
    };
  }
}

export function generateComment(comment: string): string {
  if (comment) {
    return `\n/* ${comment} */`;
  } else {
    return "";
  }
}

export function toCapitalized(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function toUpperSnaked(name: string): string {
  let upperCaseSnakedName = name.charAt(0);
  for (let i = 1; i < name.length; i++) {
    let char = name.charAt(i);
    if (UPPER_CASES_REGEXP.test(char)) {
      upperCaseSnakedName += "_" + char;
    } else {
      upperCaseSnakedName += char.toUpperCase();
    }
  }
  return upperCaseSnakedName;
}
