import { EnumDefinition } from "./definition";
import { OutputContent } from "./output_content";
import { generateComment, toUpperSnaked } from "./util";

export function generateEnumDescriptor(
  modulePath: string,
  enumName: string,
  enumDefinition: EnumDefinition,
  contentMap: Map<string, OutputContent>
): void {
  let outputContent = OutputContent.get(contentMap, modulePath);
  outputContent.push(`${generateComment(enumDefinition.comment)}
export enum ${enumName} {`);
  for (let value of enumDefinition.values) {
    outputContent.push(`${generateComment(value.comment)}
  ${value.name} = ${value.value},`);
  }
  outputContent.push(`
}
`);

  outputContent.importFromMessageDescriptor("EnumDescriptor");
  let descriptorName = toUpperSnaked(enumName);
  outputContent.push(`
export let ${descriptorName}: EnumDescriptor<${enumName}> = {
  name: '${enumName}',
  values: [`);
  for (let value of enumDefinition.values) {
    outputContent.push(`
    {
      name: '${value.name}',
      value: ${value.value},
    },`);
  }
  outputContent.push(`
  ]
}
`);
}
