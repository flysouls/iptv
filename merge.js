import fs from 'node:fs/promises';
import path from 'node:path';
import progress from 'progress';

/**
 * get m3u files
 */
const getAllPureM3uFiles = async () => {
    const files = await fs.readdir('./pure-m3u');
    return files;
}

/**
 * generate m3u file
 */
const generateM3uFile = async (dirpath) => {
    console.log('=== mession collect start ===');
    const files = await getAllPureM3uFiles(dirpath);
    const allM3uContent = await Promise.all(files.map(async (item) => {
        const fileContent = await fs.readFile(path.resolve('.', dirpath, item), { encoding: 'utf-8' });
        return fileContent;
    }));
    console.log('=== mession collect complete ===');

    const targetPath = path.resolve('./all', `${dirpath}.m3u`);

    console.log('=== mission generate start ===');
    let content = '#EXTM3U \n';
    allM3uContent.forEach(item => {
        const list = item.split('\n').filter(i => !!i.trim());
        list.forEach((i,j) => {
            if (i.startsWith('#EXTINF:')) {
                content += `${i} \n`;
                content += `${list[j + 1]} \n`;
            }
        })
    })
    await fs.writeFile(targetPath, content);
    console.log('=== mission generate complete ===');
}

// merge all m3u files
const main = async () => {
    console.log('=== merge mession start ===');

    await generateM3uFile('./m3u');

    await generateM3uFile('./pure-m3u');

    console.log('=== merge mession complete ===');
}

main();
