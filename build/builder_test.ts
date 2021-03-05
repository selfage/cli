import fs = require("fs");
import { build, readCompilerOptions } from "./builder";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "BuilderTest",
  cases: [
    {
      name: "ReadNestedCompilerOptions",
      execute: async () => {
        // Execute
        let options = await readCompilerOptions(
          "./test_data/build/builder/tsconfig.json"
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
      name: "Build",
      execute: async () => {
        // Execute
        let built = await build(
          "./test_data/build/builder/example.ts",
          "./test_data/build/builder/tsconfig.json"
        );

        // Verify
        assertThat(built, eq(true), "built");
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
