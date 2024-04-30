import fs from 'fs';
import path from 'path';

function getFilesRecursively(rootPath: string): string[] {
  let files: string[] = [];

  function walkSync(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if(entry.name.endsWith(".ts")) continue;
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walkSync(entryPath);
      } else {
        files.push(entryPath);
      }
    }
  }

  walkSync(rootPath);
  return files;
}

export default getFilesRecursively;