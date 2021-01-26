import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "DatastoreIndexBuilderTest",
  cases: [
    {
      name: "Empty",
      execute: () => {
        // Prepare
        let indexBuilder = new DatastoreIndexBuilder();

        // Execute
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/non_exist.yaml"
        );

        // Verify
        assertThat(content, eq(``), `content`);
      },
    },
    {
      name: "NoIndex",
      execute: () => {
        // Prepare
        let indexBuilder = new DatastoreIndexBuilder();

        // Verify
        indexBuilder.addIndex({
          messageName: "Task",
          key: "id",
          indexes: [
            {
              name: "TaskDoneDesc",
              properties: [
                {
                  fieldName: "done",
                  descending: true,
                },
              ],
            },
            {
              name: "Collabs",
              properties: [
                {
                  fieldName: "collaborators",
                },
              ],
            },
          ],
        });
        indexBuilder.addIndex({
          messageName: "TaskList",
          key: "id",
          indexes: [
            {
              name: "Tasks",
              properties: [
                {
                  fieldName: "taskIds",
                },
              ],
            },
          ],
        });
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/non_exist.yaml"
        );

        // Verify
        assertThat(content, eq(""), `content`);
      },
    },
    {
      name: "NewIndexes",
      execute: () => {
        // Prepare
        let indexBuilder = new DatastoreIndexBuilder();

        // Execute
        indexBuilder.addIndex({
          messageName: "Task",
          key: "id",
          indexes: [
            {
              name: "TaskDone",
              properties: [
                {
                  fieldName: "done",
                },
                {
                  fieldName: "priority",
                  descending: false,
                },
              ],
            },
            {
              name: "TaskDoneDesc",
              properties: [
                {
                  fieldName: "done",
                  descending: true,
                },
              ],
            },
            {
              name: "Collabs",
              properties: [
                {
                  fieldName: "collaborators",
                },
              ],
            },
            {
              name: "OrderedCollabs",
              properties: [
                {
                  fieldName: "collaborators",
                  descending: false,
                },
                {
                  fieldName: "created",
                  descending: true,
                },
              ],
            },
          ],
        });
        indexBuilder.addIndex({
          messageName: "TaskList",
          key: "id",
          indexes: [
            {
              name: "Tasks",
              properties: [
                {
                  fieldName: "taskIds",
                },
              ],
            },
            {
              name: "TaskCompletion",
              properties: [
                {
                  fieldName: "precentComplete",
                },
                {
                  fieldName: "type",
                },
              ],
            },
          ],
        });
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/non_exist.yaml"
        );

        // Verify
        assertThat(
          content,
          eq(`indexes:
  - kind: Task
    properties:
      - name: done
      - name: priority
        direction: asc
  - kind: Task
    properties:
      - name: collaborators
        direction: asc
      - name: created
        direction: desc
  - kind: TaskList
    properties:
      - name: precentComplete
      - name: type
`),
          `content`
        );
      },
    },
    {
      name: "MergeIndexes",
      execute: () => {
        // Prepare
        let indexBuilder = new DatastoreIndexBuilder();

        // Execute
        indexBuilder.addIndex({
          messageName: "Task",
          key: "id",
          indexes: [
            {
              name: "TaskDone",
              properties: [
                {
                  fieldName: "done",
                },
                {
                  fieldName: "priority",
                  descending: false,
                },
              ],
            },
            {
              name: "OrderedCollabs",
              properties: [
                {
                  fieldName: "collaborators",
                  descending: false,
                },
                {
                  fieldName: "created",
                  descending: true,
                },
              ],
            },
          ],
        });
        indexBuilder.addIndex({
          messageName: "TaskList",
          key: "id",
          indexes: [
            {
              name: "TaskCompletion",
              properties: [
                {
                  fieldName: "precentComplete",
                },
                {
                  fieldName: "type",
                },
              ],
            },
          ],
        });
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/index.yaml"
        );

        // Verify
        assertThat(
          content,
          eq(`indexes:
  - kind: Task
    properties:
      - name: done
      - name: priority
        direction: asc
  - kind: Task
    properties:
      - name: collaborators
        direction: asc
      - name: created
        direction: desc
  - kind: TaskList
    properties:
      - name: precentComplete
      - name: type
  - kind: User
    properties:
      - name: username
      - name: created
        direction: desc
`),
          `content`
        );
      },
    },
  ],
});
