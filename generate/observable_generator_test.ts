import { MessageDefinition } from "./definition";
import { generateObservableDescriptor } from "./observable_generator";
import { OutputContent } from "./output_content";
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
        generateObservableDescriptor(
          "some_file",
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
          contentMap
        );

        // Verify
        assertThat(counter.get("getMessage"), eq(0), `getMessage called`);
        assertThat(
          contentMap.get("some_file").toString(),
          eq(`import { ObservableArray } from '@selfage/observable_array';
import { EventEmitter } from 'events';
import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';

export interface BasicData {
  on(event: 'numberField', listener: (newValue: number, oldValue: number) => void): this;
  on(event: 'booleanField', listener: (newValue: boolean, oldValue: boolean) => void): this;
  on(event: 'stringField', listener: (newValue: string, oldValue: string) => void): this;
  on(event: 'numberArrayField', listener: (newValue: ObservableArray<number>, oldValue: ObservableArray<number>) => void): this;
  on(event: 'booleanArrayField', listener: (newValue: ObservableArray<boolean>, oldValue: ObservableArray<boolean>) => void): this;
  on(event: 'stringArrayField', listener: (newValue: ObservableArray<string>, oldValue: ObservableArray<string>) => void): this;
  on(event: string, listener: Function): this;
}

export class BasicData extends EventEmitter {
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
    this.emit('numberField', this.numberField_, oldValue);
  }

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
    this.emit('booleanField', this.booleanField_, oldValue);
  }

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
    this.emit('stringField', this.stringField_, oldValue);
  }

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
    this.emit('numberArrayField', this.numberArrayField_, oldValue);
  }

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
    this.emit('booleanArrayField', this.booleanArrayField_, oldValue);
  }

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
    this.emit('stringArrayField', this.stringArrayField_, oldValue);
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
        generateObservableDescriptor(
          "some_file",
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
          contentMap
        );

        // Verify
        assertThat(
          contentMap.get("some_file").toString(),
          eq(`import { EventEmitter } from 'events';
import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';

export interface WithComment {
  on(event: 'numberField', listener: (newValue: number, oldValue: number) => void): this;
  on(event: string, listener: Function): this;
}

/* Comment2 */
export class WithComment extends EventEmitter {
/* Comment1 */
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
    this.emit('numberField', this.numberField_, oldValue);
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
                throw new Error(`Unexpected.`);
            }
          }
        })();

        // Execute
        generateObservableDescriptor(
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
            isObservable: true,
          },
          typeCheckerMock,
          contentMap
        );

        // Verify
        assertThat(counter.get("getMessage"), eq(5), "getMessage called");
        assertThat(
          contentMap.get("some_file").toString(),
          eq(`import { ObservableArray } from '@selfage/observable_array';
import { EventEmitter } from 'events';
import { MessageDescriptor } from '@selfage/message/descriptor';
import { BasicData2, BASIC_DATA2 } from './another_file';

export interface NestedObj {
  on(event: 'basicData', listener: (newValue: BasicData, oldValue: BasicData) => void): this;
  on(event: 'basicData2', listener: (newValue: BasicData2, oldValue: BasicData2) => void): this;
  on(event: 'testEnum', listener: (newValue: TestEnum, oldValue: TestEnum) => void): this;
  on(event: 'basicDataArray', listener: (newValue: ObservableArray<BasicData>, oldValue: ObservableArray<BasicData>) => void): this;
  on(event: 'enumArray', listener: (newValue: ObservableArray<TestEnum>, oldValue: ObservableArray<TestEnum>) => void): this;
  on(event: string, listener: Function): this;
}

export class NestedObj extends EventEmitter {
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
    this.emit('basicData', this.basicData_, oldValue);
  }

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
    this.emit('basicData2', this.basicData2_, oldValue);
  }

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
    this.emit('testEnum', this.testEnum_, oldValue);
  }

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
    this.emit('basicDataArray', this.basicDataArray_, oldValue);
  }

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
    this.emit('enumArray', this.enumArray_, oldValue);
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
          `outputContent`
        );
      },
    },
  ],
});
