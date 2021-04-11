import fs = require("fs");
import path = require("path");
import stream = require("stream");
import util = require("util");
import zlib = require("zlib");
import { stripFileExtension } from "../io_helper";
import { browserify } from "./browserifier";
import { parseMessage } from "@selfage/message/parser";
import { WEB_PAGE_MAPPING } from "@selfage/web_page_mapping";
let pipeline = util.promisify(stream.pipeline);

export let WEB_PAGE_MAPPING_CONFIG = "web_page_mapping_config.json";

export async function buildWebPages(
  rootDir: string,
  tsconfigFile: string,
  environmentFile?: string,
  isDebug?: boolean
): Promise<void> {
  let configJsonString = (
    await fs.promises.readFile(path.join(rootDir, WEB_PAGE_MAPPING_CONFIG))
  ).toString();
  let config = parseMessage(JSON.parse(configJsonString), WEB_PAGE_MAPPING);

  let promisesToBuild = new Array<Promise<void>>();
  for (let pathToTs of config.pathsToTs) {
    promisesToBuild.push(
      browserifyAndGzip(
        rootDir,
        pathToTs.ts,
        pathToTs.js,
        tsconfigFile,
        environmentFile,
        isDebug
      ),
      writeHtmlFileAndGZip(
        pathToTs.path,
        rootDir,
        pathToTs.js,
        config.sourceMapSupport.path
      )
    );
  }
  promisesToBuild.push(
    browserifyAndGzip(
      rootDir,
      config.notFoundTs.ts,
      config.notFoundTs.js,
      tsconfigFile,
      environmentFile,
      isDebug
    ),
    writeHtmlFileAndGZip(
      config.notFoundTs.path,
      rootDir,
      config.notFoundTs.js,
      config.sourceMapSupport.path
    )
  );
  promisesToBuild.push(gzipFile(rootDir, config.sourceMapSupport.js, ".js"));
  await Promise.all(promisesToBuild);
}

async function browserifyAndGzip(
  rootDir: string,
  tsFile: string,
  jsFile: string,
  tsconfigFile: string,
  environmentFile?: string,
  isDebug?: boolean
): Promise<void> {
  await browserify(
    path.join(rootDir, tsFile),
    path.join(rootDir, jsFile),
    tsconfigFile,
    false,
    environmentFile,
    isDebug
  );
  return gzipFile(rootDir, jsFile, ".js");
}

async function writeHtmlFileAndGZip(
  tsUrlPath: string,
  rootDir: string,
  jsFile: string,
  sourceMapSupportPath: string
): Promise<void> {
  await fs.promises.writeFile(
    path.join(rootDir, jsFile) + ".html",
    `<!DOCTYPE html>
<html>
  <head><meta charset="UTF-8"></head>
  <body>
    <script type="text/javascript" src="${sourceMapSupportPath}.js"></script>
    <script type="text/javascript">sourceMapSupport.install();</script>
    <script type="text/javascript" src="${tsUrlPath}.js"></script>
  </body>
</html>`
  );
  return gzipFile(rootDir, jsFile, ".html");
}

async function gzipFile(
  rootDir: string,
  file: string,
  ext: string
): Promise<void> {
  let modulePath = stripFileExtension(path.join(rootDir, file));
  return pipeline(
    fs.createReadStream(modulePath + ext),
    zlib.createGzip({ level: 9 }),
    fs.createWriteStream(modulePath + ext + ".gz")
  );
}
