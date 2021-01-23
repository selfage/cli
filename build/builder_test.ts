import { readCompilerOptions } from "./builder";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "BuilderTest",
  cases: [
    {
      name: "ReadNestedCompilerOptions",
      execute: () => {
        // Execute
        let options = readCompilerOptions(
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
  ],
});
