#!/usr/bin/env node
import packageConfig from "./package.json";
import { clean } from "./build/cleaner";
import { compile } from "./build/compiler";
import { run } from "./build/runner";
import { format } from "./formatter";
import { generate } from "./generate/generator";
import { Command } from "commander";
import "source-map-support/register";

let TSCONFIG_FILE = "./tsconfig.json";
let FIXED_FILE_EXT = ` can be neglected and is always fixed as `;

async function main(): Promise<void> {
  let program = new Command();
  program.version(packageConfig.version);
  program
    .command("compile <file>")
    .alias("cpl")
    .description(
      `Compile a single TypeScript source file while respecting ` +
        `compilerOptions in tsconfig.json. Its file ext` +
        FIXED_FILE_EXT +
        `.ts.`
    )
    .option(
      "-s, --supplementary-files <files...>",
      `Supplementary files to be compiled together with the source file.`
    )
    .action((file, options) =>
      compile(file, TSCONFIG_FILE, ...options.supplementaryFiles)
    );
  program
    .command("clean")
    .description("Delete all files generated from building and bundling.")
    .action(() => clean());
  program
    .command("run <file>")
    .description(
      `Compile and run the specified file under Node environment. Its file ` +
        `ext` +
        FIXED_FILE_EXT +
        `.ts.` +
        ` Pass through arguments to the executable file after --.`
    )
    .action((file, options, extraArgs) => run(file, TSCONFIG_FILE, extraArgs));
  program
    .command("format <file>")
    .alias("fmt")
    .description(
      `Format the specified file. Its file ext` + FIXED_FILE_EXT + ".ts."
    )
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
        `source file ext` +
        FIXED_FILE_EXT +
        `.json. The generated file will be <file>.ts.`
    )
    .option(
      "-i, --index-file <indexFile>",
      `The index yaml file for Google Cloud Datastore composite index. Its ` +
        `file ext` +
        FIXED_FILE_EXT +
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
