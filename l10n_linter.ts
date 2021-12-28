import fs = require("fs");
import path = require("path");
import {
  ClassDeclaration,
  ImportDeclaration,
  ScriptTarget,
  StringLiteral,
  SyntaxKind,
  createSourceFile,
} from "typescript";

let TEXT_MODULE = "text";
let TEXT_FILE = TEXT_MODULE + ".ts";
let TEXT_FALLBACK_FILE = TEXT_MODULE + "_fallback.ts";
let DEFAULT_DIRECTORY = "default";

export async function lintL10n(baseDir: string): Promise<void> {
  let logs = await lintL10nReturnLogs(baseDir);
  console.log(logs.join("\n"));
}

export async function lintL10nReturnLogs(
  baseDir: string
): Promise<Array<string>> {
  let logs = new Array<string>();

  let localesDir: string;
  let defaultLocaleDir: string;
  let hasError: boolean;
  let texts: Set<string>;
  try {
    localesDir = await checkDirExists(baseDir, "locales");
    defaultLocaleDir = await checkDirExists(localesDir, DEFAULT_DIRECTORY);
    let defaultTextFile = await checkFileExists(defaultLocaleDir, TEXT_FILE);
    ({ hasError, texts } = await lintTextFile(defaultTextFile, logs));
  } catch (e) {
    logs.push(toRed(e.message));
    process.exitCode = 1;
    return logs;
  }

  hasError = (await lintFallbackFile(defaultLocaleDir, logs)) || hasError;

  let items = await fs.promises.readdir(localesDir, { withFileTypes: true });
  for (let item of items) {
    if (item.isDirectory() && item.name !== DEFAULT_DIRECTORY) {
      hasError =
        (await lintPerLocaleFile(
          path.join(localesDir, item.name),
          texts,
          logs
        )) || hasError;
    }
  }
  if (hasError) {
    process.exitCode = 1;
  } else {
    logs.push(toGreen("No issue found."));
  }
  return logs;
}

async function checkDirExists(
  baseDir: string,
  dirName: string
): Promise<string> {
  let fullDir = path.join(baseDir, dirName);
  let stats: fs.Stats;
  try {
    stats = await fs.promises.stat(fullDir);
  } catch (e) {
    throw new Error(`Create a directory /${dirName} under ${baseDir}.`);
  }
  if (!stats.isDirectory()) {
    throw new Error(`Create a directory /${dirName} under ${baseDir}.`);
  }
  return fullDir;
}

async function checkFileExists(
  baseDir: string,
  fileName: string
): Promise<string> {
  let fullFile = path.join(baseDir, fileName);
  let stats: fs.Stats;
  try {
    stats = await fs.promises.stat(fullFile);
  } catch (e) {
    throw new Error(`Create a file ${fileName} under ${baseDir}.`);
  }
  if (!stats.isFile()) {
    throw new Error(`Create a file ${fileName} under ${baseDir}.`);
  }
  return fullFile;
}

