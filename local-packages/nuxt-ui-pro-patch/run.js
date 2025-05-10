#!/usr/bin/env node

/**
 * 这是一个启动器脚本，用于确保在任何环境下都能正确加载和执行补丁
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
  console.log('开始执行Nuxt UI Pro补丁...');
  
  // 尝试加载主脚本
  const mainScriptPath = findScript('index.js');
  
  if (!mainScriptPath) {
    console.error('错误: 无法找到补丁主脚本 index.js');
    console.log('请确保脚本文件存在于正确位置');
    process.exit(1);
  }
  
  console.log(`找到补丁脚本: ${mainScriptPath}`);
  
  try {
    // 执行脚本
    require(mainScriptPath);
    console.log('补丁脚本已执行完毕');
  } catch (error) {
    console.error('执行补丁时出错:', error);
    process.exit(1);
  }
}

// 执行主函数
try {
  main();
} catch (error) {
  console.error('启动补丁时发生严重错误:', error);
  process.exit(1);
} 