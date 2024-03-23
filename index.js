import fs from 'node:fs/promises';
import path from 'node:path';
import axios from 'axios';
import progress from 'progress';

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
    try {
        await timeoutPromise(1500, () => axios.get(url, { timeout: 1500 }));
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * get m3u files
 */
const getAllM3uFiles = async () => {
    const files = await fs.readdir('./m3u');
    return files;
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
        }
        bar.tick();
    }
    if (pureM3uContentList.length > 1) {
        await fs.writeFile(path.resolve('./pure-m3u/', fileName), pureM3uContentList.join('\n'));
    }
    bar.terminate();
}

const main = async () => {
    console.log('=== mession start ===');
    const files = await getAllM3uFiles();

    for(let i = 0; i < files.length; i++) {
        await generateM3uFile(files[i]);
        console.log('generateM3uFile success %s', files[i]);
    }
    
    console.log('=== mession complete ===');
}

main();
