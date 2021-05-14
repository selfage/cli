import fs = require("fs");
import path = require("path");
import ignore from "ignore";

export async function clean(): Promise<void> {
  await cleanDir(".");
}

export async function cleanDir(dir: string): Promise<void> {
  let [files, gitignore] = await Promise.all([
    findFilesRecursively(dir),
    fs.promises.readFile(path.join(dir, ".gitignore")),
  ]);
  let ignorePatterns = ignore().add(
    gitignore
      .toString()
      .split("\n")
      .map((pattern) => pattern.trim())
  );
  let unwantedFiles = files.filter((file) => ignorePatterns.ignores(file));
  let promisesToUnlink = unwantedFiles.map((file) => fs.promises.unlink(file));
  await Promise.all(promisesToUnlink);
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
        }
        let filesFromSubDirectory = await findFilesRecursively(fullPath);
        files.push(...filesFromSubDirectory);
      } else {
        files.push(fullPath);
      }
    }
  );
  await Promise.all(promisesOfFiles);
  return files;
}
