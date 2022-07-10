import fs = require("fs");
import { cleanDir } from "./cleaner";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "CleanerTest",
  cases: [
    {
      name: "FindFilesIncludingNested",
      execute: async () => {
        // Prepare
        let randomDTs = fs.readFileSync("test_data/build/cleaner/random.d.ts");
        let randomJs = fs.readFileSync("test_data/build/cleaner/random.js");
        let tsbuildinfo = fs.readFileSync(
          "test_data/build/cleaner/ts.tsbuildinfo"
        );
        let insideRandomDTs = fs.readFileSync(
          "test_data/build/cleaner/inside/random.d.ts"
        );
        let insideRandomJs = fs.readFileSync(
          "test_data/build/cleaner/inside/random.js"
        );

        // Execute
        await cleanDir("./test_data/build/cleaner");

        // Verify
        assertThat(
          fs.existsSync("test_data/build/cleaner/random.d.ts"),
          eq(false),
          "random.d.ts not exists"
        );
        assertThat(
          fs.existsSync("test_data/build/cleaner/random.js"),
          eq(false),
          "random.js not exists"
        );
        assertThat(
          fs.existsSync("test_data/build/cleaner/ts.tsbuildinfo"),
          eq(false),
          "ts.tsbuildinfo not exists"
        );
        assertThat(
          fs.existsSync("test_data/build/cleaner/inside/random.d.ts"),
          eq(false),
          "inside/random.d.ts not exists"
        );
        assertThat(
          fs.existsSync("test_data/build/cleaner/inside/random.js"),
          eq(false),
          "inside/random.js not exists"
        );
        assertThat(
          fs.existsSync("test_data/build/cleaner/random.ts"),
          eq(true),
          "random.ts exists"
        );
        assertThat(
          fs.existsSync("test_data/build/cleaner/inside/random.ts"),
          eq(true),
          "inside/random.ts exists"
        );
        assertThat(
          fs.existsSync("test_data/build/cleaner/node_modules/lib.js"),
          eq(true),
          "lib.js exists"
        );
        assertThat(
          fs.existsSync("test_data/build/cleaner/inside/node_modules/lib.js"),
          eq(true),
          "inside/lib.js exists"
        );

        // Cleanup
        await Promise.all([
          fs.promises.writeFile(
            "test_data/build/cleaner/random.d.ts",
            randomDTs
          ),
          fs.promises.writeFile("test_data/build/cleaner/random.js", randomJs),
          fs.promises.writeFile(
            "test_data/build/cleaner/ts.tsbuildinfo",
            tsbuildinfo
          ),
          fs.promises.writeFile(
            "test_data/build/cleaner/inside/random.d.ts",
            insideRandomDTs
          ),
          fs.promises.writeFile(
            "test_data/build/cleaner/inside/random.js",
            insideRandomJs
          ),
        ]);
      },
    },
  ],
});
