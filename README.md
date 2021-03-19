# @seflage/cli

## Install

`npm install @selfage/cli`

## Overview

Written in TypeScript and compiled to ES6 with inline source map & source. See [@selfage/tsconfig](https://www.npmjs.com/package/@selfage/tsconfig) for full compiler options. Provides an opinionated CLI toolkit for developing frontend and backend in TypeScript. See sections below for each sub-command.

## Compile

Please make sure it's run from the directory where your tsconfig.json is defined.

If you specified `incremental: true` in your tsconfig.json, `tsBuildInfoFile` will not be respected and will be overriden by `${filename}.tsbuildinfo`.

Respect merging base tsconfig via `extends`.

```
$ selfage compile -h
Usage: selfage compile|cpl [options] <file>

Compile a single TypeScript source file while respecting compilerOptions in tsconfig.json. The file type can be neglected and is always fixed as '.ts'.

Options:
  -h, --help  display help for command
```

## Clean

Currently, only files under directory `node_modules/` and `test_data/` will be ignored.

```
$ selfage clean -h
Usage: selfage clean [options]

Delete all files generated from building and bundling.

Options:
  -h, --help  display help for command
```

## Browserify

There are three variants to browserify, to be run in Node or browser environment as JS or HTML, based on `browserify` and `uglify-js`.

```
$ selfage brn -h
Usage: selfage browserifyForNodeJs|brn [options] <sourceFile> <outputFile>

Compile a single TypeScript source file and browserify & uglify all its imported files into a bundle that can be run in Node environment. Output file type is fixed as .js.

Options:
  --debug     Include inline source map and inline source.
  -h, --help  display help for command
```

```
$ selfage brb -h
Usage: selfage browserifyForBrowser|brb [options] <sourceFile> <outputFile>

Compile a single TypeScript source file and browserify & uglify all its imported files into a bundle that can be run in browsers. Output file type is fixed as .js.

Options:
  --debug     Include inline source map and inline source.
  -h, --help  display help for command
```

```
$ selfage brh -h
Usage: selfage browserifyToHtml|brh [options] <sourceFile> <outputFile>

Compile a single TypeScript source file, browserify & uglify all its imported files into a bundle and embed it into an empty HTML inside a <script> tag of the body. Output file type is fixed as .html.

Options:
  --debug     Include inline source map and inline source.
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

See `@selfage/message`, `@selfage/datastore_client` and `@selfage/service_descriptor` packages for detailed explanation of various generated descritpors.

```
$ selfage generate -h
Usage: selfage generate|gen [options] <file>

Generate various descriptors from the specified source file. The source file type is fixed as '.json' and the destination file type is fixed as '.ts'.

Options:
  -i, --index-file <indexFile>  The index yaml file for Google Cloud Datastore composite index. The file type is fixed as
                                '.yaml'. Requried only if your source file includes a datastore definition.
  --dry-run                     Print the generated content instead of writing it to the destination file.
  -h, --help                    display help for command
```
