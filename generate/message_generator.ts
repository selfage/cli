import { MessageDefinition } from "./definition";
import { OutputContentBuilder } from "./output_content_builder";
import { TypeChecker } from "./type_checker";
import { generateComment, toUpperSnaked } from "./util";

export function generateMessageDescriptor(
  modulePath: string,
  messageName: string,
  messageDefinition: MessageDefinition,
  typeChecker: TypeChecker,
  contentMap: Map<string, OutputContentBuilder>
): void {
  let outputContentBuilder = OutputContentBuilder.get(contentMap, modulePath);
  outputContentBuilder.push(`${generateComment(messageDefinition.comment)}
export interface ${messageName} {`);
  for (let field of messageDefinition.fields) {
    let fieldTypeName: string;
    if (field.isArray) {
      fieldTypeName = `Array<${field.type}>`;
    } else {
      fieldTypeName = field.type;
    }
    outputContentBuilder.push(`${generateComment(field.comment)}
  ${field.name}?: ${fieldTypeName},`);
  }
  outputContentBuilder.push(`
}
`);

  outputContentBuilder.importFromMessageDescriptor("MessageDescriptor");
  let descriptorName = toUpperSnaked(messageName);
  outputContentBuilder.push(`
export let ${descriptorName}: MessageDescriptor<${messageName}> = {
  name: '${messageName}',
  factoryFn: () => {
    return new Object();
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
      arrayFactoryFn: () => {
        return new Array<any>();
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
