import { MessageDefinition } from "./definition";
import { OutputContent } from "./output_content";
import { TypeChecker } from "./type_checker";
import { generateComment, toUpperSnaked } from "./util";

export function generateMessageDescriptor(
  modulePath: string,
  messageName: string,
  messageDefinition: MessageDefinition,
  typeChecker: TypeChecker,
  contentMap: Map<string, OutputContent>
): void {
  let outputContent = OutputContent.get(contentMap, modulePath);
  outputContent.push(`${generateComment(messageDefinition.comment)}
export interface ${messageName} {`);
  for (let field of messageDefinition.fields) {
    let fieldTypeName: string;
    if (field.isArray) {
      fieldTypeName = `Array<${field.type}>`;
    } else {
      fieldTypeName = field.type;
    }
    outputContent.push(`${generateComment(field.comment)}
  ${field.name}?: ${fieldTypeName},`);
  }
  outputContent.push(`
}
`);

  outputContent.importFromMessageDescriptor("MessageDescriptor");
  let descriptorName = toUpperSnaked(messageName);
  outputContent.push(`
export let ${descriptorName}: MessageDescriptor<${messageName}> = {
  name: '${messageName}',
  factoryFn: () => {
    return new Object();
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
      arrayFactoryFn: () => {
        return new Array<any>();
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
