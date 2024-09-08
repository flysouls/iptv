import path from 'node:path';
import fs from 'node:fs/promises';
import { download, unzip } from './utils.js';

const rootDir = process.cwd();
const cachedir = path.resolve(rootDir, '.cache');
const ipResourceRrl = "https://github.com/iptv-org/iptv/archive/refs/heads/master.zip";

const createIfNotExists = async (path) => {
  const pathstat = await fs.stat(path);
  if (!pathstat.isDirectory()) {
    await fs.mkdir(path);
  }
};

export const fetchResource = async () => {
  console.log('--- fetch resource start ---');

  await createIfNotExists(cachedir);

  const pathname = path.resolve(cachedir, 'iptv-org.zip');
  const dirname = path.resolve(cachedir, 'iptv-org');

  console.log('--- start download ---');
  await download(ipResourceRrl, pathname);
  console.log('--- download resource successful ---');

  await unzip(pathname, dirname);
  console.log('--- unzip successful ---');

  await fs.cp(
    path.resolve(cachedir, 'iptv-org/iptv-master/streams/'),
    path.resolve(rootDir, 'm3u/'),
    {
      force: true,
      recursive: true,
      verbatimSymlinks: true
    }
  )
  console.log('--- copy successful ---');

  console.log('--- fetch resource successful ---');
}

fetchResource();