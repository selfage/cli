import fs = require("fs");
import path = require("path");
import resolve = require("resolve");
import { spawnSync } from "child_process";

export function build(file: string): boolean {
  let compilerOptions = readCompilerOptions("./tsconfig.json");
  let incremental = false;
  let args = new Array<string>();
  for (let propertyName of Object.keys(compilerOptions)) {
    args.push(`--${propertyName}`, `${compilerOptions[propertyName]}`);
    if (propertyName === "incremental") {
      incremental = true;
    }
  }
  if (incremental) {
    args.push("--tsBuildInfoFile", `${file}.tsbuildinfo`);
  }
  let res = spawnSync("npx", ["tsc", ...args, `${file}.ts`], {
    stdio: "inherit",
  });
  return res.status === 0;
}

export function readCompilerOptions(tsconfigFile: string): any {
  let tsconfig = JSON.parse(fs.readFileSync(tsconfigFile).toString());
  let compilerOptions = tsconfig.compilerOptions;
  if (tsconfig.extends) {
    let baseDir = path.parse(tsconfigFile).dir;
    let baseTsconfigFile = resolve.sync(tsconfig.extends, {
      basedir: baseDir,
      extensions: [".json"],
    });
    let baseCompilerOptions = readCompilerOptions(baseTsconfigFile);
    compilerOptions = { ...baseCompilerOptions, ...compilerOptions };
  }
  return compilerOptions;
}
