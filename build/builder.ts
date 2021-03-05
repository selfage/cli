import fs = require("fs");
import path = require("path");
import resolve = require("resolve");
import { stripFileExtension } from "../io_helper";
import { spawn } from "child_process";

export async function build(
  file: string,
  tsconfigFile: string
): Promise<boolean> {
  let compilerOptions = await readCompilerOptions(tsconfigFile);
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
  return new Promise<boolean>((resolve, reject) => {
    childProcess.on("exit", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
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
