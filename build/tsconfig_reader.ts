import fs = require("fs");
import path = require("path");
import resolve = require("resolve");

export class TsconfigReader {
  private fileToCompilerOptions = new Map<string, any>();

  public async readCompilerOptions(tsconfigFile: string): Promise<any> {
    let compilerOptions = this.fileToCompilerOptions.get(tsconfigFile);
    if (compilerOptions) {
      return compilerOptions;
    }

    let tsconfig = JSON.parse(
      (await fs.promises.readFile(tsconfigFile)).toString()
    );
    compilerOptions = tsconfig.compilerOptions;
    if (tsconfig.extends) {
      let baseDir = path.dirname(tsconfigFile);
      let baseTsconfigFile = resolve.sync(tsconfig.extends, {
        basedir: baseDir,
        extensions: [".json"],
      });
      let baseCompilerOptions = await this.readCompilerOptions(
        baseTsconfigFile
      );
      compilerOptions = { ...baseCompilerOptions, ...compilerOptions };
    }
    return compilerOptions;
  }
}

export let TSCONFIG_READER = new TsconfigReader();
