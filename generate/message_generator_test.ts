import { Importer } from "./importer";
import { generateMessageDescriptor } from "./message_generator";
import { TypeChecker } from "./type_checker";
import { Counter } from "@selfage/counter";
import { assertThat, eq } from "@selfage/test_base/matcher";
import { TEST_RUNNER } from "@selfage/test_base/runner";

TEST_RUNNER.run({
  name: "MessageGeneratorTest",
  cases: [
    {
      name: "SelfContainedData",
      execute: () => {
        // Prepare
        let importer = new Importer();
        let contentList = new Array<string>();
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public isMessage(): boolean {
            counter.increment("isMessage");
            return false;
          }
        })();

        // Execute
        generateMessageDescriptor(
          {
            name: "BasicData",
            fields: [
              {
                name: "numberField",
                type: "number",
              },
              {
                name: "stringField",
                type: "string",
              },
              {
                name: "booleanField",
                type: "boolean",
              },
              {
                name: "numberArrayField",
                type: "number",
                isArray: true,
              },
              {
                name: "stringArrayField",
                type: "string",
                isArray: true,
              },
              {
                name: "booleanArrayField",
                type: "boolean",
                isArray: true,
              },
            ],
          },
          typeCheckerMock,
          importer,
          contentList
        );

        // Verify
        assertThat(
          contentList.join(""),
          eq(`
export interface BasicData {
  numberField?: number,
  stringField?: string,
  booleanField?: boolean,
  numberArrayField?: Array<number>,
  stringArrayField?: Array<string>,
  booleanArrayField?: Array<boolean>,
}

export let BASIC_DATA: MessageDescriptor<BasicData> = {
  name: 'BasicData',
  factoryFn: () => {
    return new Object();
  },
  fields: [
    {
      name: 'numberField',
      primitiveType: PrimitiveType.NUMBER,
    },
    {
      name: 'stringField',
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'booleanField',
      primitiveType: PrimitiveType.BOOLEAN,
    },
    {
      name: 'numberArrayField',
      primitiveType: PrimitiveType.NUMBER,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
    {
      name: 'stringArrayField',
      primitiveType: PrimitiveType.STRING,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
    {
      name: 'booleanArrayField',
      primitiveType: PrimitiveType.BOOLEAN,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
  ]
};
`),
          `contentList`
        );
        assertThat(
          importer.toStringList().join(""),
          eq(
            `import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';\n`
          ),
          `importer`
        );
        assertThat(counter.get("isMessage"), eq(0), `isMessage called`);
      },
    },
    {
      name: "GenerateWithComment",
      execute: () => {
        // Prepare
        let importer = new Importer();
        let contentList = new Array<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }
        })();

        // Execute
        generateMessageDescriptor(
          {
            name: "BasicData",
            fields: [
              {
                name: "numberField",
                type: "number",
                comment: "Comment1",
              },
            ],
            comment: "Comment2\nComment3",
          },
          typeCheckerMock,
          importer,
          contentList
        );

        // Verify
        assertThat(
          contentList.join(""),
          eq(`
/* Comment2
Comment3 */
export interface BasicData {
/* Comment1 */
  numberField?: number,
}

export let BASIC_DATA: MessageDescriptor<BasicData> = {
  name: 'BasicData',
  factoryFn: () => {
    return new Object();
  },
  fields: [
    {
      name: 'numberField',
      primitiveType: PrimitiveType.NUMBER,
    },
  ]
};
`),
          `contentList`
        );
        assertThat(
          importer.toStringList().join(""),
          eq(
            `import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';\n`
          ),
          `importer`
        );
      },
    },
    {
      name: "NestedAndExtendedObjects",
      execute: () => {
        // Prepare
        let importer = new Importer();
        let contentList = new Array<string>();
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public isMessage(typeName: string, importPath?: string): boolean {
            counter.increment("isMessage");
            switch (counter.get("isMessage")) {
              case 1:
                assertThat(typeName, eq("BasicData"), `1st typeName`);
                assertThat(importPath, eq(undefined), `1st importPath`);
                return true;
              case 2:
                assertThat(typeName, eq("BasicData2"), `2nd typeName`);
                assertThat(importPath, eq("./some_file"), `2nd importPath`);
                return true;
              case 3:
                assertThat(typeName, eq("TestEnum"), `3rd typeName`);
                assertThat(importPath, eq(undefined), `3rd importPath`);
                return false;
              case 4:
                assertThat(typeName, eq("BasicData"), `4th typeName`);
                assertThat(importPath, eq(undefined), `4th importPath`);
                return true;
              case 5:
                assertThat(typeName, eq("TestEnum"), `5th typeName`);
                assertThat(importPath, eq(undefined), `5th importPath`);
                return false;
              default:
                throw new Error("Unpexpected");
            }
          }
        })();

        // Execute
        generateMessageDescriptor(
          {
            name: "NestedAndExtended",
            fields: [
              {
                name: "basicData",
                type: "BasicData",
              },
              {
                name: "basicData2",
                type: "BasicData2",
                import: "./some_file",
              },
              {
                name: "testEnum",
                type: "TestEnum",
              },
              {
                name: "basicDataArray",
                type: "BasicData",
                isArray: true,
              },
              {
                name: "enumArray",
                type: "TestEnum",
                isArray: true,
              },
            ],
            extends: [
              {
                name: "Base",
              },
              {
                name: "Base2",
                import: "./base_file",
              },
            ],
          },
          typeCheckerMock,
          importer,
          contentList
        );

        // Verify
        assertThat(
          contentList.join(""),
          eq(`
export interface NestedAndExtended extends Base, Base2 {
  basicData?: BasicData,
  basicData2?: BasicData2,
  testEnum?: TestEnum,
  basicDataArray?: Array<BasicData>,
  enumArray?: Array<TestEnum>,
}

export let NESTED_AND_EXTENDED: MessageDescriptor<NestedAndExtended> = {
  name: 'NestedAndExtended',
  factoryFn: () => {
    return new Object();
  },
  fields: [
    ...BASE.fields,
    ...BASE2.fields,
    {
      name: 'basicData',
      messageDescriptor: BASIC_DATA,
    },
    {
      name: 'basicData2',
      messageDescriptor: BASIC_DATA2,
    },
    {
      name: 'testEnum',
      enumDescriptor: TEST_ENUM,
    },
    {
      name: 'basicDataArray',
      messageDescriptor: BASIC_DATA,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
    {
      name: 'enumArray',
      enumDescriptor: TEST_ENUM,
      arrayFactoryFn: () => {
        return new Array<any>();
      },
    },
  ]
};
`),
          `contentList`
        );
        assertThat(
          importer.toStringList().join(""),
          eq(`import { MessageDescriptor } from '@selfage/message/descriptor';
import { Base2, BASE2 } from './base_file';
import { BasicData2, BASIC_DATA2 } from './some_file';
`),
          `importer`
        );
        assertThat(counter.get("isMessage"), eq(5), "isMessage called");
      },
    },
  ],
});
