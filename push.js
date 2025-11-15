import { execSync } from 'child_process';
import dayjs from 'dayjs';

/**
 * 执行 Git 推送操作
 * 包含完整的错误处理和状态检查
 */
const push = async () => {
  try {
    // 检查当前目录是否为 Git 仓库
    try {
      execSync('git rev-parse --is-inside-work-tree', { 
        stdio: 'pipe',
        shell: '/bin/zsh'
      });
    } catch (error) {
      console.error('❌ 当前目录不是 Git 仓库');
      return false;
    }

    // 检查是否有未提交的更改
    const hasChanges = execSync('git status --porcelain', {
      encoding: 'utf8',
      shell: '/bin/zsh'
    }).trim();

    if (!hasChanges) {
      console.log('ℹ️  没有需要提交的更改');
      return true;
    }

    // 生成安全的提交消息
    const timestamp = dayjs().format('YYYY-MM-DD_HH:mm:ss');
    const commitMessage = `feat: upgrade at ${timestamp}`;

    // 分步执行 Git 操作
    console.log('📦 添加文件到暂存区...');
    execSync('git add .', { 
      stdio: 'inherit',
      shell: '/bin/zsh'
    });

    console.log('💾 提交更改...');
    execSync(`git commit -m "${commitMessage}"`, { 
      stdio: 'inherit',
      shell: '/bin/zsh'
    });

    console.log('🚀 推送到远程仓库...');
    execSync('git push', { 
      stdio: 'inherit',
      shell: '/bin/zsh'
    });

    console.log('✅ Git 推送操作完成');
    return true;
  } catch (error) {
    console.error('❌ Git 操作失败:', error.message);
    return false;
  }
};

// 主执行函数
const main = async () => {
  try {
    const success = await push();
    if (!success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 程序执行异常:', error.message);
    process.exit(1);
  }
};

// 检查是否直接执行该文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { push };