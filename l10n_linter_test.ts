import { lintL10nReturnLogs } from "./l10n_linter";
import { assertThat, containStr, eqArray } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "L10nLinterTest",
  cases: [
    {
      name: "MissingLocalesDir",
      execute: async () => {
        // Execute
        let logs = await lintL10nReturnLogs(
          "./test_data/l10n_linter/missing_locales_dir"
        );

        // Verify
        assertThat(
          logs,
          eqArray([
            containStr(
              "Create a directory /locales under ./test_data/l10n_linter/missing_locales_dir"
            ),
          ]),
          "logs"
        );
      },
    },
    {
      name: "MissingDefaultDir",
      execute: async () => {
        // Execute
        let logs = await lintL10nReturnLogs(
          "./test_data/l10n_linter/missing_default_dir"
        );

        // Verify
        assertThat(
          logs,
          eqArray([
            containStr(
              "Create a directory /default under test_data/l10n_linter/missing_default_dir/locales"
            ),
          ]),
          "logs"
        );
      },
    },
    {
      name: "MissingDefaultTextFile",
      execute: async () => {
        // Execute
        let logs = await lintL10nReturnLogs(
          "./test_data/l10n_linter/missing_default_text_file"
        );

        // Verify
        assertThat(
          logs,
          eqArray([
            containStr(
              "Create a file text.ts under test_data/l10n_linter/missing_default_text_file/locales/default"
            ),
          ]),
          "logs"
        );
      },
    },
    {
      name: "DeclareMultiClasses",
      execute: async () => {
        // Execute
        let logs = await lintL10nReturnLogs(
          "./test_data/l10n_linter/declare_multi_classes"
        );

        // Verify
        assertThat(
          logs,
          eqArray([
            containStr(
              "test_data/l10n_linter/declare_multi_classes/locales/default/text.ts: Only declare one class"
            ),
          ]),
          "logs"
        );
      },
    },
    {
      name: "NonFatalErrors",
      execute: async () => {
        // Execute
        let logs = await lintL10nReturnLogs(
          "./test_data/l10n_linter/non_fatal_errors"
        );

        // Verify
        assertThat(
          logs,
          eqArray([
            containStr(
              "test_data/l10n_linter/non_fatal_errors/locales/equals_import/text.ts: Only import with \"import SomeText from './...';\""
            ),
            containStr(
              "test_data/l10n_linter/non_fatal_errors/locales/import_from_elsewhere/text.ts: Only import from /default when outside of the current locale directory."
            ),
            containStr(
              "test_data/l10n_linter/non_fatal_errors/locales/multi_files/another.ts:\n\nDo not use public/protected/private/static/async or any other modifier."
            ),
            containStr(
              'test_data/l10n_linter/non_fatal_errors/locales/multi_files/text.ts:\n\nDeclare the class Text with "export default".\nDo not declare class members other than getter and function.\nOnly declare one class and/or import one class at top-level.'
            ),
            containStr(
              "test_data/l10n_linter/non_fatal_errors/locales/multi_files: Missing the following keys:\n\ncc\nccc"
            ),
            containStr(
              "test_data/l10n_linter/non_fatal_errors/locales/multi_files: The following keys need to be removed:\n\nzz\nzzz\nyyy"
            ),
            containStr(
              "test_data/l10n_linter/non_fatal_errors/locales/multi_imports/text.ts: Only import one class."
            ),
            containStr(
              "test_data/l10n_linter/non_fatal_errors/locales/named_import/text.ts: Only import with \"import SomeText from './...';\""
            ),
          ]),
          "logs"
        );
      },
    },
    {
      name: "NoIssues",
      execute: async () => {
        // Execute
        let logs = await lintL10nReturnLogs(
          "./test_data/l10n_linter/no_issues"
        );

        // Verify
        assertThat(logs, eqArray([containStr("No issue found")]), "logs");
      },
    },
  ],
});
