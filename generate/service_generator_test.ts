import { OutputContent } from "./output_content";
import { generateServiceDescriptr } from "./service_generator";
import { assertThat, eq } from "@selfage/test_matcher";
import { TEST_RUNNER } from "@selfage/test_runner";

TEST_RUNNER.run({
  name: "ServiceGeneratorTest",
  cases: [
    {
      name: "GenerateUnauthedService",
      execute: () => {
        // Prepare
        let contentMap = new Map<string, OutputContent>();

        // Execute
        generateServiceDescriptr(
          "./some_file",
          {
            name: "GetComments",
            path: "/get_comments",
            request: "GetCommentsRequest",
            response: "GetCommentsResponse",
          },
          contentMap
        );

        // Verify
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

        // Execute
        generateServiceDescriptr(
          "./some_file",
          {
            name: "GetHistory",
            path: "/get_history",
            request: "GetHistoryequest",
            importRequet: "./some_request",
            response: "GetHistoryResponse",
            importResponse: "./some_response",
            session: "Session",
            importSession: "./some_session_def",
          },
          contentMap
        );

        // Verify
        assertThat(
          contentMap.get("./some_file").toString(),
          eq(`import { AuthedServiceDescriptor } from '@selfage/service_descriptor';
import { GetHistoryequest, GET_HISTORYEQUEST } from './some_request';
import { GetHistoryResponse, GET_HISTORY_RESPONSE } from './some_response';
import { Session, SESSION } from './some_session_def';

export let GET_HISTORY: AuthedServiceDescriptor<GetHistoryequest, GetHistoryResponse, Session> = {
  name: "GetHistory",
  path: "/get_history",
  requestDescriptor: GET_HISTORYEQUEST,
  responseDescriptor: GET_HISTORY_RESPONSE,
  session: SESSION,
};
`),
          "outputContent"
        );
      },
    },
  ],
});
