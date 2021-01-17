export class Importer {
  private pathToNamedImports = new Map<string, Set<string>>();
  private namedImportToPaths = new Map<string, string>();

  public importFromDatastoreModelDescriptor(
    ...namedImports: Array<string>
  ): void {
    this.importFromPath("@selfage/datastore/descriptor", ...namedImports);
  }

  public importFromMessageDescriptor(...namedImports: Array<string>): void {
    this.importFromPath("@selfage/message/descriptor", ...namedImports);
  }

  public importFromObservableArray(...namedImports: Array<string>): void {
    this.importFromPath("@selfage/observable_array", ...namedImports);
  }

  public importFromPath(
    path: string | undefined,
    ...namedImports: Array<string>
  ): void {
    if (!path) {
      return;
    }
    let namedImportsInMap = this.pathToNamedImports.get(path);
    if (!namedImportsInMap) {
      namedImportsInMap = new Set<string>();
      this.pathToNamedImports.set(path, namedImportsInMap);
    }
    for (let namedImport of namedImports) {
      namedImportsInMap.add(namedImport);
      this.namedImportToPaths.set(namedImport, path);
    }
  }

  public toStringList(): Array<string> {
    let content = new Array<string>();
    for (let entry of this.pathToNamedImports.entries()) {
      let importPath = entry[0];
      let namedImports = Array.from(entry[1]).join(", ");
      content.push(`import { ${namedImports} } from '${importPath}';\n`);
    }
    return content;
  }
}