async function lintTextFile(
  fileName: string,
  logs: Array<string>
): Promise<{
  hasError: boolean;
  texts: Set<string>;
}> {
  let sourceFile = createSourceFile(
    "placeholder",
    (await fs.promises.readFile(fileName)).toString(),
    ScriptTarget.ES5,
    true
  );

  let foundImport = false;
  let foundClass = false;
  let errorFromImport = false;
  let errors = new Array<string>();
  let texts = new Set<string>();
  for (let node of sourceFile.statements) {
    if (node.kind === SyntaxKind.ImportEqualsDeclaration) {
      throw new Error(
        `${fileName}: Only import with "import SomeText from './...';"`
      );
    } else if (node.kind === SyntaxKind.ImportDeclaration) {
      if (!foundImport) {
        foundImport = true;
      } else {
        throw new Error(`${fileName}: Only import one class.`);
      }
      let importNode = node as ImportDeclaration;
      let importPath = path.normalize(
        (importNode.moduleSpecifier as StringLiteral).text
      );
      if (importNode.importClause && importNode.importClause.name) {
        if (!importPath.includes("..")) {
          let res = await lintTextFile(
            path.join(path.dirname(fileName), importPath + ".ts"),
            logs
          );
          errorFromImport = res.hasError;
          texts = res.texts;
        } else {
          // Stop digging into default texts.
          if (!importPath.includes(`../${DEFAULT_DIRECTORY}/`)) {
            throw new Error(
              `${fileName}: Only import from /${DEFAULT_DIRECTORY} when outside of the current locale directory.`
            );
          }
        }
      } else {
        throw new Error(
          `${fileName}: Only import with "import SomeText from './...';"`
        );
      }
    } else if (node.kind === SyntaxKind.ClassDeclaration) {
      if (!foundClass) {
        foundClass = true;
      } else {
        throw new Error(`${fileName}: Only declare one class.`);
      }
      let classNode = node as ClassDeclaration;
      if (
        !classNode.modifiers ||
        classNode.modifiers.length !== 2 ||
        classNode.modifiers[0].kind !== SyntaxKind.ExportKeyword ||
        classNode.modifiers[1].kind !== SyntaxKind.DefaultKeyword
      ) {
        errors.push(
          `Declare the class ${classNode.name.getText()} with "export default".`
        );
      }
      for (let member of classNode.members) {
        texts.add(member.name.getText());
        if (member.modifiers && member.modifiers.length > 0) {
          errors.push(
            `Do not use public/protected/private/static/async or any other modifier.`
          );
        }
        if (
          member.kind !== SyntaxKind.GetAccessor &&
          member.kind !== SyntaxKind.MethodDeclaration
        ) {
          errors.push(
            `Do not declare class members other than getter and function.`
          );
        }
      }
    } else {
      errors.push(
        `Only declare one class and/or import one class at top-level.`
      );
    }
  }
  if (errors.length > 0) {
    logs.push(toYellow(`${fileName}:\n\n${errors.join("\n")}\n`));
  }
  return { hasError: errorFromImport || errors.length > 0, texts };
}

async function lintFallbackFile(
  defaultLocaleDir: string,
  logs: Array<string>
): Promise<boolean> {
  let fallbackFile: string;
  try {
    fallbackFile = await checkFileExists(defaultLocaleDir, TEXT_FALLBACK_FILE);
  } catch (e) {
    // Ignore fallback file if not exist.
    return false;
  }

  try {
    return (await lintTextFile(fallbackFile, logs)).hasError;
  } catch (e) {
    logs.push(toRed(e.message));
    return true;
  }
}

async function lintPerLocaleFile(
  localeDir: string,
  defaultTexts: Set<string>,
  logs: Array<string>
): Promise<boolean> {
  let hasError: boolean;
  let texts: Set<string>;
  try {
    let localeFile = await checkFileExists(localeDir, TEXT_FILE);
    ({ hasError, texts } = await lintTextFile(localeFile, logs));
  } catch (e) {
    logs.push(toRed(e.message));
    return true;
  }

  console.log("localeDir:" + localeDir);
  console.log("Default:" + Array.from(defaultTexts).join());
  console.log("Found:" + Array.from(texts).join());

  let pendingTranslation = new Array<string>();
  for (let text of defaultTexts) {
    if (!texts.delete(text)) {
      pendingTranslation.push(text);
    }
  }
  if (pendingTranslation.length > 0) {
    hasError = true;
    logs.push(
      toYellow(
        `${localeDir}: Missing the following translations:\n\n${pendingTranslation.join(
          "\n"
        )}\n`
      )
    );
  }
  if (texts.size > 0) {
    hasError = true;
    logs.push(
      toYellow(
        `${localeDir}: The following translations need to be removed:\n\n${Array.from(
          texts
        ).join("\n")}\n`
      )
    );
  }
  return hasError;
}

function toRed(log: string): string {
  return `\x1b[31m${log}\x1b[0m`;
}

function toYellow(log: string): string {
  return `\x1b[33m${log}\x1b[0m`;
}

function toGreen(log: string): string {
  return `\x1b[32m${log}\x1b[0m`;
}
