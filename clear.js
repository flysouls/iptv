import fs from 'node:fs/promises';
import path from 'node:path';

export const clear = async (path) => {
  await fs.rm(path, { recursive: true });
  await fs.mkdir(path);
}


const run = async () => {
  const dir = process.cwd();

  await clear(path.resolve(dir, './m3u'));
  await clear(path.resolve(dir, './pure-m3u'));
};

await run();