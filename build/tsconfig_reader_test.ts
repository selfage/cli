import { TSCONFIG_READER } from "./tsconfig_reader";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "BuilderTest",
  cases: [
    {
      name: "ReadNestedCompilerOptions",
      execute: async () => {
        // Execute
        let options = await TSCONFIG_READER.readCompilerOptions(
          "./test_data/build/tsconfig_reader/tsconfig.json"
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
