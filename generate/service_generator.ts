import { ServiceDefinition } from "./definition";
import { OutputContentBuilder } from "./output_content_builder";
import { TypeChecker } from "./type_checker";
import { toUpperSnaked } from "./util";

export function generateServiceDescriptor(
  modulePath: string,
  serviceName: string,
  serviceDefinition: ServiceDefinition,
  typeChecker: TypeChecker,
  contentMap: Map<string, OutputContentBuilder>
): void {
  let outputContentBuilder = OutputContentBuilder.get(contentMap, modulePath);

  let requestDefinition = typeChecker.getDefinition(
    serviceDefinition.request,
    serviceDefinition.importRequest
  );
  if (!requestDefinition.message) {
    console.warn(
      `Request ${serviceDefinition.request} is not found or not a message.`
    );
    return;
  }
  let descriptorName: string;
  if (
    requestDefinition.message.fields.find(
      (field) => field.name === "signedSession"
    )
  ) {
    descriptorName = "AuthedServiceDescriptor";
  } else {
    descriptorName = "UnauthedServiceDescriptor";
  }
  outputContentBuilder.importFromServiceDescriptor(descriptorName);

  let serviceDescriptorName = toUpperSnaked(serviceName);
  outputContentBuilder.push(`
export let ${serviceDescriptorName}: ${descriptorName}<${serviceDefinition.request}, ${serviceDefinition.response}> = {`);

  let requestDescriptorName = toUpperSnaked(serviceDefinition.request);
  outputContentBuilder.importFromPath(
    serviceDefinition.importRequest,
    serviceDefinition.request,
    requestDescriptorName
  );
  let responseDescriptorName = toUpperSnaked(serviceDefinition.response);
  outputContentBuilder.importFromPath(
    serviceDefinition.importResponse,
    serviceDefinition.response,
    responseDescriptorName
  );
  outputContentBuilder.push(`
  name: "${serviceName}",
  path: "${serviceDefinition.path}",
  requestDescriptor: ${requestDescriptorName},
  responseDescriptor: ${responseDescriptorName},
};
`);
}
