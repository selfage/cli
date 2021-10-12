import fs = require("fs");
import { generate } from "./generator";
import { NODE_TEST_RUNNER, TestCase } from "@selfage/test_runner";
import { spawnSync } from "child_process";

function assertCompile(file: string): void {
  let compilingRes = spawnSync(
    "npx",
    ["tsc", "--noImplicitAny", "--moduleResolution", "node", "-t", "ES6", file],
    {
      stdio: "inherit",
    }
  );
  if (compilingRes.status !== 0) {
    throw new Error(`Failed to compile ${file}.`);
  }
}

async function unlinkSilently(path: string): Promise<void> {
  try {
    await fs.promises.unlink(path);
  } catch (e) {
    // Swallow errors.
  }
}

NODE_TEST_RUNNER.run({
  name: "GeneratorTest",
  cases: [
    {
      name: "GenerateMessage",
      execute: async () => {
        // Execute
        generate("./test_data/generate/generator/inside/credit_card");

        // Verify
        assertCompile("./test_data/generate/generator/inside/credit_card.ts");

        // Execute
        generate("./test_data/generate/generator/user_info");

        // Verify
        assertCompile("./test_data/generate/generator/user_info.ts");

        // Execute
        generate("./test_data/generate/generator/user");

        // Verify
        assertCompile("./test_data/generate/generator/user.ts");
      },
      tearDown: async () => {
        await Promise.all([
          unlinkSilently(
            "./test_data/generate/generator/inside/credit_card.ts"
          ),
          unlinkSilently(
            "./test_data/generate/generator/inside/credit_card.js"
          ),
          unlinkSilently("./test_data/generate/generator/user_info.ts"),
          unlinkSilently("./test_data/generate/generator/user_info.js"),
          unlinkSilently("./test_data/generate/generator/user.ts"),
          unlinkSilently("./test_data/generate/generator/user.js"),
        ]);
      },
    },
    {
      name: "GenerateObservable",
      execute: async () => {
        // Execute
        generate("./test_data/generate/generator/inside/money");

        // Verify
        assertCompile("./test_data/generate/generator/inside/money.ts");

        // Execute
        generate("./test_data/generate/generator/item");

        // Verify
        assertCompile("./test_data/generate/generator/item.ts");

        // Execute
        generate("./test_data/generate/generator/cart");

        // Verify
        assertCompile("./test_data/generate/generator/cart.ts");
      },
      tearDown: async () => {
        await Promise.all([
          unlinkSilently("./test_data/generate/generator/inside/money.ts"),
          unlinkSilently("./test_data/generate/generator/inside/money.js"),
          unlinkSilently("./test_data/generate/generator/item.ts"),
          unlinkSilently("./test_data/generate/generator/item.js"),
          unlinkSilently("./test_data/generate/generator/cart.ts"),
          unlinkSilently("./test_data/generate/generator/cart.js"),
        ]);
      },
    },
    new (class implements TestCase {
      public name = "GenerateDatastoreModel";

      private originalIndexes: Buffer;
      public async execute() {
        // Prepare
        this.originalIndexes = fs.readFileSync(
          "./test_data/generate/generator/index.yaml"
        );

        // Execute
        generate(
          "./test_data/generate/generator/task",
          "./test_data/generate/generator/index"
        );

        // Verify
        assertCompile("./test_data/generate/generator/inside/task_model.ts");
      }
      public async tearDown() {
        await Promise.all([
          unlinkSilently("./test_data/generate/generator/task.ts"),
          unlinkSilently("./test_data/generate/generator/task.js"),
          unlinkSilently("./test_data/generate/generator/inside/task_model.ts"),
          unlinkSilently("./test_data/generate/generator/inside/task_model.js"),
          fs.promises.writeFile(
            "./test_data/generate/generator/index.yaml",
            this.originalIndexes
          ),
        ]);
      }
    })(),
    new (class implements TestCase {
      public name = "GenerateDatastoreModelWithPackageJsonFile";

      private originalIndexes: Buffer;
      public async execute() {
        // Prepare
        this.originalIndexes = fs.readFileSync(
          "./test_data/generate/generator/index.yaml"
        );

        // Execute
        generate(
          "./test_data/generate/generator/task",
          undefined,
          undefined,
          "./test_data/generate/generator/package.json"
        );

        // Verify
        assertCompile("./test_data/generate/generator/inside/task_model.ts");
      }
      public async tearDown() {
        await Promise.all([
          unlinkSilently("./test_data/generate/generator/task.ts"),
          unlinkSilently("./test_data/generate/generator/task.js"),
          unlinkSilently("./test_data/generate/generator/inside/task_model.ts"),
          unlinkSilently("./test_data/generate/generator/inside/task_model.js"),
          fs.promises.writeFile(
            "./test_data/generate/generator/index.yaml",
            this.originalIndexes
          ),
        ]);
      }
    })(),
    {
      name: "GenerateServiceDescriptor",
      execute: async () => {
        // Prepare
        generate("./test_data/generate/generator/inside/history");

        // Execute
        generate("./test_data/generate/generator/service");

        // Verify
        assertCompile("./test_data/generate/generator/service.ts");

        // Cleanup
        await Promise.all([
          unlinkSilently("./test_data/generate/generator/service.ts"),
          unlinkSilently("./test_data/generate/generator/service.js"),
          unlinkSilently("./test_data/generate/generator/inside/history.ts"),
          unlinkSilently("./test_data/generate/generator/inside/history.js"),
        ]);
      },
    },
  ],
});
