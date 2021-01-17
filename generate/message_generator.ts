import { MessageDefinition } from "./definition";
import { Importer } from "./importer";
import { TypeChecker } from "./type_checker";
import { flattenFieldType, generateComment, toUpperSnaked } from "./util";

// `contentList` and `importer` are expected to be modified.
export function generateMessageDescriptor(
  messageDefinition: MessageDefinition,
  typeChecker: TypeChecker,
  importer: Importer,
  contentList: Array<string>
): void {
  let messageName = messageDefinition.name;
  contentList.push(`${generateComment(messageDefinition.comment)}
export interface ${messageName}`);
  if (messageDefinition.extends) {
    contentList.push(" extends ");
    contentList.push(
      messageDefinition.extends
        .map((ext) => {
          return ext.name;
        })
        .join(", ")
    );
  }
  contentList.push(" {");
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
    let { primitiveTypeName, enumTypeName, messageTypeName } = flattenFieldType(
      typeChecker,
      field.type,
      field.import
    );
    if (primitiveTypeName) {
      importer.importFromMessageDescriptor("PrimitiveType");
      contentList.push(`
      primitiveType: PrimitiveType.${primitiveTypeName.toUpperCase()},`);
    } else if (enumTypeName) {
      let enumDescriptorName = toUpperSnaked(enumTypeName);
      importer.importFromPath(field.import, enumTypeName, enumDescriptorName);
      contentList.push(`
      enumDescriptor: ${enumDescriptorName},`);
    } else if (messageTypeName) {
      let messageDescriptorName = toUpperSnaked(messageTypeName);
      importer.importFromPath(
        field.import,
        messageTypeName,
        messageDescriptorName
      );
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
