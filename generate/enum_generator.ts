import { EnumDefinition } from "./definition";
import { Importer } from "./importer";
import { generateComment, toUpperSnaked } from "./util";

// `contentList` and `importer` are expected to be modified.
export function generateEnumDescriptor(
  enumDefinition: EnumDefinition,
  importer: Importer,
  contentList: Array<string>
): void {
  let enumName = enumDefinition.name;
  contentList.push(`${generateComment(enumDefinition.comment)}
export enum ${enumName} {`);
  for (let value of enumDefinition.values) {
    contentList.push(`${generateComment(value.comment)}
  ${value.name} = ${value.value},`);
  }
  contentList.push(`
}
`);

  importer.importFromMessageDescriptor("EnumDescriptor");
  let descriptorName = toUpperSnaked(enumName);
  contentList.push(`
export let ${descriptorName}: EnumDescriptor<${enumName}> = {
  name: '${enumName}',
  values: [`);
  for (let value of enumDefinition.values) {
    contentList.push(`
    {
      name: '${value.name}',
      value: ${value.value},
    },`);
  }
  contentList.push(`
  ]
}
`);
}
