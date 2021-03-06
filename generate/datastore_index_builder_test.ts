import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "DatastoreIndexBuilderTest",
  cases: [
    {
      name: "NonExistingYaml",
      execute: () => {
        // Prepare
        let indexBuilder = new DatastoreIndexBuilder();

        // Execute
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/non_exist.yaml"
        );

        // Verify
        assertThat(content, eq(`indexes: []\n`), `content`);
      },
    },
    {
      name: "EmptyExistingYaml",
      execute: () => {
        // Prepare
        let indexBuilder = new DatastoreIndexBuilder();

        // Execute
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/empty.yaml"
        );

        // Verify
        assertThat(content, eq(`indexes: []\n`), `content`);
      },
    },
    {
      name: "NoIndexesFieldExistingYaml",
      execute: () => {
        // Prepare
        let indexBuilder = new DatastoreIndexBuilder();

        // Execute
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/no_indexes.yaml"
        );

        // Verify
        assertThat(content, eq(`indexes: []\n`), `content`);
      },
    },
    {
      name: "NoIndexesToGenerate",
      execute: () => {
        // Prepare
        let indexBuilder = new DatastoreIndexBuilder();

        // Verify
        indexBuilder.addIndex("Task", [
          {
            name: "TaskDoneDesc",
            fields: [
              {
                fieldName: "done",
                descending: true,
              },
            ],
          },
          {
            name: "Collabs",
            fields: [
              {
                fieldName: "collaborators",
              },
            ],
          },
        ]);
        indexBuilder.addIndex("TaskList", [
          {
            name: "Tasks",
            fields: [
              {
                fieldName: "taskIds",
              },
            ],
          },
        ]);
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/non_exist.yaml"
        );

        // Verify
        assertThat(content, eq(`indexes: []\n`), `content`);
      },
    },
    {
      name: "NewIndexes",
      execute: () => {
        // Prepare
        let indexBuilder = new DatastoreIndexBuilder();

        // Execute
        indexBuilder.addIndex("Task", [
          {
            name: "TaskDone",
            fields: [
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
            fields: [
              {
                fieldName: "done",
                descending: true,
              },
            ],
          },
          {
            name: "Collabs",
            fields: [
              {
                fieldName: "collaborators",
              },
            ],
          },
          {
            name: "OrderedCollabs",
            fields: [
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
        ]);
        indexBuilder.addIndex("TaskList", [
          {
            name: "Tasks",
            fields: [
              {
                fieldName: "taskIds",
              },
            ],
          },
          {
            name: "TaskCompletion",
            fields: [
              {
                fieldName: "precentComplete",
              },
              {
                fieldName: "type",
              },
            ],
          },
        ]);
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/non_exist.yaml"
        );

        // Verify
        assertThat(
          content,
          eq(`indexes:
  - kind: Task
    properties:
      - name: collaborators
        direction: asc
      - name: created
        direction: desc
  - kind: Task
    properties:
      - name: done
      - name: priority
        direction: asc
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
        indexBuilder.addIndex("Task", [
          {
            name: "TaskDone",
            fields: [
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
            fields: [
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
        ]);
        indexBuilder.addIndex("TaskList", [
          {
            name: "TaskCompletion",
            fields: [
              {
                fieldName: "precentComplete",
              },
              {
                fieldName: "type",
              },
            ],
          },
        ]);
        let content = indexBuilder.mergeIndexes(
          "./test_data/generate/datastore_index_builder/index.yaml"
        );

        // Verify
        assertThat(
          content,
          eq(`indexes:
  - kind: Task
    properties:
      - name: collaborators
        direction: asc
      - name: created
        direction: desc
  - kind: Task
    properties:
      - name: done
      - name: priority
        direction: asc
  - kind: Task
    properties:
      - name: done
      - name: priority
        direction: desc
  - kind: TaskList
    properties:
      - name: percentComplete
        direction: asc
      - name: type
        direction: asc
  - kind: TaskList
    properties:
      - name: precentComplete
      - name: type
  - kind: User
    properties:
      - name: created
        direction: desc
      - name: username
`),
          `content`
        );
      },
    },
  ],
});
