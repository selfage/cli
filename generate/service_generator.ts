import { ServiceDefinition } from "./definition";
import { OutputContent } from "./output_content";
import { TypeChecker } from "./type_checker";
import { toUpperSnaked } from "./util";

export function generateServiceDescriptr(
  modulePath: string,
  serviceName: string,
  serviceDefinition: ServiceDefinition,
  typeChecker: TypeChecker,
  contentMap: Map<string, OutputContent>
): void {
  let outputContent = OutputContent.get(contentMap, modulePath);

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
  outputContent.importFromServiceDescriptor(descriptorName);

  let serviceDescriptorName = toUpperSnaked(serviceName);
  outputContent.push(`
export let ${serviceDescriptorName}: ${descriptorName}<${serviceDefinition.request}, ${serviceDefinition.response}> = {`);

  let requestDescriptorName = toUpperSnaked(serviceDefinition.request);
  outputContent.importFromPath(
    serviceDefinition.importRequest,
    serviceDefinition.request,
    requestDescriptorName
  );
  let responseDescriptorName = toUpperSnaked(serviceDefinition.response);
  outputContent.importFromPath(
    serviceDefinition.importResponse,
    serviceDefinition.response,
    responseDescriptorName
  );
  outputContent.push(`
  name: "${serviceName}",
  path: "${serviceDefinition.path}",
  requestDescriptor: ${requestDescriptorName},
  responseDescriptor: ${responseDescriptorName},
};
`);
}
