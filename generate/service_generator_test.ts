import { MessageDefinition } from "./definition";
import { MockTypeChecker } from "./mocks";
import { OutputContent } from "./output_content";
import { generateServiceDescriptr } from "./service_generator";
import { assertThat, eq } from "@selfage/test_matcher";
import { NODE_TEST_RUNNER } from "@selfage/test_runner";

NODE_TEST_RUNNER.run({
  name: "ServiceGeneratorTest",
  cases: [
    {
      name: "GenerateUnauthedService",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public getMessage(
            typeName: string,
            importPath?: string
          ): MessageDefinition {
            this.called.increment("getMessage");
            assertThat(typeName, eq("GetCommentsRequest"), `typeName`);
            assertThat(importPath, eq(undefined), `importPath`);
            return {
              name: "GetCommentsRequest",
              fields: [],
            };
          }
        })();

        // Execute
        generateServiceDescriptr(
          "./some_file",
          {
            name: "GetComments",
            path: "/get_comments",
            request: "GetCommentsRequest",
            response: "GetCommentsResponse",
          },
          mockTypeChecker,
          contentMap
        );

        // Verify
        assertThat(
          mockTypeChecker.called.get("getMessage"),
          eq(1),
          "getMessage called"
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
        let contentMap = new Map<string, OutputContent>();
        let mockTypeChecker = new (class extends MockTypeChecker {
          public getMessage(typeName: string, importPath?: string) {
            this.called.increment("getMessage");
            assertThat(typeName, eq("GetHistoryequest"), `typeName`);
            assertThat(importPath, eq("./some_request"), `importPath`);
            return {
              name: "GetCommentsRequest",
              fields: [
                {
                  name: "signedSession",
                  type: "string",
                },
              ],
            };
          }
        })();

        // Execute
        generateServiceDescriptr(
          "./some_file",
          {
            name: "GetHistory",
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
          mockTypeChecker.called.get("getMessage"),
          eq(1),
          "getMessage called"
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
