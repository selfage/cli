import { stripFileExtension } from "../io_helper";
import { TSCONFIG_READER } from "./tsconfig_reader";
import { spawn } from "child_process";

export async function compile(
  file: string,
  tsconfigFile: string
): Promise<void> {
  let code = await compileAndReturnExitCode(file, tsconfigFile);
  process.exitCode = code;
}

export async function compileAndReturnExitCode(
  file: string,
  tsconfigFile: string
): Promise<number> {
  let compilerOptions = await TSCONFIG_READER.readCompilerOptions(tsconfigFile);
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
