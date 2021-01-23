import { findFiles } from "./cleaner";
import { assertThat, eq, eqArray } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "CleanerTest",
  cases: [
    {
      name: "FindFilesIncludingNested",
      execute: async () => {
        // Execute
        let files = await findFiles("./test_data/build/cleaner");

        // Verify
        assertThat(
          files,
          eqArray([
            eq("test_data/build/cleaner/random.d.ts"),
            eq("test_data/build/cleaner/random.js"),
            eq("test_data/build/cleaner/ts.tsbuildinfo"),
            eq("test_data/build/cleaner/inside/random.d.ts"),
            eq("test_data/build/cleaner/inside/random.js"),
          ]),
          "files"
        );
      },
    },
  ],
});
