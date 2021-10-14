import { generateDatastoreModel } from "./datastore_model_generator";
import { DatastoreQueryTemplate } from "./definition";
import { MockDatastoreIndexBuilder, MockTypeChecker } from "./mocks";
import { OutputContent } from "./output_content";
import {
  assertThat,
  assertThrow,
  containStr,
  eq,
  eqError,
} from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "DatastoreModelGeneratorTest",
  cases: [
    {
      name: "InvalidFilteringOperator",
      execute: () => {
        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            "./some_file",
            {
              name: "Task",
              fields: [],
              datastore: {
                output: "./output_file",
                key: "id",
                queries: [
                  {
                    name: "Tasks",
                    filters: [
                      {
                        fieldName: "created",
                        operator: ">>",
                      },
                    ],
                  },
                ],
              },
            },
            new MockTypeChecker(),
            new MockDatastoreIndexBuilder(),
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(error, eqError(new Error("Unknown operator >>")), `error`);
      },
    },
    {
      name: "TooManyInequalityFilters",
      execute: () => {
        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            "./some_file",
            {
              name: "Task",
              fields: [],
              datastore: {
                output: "./output_file",
                key: "id",
                queries: [
                  {
                    name: "Tasks",
                    filters: [
                      {
                        fieldName: "created",
                        operator: ">=",
                      },
                      {
                        fieldName: "updated",
                        operator: ">=",
                      },
                    ],
                  },
                ],
              },
            },
            new MockTypeChecker(),
            new MockDatastoreIndexBuilder(),
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("fields are used in inequality filters")),
          `error`
        );
      },
    },
    {
      name: "OrderingFieldNotFound",
      execute: () => {
        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            "./some_file",
            {
              name: "Task",
              fields: [],
              datastore: {
                output: "./output_file",
                key: "id",
                queries: [
                  {
                    name: "Tasks",
                    orderings: [
                      {
                        fieldName: "created",
                        descending: true,
                      },
                    ],
                  },
                ],
              },
            },
            new MockTypeChecker(),
            new MockDatastoreIndexBuilder(),
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("Field created is not defined")),
          `error`
        );
      },
    },
    {
      name: "FilteringFieldCannotBeAMessage",
      execute: () => {
        // Prepare
        let mockTypeChecker = new (class extends MockTypeChecker {
          public categorizeType(typeName: string, importPath?: string) {
            return { isMessage: true };
          }
        })();

        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            "./some_file",
            {
              name: "Task",
              fields: [
                {
                  name: "id",
                  type: "number",
                },
                {
                  name: "payload",
                  type: "Payload",
                },
              ],
              datastore: {
                output: "./output_file",
                key: "id",
                queries: [
                  {
                    name: "TaskPayload",
                    filters: [
                      {
                        fieldName: "payload",
                        operator: "=",
                      },
                    ],
                  },
                ],
              },
            },
            mockTypeChecker,
            new MockDatastoreIndexBuilder(),
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("Payload which cannot be used to be ordered")),
          `error`
        );
      },
    },
    {
      name: "KeyNotFound",
      execute: () => {
        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            "./some_file",
            {
              name: "Task",
              fields: [],
              datastore: {
                output: "./output_file",
                key: "id",
              },
            },
            new MockTypeChecker(),
            new MockDatastoreIndexBuilder(),
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(error, eqError(new Error("key id is not found")), `error`);
      },
    },
    {
      name: "KeyCannotBeBoolean",
      execute: () => {
        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            "./some_file",
            {
              name: "Task",
              fields: [
                {
                  name: "id",
                  type: "boolean",
                },
              ],
              datastore: {
                output: "./output_file",
                key: "id",
              },
            },
            new MockTypeChecker(),
            new MockDatastoreIndexBuilder(),
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("key can only be a string")),
          `error`
        );
      },
    },
    {
      name: "KeyCannotBeAnArray",
      execute: () => {
        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            "./some_file",
            {
              name: "Task",
              fields: [
                {
                  name: "id",
                  type: "string",
                  isArray: true,
                },
              ],
              datastore: {
                output: "./output_file",
                key: "id",
              },
            },
            new MockTypeChecker(),
            new MockDatastoreIndexBuilder(),
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("key cannot be an array")),
          `error`
        );
      },
    },
    {
      name: "ArrayAndSimpleImportAndComments",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public categorizeType(typeName: string, importPath?: string) {
            if (typeName === "Priority") {
              assertThat(
                importPath,
                eq("./task_priority"),
                `Priority path for categorizeType`
              );
              return { isEnum: true };
            } else if (typeName === "SubPriority") {
              assertThat(
                importPath,
                eq(undefined),
                `SubPriority path for categorizeType`
              );
              return { isEnum: true };
            } else {
              return {};
            }
          }
        })();
        let mockIndexBuilder = new (class extends MockDatastoreIndexBuilder {
          public addIndex(
            messageName: string,
            query: DatastoreQueryTemplate
          ): void {
            switch (this.called.increment("addIndex")) {
              case 1:
                assertThat(query.name, eq(`TaskDone`), `1st index`);
                return;
              case 2:
                assertThat(query.name, eq(`TaskDonePriority`), `2nd index`);
                return;
              case 3:
                assertThat(query.name, eq(`TaskCollbas`), `3rd index`);
                return;
              case 4:
                assertThat(query.name, eq(`CreatedTime`), `4th index`);
                return;
              default:
                throw new Error("Unexpected");
            }
          }
        })();

        // Execute
        generateDatastoreModel(
          "./task_def",
          {
            name: "Task",
            fields: [
              {
                name: "id",
                type: "string",
              },
              {
                name: "payload",
                type: "Payload",
              },
              {
                name: "tags",
                type: "string",
                isArray: true,
              },
              {
                name: "done",
                type: "boolean",
              },
              {
                name: "priority",
                type: "Priority",
                import: "./task_priority",
              },
              {
                name: "subPriority",
                type: "SubPriority",
              },
              {
                name: "collaborators",
                type: "string",
                isArray: true,
              },
              {
                name: "created",
                type: "number",
              },
            ],
            datastore: {
              output: "./task_model",
              key: "id",
              queries: [
                {
                  name: "TaskDone",
                  filters: [
                    {
                      fieldName: "done",
                      operator: "=",
                    },
                  ],
                  comment: "Comment1",
                },
                {
                  name: "TaskDonePriority",
                  filters: [
                    {
                      fieldName: "done",
                      operator: "=",
                    },
                  ],
                  orderings: [
                    {
                      fieldName: "priority",
                      descending: true,
                    },
                    {
                      fieldName: "subPriority",
                      descending: false,
                    },
                  ],
                },
                {
                  name: "TaskCollbas",
                  filters: [
                    {
                      fieldName: "collaborators",
                      operator: "=",
                    },
                    {
                      fieldName: "created",
                      operator: ">",
                    },
                  ],
                  orderings: [
                    {
                      fieldName: "created",
                      descending: true,
                    },
                  ],
                },
                {
                  name: "CreatedTime",
                  orderings: [
                    {
                      fieldName: "created",
                      descending: true,
                    },
                  ],
                },
              ],
              comment: "Comment2",
            },
          },
          mockTypeChecker,
          mockIndexBuilder,
          contentMap
        );

        // Verify
        assertThat(
          mockIndexBuilder.called.get("addIndex"),
          eq(4),
          `addIndex called`
        );
        assertThat(
          contentMap.get("./task_model").toString(),
          eq(`import { DatastoreQuery, DatastoreFilter, DatastoreModelDescriptor } from '@selfage/datastore_client/model_descriptor';
import { Task, TASK } from './task_def';

/* Comment2 */
export let TASK_MODEL: DatastoreModelDescriptor<Task> = {
  name: "Task",
  key: "id",
  excludedIndexes: ["id", "payload", "tags"],
  valueDescriptor: TASK,
}

/* Comment1 */
export class TaskDoneQueryBuilder {
  private datastoreQuery: DatastoreQuery<Task> = {
    modelDescriptor: TASK_MODEL,
    filters: new Array<DatastoreFilter>(),
    orderings: [
    ]
  };

  public start(cursor: string): this {
    this.datastoreQuery.startCursor = cursor;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public equalToDone(value: boolean): this {
    this.datastoreQuery.filters.push({
      fieldName: "done",
      fieldValue: value,
      operator: "=",
    });
    return this;
  }
  public build(): DatastoreQuery<Task> {
    return this.datastoreQuery;
  }
}

export class TaskDonePriorityQueryBuilder {
  private datastoreQuery: DatastoreQuery<Task> = {
    modelDescriptor: TASK_MODEL,
    filters: new Array<DatastoreFilter>(),
    orderings: [
      {
        fieldName: "priority",
        descending: true
      },
      {
        fieldName: "subPriority",
        descending: false
      },
    ]
  };

  public start(cursor: string): this {
    this.datastoreQuery.startCursor = cursor;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public equalToDone(value: boolean): this {
    this.datastoreQuery.filters.push({
      fieldName: "done",
      fieldValue: value,
      operator: "=",
    });
    return this;
  }
  public build(): DatastoreQuery<Task> {
    return this.datastoreQuery;
  }
}

export class TaskCollbasQueryBuilder {
  private datastoreQuery: DatastoreQuery<Task> = {
    modelDescriptor: TASK_MODEL,
    filters: new Array<DatastoreFilter>(),
    orderings: [
      {
        fieldName: "created",
        descending: true
      },
    ]
  };

  public start(cursor: string): this {
    this.datastoreQuery.startCursor = cursor;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public equalToCollaborators(value: string): this {
    this.datastoreQuery.filters.push({
      fieldName: "collaborators",
      fieldValue: value,
      operator: "=",
    });
    return this;
  }
  public greaterThanCreated(value: number): this {
    this.datastoreQuery.filters.push({
      fieldName: "created",
      fieldValue: value,
      operator: ">",
    });
    return this;
  }
  public build(): DatastoreQuery<Task> {
    return this.datastoreQuery;
  }
}

export class CreatedTimeQueryBuilder {
  private datastoreQuery: DatastoreQuery<Task> = {
    modelDescriptor: TASK_MODEL,
    filters: new Array<DatastoreFilter>(),
    orderings: [
      {
        fieldName: "created",
        descending: true
      },
    ]
  };

  public start(cursor: string): this {
    this.datastoreQuery.startCursor = cursor;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public build(): DatastoreQuery<Task> {
    return this.datastoreQuery;
  }
}
`),
          `outputContent`
        );
      },
    },
    {
      name: "DivingImports",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public categorizeType(typeName: string, importPath?: string) {
            assertThat(typeName, eq("Priority"), "typeName for categorizeType");
            assertThat(
              importPath,
              eq("./another_side/task_priority"),
              "importPath for categorizeType"
            );
            return { isEnum: true };
          }
        })();

        // Execute
        generateDatastoreModel(
          "./inside/task_def",
          {
            name: "Task",
            fields: [
              {
                name: "id",
                type: "string",
              },
              {
                name: "priority",
                type: "Priority",
                import: "./another_side/task_priority",
              },
            ],
            datastore: {
              output: "./other_side/task_model",
              key: "id",
              queries: [
                {
                  name: "Priority",
                  filters: [
                    {
                      fieldName: "priority",
                      operator: "=",
                    },
                  ],
                },
              ],
            },
          },
          mockTypeChecker,
          new MockDatastoreIndexBuilder(),
          contentMap
        );

        // Verify
        assertThat(
          contentMap.get("./inside/other_side/task_model").toString(),
          containStr(`import { Priority } from '../another_side/task_priority';
import { Task, TASK } from '../task_def';`),
          `outputContent`
        );
      },
    },
    {
      name: "JumpingImports",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public categorizeType(typeName: string, importPath?: string) {
            assertThat(typeName, eq("Priority"), "typeName for categorizeType");
            assertThat(
              importPath,
              eq("../another_side/task_priority"),
              "importPath for categorizeType"
            );
            return { isEnum: true };
          }
        })();

        // Execute
        generateDatastoreModel(
          "./inside/task_def",
          {
            name: "Task",
            fields: [
              {
                name: "id",
                type: "string",
              },
              {
                name: "priority",
                type: "Priority",
                import: "../another_side/task_priority",
              },
            ],
            datastore: {
              output: "../other_side/task_model",
              key: "id",
              queries: [
                {
                  name: "Priority",
                  filters: [
                    {
                      fieldName: "priority",
                      operator: "=",
                    },
                  ],
                },
              ],
            },
          },
          mockTypeChecker,
          new MockDatastoreIndexBuilder(),
          contentMap
        );

        // Verify
        assertThat(
          contentMap.get("./other_side/task_model").toString(),
          containStr(`import { Priority } from '../another_side/task_priority';
import { Task, TASK } from '../inside/task_def';`),
          `outputContent`
        );
      },
    },
  ],
});
