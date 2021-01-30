# @seflage/cli

## Install

`npm install @selfage/cli`

## Overview

Written in TypeScript and compiled to ES6. Provides an opinionated CLI toolkit for developing frontend and backend in TypeScript. See sections below for each sub-command.

## Build

Please make sure it's run from the directory where your tsconfig.json is defined.

If you specified `incremental: true` in your tsconfig.json, `tsBuildInfoFile` will not be respected and will be overriden by `${filename}.tsbuildinfo`.

Respect merging base tsconfig via `extends`.

```
$ selfage build -h
Usage: selfage build [options] <file>

Build/Compile a single TypeScript source file while respecting compilerOptions in tsconfig.json. The file type can be neglected and is always fixed as '.ts'.

Options:
  -h, --help  display help for command
```

## Clean

```
$ selfage clean -h
Usage: selfage clean [options]

Delete all files generated from building and bundling.

Options:
  -h, --help  display help for command
```

## Run

```
$ selfage run -h
Usage: selfage run [options] <file>

Compile and run the specified file. The file type can be neglected and is always fixed as '.ts'. Pass through arguments to the executable file after --.

Options:
  -h, --help  display help for command
```

## Format

On top of `prettier`, add support to sort imports in a deterministic way but will not keep comments between import statements in place. Please leave comments on top of all import statements.

```
$ selfage format -h
Usage: selfage format|fmt [options] <file>

Format the specified file. The file type is always fixed as '.ts'.

Options:
  --dry-run   Print the formatted content instead of overwriting the file.
  -h, --help  display help for command
```

## Generate descriptors

See `@selfage/message` package for detailed explanation of what's being generated and how to use the generated descriptors.

```
$ selfage generate -h
Usage: selfage generate|gen [options] <file>

Generate various descriptors from the specified source file. The source file type is fixed as '.json' and the destination file type is fixed as '.ts'.

Options:
  --dry-run   Print the generated content instead of writing it to the destination file.
  -h, --help  display help for command
```