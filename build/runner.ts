import { stripFileExtension } from "../io_helper";
import { compile } from "./compiler";
import { spawn } from "child_process";

export async function run(
  file: string,
  tsconfigFile: string,
  args?: Array<string>
): Promise<void> {
  await compile(file, tsconfigFile);
  let jsFile = stripFileExtension(file) + ".js";
  let cliArgs = args ?? new Array<string>();
  let childProcess = spawn("node", [jsFile, ...cliArgs], { stdio: "inherit" });
  return new Promise<void>((resolve) => {
    childProcess.on("exit", (code) => {
      process.exitCode = code;
      resolve();
    });
  });
}
