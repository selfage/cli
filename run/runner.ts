import { compile } from "../build/compiler";
import { stripFileExtension } from "../io_helper";
import { spawn } from "child_process";

export async function run(
  file: string,
  tsconfigFile?: string,
  args = new Array<string>()
): Promise<void> {
  await compile(file, tsconfigFile);
  let jsFile = stripFileExtension(file) + ".js";
  let childProcess = spawn("node", [jsFile, ...args], { stdio: "inherit" });
  return new Promise<void>((resolve) => {
    childProcess.on("exit", (code) => {
      process.exitCode = code;
      resolve();
    });
  });
}
