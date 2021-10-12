import { DatastoreIndexBuilder } from "./datastore_index_builder";
import { DatastoreQueryTemplate } from "./definition";
import { TypeChecker } from "./type_checker";
import { Counter } from "@selfage/counter";

export class MockDatastoreIndexBuilder extends DatastoreIndexBuilder {
  public called = new Counter<string>();
  public constructor() {
    super("");
  }

  public addIndex(messageName: string, query: DatastoreQueryTemplate): void {}
}

export class MockTypeChecker extends TypeChecker {
  public called = new Counter<string>();
  public constructor() {
    super("");
  }

  public categorizeType(
    typeName: string,
    importPath?: string
  ): {
    isPrimitive?: boolean;
    isEnum?: boolean;
    isMessage?: boolean;
  } {
    return {};
  }
}
