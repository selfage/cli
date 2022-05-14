import { Definition } from "./definition";
import { MockTypeChecker } from "./mocks";
import { OutputContentBuilder } from "./output_content_builder";
import { generateServiceDescriptor } from "./service_generator";
import { assertThat, eq } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "ServiceGeneratorTest",
  cases: [
    {
      name: "GenerateUnauthedService",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContentBuilder>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public getDefinition(
            typeName: string,
            importPath?: string
          ): Definition {
            this.called.increment("getDefinition");
            assertThat(typeName, eq("GetCommentsRequest"), `typeName`);
            assertThat(importPath, eq(undefined), `importPath`);
            return {
              name: "GetCommentsRequest",
              message: {
                fields: [],
              },
            };
          }
        })();

        // Execute
        generateServiceDescriptor(
          "./some_file",
          "GetComments",
          {
            path: "/get_comments",
            request: "GetCommentsRequest",
            response: "GetCommentsResponse",
          },
          mockTypeChecker,
          contentMap
        );

        // Verify
        assertThat(
          mockTypeChecker.called.get("getDefinition"),
          eq(1),
          "getDefinition called"
        );
        assertThat(
          contentMap.get("./some_file").toString(),
          eq(`import { UnauthedServiceDescriptor } from '@selfage/service_descriptor';

export let GET_COMMENTS: UnauthedServiceDescriptor<GetCommentsRequest, GetCommentsResponse> = {
  name: "GetComments",
  path: "/get_comments",
  requestDescriptor: GET_COMMENTS_REQUEST,
  responseDescriptor: GET_COMMENTS_RESPONSE,
};
`),
          "outputContent"
        );
      },
    },
    {
      name: "GenerateAuthedServiceWithImports",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContentBuilder>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public getDefinition(
            typeName: string,
            importPath?: string
          ): Definition {
            this.called.increment("getDefinition");
            assertThat(typeName, eq("GetHistoryequest"), `typeName`);
            assertThat(importPath, eq("./some_request"), `importPath`);
            return {
              name: "GetCommentsRequest",
              message: {
                fields: [
                  {
                    name: "signedSession",
                    type: "string",
                  },
                ],
              },
            };
          }
        })();

        // Execute
        generateServiceDescriptor(
          "./some_file",
          "GetHistory",
          {
            path: "/get_history",
            request: "GetHistoryequest",
            importRequest: "./some_request",
            response: "GetHistoryResponse",
            importResponse: "./some_response",
          },
          mockTypeChecker,
          contentMap
        );

        // Verify
        assertThat(
          mockTypeChecker.called.get("getDefinition"),
          eq(1),
          "getDefinition called"
        );
        assertThat(
          contentMap.get("./some_file").toString(),
          eq(`import { AuthedServiceDescriptor } from '@selfage/service_descriptor';
import { GetHistoryequest, GET_HISTORYEQUEST } from './some_request';
import { GetHistoryResponse, GET_HISTORY_RESPONSE } from './some_response';

export let GET_HISTORY: AuthedServiceDescriptor<GetHistoryequest, GetHistoryResponse> = {
  name: "GetHistory",
  path: "/get_history",
  requestDescriptor: GET_HISTORYEQUEST,
  responseDescriptor: GET_HISTORY_RESPONSE,
};
`),
          "outputContent"
        );
      },
    },
  ],
});
