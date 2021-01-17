import { TypeChecker } from "./type_checker";
import {
  assertThat,
  assertThrow,
  eq,
  eqError,
} from "@selfage/test_base/matcher";
import { TEST_RUNNER } from "@selfage/test_base/runner";

TEST_RUNNER.run({
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
        let err = assertThrow(() => typeChecker.getMessage("BasicData"));

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
        let err = assertThrow(() => typeChecker.getMessage("BasicData"));

        // Verify
        assertThat(
          err,
          eqError(new SyntaxError("Failed to parse JSON")),
          `err`
        );
      },
    },
    {
      name: "GetMessageFromCurrentAndImportedFile",
      execute: () => {
        // Prepare
        let typeChecker = new TypeChecker(
          "./test_data/generate/type_checker/basic"
        );

        // Execute
        let messageDefinition = typeChecker.getMessage("BasicData");

        // Verify
        assertThat(messageDefinition.name, eq("BasicData"), "BasicData.name");
        assertThat(
          messageDefinition.comment,
          eq("Test data"),
          "BasicData.comment"
        );

        // Execute
        let isMessage = typeChecker.isMessage("BasicData");

        // Verify
        assertThat(isMessage, eq(true), "BasicData isMessage");

        // Execute
        let messageDefinition2 = typeChecker.getMessage("BasicData");

        // Verify
        assertThat(messageDefinition2, eq(messageDefinition), "Same BasicData");

        // Execute
        let messageDefinition3 = typeChecker.getMessage(
          "AnotherData",
          "./inside/another"
        );

        // Verify
        assertThat(
          messageDefinition3.name,
          eq("AnotherData"),
          "AnotherData.name"
        );
        assertThat(
          messageDefinition3.comment,
          eq("Another data"),
          "AnotherData.comment"
        );
      },
    },
  ],
});
