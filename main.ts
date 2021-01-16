#!/usr/bin/env node
import { build } from "./build/builder";
import { clean } from "./build/cleaner";
import { run } from "./build/runner";
import { format } from "./formatter";
import { Command } from "commander";
import "source-map-support/register";

let EXPLAIN_FILE_TYPE = `The file type can be neglected and is always fixed as '.ts'.`;

async function main(): Promise<void> {
  let program = new Command();
  program
    .command("build <file>")
    .description(
      `Build/Compile a single TypeScript source file. ` + EXPLAIN_FILE_TYPE
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
    .description(
      `Format the specified file. The file type is always fixed as '.ts'.`
    )
    .option(
      "--dry-run",
      "Print the formatted content instead of overwriting the file."
    )
    .action((file, options) => format(file, options.dryRun));
  await program.parseAsync();
}

main();
