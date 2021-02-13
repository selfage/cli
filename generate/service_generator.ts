import { ServiceDefinition } from "./definition";
import { OutputContent } from "./output_content";
import { toUpperSnaked } from "./util";

export function generateServiceDescriptr(
  modulePath: string,
  serviceDefinition: ServiceDefinition,
  contentMap: Map<string, OutputContent>
): void {
  let outputContent = OutputContent.get(contentMap, modulePath);
  let serviceDescriptorName = toUpperSnaked(serviceDefinition.name);
  if (!serviceDefinition.session) {
    outputContent.importFromServiceDescriptor("UnauthedServiceDescriptor");
    outputContent.push(`
export let ${serviceDescriptorName}: UnauthedServiceDescriptor<${serviceDefinition.request}, ${serviceDefinition.response}> = {`);
  } else {
    outputContent.importFromServiceDescriptor("AuthedServiceDescriptor");
    outputContent.push(`
export let ${serviceDescriptorName}: AuthedServiceDescriptor<${serviceDefinition.request}, ${serviceDefinition.response}, ${serviceDefinition.session}> = {`);
  }

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
  name: "${serviceDefinition.name}",
  path: "${serviceDefinition.path}",
  requestDescriptor: ${requestDescriptorName},
  responseDescriptor: ${responseDescriptorName},`);

  if (serviceDefinition.session) {
    let sessionDescriptorName = toUpperSnaked(serviceDefinition.session);
    outputContent.importFromPath(
      serviceDefinition.importSession,
      serviceDefinition.session,
      sessionDescriptorName
    );
    outputContent.push(`
  session: ${sessionDescriptorName},`);
  }
  outputContent.push(`
};
`);
}
