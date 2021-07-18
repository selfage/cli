import { MessageDefinition } from "./definition";
import { generateMessageDescriptor } from "./message_generator";
import { OutputContent } from "./output_content";
import { TypeChecker } from "./type_checker";
import { Counter } from "@selfage/counter";
import { assertThat, eq } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "MessageGeneratorTest",
  cases: [
    {
      name: "SelfContainedData",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();
        let counter = new Counter<string>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }

          public getMessage(): MessageDefinition {
            counter.increment("getMessage");
            return undefined;
          }
        })();

        // Execute
        generateMessageDescriptor(
          "some_file",
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
          contentMap
        );

        // Verify
        assertThat(counter.get("getMessage"), eq(0), `getMessage called`);
        assertThat(
          contentMap.get("some_file").toString(),
          eq(`import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';

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
          `outputContent`
        );
      },
    },
    {
      name: "GenerateWithComment",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();
        let typeCheckerMock = new (class extends TypeChecker {
          constructor() {
            super("");
          }
        })();

        // Execute
        generateMessageDescriptor(
          "some_file",
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
          contentMap
        );

        // Verify
        assertThat(
          contentMap.get("some_file").toString(),
          eq(`import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';

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
          `outputContent`
        );
      },
    },
    {
      name: "NestedObjects",
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
            counter.increment("getMessage");
            switch (counter.get("getMessage")) {
              case 1:
                assertThat(typeName, eq("BasicData"), `1st typeName`);
                assertThat(importPath, eq(undefined), `1st importPath`);
                return { name: "any", fields: [] };
              case 2:
                assertThat(typeName, eq("BasicData2"), `2nd typeName`);
                assertThat(importPath, eq("./another_file"), `2nd importPath`);
                return { name: "any", fields: [] };
              case 3:
                assertThat(typeName, eq("TestEnum"), `3rd typeName`);
                assertThat(importPath, eq(undefined), `3rd importPath`);
                return undefined;
              case 4:
                assertThat(typeName, eq("BasicData"), `4th typeName`);
                assertThat(importPath, eq(undefined), `4th importPath`);
                return { name: "any", fields: [] };
              case 5:
                assertThat(typeName, eq("TestEnum"), `5th typeName`);
                assertThat(importPath, eq(undefined), `5th importPath`);
                return undefined;
              default:
                throw new Error("Unpexpected");
            }
          }
        })();

        // Execute
        generateMessageDescriptor(
          "some_file",
          {
            name: "NestedObj",
            fields: [
              {
                name: "basicData",
                type: "BasicData",
              },
              {
                name: "basicData2",
                type: "BasicData2",
                import: "./another_file",
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
          },
          typeCheckerMock,
          contentMap
        );

        // Verify
        assertThat(counter.get("getMessage"), eq(5), "getMessage called");
        assertThat(
          contentMap.get("some_file").toString(),
          eq(`import { MessageDescriptor } from '@selfage/message/descriptor';
import { BasicData2, BASIC_DATA2 } from './another_file';

export interface NestedObj {
  basicData?: BasicData,
  basicData2?: BasicData2,
  testEnum?: TestEnum,
  basicDataArray?: Array<BasicData>,
  enumArray?: Array<TestEnum>,
}

export let NESTED_OBJ: MessageDescriptor<NestedObj> = {
  name: 'NestedObj',
  factoryFn: () => {
    return new Object();
  },
  fields: [
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
          `outputContent`
        );
      },
    },
  ],
});
