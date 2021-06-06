import fs = require("fs");
import path = require("path");
import resolve = require("resolve");
import { stripFileExtension } from "../io_helper";
import { spawn } from "child_process";

export async function compile(
  entryFile: string,
  tsconfigFile = "./tsconfig.json",
  extraFiles = new Array<string>()
): Promise<void> {
  let compilerOptions = await readCompilerOptions(tsconfigFile);
  let incremental = false;
  let args = new Array<string>();
  for (let propertyName of Object.keys(compilerOptions)) {
    args.push(`--${propertyName}`, `${compilerOptions[propertyName]}`);
    if (propertyName === "incremental") {
      incremental = true;
    }
  }
  let entryModulePath = stripFileExtension(entryFile);
  if (incremental) {
    args.push("--tsBuildInfoFile", `${entryModulePath}.tsbuildinfo`);
  }
  let entryFileNormalized = entryModulePath + ".ts";
  let extraFilesNormalized = extraFiles.map(
    (file) => stripFileExtension(file) + ".ts"
  );

  let childProcess = spawn(
    "npx",
    ["tsc", ...args, ...extraFilesNormalized, entryFileNormalized],
    {
      stdio: "inherit",
    }
  );
  let exitCode = await new Promise<number>((resolve, reject) => {
    childProcess.on("exit", (code) => {
      resolve(code);
    });
  });
  if (exitCode !== 0) {
    throw new Error(`tsc completed with non-zero code: ${exitCode}.`);
  }
}

export async function readCompilerOptions(tsconfigFile: string): Promise<any> {
  let tsconfig = JSON.parse(
    (await fs.promises.readFile(tsconfigFile)).toString()
  );
  let compilerOptions = tsconfig.compilerOptions;
  if (tsconfig.extends) {
    let baseDir = path.dirname(tsconfigFile);
    let baseTsconfigFile = resolve.sync(tsconfig.extends, {
      basedir: baseDir,
      extensions: [".json"],
    });
    let baseCompilerOptions = await readCompilerOptions(baseTsconfigFile);
    compilerOptions = { ...baseCompilerOptions, ...compilerOptions };
  }
  return compilerOptions;
}
