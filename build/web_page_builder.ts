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
      browserify(
        path.join(rootDir, pathToTs.ts),
        path.join(rootDir, pathToTs.js),
        tsconfigFile,
        false,
        environmentFile,
        isDebug
      ),
      writeHtmlFile(
        pathToTs.path,
        rootDir,
        pathToTs.js,
        config.sourceMapSupport.path
      )
    );
  }
  promisesToBuild.push(
    browserify(
      path.join(rootDir, config.notFoundTs.ts),
      path.join(rootDir, config.notFoundTs.js),
      tsconfigFile,
      false,
      environmentFile,
      isDebug
    ),
    writeHtmlFile(
      config.notFoundTs.path,
      rootDir,
      config.notFoundTs.js,
      config.sourceMapSupport.path
    )
  );
  await Promise.all(promisesToBuild);

  let promisesToGzip = new Array<Promise<void>>();
  for (let pathToTs of config.pathsToTs) {
    promisesToGzip.push(
      gzipFile(rootDir, pathToTs.js, ".js"),
      gzipFile(rootDir, pathToTs.js, ".html")
    );
  }
  promisesToGzip.push(
    gzipFile(rootDir, config.notFoundTs.js, ".js"),
    gzipFile(rootDir, config.notFoundTs.js, ".html")
  );
  promisesToGzip.push(gzipFile(rootDir, config.sourceMapSupport.js, ".js"));
  await Promise.all(promisesToGzip);
}

async function writeHtmlFile(
  tsUrlPath: string,
  rootDir: string,
  jsFile: string,
  sourceMapSupportPath: string
): Promise<void> {
  return fs.promises.writeFile(path.join(rootDir, jsFile) + ".html",
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
