import { stripFileExtension } from "../io_helper";
import { build } from "./builder";
import { spawn } from "child_process";

export async function run(
  file: string,
  tsconfigFile: string,
  args?: Array<string>
): Promise<void> {
  await build(file, tsconfigFile);
  let jsFile = stripFileExtension(file) + ".js";
  let cliArgs: Array<string>;
  if (!args) {
    cliArgs = new Array<string>();
  } else {
    cliArgs = args;
  }
  let childProcess = spawn("node", [jsFile, ...cliArgs], { stdio: "inherit" });
  return new Promise<void>((resolve) => {
    childProcess.on("exit", () => resolve());
  });
}
