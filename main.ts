#!/usr/bin/env node
import fs = require("fs");
import path = require("path");
import { clean } from "./build/cleaner";
import { compile } from "./build/compiler";
import { format } from "./formatter";
import { lintL10n } from "./l10n_linter";
import { runForever } from "./run/forever_runner";
import { run } from "./run/runner";
import { Command } from "commander";
import "source-map-support/register";

let FIXED_FILE_EXT = ` can be neglected and is always fixed as `;
let TSCONFIG_FILE_OPTION = [
  "-c, --tsconfig-file <file>",
  `The file path to tsconfig.json. If not provided, it will try to look for ` +
    `it at the current working directory.`,
];

async function main(): Promise<void> {
  let packageConfig = JSON.parse(
    (
      await fs.promises.readFile(path.join(__dirname, "package.json"))
    ).toString()
  );
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
      "-s, --extra-files <files...>",
      `Extra files to be compiled together with and before the source file.`
    )
    .action((file, options) =>
      compile(file, options.tsconfigFile, options.extraFiles)
    );
  program
    .command("clean")
    .description("Clean all ignored files by .gitignore, except node_modules/.")
    .action(() => clean());
  program
    .command("run <file> [pass-through-args...]")
    .description(
      `Compile and run the specified file under Node environment. Its file ` +
        `ext` +
        FIXED_FILE_EXT +
        `.ts. "--" is needed in between <file> and pass through arguments.`
    )
    .option(TSCONFIG_FILE_OPTION[0], TSCONFIG_FILE_OPTION[1])
    .action((file, passThroughArgs, options) =>
      run(file, options.tsconfigFile, passThroughArgs)
    );
  program
    .command("runForever <file> [pass-through-args...]")
    .alias("frun")
    .description(
      `Run the already compiled file under Node environment while auto ` +
        `restart when it crashes/ends. Its file ext` +
        FIXED_FILE_EXT +
        `.js. "--" is needed in between <file> and pass through arguments.`
    )
    .action((file, passThroughArgs) => runForever(file, passThroughArgs));
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
    .command("lintL10n <baseDir>")
    .alias("lln")
    .description(
      `Checks localization pattern compliance, and missing, duplicated or redundant keys.`
    )
    .action((baseDir) => lintL10n(baseDir));
  await program.parseAsync();
}

main();
