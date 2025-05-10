#!/usr/bin/env node

/**
 * 这是一个验证启动器脚本，用于确保在任何环境下都能正确加载和执行验证
 */

const fs = require('fs');
const path = require('path');

// 获取当前脚本的目录
const scriptDir = __dirname;

function findScript(name) {
  // 可能的脚本路径
  const possiblePaths = [
    path.join(scriptDir, name),             // 当前目录
    path.join(scriptDir, '..', name),       // 上级目录
    path.join(process.cwd(), name),         // 工作目录
    path.join(process.cwd(), 'local-packages', 'nuxt-ui-pro-patch', name) // 项目结构
  ];
  
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    } catch (err) {
      // 忽略错误，继续尝试下一个路径
    }
  }
  
  return null;
}

function main() {
  console.log('开始验证Nuxt UI Pro补丁...');
  
  // 尝试加载验证脚本
  const verifyScriptPath = findScript('verify.js');
  
  if (!verifyScriptPath) {
    console.error('错误: 无法找到验证脚本 verify.js');
    console.log('请确保脚本文件存在于正确位置');
    process.exit(1);
  }
  
  console.log(`找到验证脚本: ${verifyScriptPath}`);
  
  try {
    // 执行脚本
    require(verifyScriptPath);
  } catch (error) {
    console.error('执行验证时出错:', error);
    process.exit(1);
  }
}

// 执行主函数
try {
  main();
} catch (error) {
  console.error('启动验证时发生严重错误:', error);
  process.exit(1);
} 