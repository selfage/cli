import fs = require("fs");
import { compileAndReturnExitCode, readCompilerOptions } from "./compiler";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "CompilerTest",
  cases: [
    {
      name: "ReadNestedCompilerOptions",
      execute: async () => {
        // Execute
        let options = await readCompilerOptions(
          "./test_data/build/compiler/tsconfig.json"
        );

        // Verify
        assertThat(options.target, eq("ES6"), "target");
        assertThat(options.strict, eq(true), "strict");
        assertThat(options.alwaysStrict, eq(true), "alwaysStrict");
        assertThat(options.noImplicitAny, eq(true), "noImplicitAny");
        assertThat(options.noImplicitThis, eq(false), "noImplicitThis");
      },
    },
    {
      name: "BuildAndReturnExitCode",
      execute: async () => {
        // Execute
        let exitCode = await compileAndReturnExitCode(
          "./test_data/build/compiler/example.ts",
          "./test_data/build/compiler/tsconfig_another.json"
        );

        // Verify
        assertThat(exitCode, eq(0), "exit code");
        assertThat(
          fs.existsSync("./test_data/build/compiler/example.js"),
          eq(true),
          "js file exists"
        );

        // Cleanup
        fs.promises.unlink("./test_data/build/compiler/example.js");
      },
    },
  ],
});
