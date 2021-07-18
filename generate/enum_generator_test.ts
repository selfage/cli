import { generateEnumDescriptor } from "./enum_generator";
import { OutputContent } from "./output_content";
import { assertThat, eq } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "EnumGeneratorTest",
  cases: [
    {
      name: "GenerateMultipleValues",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();

        // Execute
        generateEnumDescriptor(
          "some_file",
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
          contentMap
        );

        // Verify
        assertThat(
          contentMap.get("some_file").toString(),
          eq(`import { EnumDescriptor } from '@selfage/message/descriptor';

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
          "outputContent"
        );
      },
    },
    {
      name: "GenerateWithComment",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();

        // Execute
        generateEnumDescriptor(
          "some_file",
          {
            name: "Color",
            values: [{ name: "RED", value: 1, comment: "Red!" }],
            comment: "Pick!",
          },
          contentMap
        );

        // Verify
        assertThat(
          contentMap.get("some_file").toString(),
          eq(`import { EnumDescriptor } from '@selfage/message/descriptor';

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
          `outputContent`
        );
      },
    },
  ],
});
