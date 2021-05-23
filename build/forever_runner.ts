import { stripFileExtension } from "../io_helper";
import { compile } from "./compiler";
import { spawn } from "child_process";

export async function runForever(
  file: string,
  tsconfigFile?: string,
  args = new Array<string>()
): Promise<void> {
  await compile(file, tsconfigFile);
  let jsFile = stripFileExtension(file) + ".js";
  new Spawner(jsFile, args).spawnChild();
}

class Spawner {
  public constructor(private jsFile: string, private args: Array<string>) {}

  public spawnChild(): void {
    let childProcess = spawn("node", [this.jsFile, ...this.args], {
      stdio: "inherit",
    });
    childProcess.on("exit", (code) => {
      console.log(`Exited with code ${code}.`);
      this.spawnChild();
    });
  }
}
