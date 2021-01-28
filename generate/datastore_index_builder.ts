import fs = require("fs");
import YAML = require("yaml");
import { DatastoreDefinition } from "./definition";

// Mimic the structure of datastore composite index yaml.
interface CompositeIndexProperty {
  name: string;
  direction?: string;
}

interface CompositeIndex {
  kind: string;
  properties: Array<CompositeIndexProperty>;
}

interface CompositeIndexList {
  indexes: Array<CompositeIndex>;
}

export class DatastoreIndexBuilder {
  private jsonToIndexes = new Map<string, CompositeIndex>();

  public addIndex(datastoreDefinition: DatastoreDefinition): void {
    for (let index of datastoreDefinition.indexes) {
      if (index.properties.length < 2) {
        continue;
      }

      let compositeIndexProperties = new Array<CompositeIndexProperty>();
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
      compositeIndexProperties.sort(DatastoreIndexBuilder.compareIndexProperty);
      let compsiteIndex = {
        kind: datastoreDefinition.messageName,
        properties: compositeIndexProperties,
      };
      this.jsonToIndexes.set(JSON.stringify(compsiteIndex), compsiteIndex);
    }
  }

  public mergeIndexes(indexFile: string): string {
    if (fs.existsSync(indexFile)) {
      let indexList = YAML.parse(
        fs.readFileSync(indexFile).toString()
      ) as CompositeIndexList;
      for (let index of indexList.indexes) {
        index.properties.sort(DatastoreIndexBuilder.compareIndexProperty);
        this.jsonToIndexes.set(JSON.stringify(index), index);
      }
    }
    let mergedIndexes = new Array<CompositeIndex>();
    for (let key of Array.from(this.jsonToIndexes.keys()).sort()) {
      mergedIndexes.push(this.jsonToIndexes.get(key));
    }
    let mergedIndexList: CompositeIndexList = {
      indexes: mergedIndexes,
    };
    return YAML.stringify(mergedIndexList);
  }

  private static compareIndexProperty(
    left: CompositeIndexProperty,
    right: CompositeIndexProperty
  ): number {
    let nameRes = left.name.localeCompare(right.name);
    if (nameRes !== 0) {
      return nameRes;
    }
    if (left.direction === right.direction) {
      return 0;
    }
    if (left.direction === undefined) {
      return -1;
    }
    if (right.direction === undefined) {
      return 1;
    }
    return left.direction.localeCompare(right.direction);
  }
}
