import fs = require("fs");
import { browserify } from "./browserifier";
import { assertThat, containStr } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";
import { spawnSync } from "child_process";

// TODO: Add browser test once puppeteer_runner is ready.

function executeSync(jsFile: string): string {
  return spawnSync("node", [jsFile]).output.join("\n");
}

TEST_RUNNER.run({
  name: "BrowserifierTest",
  cases: [
    {
      name: "SimpleBrowserify",
      execute: async () => {
        // Execute
        await browserify(
          "./test_data/build/browserify/two_file2.ts",
          "./test_data/build/browserify/two_file2_browserified.js",
          "./test_data/build/browserify/tsconfig.json",
          true
        );

        // Verify
        assertThat(
          executeSync("./test_data/build/browserify/two_file2_browserified.js"),
          containStr("31"),
          "output"
        );

        // Cleanup
        await Promise.all([
          fs.promises.unlink("./test_data/build/browserify/two_file.js"),
          fs.promises.unlink("./test_data/build/browserify/two_file2.js"),
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
          undefined,
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
      name: "OnlyExecuteCodeUnderDevEnvironment",
      execute: async () => {
        // Execute
        await browserify(
          "./test_data/build/browserify/try_environment.ts",
          "./test_data/build/browserify/try_environment_browserified.js",
          "./test_data/build/browserify/tsconfig.json",
          true,
          "./test_data/build/browserify/environment_dev.ts"
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
          fs.promises.unlink("./test_data/build/browserify/environment_dev.js"),
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
          true,
          "./test_data/build/browserify/environment_prod.ts"
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
            "./test_data/build/browserify/environment_prod.js"
          ),
          fs.promises.unlink(
            "./test_data/build/browserify/try_environment_browserified.js"
          ),
        ]);
      },
    },
  ],
});
