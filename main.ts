#!/usr/bin/env node
import packageConfig from "./package.json";
import { browserify } from "./build/browserifier";
import { clean } from "./build/cleaner";
import { compile } from "./build/compiler";
import { run } from "./build/runner";
import {
  WEB_PAGE_MAPPING_CONFIG,
  buildWebPages,
} from "./build/web_page_builder";
import { format } from "./formatter";
import { generate } from "./generate/generator";
import { Command } from "commander";
import "source-map-support/register";

let TSCONFIG_FILE = "./tsconfig.json";
let FIX_FILE_EXT = `The file ext can be neglected and is always fixed as `;

async function main(): Promise<void> {
  let program = new Command();
  program.version(packageConfig.version);
  program
    .command("compile <file>")
    .alias("cpl")
    .description(
      `Compile a single TypeScript source file while respecting ` +
        `compilerOptions in tsconfig.json. ` +
        FIX_FILE_EXT +
        `.ts.`
    )
    .action((file) => compile(file, TSCONFIG_FILE));
  program
    .command("clean")
    .description("Delete all files generated from building and bundling.")
    .action(() => clean());
  program
    .command("run <file>")
    .description(
      `Compile and run the specified file. ` +
        FIX_FILE_EXT +
        `.ts.` +
        ` Pass through arguments to the executable file after --.`
    )
    .action((file, options, extraArgs) => run(file, TSCONFIG_FILE, extraArgs));
  program
    .command("browserifyForNode <sourceFile> <outputFile>")
    .alias("brn")
    .description(
      `Compile a single source file and browserify & uglify all its imported ` +
        `files into a bundle that can be run in browsers. Both file exts can ` +
        `be neglected and are always fixed as .ts and .js respectively.`
    )
    .option(
      "-e, --environment-file <environmentFile>",
      `An extra TypeScript file to be browserified & uglified together with ` +
        `the source file. Typically such file contains global variables for ` +
        `a particular environment such as PROD or DEV, and it's not imported ` +
        `by the source file but assumed to be present at runtime.`
    )
    .option("--debug", "Include inline source map and inline source.")
    .action((sourceFile, options) =>
      browserify(
        sourceFile,
        options.outputFile,
        TSCONFIG_FILE,
        true,
        options.environmentFile,
        options.debug
      )
    );
  program
    .command("browserifyForBrowser <sourceFile>")
    .alias("brb")
    .description(
      `Compile a single source file and browserify & uglify all its imported ` +
        `files into a bundle that can be run in browsers. Both file exts can ` +
        `be neglected and are always fixed as .ts and .js respectively.`
    )
    .option(
      "-e, --environment-file <environmentFile>",
      `An extra TypeScript file to be browserified & uglified together with ` +
        `the source file. Typically such file contains global variables for ` +
        `a particular environment such as PROD or DEV, and it's not imported ` +
        `by the source file but assumed to be present at runtime.`
    )
    .option("--debug", "Include inline source map and inline source.")
    .action((sourceFile, outputFile, options) =>
      browserify(
        sourceFile,
        outputFile,
        TSCONFIG_FILE,
        false,
        options.environmentFile,
        options.debug
      )
    );
  program
    .command("buildWebPages <rootDir>")
    .alias("bwp")
    .description(
      `Compile, browserify, and uglify TypeScript files into JavaScript and ` +
        `HTML files, based on <rootDir>/${WEB_PAGE_MAPPING_CONFIG}.`
    )
    .option(
      "-e, --environment-file <environmentFile>",
      `An extra TypeScript file to be browserified & uglified together with ` +
        `the source file. Typically such file contains global variables for ` +
        `a particular environment such as PROD or DEV, and it's not imported ` +
        `by the source file but assumed to be present at runtime.`
    )
    .option("--debug", "Include inline source map and inline source.")
    .action((rootDir, options) =>
      buildWebPages(
        rootDir,
        TSCONFIG_FILE,
        options.environmentFile,
        options.debug
      )
    );
  program
    .command("format <file>")
    .alias("fmt")
    .description(`Format the specified file. ` + FIX_FILE_EXT + ".ts.")
    .option(
      "--dry-run",
      "Print the formatted content instead of overwriting the file."
    )
    .action((file, options) => format(file, options.dryRun));
  program
    .command("generate <file>")
    .alias("gen")
    .description(
      `Generate various descriptors from the specified source file. The ` +
        `source file ext is fixed as .json and the destination file ext is ` +
        `fixed as .ts.`
    )
    .option(
      "-i, --index-file <indexFile>",
      `The index yaml file for Google Cloud Datastore composite index. ` +
        FIX_FILE_EXT +
        `.yaml. Requried only if your definition file includes a datastore ` +
        `definition.`
    )
    .option(
      "--dry-run",
      "Print the generated content instead of writing it to the destination " +
        "file."
    )
    .action((file, options) =>
      generate(file, options.indexFile, options.dryRun)
    );
  await program.parseAsync();
}

main();
