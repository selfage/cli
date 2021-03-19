import fs = require("fs");
import { compileAndReturnExitCode } from "./compiler";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "BuilderTest",
  cases: [
    {
      name: "BuildAndReturnExitCode",
      execute: async () => {
        // Execute
        let exitCode = await compileAndReturnExitCode(
          "./test_data/build/builder/example.ts",
          "./test_data/build/builder/tsconfig.json"
        );

        // Verify
        assertThat(exitCode, eq(0), "exit code");
        assertThat(
          fs.existsSync("./test_data/build/builder/example.js"),
          eq(true),
          "js file exists"
        );

        // Cleanup
        fs.promises.unlink("./test_data/build/builder/example.js");
      },
    },
  ],
});
