import { stripFileExtension } from "../io_helper";
import { build } from "./builder";
import { spawnSync } from "child_process";

export function run(file: string, args?: Array<string>): void {
  build(file);
  let jsFile = stripFileExtension(file);
  let cliArgs: Array<string>;
  if (!args) {
    cliArgs = new Array<string>();
  } else {
    cliArgs = args;
  }
  spawnSync("node", [jsFile, ...cliArgs], { stdio: "inherit" });
}
