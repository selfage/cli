import { MessageDefinition } from "./definition";
import { OutputContent } from "./output_content";
import { TypeChecker } from "./type_checker";
import { generateComment, toCapitalized, toUpperSnaked } from "./util";

export function generateObservableDescriptor(
  modulePath: string,
  messageDefinition: MessageDefinition,
  typeChecker: TypeChecker,
  contentMap: Map<string, OutputContent>
): void {
  let outputContent = OutputContent.get(contentMap, modulePath);
  let messageName = messageDefinition.name;
  outputContent.push(`${generateComment(messageDefinition.comment)}
export class ${messageName} {`);
  for (let field of messageDefinition.fields) {
    let fieldTypeName: string;
    if (field.isArray) {
      outputContent.importFromObservableArray("ObservableArray");
      fieldTypeName = `ObservableArray<${field.type}>`;
    } else {
      fieldTypeName = field.type;
    }
    outputContent.push(`${generateComment(field.comment)}
  public on${toCapitalized(
    field.name
  )}Change: (newValue: ${fieldTypeName}, oldValue: ${fieldTypeName}) => void;
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
    if (this.on${toCapitalized(field.name)}Change) {
      this.on${toCapitalized(field.name)}Change(this.${field.name}_, oldValue);
    }
  }
`);
  }
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
