import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { generateDatastoreModel } from "./datastore_model_generator";
import { DatastoreDefinition, MessageDefinition } from "./definition";
import { Importer } from "./importer";
import { TypeChecker } from "./type_checker";
import { Counter } from "@selfage/counter";
import { assertThat, assertThrow, eq, eqError } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "DatastoreModelGeneratorTest",
  cases: [
    {
      name: "MessageNotFound",
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
            assertThat(typeName, eq(`Task`), `typeName`);
            assertThat(importPath, eq(undefined), `importPath`);
            return undefined;
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {})();

        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            {
              messageName: "Task",
              key: "id",
            },
            typeCheckerMock,
            new Importer(),
            indexBuilderMock,
            new Array<string>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error(`Message definition of Task is not found`)),
          `error`
        );
        assertThat(counter.get("getMessage"), eq(1), `getMessage called`);
      },
    },
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
            assertThat(typeName, eq(`Task`), `typeName`);
            assertThat(importPath, eq(undefined), `importPath`);
            return {
              name: "Task",
              fields: [
                {
                  name: "id",
                  type: "number",
                },
              ],
            };
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {
          public addIndex(datastoreDefinition: DatastoreDefinition): void {}
        })();

        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            {
              messageName: "Task",
              key: "id",
              indexes: [
                {
                  name: "TaskDone",
                  properties: [
                    {
                      fieldName: "done",
                    },
                  ],
                },
              ],
            },
            typeCheckerMock,
            new Importer(),
            indexBuilderMock,
            new Array<string>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("Indexed field done is not defined")),
          `error`
        );
        assertThat(counter.get("getMessage"), eq(1), `getMessage called`);
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
            if (typeName === "Task") {
              counter.increment("Task for getMessage");
              assertThat(importPath, eq(undefined), `importPath`);
              return {
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
              };
            } else if (typeName === "Payload") {
              counter.increment("Payload for getMessage");
              assertThat(importPath, eq(undefined), `importPath for isMessage`);
              return {
                name: "any",
                fields: [],
              };
            } else {
              throw new Error("Unexpected.");
            }
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {
          public addIndex(datastoreDefinition: DatastoreDefinition): void {}
        })();

        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            {
              messageName: "Task",
              key: "id",
              indexes: [
                {
                  name: "TaskPayload",
                  properties: [
                    {
                      fieldName: "payload",
                    },
                  ],
                },
              ],
            },
            typeCheckerMock,
            new Importer(),
            indexBuilderMock,
            new Array<string>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("Payload cannot be used as a filter")),
          `error`
        );
        assertThat(
          counter.get("Task for getMessage"),
          eq(1),
          `Task for getMessage called`
        );
        assertThat(
          counter.get("Payload for getMessage"),
          eq(1),
          `Payload for getMessage called`
        );
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
            assertThat(typeName, eq(`Task`), `typeName`);
            assertThat(importPath, eq(undefined), `importPath`);
            return {
              name: "Task",
              fields: [
                {
                  name: "payload",
                  type: "Payload",
                },
              ],
            };
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {})();

        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            {
              messageName: "Task",
              key: "id",
            },
            typeCheckerMock,
            new Importer(),
            indexBuilderMock,
            new Array<string>()
          )
        );

        // Verify
        assertThat(error, eqError(new Error("key id is not found")), `error`);
        assertThat(counter.get("getMessage"), eq(1), `getMessage called`);
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
            assertThat(typeName, eq(`Task`), `typeName`);
            assertThat(importPath, eq(undefined), `importPath`);
            return {
              name: "Task",
              fields: [
                {
                  name: "id",
                  type: "boolean",
                },
              ],
            };
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {})();

        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            {
              messageName: "Task",
              key: "id",
            },
            typeCheckerMock,
            new Importer(),
            indexBuilderMock,
            new Array<string>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("key can only be a string or a number")),
          `error`
        );
        assertThat(counter.get("getMessage"), eq(1), `getMessage called`);
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
            assertThat(typeName, eq(`Task`), `typeName`);
            assertThat(importPath, eq(undefined), `importPath`);
            return {
              name: "Task",
              fields: [
                {
                  name: "id",
                  type: "string",
                  isArray: true,
                },
              ],
            };
          }
        })();
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {})();

        // Execute
        let error = assertThrow(() =>
          generateDatastoreModel(
            {
              messageName: "Task",
              key: "id",
            },
            typeCheckerMock,
            new Importer(),
            indexBuilderMock,
            new Array<string>()
          )
        );

        // Verify
        assertThat(
          error,
          eqError(new Error("key cannot be an array")),
          `error`
        );
        assertThat(counter.get("getMessage"), eq(1), `getMessage called`);
      },
    },
    {
      name: "ModelWithArrayAndImports",
      execute: () => {
        // Prepare
        let counter = new Counter<string>();
        let importer = new Importer();
        let contentList = new Array<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            if (typeName === "Task") {
              counter.increment("Task for getMessage");
              assertThat(importPath, eq("./inside/task_def"), `importPath`);
              return {
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
                    import: "./inside/task_priority",
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
              };
            } else if (typeName === "Priority") {
              counter.increment("Priority for getMessage");
              assertThat(
                importPath,
                eq("./inside/task_priority"),
                `Priority path for getMessage`
              );
              return undefined;
            } else if (typeName === "SubPriority") {
              counter.increment("SubPriority for getMessage");
              assertThat(
                importPath,
                eq(undefined),
                `SubPriority path for isMessage`
              );
              return undefined;
            } else {
              throw new Error("Unexpected typeName.");
            }
          }
        })();
        let taskModelDefinition: DatastoreDefinition = {
          messageName: "Task",
          import: "./inside/task_def",
          key: "id",
          indexes: [
            {
              name: "TaskDone",
              properties: [
                {
                  fieldName: "done",
                },
              ],
            },
            {
              name: "TaskDonePriority",
              properties: [
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
              properties: [
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
              properties: [
                {
                  fieldName: "created",
                  descending: true,
                },
              ],
            },
          ],
        };
        let indexBuilderMock = new (class extends DatastoreIndexBuilder {
          public addIndex(datastoreDefinition: DatastoreDefinition) {
            counter.increment("addIndex");
            assertThat(
              datastoreDefinition,
              eq(taskModelDefinition),
              `datastoreDefinition`
            );
          }
        })();

        // Execute
        generateDatastoreModel(
          taskModelDefinition,
          typeCheckerMock,
          importer,
          indexBuilderMock,
          contentList
        );

        // Verify
        assertThat(
          counter.get("Task for getMessage"),
          eq(1),
          `Task for getMessage called`
        );
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
          contentList.join(""),
          eq(`
export class TaskDoneQueryBuilder {
  private datastoreQuery: DatastoreQuery<Task>;

  public constructor() {
    this.datastoreQuery = {
      filters: new Array<DatastoreFilter>(),
      orderings: [
      ]
    }
  }
  public start(token: string): this {
    this.datastoreQuery.startToken = token;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public filterByDone(operator: Operator, value: boolean): this {
    this.datastoreQuery.filters.push({
      indexName: "done",
      indexValue: value,
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
      filters: new Array<DatastoreFilter>(),
      orderings: [
        {
          indexName: "priority",
          descending: true
        },
        {
          indexName: "subPriority",
          descending: true
        },
      ]
    }
  }
  public start(token: string): this {
    this.datastoreQuery.startToken = token;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public filterByDone(operator: Operator, value: boolean): this {
    this.datastoreQuery.filters.push({
      indexName: "done",
      indexValue: value,
      operator: operator,
    });
    return this;
  }
  public filterByPriority(operator: Operator, value: Priority): this {
    this.datastoreQuery.filters.push({
      indexName: "priority",
      indexValue: value,
      operator: operator,
    });
    return this;
  }
  public filterBySubPriority(operator: Operator, value: SubPriority): this {
    this.datastoreQuery.filters.push({
      indexName: "subPriority",
      indexValue: value,
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
      filters: new Array<DatastoreFilter>(),
      orderings: [
        {
          indexName: "created",
          descending: false
        },
      ]
    }
  }
  public start(token: string): this {
    this.datastoreQuery.startToken = token;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public filterByCollaborators(operator: Operator, value: string): this {
    this.datastoreQuery.filters.push({
      indexName: "collaborators",
      indexValue: value,
      operator: operator,
    });
    return this;
  }
  public filterByCreated(operator: Operator, value: number): this {
    this.datastoreQuery.filters.push({
      indexName: "created",
      indexValue: value,
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
      filters: new Array<DatastoreFilter>(),
      orderings: [
        {
          indexName: "created",
          descending: true
        },
      ]
    }
  }
  public start(token: string): this {
    this.datastoreQuery.startToken = token;
    return this;
  }
  public limit(num: number): this {
    this.datastoreQuery.limit = num;
    return this;
  }
  public filterByCreated(operator: Operator, value: number): this {
    this.datastoreQuery.filters.push({
      indexName: "created",
      indexValue: value,
      operator: operator,
    });
    return this;
  }
  public build(): DatastoreQuery<Task> {
    return this.datastoreQuery;
  }
}

export let TASK_MODEL: DatastoreModelDescriptor<Task> = {
  name: "Task",
  key: "id",
  excludedIndexes: ["id", "payload", "tags"],
  valueDescriptor: TASK,
}
`),
          `contentList`
        );
        assertThat(
          importer.toStringList().join(""),
          eq(
            `import { DatastoreQuery, DatastoreFilter, DatastoreOrdering, Operator, DatastoreModelDescriptor } from '@selfage/datastore_client/model_descriptor';
import { Priority } from './inside/task_priority';
import { Task, TASK } from './inside/task_def';
`
          ),
          `importer`
        );
      },
    },
  ],
});
