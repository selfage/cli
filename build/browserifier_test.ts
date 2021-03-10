import fs = require("fs");
import { browserify } from "./browserifier";
import { assertThat, containStr, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";
import { spawnSync } from "child_process";

function executeSync(jsFile: string): string {
  return spawnSync("node", [jsFile]).output.join("\n");
}

TEST_RUNNER.run({
  name: "BrowserifierTest",
  cases: [
    {
      name: "BrowserifyTwoFilesIncrementally",
      execute: async () => {
        // Execute
        await browserify(
          "./test_data/build/browserify/two_file2.ts",
          "./test_data/build/browserify/two_file2_browserified.js",
          "./test_data/build/browserify/tsconfig_incr.json",
          false,
          true
        );

        // Verify
        assertThat(
          executeSync("./test_data/build/browserify/two_file2_browserified.js"),
          containStr("31"),
          "output"
        );

        // Prepare
        let browserifiedMtime = fs.statSync(
          "./test_data/build/browserify/two_file2_browserified.js"
        ).mtimeMs;

        // Execute
        await browserify(
          "./test_data/build/browserify/two_file2.ts",
          "./test_data/build/browserify/two_file2_browserified.js",
          "./test_data/build/browserify/tsconfig_incr.json",
          false,
          true
        );

        // Verify
        assertThat(
          fs.statSync("./test_data/build/browserify/two_file2_browserified.js")
            .mtimeMs,
          eq(browserifiedMtime),
          "second browserified file mtime"
        );

        // Cleanup
        await Promise.all([
          fs.promises.unlink("./test_data/build/browserify/two_file.js"),
          fs.promises.unlink("./test_data/build/browserify/two_file2.js"),
          fs.promises.unlink(
            "./test_data/build/browserify/two_file2.tsbuildinfo"
          ),
          fs.promises.unlink(
            "./test_data/build/browserify/two_file2.browserifymtime"
          ),
          fs.promises.unlink(
            "./test_data/build/browserify/two_file2_browserified.js"
          ),
        ]);
      },
    },
    {
      name: "StackTraceShouldPointToTsFile",
      execute: async () => {
        // Execute
        await browserify(
          "./test_data/build/browserify/stack_trace.ts",
          "./test_data/build/browserify/stack_trace_browserified.js",
          "./test_data/build/browserify/tsconfig.json",
          true,
          true
        );

        // Verify
        assertThat(
          executeSync(
            "./test_data/build/browserify/stack_trace_browserified.js"
          ),
          containStr("test_data/build/browserify/stack_trace.ts"),
          "output"
        );

        // Cleanup
        await Promise.all([
          fs.promises.unlink("./test_data/build/browserify/stack_trace.js"),
          fs.promises.unlink(
            "./test_data/build/browserify/stack_trace_browserified.js"
          ),
        ]);
      },
    },
    {
      name: "OnlyExecuteCodeUnderUndefinedEnvironment",
      execute: async () => {
        // Execute
        await browserify(
          "./test_data/build/browserify/try_environment.ts",
          "./test_data/build/browserify/try_environment_browserified.js",
          "./test_data/build/browserify/tsconfig.json",
          false,
          true
        );

        // Verify
        assertThat(
          executeSync(
            "./test_data/build/browserify/try_environment_browserified.js"
          ),
          containStr("Something else"),
          "output"
        );

        // Cleanup
        await Promise.all([
          fs.promises.unlink("./test_data/build/browserify/try_environment.js"),
          fs.promises.unlink(
            "./test_data/build/browserify/try_environment_browserified.js"
          ),
        ]);
      },
    },
    {
      name: "OnlyExecuteCodeUnderProdEnvironment",
      execute: async () => {
        // Execute
        await browserify(
          "./test_data/build/browserify/try_environment.ts",
          "./test_data/build/browserify/try_environment_browserified.js",
          "./test_data/build/browserify/tsconfig.json",
          false,
          true,
          "PROD"
        );

        // Verify
        assertThat(
          executeSync(
            "./test_data/build/browserify/try_environment_browserified.js"
          ),
          containStr("Prod!"),
          "output"
        );

        // Cleanup
        await Promise.all([
          fs.promises.unlink("./test_data/build/browserify/try_environment.js"),
          fs.promises.unlink(
            "./test_data/build/browserify/try_environment_browserified.js"
          ),
        ]);
      },
    },
  ],
});
