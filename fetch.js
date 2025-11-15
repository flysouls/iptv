import path from 'node:path';
import fs from 'node:fs/promises';
import { download, unzip } from './utils.js';

const rootDir = process.cwd();
const cachedir = path.resolve(rootDir, '.cache');

const resources = [
  {
    url: "https://github.com/iptv-org/iptv/archive/refs/heads/master.zip",
    name: 'iptv-org',
    m3uPath: 'iptv-org/iptv-master/streams/',
  }
]

const createIfNotExists = async (path) => {
  try {
    const pathstat = await fs.stat(path);
    if (!pathstat.isDirectory()) {
      await fs.mkdir(path);
    }
  } catch (err) {
    await fs.mkdir(path);
  }
};

const clearIfExists = async (path) => {
  try {
    const pathstat = await fs.stat(path);
    if (pathstat.isDirectory()) {
      await fs.rm(path, { recursive: true });
    }
  } catch (err) { 
    console.log(err);
  }
}

export const fetchResource = async (resource) => {
  console.log(`--- fetch resource ${resource.name} start ---`);

  const pathname = path.resolve(cachedir, `${resource.name}.zip`);
  const dirname = path.resolve(cachedir, resource.name);

  console.log('--- start download ---');
  await download(resource.url, pathname);
  console.log(`--- download resource ${resource.name} successful ---`);

  await unzip(pathname, dirname);
  console.log('--- unzip successful ---');

  await fs.cp(
    path.resolve(cachedir, resource.m3uPath),
    path.resolve(rootDir, 'm3u/'),
    {
      force: true,
      recursive: true,
      verbatimSymlinks: true
    }
  )
  console.log('--- copy successful ---');

  console.log(`--- fetch resource ${resource.name} successful ---`);
}

const main = async () => {
  await clearIfExists(path.resolve(rootDir, 'm3u/'));
  await createIfNotExists(path.resolve(rootDir, 'm3u/'));
  await clearIfExists(path.resolve(rootDir, 'pure-m3u/'));
  await createIfNotExists(path.resolve(rootDir, 'pure-m3u/'));
  await clearIfExists(cachedir);
  await createIfNotExists(cachedir);

  for (let resource of resources) {
    await fetchResource(resource);
  }
}

main();