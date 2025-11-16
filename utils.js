import fetch from 'node-fetch';
import fs from 'node:fs/promises';
import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';

export const unzip = async (zipPath, dirPath) => {
  return promisify(exec)(`unzip -o ${zipPath} -d ${dirPath}`);
}
export const download = async (url, filename) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      signal: controller.signal
    });
    
    if (!res.ok) {
      throw new Error(`Failed to download ${url}: ${res.statusText}`);
    }

    const buffer = await res.buffer();
    await fs.writeFile(filename, buffer);
  } finally {
    clearTimeout(timeout);
  }
}