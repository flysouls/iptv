import path from 'node:path';
import fs from 'node:fs/promises';
import { download, unzip } from './utils.js';

const rootDir = process.cwd();
const cachedir = path.resolve(rootDir, '.cache');

const resources = [
  {
    url: "https://github.com/iptv-org/iptv/archive/refs/heads/master.zip",
    name: 'iptv-org',
    needUnzip: true,
    fileType: 'zip',
    m3uPath: 'iptv-org/iptv-master/streams/',
  },
  {
    url: "https://m3u.ibert.me/all.m3u",
    name: 'ibert',
    fileType: 'm3u',
    m3uPath: 'ibert.m3u',
  },
  {
    url: "https://m3u.ibert.me/fmml_ipv6.m3u",
    name: 'fmml_ipv6',
    fileType: 'm3u',
    m3uPath: 'fmml_ipv6.m3u',
  },
  {
    url: "https://m3u.ibert.me/fmml_itv.m3u",
    name: 'fmml_itv',
    fileType: 'm3u',
    m3uPath: 'fmml_itv.m3u',
  }, {
    url: "https://m3u.ibert.me/fmml_index.m3u",
    name: 'fmml_index',
    fileType: 'm3u',
    m3uPath: 'fmml_index.m3u',
  }, {
    url: "https://m3u.ibert.me/ycl_iptv.m3u",
    name: "ycl_iptv",
    fileType: 'm3u',
    m3uPath: 'ycl_iptv.m3u',
  }, {
    url: "https://m3u.ibert.me/o_cn.m3u",
    name: "o_cn",
    fileType: 'm3u',
    m3uPath: 'o_cn.m3u',
  }, {
    url: "https://m3u.ibert.me/o_s_cn.m3u",
    name: "o_s_cn",
    fileType: "m3u",
    m3uPath: 'o_s_cn.m3u',
  }, {
    url: "https://m3u.ibert.me/o_s_cn_112114.m3u",
    name: "o_s_cn_112114",
    fileType: "m3u",
    m3uPath: 'o_s_cn_112114.m3u',
  }, {
    url: "https://m3u.ibert.me/o_s_cn_cctv.m3u",
    name: "o_s_cn_cctv",
    fileType: "m3u",
    m3uPath: 'o_s_cn_cctv.m3u',
  }, {
    url: "https://m3u.ibert.me/o_s_cn_cgtn.m3u",
    name: "o_s_cn_cgtn",
    fileType: "m3u",
    m3uPath: "o_s_cn_cgtn.m3u"
  },{
    url: "https://m3u.ibert.me/cn.m3u",
    name: "cn",
    fileType: "m3u",
    m3uPath: "cn.m3u",
  }, {
    url: "https://m3u.ibert.me/cn_c.m3u",
    name: "cn_c",
    fileType: "m3u",
    m3uPath: "cn_c.m3u",
  }, {
    url: "https://m3u.ibert.me/q_bj_iptv_unicom.m3u",
    name: "q_bj_iptv_unicom",
    fileType: "m3u",
    m3uPath: "q_bj_iptv_unicom.m3u",
  }, {
    url: "https://m3u.ibert.me/q_bj_iptv_unicom_m.m3u",
    name: "q_bj_iptv_unicom_m",
    fileType: "m3u",
    m3uPath: "q_bj_iptv_unicom_m.m3u",
  }, {
    url: "https://m3u.ibert.me/q_bj_iptv_mobile.m3u",
    name: "q_bj_iptv_mobile",
    fileType: "m3u",
    m3uPath: "q_bj_iptv_mobile.m3u",
  }, {
    url: "https://m3u.ibert.me/q_bj_iptv_mobile_m.m3u",
    name: "q_bj_iptv_mobile_m",
    fileType: "m3u",
    m3uPath: "q_bj_iptv_mobile_m.m3u",
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

  const pathname = path.resolve(cachedir, `${resource.name}.${resource.fileType}`);
  const dirname = path.resolve(cachedir, resource.name);

  console.log('--- start download ---');
  await download(resource.url, pathname);
  console.log(`--- download resource ${resource.name} successful ---`);

  if (resource.needUnzip) {
    await unzip(pathname, dirname);
    console.log('--- unzip successful ---');
  }

  // 修复文件复制逻辑
  const sourcePath = path.resolve(cachedir, resource.m3uPath);
  const targetDir = path.resolve(rootDir, 'm3u');
  
  // 确保目标目录存在
  await fs.mkdir(targetDir, { recursive: true });
  
  if (resource.fileType === 'm3u') {
    // 对于 M3U 文件，直接复制到 m3u 目录
    const targetPath = path.resolve(targetDir, path.basename(resource.m3uPath));
    await fs.copyFile(sourcePath, targetPath);
    console.log(`📄 复制 M3U 文件: ${path.basename(resource.m3uPath)}`);
  } else {
    // 对于 ZIP 文件，复制整个目录
    const sourceDir = path.resolve(cachedir, resource.m3uPath);
    
    // 检查源目录是否存在
    try {
      await fs.access(sourceDir);
      await fs.cp(sourceDir, targetDir, {
        force: true,
        recursive: true
      });
      console.log(`📁 复制目录内容: ${resource.m3uPath}`);
    } catch (error) {
      console.error(`❌ 复制失败: ${sourceDir} 不存在或无法访问`);
      throw error;
    }
  }
  
  console.log('--- copy successful ---');
  console.log(`--- fetch resource ${resource.name} successful ---`);
}

const main = async () => {
  try {
    // 清理并创建必要的目录
    console.log('🗂️  初始化目录结构...');
    await clearIfExists(path.resolve(rootDir, 'm3u/'));
    await createIfNotExists(path.resolve(rootDir, 'm3u/'));
    await clearIfExists(path.resolve(rootDir, 'pure-m3u/'));
    await createIfNotExists(path.resolve(rootDir, 'pure-m3u/'));
    await clearIfExists(cachedir);
    await createIfNotExists(cachedir);
    console.log('✅ 目录初始化完成');

    // 改进的错误处理和进度跟踪
    console.log(`📥 开始下载 ${resources.length} 个资源...`);
    
    const results = await Promise.allSettled(
      resources.map(async (resource, index) => {
        console.log(`\n[${index + 1}/${resources.length}] 处理资源: ${resource.name}`);
        try {
          await fetchResource(resource);
          return { resource: resource.name, status: 'success' };
        } catch (error) {
          console.error(`❌ 资源 ${resource.name} 处理失败:`, error.message);
          return { resource: resource.name, status: 'failed', error: error.message };
        }
      })
    );

    // 统计结果
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
    const failed = results.length - successful;
    
    console.log('\n📊 ========== 下载统计 ==========');
    console.log(`✅ 成功: ${successful} 个资源`);
    console.log(`❌ 失败: ${failed} 个资源`);
    console.log(`📈 成功率: ${((successful / resources.length) * 100).toFixed(1)}%`);
    
    // 显示失败的资源
    if (failed > 0) {
      console.log('\n📋 失败资源列表:');
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.status === 'failed') {
          console.log(`   ❌ ${resources[index].name}: ${result.value.error}`);
        } else if (result.status === 'rejected') {
          console.log(`   ❌ ${resources[index].name}: 未知错误`);
        }
      });
    }
    
    console.log('================================\n');
    
    if (failed === 0) {
      console.log('🎉 所有资源下载完成！');
    } else {
      console.log(`⚠️  部分资源下载失败，请检查网络连接或资源URL`);
    }
    
  } catch (error) {
    console.error('💥 程序执行失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('💥 程序执行失败:', error);
    process.exit(1);
  });
}