import browserifyConstructor = require("browserify");
import fs = require("fs");
import getStream = require("get-stream");
import UglifyJS = require("uglify-js");
import { stripFileExtension } from "../io_helper";
import { compileAndReturnExitCode } from "./compiler";

export async function browserify(
  sourceFile: string,
  outputFile: string,
  tsconfigFile: string,
  inNode: boolean,
  environmentFile?: string,
  isDebug?: boolean
): Promise<void> {
  let exitCode = await compileAndReturnExitCode(sourceFile, tsconfigFile);
  if (exitCode !== 0) {
    process.exitCode = exitCode;
    return;
  }
  if (environmentFile) {
    let exitCode = await compileAndReturnExitCode(
      environmentFile,
      tsconfigFile
    );
    if (exitCode !== 0) {
      process.exitCode = exitCode;
      return;
    }
  }

  let filesToBeBrowserified = new Array<string>();
  // environmentFile, if exists, needs to be run first.
  if (environmentFile) {
    filesToBeBrowserified.push(stripFileExtension(environmentFile) + ".js");
  }
  filesToBeBrowserified.push(stripFileExtension(sourceFile) + ".js");
  let browserifyHandler = browserifyConstructor(filesToBeBrowserified, {
    debug: isDebug,
    node: inNode,
  });
  let involvedFiles: string[] = [];
  browserifyHandler.on("file", (file) => {
    involvedFiles.push(file);
  });
  let bundledCode = await getStream(browserifyHandler.bundle());

  let minifyOptions: UglifyJS.MinifyOptions = {};
  if (isDebug) {
    minifyOptions.sourceMap = {
      content: "inline",
      includeSources: true,
      url: "inline",
    };
  }
  let minifiedRes = UglifyJS.minify(bundledCode, minifyOptions);
  if (minifiedRes.error) {
    throw minifiedRes.error;
  }

  await fs.promises.writeFile(
    stripFileExtension(outputFile) + ".js",
    minifiedRes.code
  );
}
