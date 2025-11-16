import fs from 'node:fs/promises';
import path from 'node:path';
import progress from 'progress';

/**
 * get m3u files
 */
const getAllM3uFiles = async (dirpath) => {
    const files = await fs.readdir(dirpath);
    return files;
}

/**
 * generate m3u file
 */
const generateM3uFile = async (dirPath, target, filter = () => true) => {
    console.log('=== mession collect start ===');
    const files = await getAllM3uFiles(dirPath);
    const allM3uContent = await Promise.all(files.filter(filter).map(async (item) => {
        const fileContent = await fs.readFile(path.resolve('.', dirPath, item), { encoding: 'utf-8' });
        return fileContent;
    }));
    console.log('=== mession collect complete ===');

    const targetPath = path.resolve('./all', `${target}.m3u`);

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

    await generateM3uFile('./m3u', './m3u');

    await generateM3uFile('./pure-m3u', './pure-m3u');

    await generateM3uFile('./pure-m3u', './cn', (val) => val.includes('cn') || val.includes('cctv'));

    console.log('=== merge mession complete ===');
}

main().then(() => {
    console.log('=== merge mession complete ===');
    process.exit(0);
});
