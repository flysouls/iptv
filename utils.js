import fetch from 'node-fetch';
import fs from 'node:fs/promises';
import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';

export const download = async (url, filename) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.statusText}`);
  }

  const buffer = await res.arrayBuffer();
  await fs.writeFile(filename, buffer);
}

export const unzip = async (zipPath, dirPath) => {
  return promisify(exec)(`unzip -o ${zipPath} -d ${dirPath}`);
}
