#!/usr/bin/env node
import { browserify } from "./build/browserifier";
import { clean } from "./build/cleaner";
import { compile } from "./build/compiler";
import { run } from "./build/runner";
import { format } from "./formatter";
import { generate } from "./generate/generator";
import { Command } from "commander";
import "source-map-support/register";

let TSCONFIG_FILE = "./tsconfig.json";
let EXPLAIN_FILE_TYPE = `The file type can be neglected and is always fixed as '.ts'.`;

async function main(): Promise<void> {
  let program = new Command();
  program
    .command("compile <file>")
    .alias("cpl")
    .description(
      `Compile a single TypeScript source file while respecting ` +
        `compilerOptions in tsconfig.json. ` +
        EXPLAIN_FILE_TYPE
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
        EXPLAIN_FILE_TYPE +
        ` Pass through arguments to the executable file after --.`
    )
    .action((file, options, extraArgs) => run(file, TSCONFIG_FILE, extraArgs));
  program
    .command("browserifyForNode <sourceFile> <outputFile>")
    .alias("brn")
    .description(
      `Compile a single TypeScript source file and browserify & uglify all ` +
        `its imported files into a bundle that can be run in Node ` +
        `environment. Output file type is fixed as .js.`
    )
    .option(
      "-e, --environment-file <environmentFile>",
      `An extra TypeScript file to be browserified & uglified together with ` +
        `the soure file. Typically such file contains global variables for a ` +
        `particular environment such as PROD or DEV, and it's not imported ` +
        `by the source file but assumed to be present at runtime.`
    )
    .option("--debug", "Include inline source map and inline source.")
    .action((sourceFile, outputFile, options) =>
      browserify(
        sourceFile,
        outputFile,
        TSCONFIG_FILE,
        true,
        options.environmentFile,
        options.debug
      )
    );
  program
    .command("browserifyForBrowser <sourceFile> <outputFile>")
    .alias("brb")
    .description(
      `Compile a single TypeScript source file and browserify & uglify all ` +
        `its imported files into a bundle that can be run in browsers. ` +
        `Output file type is fixed as .js.`
    )
    .option(
      "-e, --environment-file <environmentFile>",
      `An extra TypeScript file to be browserified & uglified together with ` +
        `the soure file. Typically such file contains global variables for a ` +
        `particular environment such as PROD or DEV, and it's not imported ` +
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
    .command("format <file>")
    .alias("fmt")
    .description(`Format the specified file. ` + EXPLAIN_FILE_TYPE)
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
        `source file type is fixed as '.json' and the destination file type ` +
        `is fixed as '.ts'.`
    )
    .option(
      "-i, --index-file <indexFile>",
      `The index yaml file for Google Cloud Datastore composite index. The ` +
        `file type is fixed as '.yaml'. Requried only if your source file ` +
        `includes a datastore definition.`
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
