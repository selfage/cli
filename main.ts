#!/usr/bin/env node
import { build } from "./build/builder";
import { clean } from "./build/cleaner";
import { run } from "./build/runner";
import { format } from "./formatter";
import { generate } from "./generate/generator";
import { Command } from "commander";
import "source-map-support/register";

let EXPLAIN_FILE_TYPE = `The file type can be neglected and is always fixed as '.ts'.`;

async function main(): Promise<void> {
  let program = new Command();
  program
    .command("build <file>")
    .description(
      `Build/Compile a single TypeScript source file while respecting ` +
        `compilerOptions in tsconfig.json. ` +
        EXPLAIN_FILE_TYPE
    )
    .action((file) => {
      build(file);
    });
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
    .action((file, options, extraArgs) => run(file, extraArgs));
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
      generate(file, options.dryRun, options.indexFile)
    );
  await program.parseAsync();
}

main();
