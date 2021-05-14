#!/usr/bin/env node
import packageConfig from "./package.json";
import { clean } from "./build/cleaner";
import { compile } from "./build/compiler";
import { run } from "./build/runner";
import { format } from "./formatter";
import { generate } from "./generate/generator";
import { Command } from "commander";
import "source-map-support/register";

let FIXED_FILE_EXT = ` can be neglected and is always fixed as `;
let TSCONFIG_FILE_OPTION = [
  "-c, --tsconfig-file <file>",
  `The file path to tsconfig.json. If not provided, it will try to look for ` +
    `it at the current working directory.`,
];

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
    .option(TSCONFIG_FILE_OPTION[0], TSCONFIG_FILE_OPTION[1])
    .option(
      "-s, --supplementary-files <files...>",
      `Supplementary files to be compiled together with the source file.`
    )
    .action((file, options) =>
      compile(file, options.tsconfigFile, options.supplementaryFiles)
    );
  program
    .command("clean")
    .description("Clean all ignored files by .gitignore, except node_modules/.")
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
    .option(TSCONFIG_FILE_OPTION[0], TSCONFIG_FILE_OPTION[1])
    .action((file, options, extraArgs) =>
      run(file, options.tsconfigFile, extraArgs)
    );
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
