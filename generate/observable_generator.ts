import { MessageDefinition } from "./definition";
import { OutputContent } from "./output_content";
import { TypeChecker } from "./type_checker";
import { generateComment, toUpperSnaked } from "./util";

export function generateObservableDescriptor(
  modulePath: string,
  messageDefinition: MessageDefinition,
  typeChecker: TypeChecker,
  contentMap: Map<string, OutputContent>
): void {
  let outputContent = OutputContent.get(contentMap, modulePath);
  let messageName = messageDefinition.name;
  outputContent.push(`
export interface ${messageName} {`);
  for (let field of messageDefinition.fields) {
    let fieldTypeName: string;
    if (field.isArray) {
      outputContent.importFromObservableArray("ObservableArray");
      fieldTypeName = `ObservableArray<${field.type}>`;
    } else {
      fieldTypeName = field.type;
    }
    outputContent.push(`
  on(event: '${field.name}', listener: (newValue: ${fieldTypeName}, oldValue: ${fieldTypeName}) => void): this;`);
  }
  outputContent.push(`
}
`);

  outputContent.importFromPath("events", "EventEmitter");
  outputContent.push(`${generateComment(messageDefinition.comment)}
export class ${messageName} extends EventEmitter {`);
  for (let field of messageDefinition.fields) {
    let fieldTypeName: string;
    if (field.isArray) {
      fieldTypeName = `ObservableArray<${field.type}>`;
    } else {
      fieldTypeName = field.type;
    }
    outputContent.push(`${generateComment(field.comment)}
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
  outputContent.push(`
  public triggerAllFields(): void {`);
  for (let field of messageDefinition.fields) {
    outputContent.push(`
    this.emit('${field.name}', this.${field.name}_, this.${field.name}_);`);
  }
  outputContent.push(`
  }
`);
  outputContent.push(`
  public toJSON(): Object {
    return {`);
  for (let field of messageDefinition.fields) {
    outputContent.push(`
      ${field.name}: this.${field.name},`);
  }
  outputContent.push(`
    };
  }
}
`);

  outputContent.importFromMessageDescriptor("MessageDescriptor");
  let descriptorName = toUpperSnaked(messageName);
  outputContent.push(`
export let ${descriptorName}: MessageDescriptor<${messageName}> = {
  name: '${messageName}',
  factoryFn: () => {
    return new ${messageName}();
  },
  fields: [`);
  for (let field of messageDefinition.fields) {
    outputContent.push(`
    {
      name: '${field.name}',`);
    let { isPrimitive, isEnum, isMessage } = typeChecker.categorizeType(
      field.type,
      field.import
    );
    if (isPrimitive) {
      outputContent.importFromMessageDescriptor("PrimitiveType");
      outputContent.push(`
      primitiveType: PrimitiveType.${field.type.toUpperCase()},`);
    } else if (isEnum) {
      let enumDescriptorName = toUpperSnaked(field.type);
      outputContent.importFromPath(
        field.import,
        field.type,
        enumDescriptorName
      );
      outputContent.push(`
      enumDescriptor: ${enumDescriptorName},`);
    } else if (isMessage) {
      let messageDescriptorName = toUpperSnaked(field.type);
      outputContent.importFromPath(
        field.import,
        field.type,
        messageDescriptorName
      );
      outputContent.push(`
      messageDescriptor: ${messageDescriptorName},`);
    }
    if (field.isArray) {
      outputContent.push(`
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },`);
    }
    outputContent.push(`
    },`);
  }
  outputContent.push(`
  ]
};
`);
}
