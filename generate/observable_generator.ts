import { MessageDefinition } from "./definition";
import { OutputContentBuilder } from "./output_content_builder";
import { TypeChecker } from "./type_checker";
import { generateComment, toUpperSnaked } from "./util";

export function generateObservableDescriptor(
  modulePath: string,
  messageName: string,
  messageDefinition: MessageDefinition,
  typeChecker: TypeChecker,
  contentMap: Map<string, OutputContentBuilder>
): void {
  let outputContentBuilder = OutputContentBuilder.get(contentMap, modulePath);
  outputContentBuilder.push(`
export interface ${messageName} {`);
  for (let field of messageDefinition.fields) {
    let fieldTypeName: string;
    if (field.isArray) {
      outputContentBuilder.importFromObservableArray("ObservableArray");
      fieldTypeName = `ObservableArray<${field.type}>`;
    } else {
      fieldTypeName = field.type;
    }
    outputContentBuilder.push(`
  on(event: '${field.name}', listener: (newValue: ${fieldTypeName}, oldValue: ${fieldTypeName}) => void): this;`);
  }
  outputContentBuilder.push(`
  on(event: 'init', listener: () => void): this;
}
`);

  outputContentBuilder.importFromPath("events", "EventEmitter");
  outputContentBuilder.push(`${generateComment(messageDefinition.comment)}
export class ${messageName} extends EventEmitter {`);
  for (let field of messageDefinition.fields) {
    let fieldTypeName: string;
    if (field.isArray) {
      fieldTypeName = `ObservableArray<${field.type}>`;
    } else {
      fieldTypeName = field.type;
    }
    outputContentBuilder.push(`${generateComment(field.comment)}
  private ${field.name}_?: ${fieldTypeName};
  get ${field.name}(): ${fieldTypeName} {
    return this.${field.name}_;
  }
  set ${field.name}(value: ${fieldTypeName}) {
    let oldValue = this.${field.name}_;
    if (value === oldValue) {
      return;
    }
    this.${field.name}_ = value;
    this.emit('${field.name}', this.${field.name}_, oldValue);
  }
`);
  }
  outputContentBuilder.push(`
  public triggerInitialEvents(): void {`);
  for (let field of messageDefinition.fields) {
    outputContentBuilder.push(`
    if (this.${field.name}_ !== undefined) {
      this.emit('${field.name}', this.${field.name}_, undefined);
    }`);
  }
  outputContentBuilder.push(`
    this.emit('init');
  }
`);
  outputContentBuilder.push(`
  public toJSON(): Object {
    return {`);
  for (let field of messageDefinition.fields) {
    outputContentBuilder.push(`
      ${field.name}: this.${field.name},`);
  }
  outputContentBuilder.push(`
    };
  }
}
`);

  outputContentBuilder.importFromMessageDescriptor("MessageDescriptor");
  let descriptorName = toUpperSnaked(messageName);
  outputContentBuilder.push(`
export let ${descriptorName}: MessageDescriptor<${messageName}> = {
  name: '${messageName}',
  factoryFn: () => {
    return new ${messageName}();
  },
  fields: [`);
  for (let field of messageDefinition.fields) {
    outputContentBuilder.push(`
    {
      name: '${field.name}',`);
    let { isPrimitive, isEnum, isMessage } = typeChecker.categorizeType(
      field.type,
      field.import
    );
    if (isPrimitive) {
      outputContentBuilder.importFromMessageDescriptor("PrimitiveType");
      outputContentBuilder.push(`
      primitiveType: PrimitiveType.${field.type.toUpperCase()},`);
    } else if (isEnum) {
      let enumDescriptorName = toUpperSnaked(field.type);
      outputContentBuilder.importFromPath(
        field.import,
        field.type,
        enumDescriptorName
      );
      outputContentBuilder.push(`
      enumDescriptor: ${enumDescriptorName},`);
    } else if (isMessage) {
      let messageDescriptorName = toUpperSnaked(field.type);
      outputContentBuilder.importFromPath(
        field.import,
        field.type,
        messageDescriptorName
      );
      outputContentBuilder.push(`
      messageDescriptor: ${messageDescriptorName},`);
    }
    if (field.isArray) {
      outputContentBuilder.push(`
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },`);
    }
    outputContentBuilder.push(`
    },`);
  }
  outputContentBuilder.push(`
  ]
};
`);
}
