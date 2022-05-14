import { generateMessageDescriptor } from "./message_generator";
import { MockTypeChecker } from "./mocks";
import { OutputContentBuilder } from "./output_content_builder";
import { assertThat, eq } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "MessageGeneratorTest",
  cases: [
    {
      name: "SelfContainedData",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContentBuilder>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public categorizeType() {
            return { isPrimitive: true };
          }
        })();

        // Execute
        generateMessageDescriptor(
          "some_file",
          "BasicData",
          {
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
          mockTypeChecker,
          contentMap
        );

        // Verify
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
        let contentMap = new Map<string, OutputContentBuilder>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public categorizeType() {
            return { isPrimitive: true };
          }
        })();

        // Execute
        generateMessageDescriptor(
          "some_file",
          "BasicData",
          {
            fields: [
              {
                name: "numberField",
                type: "number",
                comment: "Comment1",
              },
            ],
            comment: "Comment2\nComment3",
          },
          mockTypeChecker,
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
        let contentMap = new Map<string, OutputContentBuilder>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public categorizeType(typeName: string, importPath?: string) {
            switch (this.called.increment("categorizeType")) {
              case 1:
                assertThat(typeName, eq("BasicData"), `1st typeName`);
                assertThat(importPath, eq(undefined), `1st importPath`);
                return { isMessage: true };
              case 2:
                assertThat(typeName, eq("BasicData2"), `2nd typeName`);
                assertThat(importPath, eq("./another_file"), `2nd importPath`);
                return { isMessage: true };
              case 3:
                assertThat(typeName, eq("TestEnum"), `3rd typeName`);
                assertThat(importPath, eq(undefined), `3rd importPath`);
                return { isEnum: true };
              case 4:
                assertThat(typeName, eq("BasicData"), `4th typeName`);
                assertThat(importPath, eq(undefined), `4th importPath`);
                return { isMessage: true };
              case 5:
                assertThat(typeName, eq("TestEnum"), `5th typeName`);
                assertThat(importPath, eq(undefined), `5th importPath`);
                return { isEnum: true };
              default:
                throw new Error("Unpexpected");
            }
          }
        })();

        // Execute
        generateMessageDescriptor(
          "some_file",
          "NestedObj",
          {
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
          mockTypeChecker,
          contentMap
        );

        // Verify
        assertThat(
          mockTypeChecker.called.get("categorizeType"),
          eq(5),
          "categorizeType called"
        );
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
