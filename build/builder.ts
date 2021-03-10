import fs = require("fs");
import path = require("path");
import resolve = require("resolve");
import { stripFileExtension } from "../io_helper";
import { spawn } from "child_process";

export async function build(file: string, tsconfigFile: string): Promise<void> {
  let code = await buildAndReturnExitCode(file, tsconfigFile);
  process.exitCode = code;
}

export async function buildAndReturnExitCode(
  file: string,
  tsconfigFile: string
): Promise<number> {
  return buildWithCompilerOptionsAndReturnExitCode(
    file,
    await readCompilerOptions(tsconfigFile)
  );
}

export async function buildWithCompilerOptionsAndReturnExitCode(
  file: string,
  compilerOptions: any
): Promise<number> {
  let incremental = false;
  let args = new Array<string>();
  for (let propertyName of Object.keys(compilerOptions)) {
    args.push(`--${propertyName}`, `${compilerOptions[propertyName]}`);
    if (propertyName === "incremental") {
      incremental = true;
    }
  }

  let modulePath = stripFileExtension(file);
  if (incremental) {
    args.push("--tsBuildInfoFile", `${modulePath}.tsbuildinfo`);
  }
  let childProcess = spawn("npx", ["tsc", ...args, `${modulePath}.ts`], {
    stdio: "inherit",
  });
  return new Promise<number>((resolve, reject) => {
    childProcess.on("exit", (code) => {
      resolve(code);
    });
  });
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
