import fs from 'node:fs/promises';
import path from 'node:path';
import axios from 'axios';
import progress from 'progress';

import promiseQueue from './queue.js';

const allM3uPath = './m3u';

const timeoutPromise = async (time, promise) => {
    return new Promise(async (res, rej) => {
        let timer = setTimeout(() => {
            rej(false);
        }, time);
        try {
            await promise();
        } catch (err) {
            rej(false);
        }
        clearTimeout(timer);
        res(true);
    })
}

/**
 * check if url avaliable
 */
const checkUrlAvaliable = async (url) => {
    const time = 500;
    try {
        await timeoutPromise(time, () => axios.head(url, { timeout: time }));
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * get m3u files
 */
const getAllM3uFiles = async () => {
    const files = await fs.readdir(path.resolve(allM3uPath));
    const fileState = await Promise.all(
        files.map(i => fs.stat(path.resolve(allM3uPath, i)))
    );
    const sortFiles = files.map((i, j) => ({
        name: i,
        stat: fileState[j],
    })).sort((a, b) => b.stat.size - a.stat.size).map(i => i.name);

    return sortFiles;
}

/**
 * generate m3u file
 */
const generateM3uFile = async (fileName) => {
    const fileBuffer = await fs.readFile(path.resolve('./m3u/', fileName));
    const m3uContentList = fileBuffer.toString().split('\n').filter(i => !!i.trim());
    
    const bar = new progress(`generate ${fileName} :bar :current/:total`, { total: m3uContentList.length, curr: 0 })

    const pureM3uContentList = ['#EXTM3U'];
    for (let i = 0; i < m3uContentList.length; i++) {
        if (m3uContentList[i].startsWith('#EXTINF:')) {
            const avaliable = await checkUrlAvaliable(m3uContentList[i+1]);
            if (avaliable) {
                pureM3uContentList.push(m3uContentList[i]);
                pureM3uContentList.push(m3uContentList[i + 1]);
            }
            i++;
            bar.tick();
        }
        bar.tick();
    }
    if (pureM3uContentList.length > 1) {
        console.log('write file');
        await fs.writeFile(path.resolve('./pure-m3u/', fileName), pureM3uContentList.join('\n'));
    }

    console.log('generate complate', fileName);
    bar.terminate();
}

const main = async () => {
    console.time('=== generate mession ===');
    const files = await getAllM3uFiles();

    for(let i = 0; i < files.length; i++) {
        promiseQueue.enqueue(() => generateM3uFile(files[i]));
        promiseQueue.runItem();
    }

    promiseQueue.done(() => {
        console.timeEnd('=== generate mession ===');
    })

}

main();
