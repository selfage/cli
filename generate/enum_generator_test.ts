import { generateEnumDescriptor } from "./enum_generator";
import { Importer } from "./importer";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "EnumGeneratorTest",
  cases: [
    {
      name: "GenerateMultipleValues",
      execute: () => {
        // Prepare
        let importer = new Importer();
        let contentList = new Array<string>();

        // Execute
        generateEnumDescriptor(
          {
            name: "Color",
            values: [
              {
                name: "RED",
                value: 12,
              },
              {
                name: "BLUE",
                value: 1,
              },
            ],
          },
          importer,
          contentList
        );

        // Verify
        assertThat(
          contentList.join(""),
          eq(`
export enum Color {
  RED = 12,
  BLUE = 1,
}

export let COLOR: EnumDescriptor<Color> = {
  name: 'Color',
  values: [
    {
      name: 'RED',
      value: 12,
    },
    {
      name: 'BLUE',
      value: 1,
    },
  ]
}
`),
          "contentList"
        );
        assertThat(
          importer.toStringList().join(""),
          eq(`import { EnumDescriptor } from '@selfage/message/descriptor';\n`),
          "importer"
        );
      },
    },
    {
      name: "GenerateWithComment",
      execute: () => {
        // Prepare
        let importer = new Importer();
        let contentList = new Array<string>();

        // Execute
        generateEnumDescriptor(
          {
            name: "Color",
            values: [{ name: "RED", value: 1, comment: "Red!" }],
            comment: "Pick!",
          },
          importer,
          contentList
        );

        // Verify
        assertThat(
          contentList.join(""),
          eq(`
/* Pick! */
export enum Color {
/* Red! */
  RED = 1,
}

export let COLOR: EnumDescriptor<Color> = {
  name: 'Color',
  values: [
    {
      name: 'RED',
      value: 1,
    },
  ]
}
`),
          `contentList`
        );
        assertThat(
          importer.toStringList().join(""),
          eq(`import { EnumDescriptor } from '@selfage/message/descriptor';\n`),
          `importer`
        );
      },
    },
  ],
});
