import { MessageDefinition } from "./definition";
import { Importer } from "./importer";
import { TypeChecker } from "./type_checker";
import { generateComment, toUpperSnaked } from "./util";

// `contentList` and `importer` are expected to be modified.
export function generateMessageDescriptor(
  messageDefinition: MessageDefinition,
  typeChecker: TypeChecker,
  importer: Importer,
  contentList: Array<string>
): void {
  let messageName = messageDefinition.name;
  contentList.push(`${generateComment(messageDefinition.comment)}
export interface ${messageName} {`);
  for (let field of messageDefinition.fields) {
    let fieldTypeName: string;
    if (field.isArray) {
      fieldTypeName = `Array<${field.type}>`;
    } else {
      fieldTypeName = field.type;
    }
    contentList.push(`${generateComment(field.comment)}
  ${field.name}?: ${fieldTypeName},`);
  }
  contentList.push(`
}
`);

  importer.importFromMessageDescriptor("MessageDescriptor");
  let descriptorName = toUpperSnaked(messageName);
  contentList.push(`
export let ${descriptorName}: MessageDescriptor<${messageName}> = {
  name: '${messageName}',
  factoryFn: () => {
    return new Object();
  },
  fields: [`);
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
      arrayFactoryFn: () => {
        return new Array<any>();
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
