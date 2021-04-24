import fs = require("fs");
import { compile, readCompilerOptions } from "./compiler";
import { assertReject, assertThat, eq, eqError } from "@selfage/test_matcher";
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
      name: "BuildWithError",
      execute: async () => {
        // Execute & Verify
        let error = await assertReject(
          compile(
            "./test_data/build/compiler/error_example.ts",
            "./test_data/build/compiler/tsconfig_another.json"
          )
        );

        // Verify
        assertThat(error, eqError(new Error("with non-zero code")), "error");
        assertThat(
          fs.existsSync("./test_data/build/compiler/error_example.js"),
          eq(true),
          "js file exists"
        );

        // Cleanup
        await fs.promises.unlink("./test_data/build/compiler/error_example.js");
      },
    },
    {
      name: "BuildWithoutError",
      execute: async () => {
        // Execute & Verify
        await compile(
          "./test_data/build/compiler/example.ts",
          "./test_data/build/compiler/tsconfig_another.json"
        );

        // Verify
        assertThat(
          fs.existsSync("./test_data/build/compiler/example.js"),
          eq(true),
          "js file exists"
        );

        // Cleanup
        await fs.promises.unlink("./test_data/build/compiler/example.js");
      },
    },
    {
      name: "BuildWithSupplementary",
      execute: async () => {
        // Execute & Verify
        await compile(
          "./test_data/build/compiler/example.ts",
          "./test_data/build/compiler/tsconfig_another.json",
          ["./test_data/build/compiler/sup_example.ts"]
        );

        // Verify
        assertThat(
          fs.existsSync("./test_data/build/compiler/example.js"),
          eq(true),
          "js file exists"
        );
        assertThat(
          fs.existsSync("./test_data/build/compiler/sup_example.js"),
          eq(true),
          "supplementary js file exists"
        );

        // Cleanup
        await Promise.all([
          fs.promises.unlink("./test_data/build/compiler/example.js"),
          fs.promises.unlink("./test_data/build/compiler/sup_example.js"),
        ]);
      },
    },
  ],
});
