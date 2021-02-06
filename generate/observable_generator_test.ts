import { MessageDefinition } from "./definition";
import { Importer } from "./importer";
import { generateObservableDescriptor } from "./observable_generator";
import { TypeChecker } from "./type_checker";
import { Counter } from "@selfage/counter";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "ObservableGeneratorTest",
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

          public getMessage(): MessageDefinition {
            counter.increment("getMessage");
            return undefined;
          }
        })();

        // Execute
        generateObservableDescriptor(
          {
            name: "BasicData",
            fields: [
              {
                name: "numberField",
                type: "number",
              },
              {
                name: "booleanField",
                type: "boolean",
              },
              {
                name: "stringField",
                type: "string",
              },
              {
                name: "numberArrayField",
                type: "number",
                isArray: true,
              },
              {
                name: "booleanArrayField",
                type: "boolean",
                isArray: true,
              },
              {
                name: "stringArrayField",
                type: "string",
                isArray: true,
              },
            ],
            isObservable: true,
          },
          typeCheckerMock,
          importer,
          contentList
        );

        // Verify
        assertThat(counter.get("getMessage"), eq(0), `getMessage called`);
        assertThat(
          contentList.join(""),
          eq(`
export class BasicData {
  public onNumberFieldChange: (newValue: number, oldValue: number) => void;
  private numberField_?: number;
  get numberField(): number {
    return this.numberField_;
  }
  set numberField(value: number) {
    let oldValue = this.numberField_;
    if (value === oldValue) {
      return;
    }
    this.numberField_ = value;
    if (this.onNumberFieldChange) {
      this.onNumberFieldChange(this.numberField_, oldValue);
    }
  }

  public onBooleanFieldChange: (newValue: boolean, oldValue: boolean) => void;
  private booleanField_?: boolean;
  get booleanField(): boolean {
    return this.booleanField_;
  }
  set booleanField(value: boolean) {
    let oldValue = this.booleanField_;
    if (value === oldValue) {
      return;
    }
    this.booleanField_ = value;
    if (this.onBooleanFieldChange) {
      this.onBooleanFieldChange(this.booleanField_, oldValue);
    }
  }

  public onStringFieldChange: (newValue: string, oldValue: string) => void;
  private stringField_?: string;
  get stringField(): string {
    return this.stringField_;
  }
  set stringField(value: string) {
    let oldValue = this.stringField_;
    if (value === oldValue) {
      return;
    }
    this.stringField_ = value;
    if (this.onStringFieldChange) {
      this.onStringFieldChange(this.stringField_, oldValue);
    }
  }

  public onNumberArrayFieldChange: (newValue: ObservableArray<number>, oldValue: ObservableArray<number>) => void;
  private numberArrayField_?: ObservableArray<number>;
  get numberArrayField(): ObservableArray<number> {
    return this.numberArrayField_;
  }
  set numberArrayField(value: ObservableArray<number>) {
    let oldValue = this.numberArrayField_;
    if (value === oldValue) {
      return;
    }
    this.numberArrayField_ = value;
    if (this.onNumberArrayFieldChange) {
      this.onNumberArrayFieldChange(this.numberArrayField_, oldValue);
    }
  }

  public onBooleanArrayFieldChange: (newValue: ObservableArray<boolean>, oldValue: ObservableArray<boolean>) => void;
  private booleanArrayField_?: ObservableArray<boolean>;
  get booleanArrayField(): ObservableArray<boolean> {
    return this.booleanArrayField_;
  }
  set booleanArrayField(value: ObservableArray<boolean>) {
    let oldValue = this.booleanArrayField_;
    if (value === oldValue) {
      return;
    }
    this.booleanArrayField_ = value;
    if (this.onBooleanArrayFieldChange) {
      this.onBooleanArrayFieldChange(this.booleanArrayField_, oldValue);
    }
  }

  public onStringArrayFieldChange: (newValue: ObservableArray<string>, oldValue: ObservableArray<string>) => void;
  private stringArrayField_?: ObservableArray<string>;
  get stringArrayField(): ObservableArray<string> {
    return this.stringArrayField_;
  }
  set stringArrayField(value: ObservableArray<string>) {
    let oldValue = this.stringArrayField_;
    if (value === oldValue) {
      return;
    }
    this.stringArrayField_ = value;
    if (this.onStringArrayFieldChange) {
      this.onStringArrayFieldChange(this.stringArrayField_, oldValue);
    }
  }

  public toJSON(): Object {
    return {
      numberField: this.numberField,
      booleanField: this.booleanField,
      stringField: this.stringField,
      numberArrayField: this.numberArrayField,
      booleanArrayField: this.booleanArrayField,
      stringArrayField: this.stringArrayField,
    };
  }
}

export let BASIC_DATA: MessageDescriptor<BasicData> = {
  name: 'BasicData',
  factoryFn: () => {
    return new BasicData();
  },
  fields: [
    {
      name: 'numberField',
      primitiveType: PrimitiveType.NUMBER,
    },
    {
      name: 'booleanField',
      primitiveType: PrimitiveType.BOOLEAN,
    },
    {
      name: 'stringField',
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'numberArrayField',
      primitiveType: PrimitiveType.NUMBER,
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },
    },
    {
      name: 'booleanArrayField',
      primitiveType: PrimitiveType.BOOLEAN,
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },
    },
    {
      name: 'stringArrayField',
      primitiveType: PrimitiveType.STRING,
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },
    },
  ]
};
`),
          `contentList`
        );
        assertThat(
          importer.toStringList().join(""),
          eq(`import { ObservableArray } from '@selfage/observable_array';
import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';
`),
          `importer`
        );
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
        generateObservableDescriptor(
          {
            name: "WithComment",
            fields: [
              {
                name: "numberField",
                type: "number",
                comment: "Comment1",
              },
            ],
            comment: "Comment2",
          },
          typeCheckerMock,
          importer,
          contentList
        );

        // Verify
        assertThat(
          contentList.join(""),
          eq(`
/* Comment2 */
export class WithComment {
/* Comment1 */
  public onNumberFieldChange: (newValue: number, oldValue: number) => void;
  private numberField_?: number;
  get numberField(): number {
    return this.numberField_;
  }
  set numberField(value: number) {
    let oldValue = this.numberField_;
    if (value === oldValue) {
      return;
    }
    this.numberField_ = value;
    if (this.onNumberFieldChange) {
      this.onNumberFieldChange(this.numberField_, oldValue);
    }
  }

  public toJSON(): Object {
    return {
      numberField: this.numberField,
    };
  }
}

export let WITH_COMMENT: MessageDescriptor<WithComment> = {
  name: 'WithComment',
  factoryFn: () => {
    return new WithComment();
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
      name: "NestedObjects",
      execute: () => {
        // Prepare
        let importer = new Importer();
        let contentList = new Array<string>();
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
                assertThat(importPath, eq("./some_file"), `2nd importPath`);
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
                throw new Error(`Unexpected.`);
            }
          }
        })();

        // Execute
        generateObservableDescriptor(
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
            isObservable: true,
          },
          typeCheckerMock,
          importer,
          contentList
        );

        // Verify
        assertThat(counter.get("getMessage"), eq(5), "getMessage called");
        assertThat(
          contentList.join(""),
          eq(`
export class NestedObj {
  public onBasicDataChange: (newValue: BasicData, oldValue: BasicData) => void;
  private basicData_?: BasicData;
  get basicData(): BasicData {
    return this.basicData_;
  }
  set basicData(value: BasicData) {
    let oldValue = this.basicData_;
    if (value === oldValue) {
      return;
    }
    this.basicData_ = value;
    if (this.onBasicDataChange) {
      this.onBasicDataChange(this.basicData_, oldValue);
    }
  }

  public onBasicData2Change: (newValue: BasicData2, oldValue: BasicData2) => void;
  private basicData2_?: BasicData2;
  get basicData2(): BasicData2 {
    return this.basicData2_;
  }
  set basicData2(value: BasicData2) {
    let oldValue = this.basicData2_;
    if (value === oldValue) {
      return;
    }
    this.basicData2_ = value;
    if (this.onBasicData2Change) {
      this.onBasicData2Change(this.basicData2_, oldValue);
    }
  }

  public onTestEnumChange: (newValue: TestEnum, oldValue: TestEnum) => void;
  private testEnum_?: TestEnum;
  get testEnum(): TestEnum {
    return this.testEnum_;
  }
  set testEnum(value: TestEnum) {
    let oldValue = this.testEnum_;
    if (value === oldValue) {
      return;
    }
    this.testEnum_ = value;
    if (this.onTestEnumChange) {
      this.onTestEnumChange(this.testEnum_, oldValue);
    }
  }

  public onBasicDataArrayChange: (newValue: ObservableArray<BasicData>, oldValue: ObservableArray<BasicData>) => void;
  private basicDataArray_?: ObservableArray<BasicData>;
  get basicDataArray(): ObservableArray<BasicData> {
    return this.basicDataArray_;
  }
  set basicDataArray(value: ObservableArray<BasicData>) {
    let oldValue = this.basicDataArray_;
    if (value === oldValue) {
      return;
    }
    this.basicDataArray_ = value;
    if (this.onBasicDataArrayChange) {
      this.onBasicDataArrayChange(this.basicDataArray_, oldValue);
    }
  }

  public onEnumArrayChange: (newValue: ObservableArray<TestEnum>, oldValue: ObservableArray<TestEnum>) => void;
  private enumArray_?: ObservableArray<TestEnum>;
  get enumArray(): ObservableArray<TestEnum> {
    return this.enumArray_;
  }
  set enumArray(value: ObservableArray<TestEnum>) {
    let oldValue = this.enumArray_;
    if (value === oldValue) {
      return;
    }
    this.enumArray_ = value;
    if (this.onEnumArrayChange) {
      this.onEnumArrayChange(this.enumArray_, oldValue);
    }
  }

  public toJSON(): Object {
    return {
      basicData: this.basicData,
      basicData2: this.basicData2,
      testEnum: this.testEnum,
      basicDataArray: this.basicDataArray,
      enumArray: this.enumArray,
    };
  }
}

export let NESTED_OBJ: MessageDescriptor<NestedObj> = {
  name: 'NestedObj',
  factoryFn: () => {
    return new NestedObj();
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
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },
    },
    {
      name: 'enumArray',
      enumDescriptor: TEST_ENUM,
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },
    },
  ]
};
`),
          `contentList`
        );
        assertThat(
          importer.toStringList().join(""),
          eq(`import { ObservableArray } from '@selfage/observable_array';
import { MessageDescriptor } from '@selfage/message/descriptor';
import { BasicData2, BASIC_DATA2 } from './some_file';
`),
          `importer`
        );
      },
    },
  ],
});
