import { TypeChecker } from "./type_checker";
import { assertThat, assertThrow, eq, eqError } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "TypeCheckerTest",
  cases: [
    {
      name: "MissingFile",
      execute: () => {
        // Prepare
        let typeChecker = new TypeChecker(
          "./test_data/generate/type_checker/non_exist"
        );

        // Execute
        let err = assertThrow(() => typeChecker.getDefinition("BasicData"));

        // Verify
        assertThat(err, eqError(new Error("Cannot find module")), `err`);
      },
    },
    {
      name: "MalformedJson",
      execute: () => {
        // Prepare
        let typeChecker = new TypeChecker(
          "./test_data/generate/type_checker/malformed"
        );

        // Execute
        let err = assertThrow(() => typeChecker.getDefinition("BasicData"));

        // Verify
        assertThat(
          err,
          eqError(new SyntaxError("Failed to parse JSON")),
          `err`
        );
      },
    },
    {
      name: "CategorizeTypeAndGetMessage",
      execute: () => {
        // Prepare
        let typeChecker = new TypeChecker(
          "./test_data/generate/type_checker/basic"
        );

        // Execute
        let category = typeChecker.categorizeType("string");

        // Verify
        assertThat(category.isPrimitive, eq(true), "string isPrimitive");
        assertThat(category.isEnum, eq(undefined), "string isEnum");
        assertThat(category.isMessage, eq(undefined), "string isMessage");

        // Execute
        let definition = typeChecker.getDefinition("BasicData");

        // Verify
        assertThat(definition.name, eq("BasicData"), "BasicData.name");
        assertThat(
          definition.message.comment,
          eq("Test data"),
          "BasicData.comment"
        );

        // Execute
        category = typeChecker.categorizeType("BasicData");

        // Verify
        assertThat(
          category.isPrimitive,
          eq(undefined),
          "BasicData isPrimitive"
        );
        assertThat(category.isEnum, eq(undefined), "BasicData isEnum");
        assertThat(category.isMessage, eq(true), "BasicData isMessage");

        // Execute
        category = typeChecker.categorizeType("SomeEnum");

        // Verify
        assertThat(category.isPrimitive, eq(undefined), "SomeEnum isPrimitive");
        assertThat(category.isEnum, eq(true), "SomeEnum isEnum");
        assertThat(category.isMessage, eq(undefined), "SomeEnum isMessage");

        // Execute
        let definition2 = typeChecker.getDefinition("BasicData");

        // Verify
        assertThat(definition2, eq(definition), "Same BasicData");

        // Execute
        let definition3 = typeChecker.getDefinition(
          "AnotherData",
          "./inside/another"
        );

        // Verify
        assertThat(
          definition3.name,
          eq("AnotherData"),
          "AnotherData.name"
        );
        assertThat(
          definition3.message.comment,
          eq("Another data"),
          "AnotherData.comment"
        );
      },
    },
  ],
});
