import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { generateDatastoreModel } from "./datastore_model_generator";
import { IndexDefinition, MessageDefinition } from "./definition";
import { OutputContent } from "./output_content";
import { TypeChecker } from "./type_checker";
import { Counter } from "@selfage/counter";
import { assertThat, assertThrow, eq, eqError, containStr } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "DatastoreModelGeneratorTest",
  cases: [
    {
      name: "IndexedFieldNotFound",
      execute: () => {
        // Prepare
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            counter.increment("getMessage");
            return undefined;
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {
          public addIndex(
            messageName: string,
            indexDefinitions: Array<IndexDefinition>
          ): void {}
        })();

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
                indexes: [
                  {
                    name: "TaskDone",
                    fields: [
                      {
                        fieldName: "done",
                      },
                    ],
                  },
                ],
              },
            },
            typeCheckerMock,
            indexBuilderMock,
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("Indexed field done is not defined")),
          `error`
        );
        assertThat(counter.get("getMessage"), eq(0), `getMessage called`);
      },
    },
    {
      name: "IndexedFieldCannotBeAMessage",
      execute: () => {
        // Prepare
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            counter.increment("getMessage");
            assertThat(typeName, eq("Payload"), `typeName for getMessage`);
            assertThat(importPath, eq(undefined), `importPath for getMessage`);
            return {
              name: "any",
              fields: [],
            };
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {
          public addIndex(
            messageName: string,
            indexDefinitions: Array<IndexDefinition>
          ): void {}
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
                indexes: [
                  {
                    name: "TaskPayload",
                    fields: [
                      {
                        fieldName: "payload",
                      },
                    ],
                  },
                ],
              },
            },
            typeCheckerMock,
            indexBuilderMock,
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("Payload cannot be used as a filter")),
          `error`
        );
        assertThat(counter.get("getMessage"), eq(1), `getMessage called`);
      },
    },
    {
      name: "KeyNotFound",
      execute: () => {
        // Prepare
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            counter.increment("getMessage");
            return undefined;
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {})();

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
            typeCheckerMock,
            indexBuilderMock,
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(error, eqError(new Error("key id is not found")), `error`);
        assertThat(counter.get("getMessage"), eq(0), `getMessage called`);
      },
    },
    {
      name: "KeyCannotBeBoolean",
      execute: () => {
        // Prepare
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            counter.increment("getMessage");
            return undefined;
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {})();

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
            typeCheckerMock,
            indexBuilderMock,
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("key can only be a string")),
          `error`
        );
        assertThat(counter.get("getMessage"), eq(0), `getMessage called`);
      },
    },
    {
      name: "KeyCannotBeAnArray",
      execute: () => {
        // Prepare
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            counter.increment("getMessage");
            return undefined;
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {})();

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
            typeCheckerMock,
            indexBuilderMock,
            new Map<string, OutputContent>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("key cannot be an array")),
          `error`
        );
        assertThat(counter.get("getMessage"), eq(0), `getMessage called`);
      },
    },
    {
      name: "ArrayAndSimpleImportsAndComments",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            if (typeName === "Priority") {
              counter.increment("Priority for getMessage");
              assertThat(
                importPath,
                eq("./task_priority"),
                `Priority path for getMessage`
              );
              return undefined;
            } else if (typeName === "SubPriority") {
              counter.increment("SubPriority for getMessage");
              assertThat(
                importPath,
                eq(undefined),
                `SubPriority path for getMessage`
              );
              return undefined;
            } else {
              throw new Error("Unexpected typeName.");
            }
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {
          public addIndex(
            messageName: string,
            indexDefinitions: Array<IndexDefinition>
          ): void {
            counter.increment("addIndex");
            assertThat(indexDefinitions.length, eq(4), `index length`);
            assertThat(
              indexDefinitions[0].name,
              eq(`TaskDone`),
              `0th name of indexes`
            );
            assertThat(
              indexDefinitions[1].name,
              eq(`TaskDonePriority`),
              `1th name of indexes`
            );
            assertThat(
              indexDefinitions[2].name,
              eq(`TaskCollbas`),
              `2th name of indexes`
            );
            assertThat(
              indexDefinitions[3].name,
              eq(`CreatedTime`),
              `3th name of indexes`
            );
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
              indexes: [
                {
                  name: "TaskDone",
                  fields: [
                    {
                      fieldName: "done",
                    },
                  ],
                },
                {
                  name: "TaskDonePriority",
                  fields: [
                    {
                      fieldName: "done",
                    },
                    {
                      fieldName: "priority",
                      descending: true,
                    },
                    {
                      fieldName: "subPriority",
                      descending: true,
                    },
                  ],
                },
                {
                  name: "TaskCollbas",
                  fields: [
                    {
                      fieldName: "collaborators",
                    },
                    {
                      fieldName: "created",
                      descending: false,
                    },
                  ],
                },
                {
                  name: "CreatedTime",
                  fields: [
                    {
                      fieldName: "created",
                      descending: true,
                    },
                  ],
                },
              ],
              comment: "Comment1",
            },
          },
          typeCheckerMock,
          indexBuilderMock,
          contentMap
        );

        // Verify
        assertThat(
          counter.get("Priority for getMessage"),
          eq(1),
          `Priority for getMessage called`
        );
        assertThat(
          counter.get("SubPriority for getMessage"),
          eq(1),
          `SubPriority for getMessage called`
        );
        assertThat(counter.get("addIndex"), eq(1), `addIndex called`);
        assertThat(
          contentMap.get("./task_model").toString(),
          eq(`import { DatastoreQuery, DatastoreFilter, Operator, DatastoreModelDescriptor } from '@selfage/datastore_client/model_descriptor';
import { Priority } from './task_priority';
import { SubPriority, Task, TASK } from './task_def';

/* Comment1 */
export let TASK_MODEL: DatastoreModelDescriptor<Task> = {
  name: "Task",
  key: "id",
  excludedIndexes: ["id", "payload", "tags"],
  valueDescriptor: TASK,
}

export class TaskDoneQueryBuilder {
  private datastoreQuery: DatastoreQuery<Task>;

  public constructor() {
    this.datastoreQuery = {
      modelDescriptor: TASK_MODEL,
      filters: new Array<DatastoreFilter>(),
      orderings: [
      ]
    }
  }
  public start(cursor: string): this {
    this.datastoreQuery.startCursor = cursor;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public filterByDone(operator: Operator, value: boolean): this {
    this.datastoreQuery.filters.push({
      fieldName: "done",
      fieldValue: value,
      operator: operator,
    });
    return this;
  }
  public build(): DatastoreQuery<Task> {
    return this.datastoreQuery;
  }
}

export class TaskDonePriorityQueryBuilder {
  private datastoreQuery: DatastoreQuery<Task>;

  public constructor() {
    this.datastoreQuery = {
      modelDescriptor: TASK_MODEL,
      filters: new Array<DatastoreFilter>(),
      orderings: [
        {
          fieldName: "priority",
          descending: true
        },
        {
          fieldName: "subPriority",
          descending: true
        },
      ]
    }
  }
  public start(cursor: string): this {
    this.datastoreQuery.startCursor = cursor;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public filterByDone(operator: Operator, value: boolean): this {
    this.datastoreQuery.filters.push({
      fieldName: "done",
      fieldValue: value,
      operator: operator,
    });
    return this;
  }
  public filterByPriority(operator: Operator, value: Priority): this {
    this.datastoreQuery.filters.push({
      fieldName: "priority",
      fieldValue: value,
      operator: operator,
    });
    return this;
  }
  public filterBySubPriority(operator: Operator, value: SubPriority): this {
    this.datastoreQuery.filters.push({
      fieldName: "subPriority",
      fieldValue: value,
      operator: operator,
    });
    return this;
  }
  public build(): DatastoreQuery<Task> {
    return this.datastoreQuery;
  }
}

export class TaskCollbasQueryBuilder {
  private datastoreQuery: DatastoreQuery<Task>;

  public constructor() {
    this.datastoreQuery = {
      modelDescriptor: TASK_MODEL,
      filters: new Array<DatastoreFilter>(),
      orderings: [
        {
          fieldName: "created",
          descending: false
        },
      ]
    }
  }
  public start(cursor: string): this {
    this.datastoreQuery.startCursor = cursor;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public filterByCollaborators(operator: Operator, value: string): this {
    this.datastoreQuery.filters.push({
      fieldName: "collaborators",
      fieldValue: value,
      operator: operator,
    });
    return this;
  }
  public filterByCreated(operator: Operator, value: number): this {
    this.datastoreQuery.filters.push({
      fieldName: "created",
      fieldValue: value,
      operator: operator,
    });
    return this;
  }
  public build(): DatastoreQuery<Task> {
    return this.datastoreQuery;
  }
}

export class CreatedTimeQueryBuilder {
  private datastoreQuery: DatastoreQuery<Task>;

  public constructor() {
    this.datastoreQuery = {
      modelDescriptor: TASK_MODEL,
      filters: new Array<DatastoreFilter>(),
      orderings: [
        {
          fieldName: "created",
          descending: true
        },
      ]
    }
  }
  public start(cursor: string): this {
    this.datastoreQuery.startCursor = cursor;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public filterByCreated(operator: Operator, value: number): this {
    this.datastoreQuery.filters.push({
      fieldName: "created",
      fieldValue: value,
      operator: operator,
    });
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
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            counter.increment('getMessage');
            assertThat(typeName, eq('Priority'), 'typeName for getMessage');
            assertThat(importPath, eq('./another_side/task_priority'), 'importPath for getMessage');
            return undefined;
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {
          public addIndex(
            messageName: string,
            indexDefinitions: Array<IndexDefinition>
          ): void {}
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
              indexes: [{
                name: "Priority",
                fields: [{
                  fieldName: "priority"
                }]
              }]
            },
          },
          typeCheckerMock,
          indexBuilderMock,
          contentMap
        );

        // Verify
        assertThat(counter.get('getMessage'), eq(1), `getMessage called`);
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
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            counter.increment('getMessage');
            assertThat(typeName, eq('Priority'), 'typeName for getMessage');
            assertThat(importPath, eq('../another_side/task_priority'), 'importPath for getMessage');
            return undefined;
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {
          public addIndex(
            messageName: string,
            indexDefinitions: Array<IndexDefinition>
          ): void {}
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
              indexes: [{
                name: "Priority",
                fields: [{
                  fieldName: "priority"
                }]
              }]
            },
          },
          typeCheckerMock,
          indexBuilderMock,
          contentMap
        );

        // Verify
        assertThat(counter.get('getMessage'), eq(1), `getMessage called`);
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
