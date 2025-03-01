import { sortImports } from "./formatter";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "FormatterTest",
  cases: [
    {
      name: "SortWithCommentsAndClassAndLaterImports",
      execute: () => {
        // Execute
        let content = sortImports("./test_data/formatter/imports_with_body.ts");

        // Verify
        assertThat(
          content,
          eq(`// Comment0
// Comment10
// Comment12
// Comment 11
// Comment1
// comment 2
import 'ts';
import 'tsts';
import ts = require('ts');
import ts = require('typescript');
import a from 'a';
import b from 'b';
import c from 'c';
import ts from 'typescript';
import tss from 'typescripttypescript';
import * as ts from 'typescript';
import * as tss from 'typescripttypescript';
import { TestColor2 as TestColor,TestObject,TestObjectObject } from './test_interface';
import { TestObject } from './test_interface/ts';
import { a,b,d,e,f,g,i,z } from 'alphbet';

// Comment 3
class X {
}

import fs = require('fs');
`),
          "content",
        );
      },
    },
    {
      name: "SortImportsOnly",
      execute: () => {
        // Execute
        let content = sortImports("./test_data/formatter/imports_only.ts");

        // Verify
        assertThat(
          content,
          eq(`// Comment 1
// Comment 10
import './side_effect';
import { ast,bba } from './typescript';
`),
          "content",
        );
      },
    },
    {
      name: "SortNoImports",
      execute: () => {
        // Execute
        let content = sortImports("./test_data/formatter/no_imports.ts");

        // Verify
        assertThat(
          content,
          eq(`class A {
  public a = 10;
}
`),
          "content",
        );
      },
    },
  ],
});
