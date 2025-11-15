import fs from 'node:fs/promises';
import path from 'node:path';
import axios from 'axios';
import progress from 'progress';

import promiseQueue from './queue.js';

const allM3uPath = './m3u';
const CONCURRENT_URL_CHECKS = 10; // 并发 URL 检测数量
const URL_CHECK_TIMEOUT = 3000; // URL 检测超时时间（毫秒）

/**
 * 检查 URL 是否可用（优化版）
 * 只检查 HTTP 状态码为 200 即认为可用
 */
const checkUrlAvailable = async (url) => {
    try {
        const response = await axios.head(url, { 
            timeout: URL_CHECK_TIMEOUT,
            validateStatus: (status) => status === 200 // 只接受 200 状态码
        });
        return response.status === 200;
    } catch (error) {
        // 忽略所有错误，只返回 false
        return false;
    }
}

/**
 * 批量并行检查 URL 可用性
 */
const batchCheckUrls = async (urls) => {
    const results = await Promise.allSettled(
        urls.map(url => checkUrlAvailable(url))
    );
    
    return results.map((result, index) => ({
        url: urls[index],
        available: result.status === 'fulfilled' && result.value === true
    }));
}

/**
 * 获取 M3U 文件列表（按大小排序）
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
 * 解析 M3U 文件内容，提取频道信息
 */
const parseM3uContent = (content) => {
    const lines = content.split('\n').filter(i => !!i.trim());
    const channels = [];
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXTINF:')) {
            if (i + 1 < lines.length) {
                channels.push({
                    metadata: lines[i],
                    url: lines[i + 1],
                    index: i
                });
                i++; // 跳过 URL 行
            }
        }
    }
    
    return channels;
}

/**
 * 生成纯净的 M3U 文件（优化版）
 */
const generateM3uFile = async (fileName) => {
    console.log(`🚀 开始处理文件: ${fileName}`);
    
    // 读取文件内容
    const fileBuffer = await fs.readFile(path.resolve('./m3u/', fileName));
    const content = fileBuffer.toString();
    
    // 解析 M3U 内容
    const channels = parseM3uContent(content);
    console.log(`📊 文件 ${fileName} 包含 ${channels.length} 个频道`);
    
    if (channels.length === 0) {
        console.log(`⚠️  文件 ${fileName} 没有有效的频道信息`);
        return;
    }
    
    // 初始化进度条
    const bar = new progress(`验证 ${fileName} :bar :current/:total :percent`, { 
        total: channels.length,
        width: 30
    });
    
    const pureM3uContentList = ['#EXTM3U'];
    
    // 分批并行验证 URL
    const batchSize = CONCURRENT_URL_CHECKS;
    for (let i = 0; i < channels.length; i += batchSize) {
        const batch = channels.slice(i, i + batchSize);
        const urls = batch.map(channel => channel.url);
        
        // 并行验证当前批次的 URL
        const results = await batchCheckUrls(urls);
        
        // 处理验证结果
        results.forEach((result, batchIndex) => {
            const channelIndex = i + batchIndex;
            if (channelIndex < channels.length) {
                const channel = channels[channelIndex];
                
                if (result.available) {
                    pureM3uContentList.push(channel.metadata);
                    pureM3uContentList.push(channel.url);
                }
                
                // 更新进度条
                bar.tick();
            }
        });
    }
    
    // 生成纯净文件
    if (pureM3uContentList.length > 1) {
        const targetPath = path.resolve('./pure-m3u/', fileName);
        await fs.writeFile(targetPath, pureM3uContentList.join('\n'));
        console.log(`✅ 文件 ${fileName} 处理完成，有效频道: ${(pureM3uContentList.length - 1) / 2}`);
    } else {
        console.log(`❌ 文件 ${fileName} 没有可用的频道`);
    }
    
    bar.terminate();
}

/**
 * 主函数
 */
const main = async () => {
    console.time('=== 生成任务总耗时 ===');
    console.log('🎯 开始处理 M3U 文件...');
    
    const files = await getAllM3uFiles();
    console.log(`📁 找到 ${files.length} 个 M3U 文件`);
    
    // 使用队列控制文件处理并发
    for (let i = 0; i < files.length; i++) {
        promiseQueue.enqueue(() => generateM3uFile(files[i]));
        promiseQueue.runItem();
    }
    
    promiseQueue.done(() => {
        console.timeEnd('=== 生成任务总耗时 ===');
        console.log('🎉 所有文件处理完成！');
    });
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ 程序执行失败:', error);
        process.exit(1);
    });
}

export { generateM3uFile, checkUrlAvailable };
