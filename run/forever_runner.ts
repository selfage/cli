import { stripFileExtension } from "../io_helper";
import { spawn } from "child_process";

export function runForever(file: string, args = new Array<string>()): void {
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
