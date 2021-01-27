import { MessageDefinition } from "./definition";
import { Importer } from "./importer";
import { TypeChecker } from "./type_checker";
import { generateComment, toCapitalized, toUpperSnaked } from "./util";

// `contentList` and `importer` are expected to be modified.
export function generateObservableDescriptor(
  messageDefinition: MessageDefinition,
  typeChecker: TypeChecker,
  importer: Importer,
  contentList: Array<string>
): void {
  let messageName = messageDefinition.name;
  contentList.push(`${generateComment(messageDefinition.comment)}
export class ${messageName}`);
  if (messageDefinition.extends) {
    contentList.push(" extends");
    contentList.push(
      messageDefinition.extends
        .map((ext) => {
          return ext.name;
        })
        .join(", ")
    );
  }
  contentList.push(` {`);
  for (let field of messageDefinition.fields) {
    let fieldTypeName: string;
    if (field.isArray) {
      importer.importFromObservableArray("ObservableArray");
      fieldTypeName = `ObservableArray<${field.type}>`;
    } else {
      fieldTypeName = field.type;
    }
    contentList.push(`${generateComment(field.comment)}
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
  contentList.push(`
  public toJSON(): Object {
    return {`);
  for (let field of messageDefinition.fields) {
    contentList.push(`
      ${field.name}: this.${field.name},`);
  }
  contentList.push(`
    };
  }
}
`);

  importer.importFromMessageDescriptor("MessageDescriptor");
  let descriptorName = toUpperSnaked(messageName);
  contentList.push(`
export let ${descriptorName}: MessageDescriptor<${messageName}> = {
  name: '${messageName}',
  factoryFn: () => {
    return new ${messageName}();
  },
  fields: [`);
  if (messageDefinition.extends) {
    for (let ext of messageDefinition.extends) {
      let extDescriptorName = toUpperSnaked(ext.name);
      importer.importFromPath(ext.import, ext.name, extDescriptorName);
      contentList.push(`
    ...${extDescriptorName}.fields,`);
    }
  }
  for (let field of messageDefinition.fields) {
    contentList.push(`
    {
      name: '${field.name}',`);
    let { isPrimitive, isEnum, isMessage } = typeChecker.categorizeType(
      field.type,
      field.import
    );
    if (isPrimitive) {
      importer.importFromMessageDescriptor("PrimitiveType");
      contentList.push(`
      primitiveType: PrimitiveType.${field.type.toUpperCase()},`);
    } else if (isEnum) {
      let enumDescriptorName = toUpperSnaked(field.type);
      importer.importFromPath(field.import, field.type, enumDescriptorName);
      contentList.push(`
      enumDescriptor: ${enumDescriptorName},`);
    } else if (isMessage) {
      let messageDescriptorName = toUpperSnaked(field.type);
      importer.importFromPath(field.import, field.type, messageDescriptorName);
      contentList.push(`
      messageDescriptor: ${messageDescriptorName},`);
    }
    if (field.isArray) {
      contentList.push(`
      observableArrayFactoryFn: () => {
        return new ObservableArray<any>();
      },`);
    }
    contentList.push(`
    },`);
  }
  contentList.push(`
  ]
};
`);
}
