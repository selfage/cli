import browserifyConstructor = require("browserify");
import fs = require("fs");
import getStream = require("get-stream");
import UglifyJS = require("uglify-js");
import { stripFileExtension } from "../io_helper";
import { MTIME_LIST, Mtime, MtimeList } from "./browserify_mtime";
import {
  buildWithCompilerOptionsAndReturnExitCode,
  readCompilerOptions,
} from "./builder";
import { parseMessage } from "@selfage/message/parser";

let BROWSERIFY_MTIME_EXT = ".browserifymtime";

export async function browserify(
  sourceFile: string,
  outputFile: string,
  tsconfigFile: string,
  isDebug: boolean,
  runInNode: boolean,
  environment?: string
): Promise<void> {
  let compilerOptions = await readCompilerOptions(tsconfigFile);
  let exitCode = await buildWithCompilerOptionsAndReturnExitCode(
    sourceFile,
    compilerOptions
  );
  if (exitCode !== 0) {
    process.exitCode = exitCode;
    return;
  }

  let sourceModulePath = stripFileExtension(sourceFile);
  let mtimesFile = sourceModulePath + BROWSERIFY_MTIME_EXT;
  if (compilerOptions.incremental && !(await needsBrowserify(mtimesFile))) {
    return;
  }

  let compiledSourceFile = sourceModulePath + ".js";
  let browserifyHandler = browserifyConstructor(compiledSourceFile, {
    debug: isDebug,
    node: runInNode,
  });
  let involvedFiles: string[] = [];
  browserifyHandler.on("file", (file) => {
    involvedFiles.push(file);
  });
  let bundledCode = await getStream(browserifyHandler.bundle());

  let minifyOptions: UglifyJS.MinifyOptions = {
    compress: {
      global_defs: {
        ENVIRONMENT: environment,
      },
    },
  };
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

  let outputModulePath = stripFileExtension(outputFile);
  await Promise.all([
    fs.promises.writeFile(outputModulePath + ".js", minifiedRes.code),
    writeMtimesFileIfIncremental(
      mtimesFile,
      involvedFiles,
      compilerOptions.incremental
    ),
  ]);
}

async function needsBrowserify(mtimeFile: string): Promise<boolean> {
  let mtimesBuffer: Buffer;
  try {
    mtimesBuffer = await fs.promises.readFile(mtimeFile);
  } catch (e) {
    if (e.code === "ENOENT") {
      return true;
    } else {
      throw e;
    }
  }

  let mtimeList = parseMessage(JSON.parse(mtimesBuffer.toString()), MTIME_LIST);
  let promisesToCheck = mtimeList.mtimes.map(
    async (fileMtime): Promise<boolean> => {
      let fileStats: fs.Stats;
      try {
        fileStats = await fs.promises.stat(fileMtime.fileName);
      } catch (e) {
        return true;
      }
      return fileStats.mtimeMs > fileMtime.mtimeMs;
    }
  );
  return (await Promise.all(promisesToCheck)).some((updated) => updated);
}

async function writeMtimesFileIfIncremental(
  mtimesFile: string,
  involvedFiles: string[],
  incremental?: boolean
): Promise<void> {
  if (!incremental) {
    return;
  }

  let mtimes: Mtime[] = [];
  let promisesToCollectMtimes = involvedFiles.map(
    async (file): Promise<void> => {
      let fileStats = await fs.promises.stat(file);
      mtimes.push({ fileName: file, mtimeMs: fileStats.mtimeMs });
    }
  );
  await Promise.all(promisesToCollectMtimes);

  let mtimeList: MtimeList = { mtimes: mtimes };
  await fs.promises.writeFile(mtimesFile, JSON.stringify(mtimeList));
}
