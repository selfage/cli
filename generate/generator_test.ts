import fs = require("fs");
import { generate } from "./generator";
import { TEST_RUNNER } from "@selfage/test_runner";
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

TEST_RUNNER.run({
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

        // Cleanup
        await Promise.all([
          fs.promises.unlink(
            "./test_data/generate/generator/inside/credit_card.ts"
          ),
          fs.promises.unlink(
            "./test_data/generate/generator/inside/credit_card.js"
          ),
          fs.promises.unlink("./test_data/generate/generator/user_info.ts"),
          fs.promises.unlink("./test_data/generate/generator/user_info.js"),
          fs.promises.unlink("./test_data/generate/generator/user.ts"),
          fs.promises.unlink("./test_data/generate/generator/user.js"),
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

        // Cleanup
        await Promise.all([
          fs.promises.unlink("./test_data/generate/generator/inside/money.ts"),
          fs.promises.unlink("./test_data/generate/generator/inside/money.js"),
          fs.promises.unlink("./test_data/generate/generator/item.ts"),
          fs.promises.unlink("./test_data/generate/generator/item.js"),
          fs.promises.unlink("./test_data/generate/generator/cart.ts"),
          fs.promises.unlink("./test_data/generate/generator/cart.js"),
        ]);
      },
    },
    {
      name: "GenerateDatastoreModel",
      execute: async () => {
        // Prepare
        let originalIndexes = fs.readFileSync(
          "./test_data/generate/generator/index.yaml"
        );

        // Execute
        generate(
          "./test_data/generate/generator/task",
          "./test_data/generate/generator/index"
        );

        // Verify
        assertCompile("./test_data/generate/generator/inside/task_model.ts");

        // Cleanup
        await Promise.all([
          fs.promises.unlink("./test_data/generate/generator/task.ts"),
          fs.promises.unlink("./test_data/generate/generator/task.js"),
          fs.promises.unlink(
            "./test_data/generate/generator/inside/task_model.ts"
          ),
          fs.promises.unlink(
            "./test_data/generate/generator/inside/task_model.js"
          ),
          fs.promises.writeFile(
            "./test_data/generate/generator/index.yaml",
            originalIndexes
          ),
        ]);
      },
    },
    {
      name: "GenerateDatastoreModelWithPackageJsonFile",
      execute: async () => {
        // Prepare
        let originalIndexes = fs.readFileSync(
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

        // Cleanup
        await Promise.all([
          fs.promises.unlink("./test_data/generate/generator/task.ts"),
          fs.promises.unlink("./test_data/generate/generator/task.js"),
          fs.promises.unlink(
            "./test_data/generate/generator/inside/task_model.ts"
          ),
          fs.promises.unlink(
            "./test_data/generate/generator/inside/task_model.js"
          ),
          fs.promises.writeFile(
            "./test_data/generate/generator/index.yaml",
            originalIndexes
          ),
        ]);
      },
    },
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
          fs.promises.unlink("./test_data/generate/generator/service.ts"),
          fs.promises.unlink("./test_data/generate/generator/service.js"),
          fs.promises.unlink(
            "./test_data/generate/generator/inside/history.ts"
          ),
          fs.promises.unlink(
            "./test_data/generate/generator/inside/history.js"
          ),
        ]);
      },
    },
  ],
});
