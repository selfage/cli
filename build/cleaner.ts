import fs = require("fs");
import path = require("path");

export async function clean(): Promise<void> {
  let files = await findFiles(".");
  let promisesToUnlink = files.map(async (file) => {
    await fs.promises.unlink(file);
  });
  await Promise.all(promisesToUnlink);
}

export async function findFiles(rootDir: string): Promise<Array<string>> {
  let files = await findFilesRecursively(rootDir);
  return files.filter(
    (file) =>
      file.endsWith(".d.ts") ||
      file.endsWith(".js") ||
      file.endsWith(".tsbuildinfo")
  );
}

async function findFilesRecursively(dir: string): Promise<Array<string>> {
  let items = await fs.promises.readdir(dir);
  let files: string[] = [];
  let promisesOfFiles = items.map(
    async (item): Promise<void> => {
      let fullPath = path.join(dir, item);
      let fileStats = await fs.promises.stat(fullPath);
      if (fileStats.isDirectory()) {
        if (item === "node_modules") {
          return;
        } else {
          let filesFromSubDirectory = await findFilesRecursively(fullPath);
          files.push(...filesFromSubDirectory);
        }
      } else {
        files.push(fullPath);
      }
    }
  );
  await Promise.all(promisesOfFiles);
  return files;
}
