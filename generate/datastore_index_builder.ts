import fs = require("fs");
import YAML = require("yaml");
import { DatastoreDefinition } from "./definition";

// Mimic the structure to be uploaded to datastore composite index yaml.
interface DatastoreCompositeIndexProperty {
  name: string;
  direction?: string;
}

interface DatastoreCompositeIndex {
  kind: string;
  properties: Array<DatastoreCompositeIndexProperty>;
}

interface DatastoreCompositeIndexList {
  indexes: Array<DatastoreCompositeIndex>;
}

export class DatastoreIndexBuilder {
  private kindToIndexes = new Map<string, Array<DatastoreCompositeIndex>>();

  public addIndex(datastoreDefinition: DatastoreDefinition): void {
    let compositeIndexes = new Array<DatastoreCompositeIndex>();
    for (let index of datastoreDefinition.indexes) {
      if (index.properties.length < 2) {
        continue;
      }

      let compositeIndexProperties = new Array<DatastoreCompositeIndexProperty>();
      for (let property of index.properties) {
        if (property.descending !== undefined) {
          let direction: string;
          if (property.descending) {
            direction = "desc";
          } else {
            direction = "asc";
          }
          compositeIndexProperties.push({
            name: property.fieldName,
            direction: direction,
          });
        } else {
          compositeIndexProperties.push({
            name: property.fieldName,
          });
        }
      }
      compositeIndexes.push({
        kind: datastoreDefinition.messageName,
        properties: compositeIndexProperties,
      });
    }
    if (compositeIndexes.length > 0) {
      this.kindToIndexes.set(datastoreDefinition.messageName, compositeIndexes);
    }
  }

  public mergeIndexes(indexFile: string): string {
    if (this.kindToIndexes.size === 0) {
      return "";
    }

    let kindToIndexes = new Map<string, Array<DatastoreCompositeIndex>>();
    if (fs.existsSync(indexFile)) {
      let indexList = YAML.parse(
        fs.readFileSync(indexFile).toString()
      ) as DatastoreCompositeIndexList;
      for (let index of indexList.indexes) {
        let compositeIndexes = kindToIndexes.get(index.kind);
        if (!compositeIndexes) {
          compositeIndexes = new Array<DatastoreCompositeIndex>();
          kindToIndexes.set(index.kind, compositeIndexes);
        }
        compositeIndexes.push(index);
      }
    }

    for (let [kind, indexes] of this.kindToIndexes.entries()) {
      kindToIndexes.set(kind, indexes);
    }

    let resultIndexes = new Array<DatastoreCompositeIndex>();
    for (let indexes of kindToIndexes.values()) {
      resultIndexes.push(...indexes);
    }
    let resultIndexList: DatastoreCompositeIndexList = {
      indexes: resultIndexes,
    };
    return YAML.stringify(resultIndexList);
  }
}
